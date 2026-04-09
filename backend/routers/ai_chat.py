"""
Agentic Sales Concierge - Diego
================================
A sophisticated AI concierge using Anthropic Claude with Tool Use.

Security Features:
- API key stored server-side only (never exposed to client)
- Rate limiting per user via Redis
- Input sanitization and validation
- No PII in logs
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, AsyncGenerator, Literal
import hashlib
import time
import json
import re
import redis.asyncio as redis
from sqlalchemy.orm import Session
from models import get_db
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
                "message": "Please wait before sending more messages."
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

# =============================================================================
# Diego Persona & Tool Definitions
# =============================================================================

DIEGO_SYSTEM_PROMPT = """You are 'Diego', the Head Concierge at The Mambo Guild - an exclusive online salsa dance academy.

STYLE:
- Charming, sophisticated, with 1920s Havana flair
- Warm, authoritative but humble
- Use occasional Spanish phrases naturally (Hola, mi amigo, magnifico, etc.)
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

# Tool definitions in Anthropic format
ANTHROPIC_TOOLS = [
    {
        "name": "recommend_membership",
        "description": "Call this when you have identified the user's dance level and goals, and want to present a specific membership tier. Only call after asking at least one qualifying question.",
        "input_schema": {
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
        "description": "Call this when the user asks a specific technical question about salsa steps, techniques, history, or musicality that requires detailed information.",
        "input_schema": {
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
    """Execute the membership recommendation tool."""
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

def execute_search_knowledge_base(query: str, db: Optional[Session] = None) -> dict:
    """Search published courses and lessons for content relevant to the query."""
    if db is None:
        return {
            "type": "knowledge_base",
            "query": query,
            "result": "Our detailed course catalogue is loading. Please check /courses for our full course list."
        }

    try:
        from models.course import World, Lesson, Level

        terms = [t.lower() for t in query.split() if len(t) >= 3]
        if not terms:
            terms = [query.lower()]

        all_worlds = db.query(World).filter(World.is_published == True).all()
        matching_worlds = [
            w for w in all_worlds
            if any(
                t in (w.title or "").lower() or t in (w.description or "").lower()
                for t in terms
            )
        ]

        all_lessons = (
            db.query(Lesson)
            .join(Level, Lesson.level_id == Level.id)
            .join(World, Level.world_id == World.id)
            .filter(World.is_published == True)
            .limit(100)
            .all()
        )
        matching_lessons = [
            l for l in all_lessons
            if any(
                t in (l.title or "").lower() or t in (l.description or "").lower()
                for t in terms
            )
        ]

        results: List[str] = []
        for w in matching_worlds[:3]:
            desc = (w.description or "").strip()
            results.append(f"Course - {w.title}: {desc[:120]}" if desc else f"Course - {w.title}")
        for l in matching_lessons[:5]:
            desc = (l.description or "").strip()
            results.append(f"Lesson - {l.title}: {desc[:120]}" if desc else f"Lesson - {l.title}")

        if results:
            summary = " | ".join(results)
            return {
                "type": "knowledge_base",
                "query": query,
                "result": f"I found the following relevant content: {summary}"
            }

        return {
            "type": "knowledge_base",
            "query": query,
            "result": (
                f"I don't have a specific lesson on '{query}' in the catalogue yet, "
                "but our courses cover fundamentals, partnerwork, and choreography. "
                "Visit /courses for the full list or ask me about a specific course."
            )
        }
    except Exception:
        return {
            "type": "knowledge_base",
            "query": query,
            "result": "I'm having trouble searching our course catalogue right now. Please check /courses directly."
        }


def execute_tool(name: str, args: dict, db: Optional[Session] = None) -> dict:
    """Route tool execution to the appropriate handler."""
    if name == "recommend_membership":
        return execute_recommend_membership(args.get("tier", "rookie"), args.get("reasoning", ""))
    elif name == "search_knowledge_base":
        return execute_search_knowledge_base(args.get("query", ""), db=db)
    else:
        return {"type": "error", "message": f"Unknown tool: {name}"}

# =============================================================================
# Anthropic Client Setup
# =============================================================================

_anthropic_client = None

def get_anthropic_client():
    """Get or create the Anthropic client."""
    global _anthropic_client
    if _anthropic_client is None:
        try:
            import anthropic
        except ImportError:
            raise HTTPException(
                status_code=503,
                detail="AI service not available. anthropic package not installed."
            )

        api_key = settings.ANTHROPIC_API_KEY
        if not api_key:
            raise HTTPException(
                status_code=503,
                detail="AI service not configured. ANTHROPIC_API_KEY not set."
            )

        _anthropic_client = anthropic.Anthropic(api_key=api_key)
    return _anthropic_client

# =============================================================================
# Streaming Response Generator
# =============================================================================

async def stream_claude_response(
    messages: List[ChatMessage],
    db: Optional[Session] = None,
) -> AsyncGenerator[str, None]:
    """
    Stream response from Claude API with tool use support.
    Yields SSE-formatted chunks matching the existing frontend contract.
    """
    client = get_anthropic_client()

    # Build messages for Claude (system prompt is separate)
    claude_messages = []
    for msg in messages:
        role = "user" if msg.role == "user" else "assistant"
        claude_messages.append({"role": role, "content": msg.content})

    try:
        # First call - may return text or tool_use
        with client.messages.stream(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            system=DIEGO_SYSTEM_PROMPT,
            messages=claude_messages,
            tools=ANTHROPIC_TOOLS,
            temperature=0.8,
        ) as stream:
            accumulated_text = ""
            tool_use_block = None

            for event in stream:
                if event.type == "content_block_start":
                    if event.content_block.type == "tool_use":
                        tool_use_block = {
                            "id": event.content_block.id,
                            "name": event.content_block.name,
                            "input_json": ""
                        }
                elif event.type == "content_block_delta":
                    if event.delta.type == "text_delta":
                        text = event.delta.text
                        accumulated_text += text
                        yield f"data: {json.dumps({'type': 'text', 'content': text, 'done': False})}\n\n"
                    elif event.delta.type == "input_json_delta":
                        if tool_use_block:
                            tool_use_block["input_json"] += event.delta.partial_json
                elif event.type == "content_block_stop":
                    if tool_use_block:
                        # Parse tool input and execute
                        try:
                            tool_args = json.loads(tool_use_block["input_json"])
                        except json.JSONDecodeError:
                            tool_args = {}

                        tool_result = execute_tool(tool_use_block["name"], tool_args, db=db)
                        yield f"data: {json.dumps({'type': 'function_call', 'name': tool_use_block['name'], 'args': tool_args, 'result': tool_result, 'done': False})}\n\n"

                        # Send tool result back to Claude for a follow-up response
                        followup_messages = claude_messages + [
                            {
                                "role": "assistant",
                                "content": [
                                    {"type": "text", "text": accumulated_text} if accumulated_text else None,
                                    {
                                        "type": "tool_use",
                                        "id": tool_use_block["id"],
                                        "name": tool_use_block["name"],
                                        "input": tool_args,
                                    }
                                ]
                            },
                            {
                                "role": "user",
                                "content": [
                                    {
                                        "type": "tool_result",
                                        "tool_use_id": tool_use_block["id"],
                                        "content": json.dumps(tool_result),
                                    }
                                ]
                            }
                        ]
                        # Filter None from assistant content
                        for m in followup_messages:
                            if isinstance(m.get("content"), list):
                                m["content"] = [c for c in m["content"] if c is not None]

                        with client.messages.stream(
                            model="claude-sonnet-4-20250514",
                            max_tokens=1024,
                            system=DIEGO_SYSTEM_PROMPT,
                            messages=followup_messages,
                            tools=ANTHROPIC_TOOLS,
                            temperature=0.8,
                        ) as followup_stream:
                            for followup_event in followup_stream:
                                if followup_event.type == "content_block_delta" and followup_event.delta.type == "text_delta":
                                    yield f"data: {json.dumps({'type': 'text', 'content': followup_event.delta.text, 'done': False})}\n\n"

                        tool_use_block = None

        yield f"data: {json.dumps({'type': 'done', 'content': '', 'done': True})}\n\n"

    except Exception as e:
        error_msg = str(e)
        if "api key" in error_msg.lower() or "authentication" in error_msg.lower():
            error_msg = "AI service configuration error"
        yield f"data: {json.dumps({'type': 'error', 'error': error_msg, 'done': True})}\n\n"

# =============================================================================
# API Endpoints
# =============================================================================

@router.post("/chat")
async def chat_endpoint(
    request: Request,
    chat_request: ChatRequest,
    db: Session = Depends(get_db),
):
    """
    Main chat endpoint with streaming and tool use support.

    Response types in stream:
    - text: Regular text content from Diego
    - function_call: A tool was invoked with results
    - done: Stream complete
    - error: An error occurred
    """
    client_id = get_client_identifier(request)
    rate_info = await check_rate_limit(client_id)

    if chat_request.stream:
        return StreamingResponse(
            stream_claude_response(chat_request.messages, db=db),
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
            client = get_anthropic_client()

            claude_messages = []
            for msg in chat_request.messages:
                role = "user" if msg.role == "user" else "assistant"
                claude_messages.append({"role": role, "content": msg.content})

            response = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1024,
                system=DIEGO_SYSTEM_PROMPT,
                messages=claude_messages,
                tools=ANTHROPIC_TOOLS,
                temperature=0.8,
            )

            text_content = ""
            function_call = None

            for block in response.content:
                if block.type == "text":
                    text_content += block.text
                elif block.type == "tool_use":
                    tool_result = execute_tool(block.name, block.input, db=db)
                    function_call = {
                        "name": block.name,
                        "args": block.input,
                        "result": tool_result
                    }

            result = {
                "content": text_content,
                "rate_limit": rate_info
            }

            if function_call:
                result["function_call"] = function_call

            return result

        except Exception:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate response. Please try again."
            )

@router.get("/status")
async def ai_status():
    """Check if AI service is available."""
    available = settings.ANTHROPIC_API_KEY is not None

    return {
        "available": available,
        "model": "claude-sonnet-4-20250514" if available else None,
        "persona": "Diego - Head Concierge",
        "tools": [t["name"] for t in ANTHROPIC_TOOLS] if available else [],
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
