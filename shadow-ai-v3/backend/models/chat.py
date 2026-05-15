from pydantic import BaseModel
from typing import List, Literal

class Message(BaseModel):
    role: Literal["user", "model"]
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[Message] = []
    language: str = "Japanese"
    level: str = "N5"
    topic: str = "daily life"
    mode: str = "teacher"  # teacher | friend | manager | customer | interviewer

class ChatResponse(BaseModel):
    reply: str | None = None
    error: str | None = None
