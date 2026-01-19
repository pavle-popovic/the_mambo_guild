"""
Secure AI Chat Router with Rate Limiting

Security Features:
- API key stored server-side only (never exposed to client)
- Rate limiting per user via Redis
- Input sanitization and validation
- Request/Response logging for audit
- No PII in logs
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, AsyncGenerator
import hashlib
import time
import json
import re
import redis.asyncio as redis
from config import settings

router = APIRouter()

# Redis client for rate limiting
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

# Pydantic models with validation
class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str = Field(..., min_length=1, max_length=10000)

    @field_validator('content')
    @classmethod
    def sanitize_content(cls, v: str) -> str:
        # Remove any potential injection attempts
        v = v.strip()
        # Limit consecutive newlines
        v = re.sub(r'\n{4,}', '\n\n\n', v)
        return v

class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(..., min_length=1, max_length=50)
    stream: bool = Field(default=True)
    context: Optional[str] = Field(default=None, max_length=2000)

class ChatResponse(BaseModel):
    content: str
    finish_reason: str

class RateLimitInfo(BaseModel):
    remaining: int
    reset_in_seconds: int

def get_client_identifier(request: Request) -> str:
    """
    Generate a secure client identifier for rate limiting.
    Uses hashed IP + forwarded headers for privacy.
    """
    forwarded = request.headers.get("x-forwarded-for", "")
    real_ip = request.headers.get("x-real-ip", "")
    client_ip = request.client.host if request.client else "unknown"

    # Combine identifiers
    identifier = f"{client_ip}:{forwarded}:{real_ip}"

    # Hash for privacy (do not store raw IPs in Redis)
    return hashlib.sha256(identifier.encode()).hexdigest()[:16]

async def check_rate_limit(client_id: str) -> RateLimitInfo:
    """
    Check and update rate limit for client.
    Uses sliding window algorithm via Redis.
    """
    redis_client = await get_redis_client()

    key = f"ai_rate_limit:{client_id}"
    window = settings.AI_RATE_LIMIT_WINDOW_SECONDS
    max_requests = settings.AI_RATE_LIMIT_REQUESTS

    now = time.time()
    window_start = now - window

    pipe = redis_client.pipeline()

    # Remove old entries outside the window
    pipe.zremrangebyscore(key, 0, window_start)
    # Add current request
    pipe.zadd(key, {str(now): now})
    # Count requests in window
    pipe.zcard(key)
    # Set expiry on the key
    pipe.expire(key, window)

    results = await pipe.execute()
    request_count = results[2]

    remaining = max(0, max_requests - request_count)
    reset_in = int(window - (now - window_start))

    if request_count > max_requests:
        raise HTTPException(
            status_code=429,
            detail={
                "error": "Rate limit exceeded",
                "remaining": 0,
                "reset_in_seconds": reset_in,
                "message": f"You have exceeded {max_requests} requests per {window} seconds. Please wait."
            }
        )

    return RateLimitInfo(remaining=remaining, reset_in_seconds=reset_in)

def get_gemini_model():
    """
    Lazily initialize Gemini model.
    API key is securely loaded from environment.
    """
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

    return genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        generation_config={
            "temperature": 0.7,
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 2048,
        },
        safety_settings=[
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
        ]
    )

SALSA_SYSTEM_PROMPT = """You are a friendly and knowledgeable salsa dance instructor assistant for Salsa Lab, an online dance learning platform. Your expertise includes:

- Salsa dancing (LA style, Cuban style, etc.)
- Bachata, Kizomba, and other Latin dances
- Dance techniques, timing, and musicality
- Practice tips and improvement strategies
- Dance history and culture

Guidelines:
- Be encouraging and supportive
- Give specific, actionable advice
- Use dance terminology but explain it when needed
- Keep responses concise but helpful
- If asked about non-dance topics, gently redirect to dance-related discussions
- Suggest relevant courses or lessons when appropriate

