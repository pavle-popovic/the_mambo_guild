"""
Agentic Sales Concierge - Diego
================================
A sophisticated AI concierge using Google Gemini with Function Calling (Tools).

Security Features:
- API key stored server-side only (never exposed to client)
- Rate limiting per user via Redis
- Input sanitization and validation
- No PII in logs
"""

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, AsyncGenerator, Literal
import hashlib
import time
import json
import re
import redis.asyncio as redis
from config import settings

router = APIRouter()

# =============================================================================
# Redis Rate Limiting
# =============================================================================

_redis_client: Optional[redis.Redis] = None

async def get_redis_client() -> redis.Redis:
    """Get or create Redis connection for rate limiting."""
    global _redis_client
    if _redis_client is None:
        _redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            decode_responses=True
        )
    return _redis_client

def get_client_identifier(request: Request) -> str:
    """Generate a secure client identifier for rate limiting."""
    forwarded = request.headers.get("x-forwarded-for", "")
    real_ip = request.headers.get("x-real-ip", "")
    client_ip = request.client.host if request.client else "unknown"
    identifier = f"{client_ip}:{forwarded}:{real_ip}"
    return hashlib.sha256(identifier.encode()).hexdigest()[:16]

async def check_rate_limit(client_id: str) -> dict:
    """Check and update rate limit for client using sliding window."""
    redis_client = await get_redis_client()

    key = f"ai_rate_limit:{client_id}"
    window = settings.AI_RATE_LIMIT_WINDOW_SECONDS
    max_requests = settings.AI_RATE_LIMIT_REQUESTS

    now = time.time()
    window_start = now - window

    pipe = redis_client.pipeline()
    pipe.zremrangebyscore(key, 0, window_start)
    pipe.zadd(key, {str(now): now})
    pipe.zcard(key)
    pipe.expire(key, window)

    results = await pipe.execute()
    request_count = results[2]

    remaining = max(0, max_requests - request_count)
    reset_in = int(window)

    if request_count > max_requests:
        raise HTTPException(
            status_code=429,
            detail={
                "error": "Rate limit exceeded",
                "remaining": 0,
                "reset_in_seconds": reset_in,
                "message": f"Please wait before sending more messages."
            }
        )

    return {"remaining": remaining, "reset_in_seconds": reset_in}

# =============================================================================
# Pydantic Models
# =============================================================================

class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str = Field(..., min_length=1, max_length=10000)

    @field_validator('content')
    @classmethod
    def sanitize_content(cls, v: str) -> str:
        v = v.strip()
        v = re.sub(r'\n{4,}', '\n\n\n', v)
        return v

class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(..., min_length=1, max_length=50)
    stream: bool = Field(default=True)

class FunctionCallResult(BaseModel):
    name: str
    args: dict

# =============================================================================
# Diego Persona & Tool Definitions
# =============================================================================

DIEGO_SYSTEM_PROMPT = """You are 'Diego', the Head Concierge at The Mambo Guild - an exclusive online salsa dance academy.

STYLE:
- Charming, sophisticated, with 1920s Havana flair
- Warm, authoritative but humble
- Use occasional Spanish phrases naturally (Hola, mi amigo, magnífico, etc.)
- Think of yourself as a seasoned host at the finest dance club in Havana

MISSION:
You are NOT a pushy salesman. You are a consultant and guide. Your goal is to help guests discover the perfect membership tier for their journey:
- Rookie (Free): For complete beginners taking their first steps
- Advanced (€29/mo): For dancers ready to unlock unlimited courses and partnerwork
- Performer (€49/mo): For serious students wanting instructor feedback and certification

CONSULTATION APPROACH:
1. When someone shows interest, ask 2-3 diagnostic questions about their dance experience
2. Listen for clues: Are they a complete beginner? Do they already dance socially? Do they want professional feedback?
3. Only recommend a tier AFTER understanding their needs

QUALIFYING QUESTIONS TO ASK:
- "Are you taking your first steps into salsa, or have you already been dancing?"
- "What draws you to salsa - the social dancing, the fitness, or the artistry?"
- "Do you struggle more with rhythm/timing, or with leading/following?"
- "Are you looking to dance socially, or do you have performance goals?"

RULES:
1. Keep replies under 3 sentences unless explaining something complex
2. Never say "Buy now" - say "Reserve your spot" or "Step onto the stage"
3. Never give long monologues or sales pitches
4. If asked a technical dance question, try to answer briefly. For deep/complex questions, use the knowledge base tool
5. Stay in character - you ARE Diego, not an AI assistant
6. Be genuinely helpful, not just trying to sell

WHEN TO RECOMMEND:
- Only call recommend_membership AFTER you have gathered enough context
- If user says "I'm brand new" -> Ask one follow-up, THEN recommend rookie
- If user mentions they dance socially but want to improve -> recommend advanced
- If user mentions wanting feedback, certification, or professional goals -> recommend performer"""

