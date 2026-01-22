from typing import Any, List
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi import FastAPI, Request as FastAPIRequest
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os

from .utils.ollama_client import stream_ollama


load_dotenv(".env.local")

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

is_production = (
    os.getenv("RAILWAY_ENVIRONMENT_NAME") == "production"
    or os.getenv("VERCEL_ENV") == "production"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://screen.vision", "https://www.screen.vision"]
    if is_production
    else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MessagesRequest(BaseModel):
    messages: List[Any]


@app.post("/api/step")
@limiter.limit("20/minute;300/hour")
async def handle_step_chat(request: FastAPIRequest, body: MessagesRequest):
    # Replace OpenAI with local Ollama
    response = StreamingResponse(
        stream_ollama(body.messages, model="qwen3-vl", endpoint_name="step"),
        media_type="text/event-stream",
    )
    return response


@app.post("/api/help")
@limiter.limit("8/minute;100/hour")
async def handle_help_chat(request: FastAPIRequest, body: MessagesRequest):
    # Replace OpenAI with local Ollama
    response = StreamingResponse(
        stream_ollama(body.messages, model="qwen3-vl", endpoint_name="help"),
        media_type="text/event-stream",
    )
    return response


@app.post("/api/check")
@limiter.limit("30/minute;500/hour")
async def handle_check_chat(request: FastAPIRequest, body: MessagesRequest):
    # Replace Gemini/OpenRouter with local Ollama
    response = StreamingResponse(
        stream_ollama(body.messages, model="qwen3-vl", endpoint_name="check"),
        media_type="text/event-stream",
    )
    return response


@app.post("/api/coordinates")
@limiter.limit("15/minute;200/hour")
async def handle_coordinate_chat(request: FastAPIRequest, body: MessagesRequest):
    # Replace OpenRouter with local Ollama for vision model
    response = StreamingResponse(
        stream_ollama(body.messages, model="qwen3-vl", endpoint_name="coordinates"),
        media_type="text/event-stream",
    )
    return response