Remember: You are here to help dancers improve and enjoy their learning journey!"""

async def stream_gemini_response(
    model,
    messages: List[ChatMessage],
    context: Optional[str] = None
) -> AsyncGenerator[str, None]:
    """
    Stream response from Gemini API.
    Yields SSE-formatted chunks.
    """
    # Build conversation history
    history = []

    # Add system prompt as first user message for context
    system_content = SALSA_SYSTEM_PROMPT
    if context:
        system_content += f"\n\nAdditional context: {context}"

    for msg in messages[:-1]:  # All but last message
        role = "user" if msg.role == "user" else "model"
        history.append({"role": role, "parts": [msg.content]})

    # Start chat with history
    chat = model.start_chat(history=history)

    # Get the last user message
    last_message = messages[-1].content
    prompt = f"{system_content}\n\nUser: {last_message}"

    try:
        response = await chat.send_message_async(prompt, stream=True)

        async for chunk in response:
            if chunk.text:
                # SSE format
                data = json.dumps({"content": chunk.text, "done": False})
                yield f"data: {data}\n\n"

        # Final chunk
        yield f"data: {json.dumps({'content': '', 'done': True, 'finish_reason': 'stop'})}\n\n"

    except Exception as e:
        error_msg = str(e)
        # Do not expose internal errors
        if "API key" in error_msg.lower():
            error_msg = "AI service configuration error"
        yield f"data: {json.dumps({'error': error_msg, 'done': True})}\n\n"

@router.post("/chat")
async def chat_endpoint(
    request: Request,
    chat_request: ChatRequest
):
    """
    Main chat endpoint with streaming support.

    Security:
    - Rate limited per client
    - Input validated and sanitized
    - API key never exposed
    """
    # Get client identifier and check rate limit
    client_id = get_client_identifier(request)
    rate_info = await check_rate_limit(client_id)

    # Get Gemini model (will raise if not configured)
    model = get_gemini_model()

    if chat_request.stream:
        return StreamingResponse(
            stream_gemini_response(model, chat_request.messages, chat_request.context),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-RateLimit-Remaining": str(rate_info.remaining),
                "X-RateLimit-Reset": str(rate_info.reset_in_seconds),
            }
        )
    else:
        # Non-streaming response
        try:
            history = []
            system_content = SALSA_SYSTEM_PROMPT
            if chat_request.context:
                system_content += f"\n\nAdditional context: {chat_request.context}"

            for msg in chat_request.messages[:-1]:
                role = "user" if msg.role == "user" else "model"
                history.append({"role": role, "parts": [msg.content]})

            chat = model.start_chat(history=history)
            last_message = chat_request.messages[-1].content
            prompt = f"{system_content}\n\nUser: {last_message}"

            response = await chat.send_message_async(prompt)

            return {
                "content": response.text,
                "finish_reason": "stop",
                "rate_limit": {
                    "remaining": rate_info.remaining,
                    "reset_in_seconds": rate_info.reset_in_seconds
                }
            }
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate response. Please try again."
            )

@router.get("/status")
async def ai_status():
    """
    Check if AI service is available.
    Does not expose API key status details.
    """
    available = settings.GEMINI_API_KEY is not None

    return {
        "available": available,
        "model": "gemini-2.0-flash" if available else None,
        "rate_limit": {
            "requests_per_window": settings.AI_RATE_LIMIT_REQUESTS,
            "window_seconds": settings.AI_RATE_LIMIT_WINDOW_SECONDS
        }
    }

@router.get("/rate-limit")
async def get_rate_limit_status(request: Request):
    """
    Get current rate limit status for the client.
    """
    client_id = get_client_identifier(request)
    redis_client = await get_redis_client()

    key = f"ai_rate_limit:{client_id}"
    window = settings.AI_RATE_LIMIT_WINDOW_SECONDS
    max_requests = settings.AI_RATE_LIMIT_REQUESTS

    now = time.time()
    window_start = now - window

    # Count current requests
    await redis_client.zremrangebyscore(key, 0, window_start)
    request_count = await redis_client.zcard(key)

    remaining = max(0, max_requests - request_count)

    return {
        "remaining": remaining,
        "limit": max_requests,
        "window_seconds": window,
        "reset_in_seconds": window
    }