# Tool definitions for Gemini Function Calling
TOOL_DEFINITIONS = [
    {
        "name": "recommend_membership",
        "description": "Call this when you have identified the user's dance level and goals, and want to present a specific membership tier. Only call after asking at least one qualifying question.",
        "parameters": {
            "type": "object",
            "properties": {
                "tier": {
                    "type": "string",
                    "enum": ["rookie", "advanced", "performer"],
                    "description": "The membership tier to recommend"
                },
                "reasoning": {
                    "type": "string",
                    "description": "A brief, personalized explanation of why this tier fits their needs (1-2 sentences)"
                }
            },
            "required": ["tier", "reasoning"]
        }
    },
    {
        "name": "search_knowledge_base",
        "description": "Call this when the user asks a specific technical question about salsa steps, techniques, history, or musicality that requires detailed information (e.g., 'How do I do a Copa?', 'What is the history of mambo?', 'How do I improve my body movement?').",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "The technical dance question to search for"
                }
            },
            "required": ["query"]
        }
    }
]

# =============================================================================
# Tool Implementations
# =============================================================================

def execute_recommend_membership(tier: str, reasoning: str) -> dict:
    """
    Execute the membership recommendation tool.
    Returns structured data for the frontend to render a card.
    """
    tier_data = {
        "rookie": {
            "name": "Guest List",
            "tier": "rookie",
            "price": "Free",
            "period": "Forever",
            "description": "Perfect for taking your first steps",
            "features": [
                "1 Free Course Access",
                "1 Free Workshop / Month",
                "Community Access"
            ],
            "cta": "Create Free Account",
            "ctaLink": "/register"
        },
        "advanced": {
            "name": "Full Access",
            "tier": "advanced",
            "price": "€29",
            "period": "/mo",
            "description": "Unlock your full potential",
            "features": [
                "Unlimited Course Access",
                "New Workshops Weekly",
                "Advanced Partnerwork",
                "Community Challenges"
            ],
            "cta": "Start 7-Day Free Trial",
            "ctaLink": "/pricing",
            "highlighted": True
        },
        "performer": {
            "name": "Performer",
            "tier": "performer",
            "price": "€49",
            "period": "/mo",
            "description": "For the dedicated artist",
            "features": [
                "Everything in Advanced",
                "1 Video Review / Month",
                "Direct Chat with Instructors",
                "Certified Badge on Profile"
            ],
            "cta": "Step Onto The Stage",
            "ctaLink": "/pricing"
        }
    }

    return {
        "type": "recommendation",
        "tier_info": tier_data.get(tier, tier_data["rookie"]),
        "reasoning": reasoning
    }

def execute_search_knowledge_base(query: str) -> dict:
    """
    Execute the knowledge base search tool.
    Currently a placeholder - will be connected to Vector DB/RAG later.
    """
    # Placeholder response - will be replaced with actual RAG implementation
    return {
        "type": "knowledge_base",
        "query": query,
        "result": f"That's a great question about '{query}'! Our detailed knowledge base with step-by-step tutorials is coming soon. In the meantime, I'd recommend checking out our beginner courses which cover the fundamentals thoroughly. Would you like me to tell you more about our course offerings?"
    }

def execute_tool(name: str, args: dict) -> dict:
    """Route tool execution to the appropriate handler."""
    if name == "recommend_membership":
        return execute_recommend_membership(args.get("tier", "rookie"), args.get("reasoning", ""))
    elif name == "search_knowledge_base":
        return execute_search_knowledge_base(args.get("query", ""))
    else:
        return {"type": "error", "message": f"Unknown tool: {name}"}

# =============================================================================
# Gemini Model Setup
# =============================================================================

def get_gemini_model():
    """Initialize Gemini model with tools configured."""
    try:
        import google.generativeai as genai
    except ImportError:
        raise HTTPException(
            status_code=503,
            detail="AI service not available. google-generativeai package not installed."
        )

    api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="AI service not configured. GEMINI_API_KEY not set."
        )

    genai.configure(api_key=api_key)

    # Create tool declarations
    tools = [
        genai.protos.Tool(
            function_declarations=[
                genai.protos.FunctionDeclaration(
                    name=tool["name"],
                    description=tool["description"],
                    parameters=genai.protos.Schema(
                        type=genai.protos.Type.OBJECT,
                        properties={
                            k: genai.protos.Schema(
                                type=genai.protos.Type.STRING,
                                description=v.get("description", ""),
                                enum=v.get("enum") if "enum" in v else None
                            )
                            for k, v in tool["parameters"]["properties"].items()
                        },
                        required=tool["parameters"].get("required", [])
                    )
                )
                for tool in TOOL_DEFINITIONS
            ]
        )
    ]

    return genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        generation_config={
            "temperature": 0.8,
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 1024,
        },
        safety_settings=[
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
        ],
        tools=tools,
        system_instruction=DIEGO_SYSTEM_PROMPT
    )

# =============================================================================
# Streaming Response Generator
# =============================================================================

async def stream_gemini_response(
    model,
    messages: List[ChatMessage]
) -> AsyncGenerator[str, None]:
    """
    Stream response from Gemini API with function calling support.
    Yields SSE-formatted chunks including function calls.
    """
    # Build conversation history for Gemini
    history = []

    for msg in messages[:-1]:
        role = "user" if msg.role == "user" else "model"
        history.append({"role": role, "parts": [msg.content]})

    # Start chat with history
    chat = model.start_chat(history=history)

    # Get the last user message
    last_message = messages[-1].content

    try:
        # Send message with streaming
        response = await chat.send_message_async(last_message, stream=True)

        accumulated_text = ""
        function_call = None

        async for chunk in response:
            # Check for function calls
            if chunk.candidates:
                candidate = chunk.candidates[0]
                if candidate.content and candidate.content.parts:
                    for part in candidate.content.parts:
                        # Handle text content
                        if hasattr(part, 'text') and part.text:
                            accumulated_text += part.text
                            yield f"data: {json.dumps({'type': 'text', 'content': part.text, 'done': False})}\n\n"

                        # Handle function calls
                        if hasattr(part, 'function_call') and part.function_call:
                            fc = part.function_call
                            function_call = {
                                "name": fc.name,
                                "args": dict(fc.args) if fc.args else {}
                            }

        # If there was a function call, execute it and send the result
        if function_call:
            tool_result = execute_tool(function_call["name"], function_call["args"])
            yield f"data: {json.dumps({'type': 'function_call', 'name': function_call['name'], 'args': function_call['args'], 'result': tool_result, 'done': False})}\n\n"

        # Send completion signal
        yield f"data: {json.dumps({'type': 'done', 'content': '', 'done': True})}\n\n"

    except Exception as e:
        error_msg = str(e)
        if "API key" in error_msg.lower():
            error_msg = "AI service configuration error"
        yield f"data: {json.dumps({'type': 'error', 'error': error_msg, 'done': True})}\n\n"

# =============================================================================
# API Endpoints
# =============================================================================

@router.post("/chat")
async def chat_endpoint(request: Request, chat_request: ChatRequest):
    """
    Main chat endpoint with streaming and function calling support.

    Response types in stream:
    - text: Regular text content from Diego
    - function_call: A tool was invoked with results
    - done: Stream complete
    - error: An error occurred
    """
    # Check rate limit
    client_id = get_client_identifier(request)
    rate_info = await check_rate_limit(client_id)

    # Get Gemini model with tools
    model = get_gemini_model()

    if chat_request.stream:
        return StreamingResponse(
            stream_gemini_response(model, chat_request.messages),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-RateLimit-Remaining": str(rate_info["remaining"]),
                "X-RateLimit-Reset": str(rate_info["reset_in_seconds"]),
            }
        )
    else:
        # Non-streaming response
        try:
            history = []
            for msg in chat_request.messages[:-1]:
                role = "user" if msg.role == "user" else "model"
                history.append({"role": role, "parts": [msg.content]})

            chat = model.start_chat(history=history)
            last_message = chat_request.messages[-1].content
            response = await chat.send_message_async(last_message)

            # Check for function calls in response
            function_call = None
            text_content = ""

            if response.candidates:
                candidate = response.candidates[0]
                if candidate.content and candidate.content.parts:
                    for part in candidate.content.parts:
                        if hasattr(part, 'text') and part.text:
                            text_content += part.text
                        if hasattr(part, 'function_call') and part.function_call:
                            fc = part.function_call
                            function_call = {
                                "name": fc.name,
                                "args": dict(fc.args) if fc.args else {}
                            }

            result = {
                "content": text_content,
                "rate_limit": rate_info
            }

            if function_call:
                tool_result = execute_tool(function_call["name"], function_call["args"])
                result["function_call"] = {
                    "name": function_call["name"],
                    "args": function_call["args"],
                    "result": tool_result
                }

            return result

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate response. Please try again."
            )

@router.get("/status")
async def ai_status():
    """Check if AI service is available."""
    available = settings.GEMINI_API_KEY is not None

    return {
        "available": available,
        "model": "gemini-2.0-flash" if available else None,
        "persona": "Diego - Head Concierge",
        "tools": [t["name"] for t in TOOL_DEFINITIONS] if available else [],
        "rate_limit": {
            "requests_per_window": settings.AI_RATE_LIMIT_REQUESTS,
            "window_seconds": settings.AI_RATE_LIMIT_WINDOW_SECONDS
        }
    }

@router.get("/rate-limit")
async def get_rate_limit_status(request: Request):
    """Get current rate limit status for the client."""
    client_id = get_client_identifier(request)
    redis_client = await get_redis_client()

    key = f"ai_rate_limit:{client_id}"
    window = settings.AI_RATE_LIMIT_WINDOW_SECONDS
    max_requests = settings.AI_RATE_LIMIT_REQUESTS

    now = time.time()
    window_start = now - window

    await redis_client.zremrangebyscore(key, 0, window_start)
    request_count = await redis_client.zcard(key)

    remaining = max(0, max_requests - request_count)

    return {
        "remaining": remaining,
        "limit": max_requests,
        "window_seconds": window
    }
