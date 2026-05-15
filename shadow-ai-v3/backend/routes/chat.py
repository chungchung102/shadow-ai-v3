from fastapi import APIRouter
from models.chat import ChatRequest, ChatResponse
from services.gemini_service import get_ai_reply
import asyncio

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    try:
        reply = await asyncio.wait_for(
            get_ai_reply(
                message=req.message,
                history=req.history,
                language=req.language,
                level=req.level,
                topic=req.topic,
                mode=req.mode,
            ),
            timeout=30.0,  # 30s timeout — avoid hanging forever
        )
        return ChatResponse(reply=reply)

    except asyncio.TimeoutError:
        return ChatResponse(error="AI mất quá nhiều thời gian. Thử lại nhé.")
    except Exception as e:
        return ChatResponse(error=f"Lỗi: {str(e)}")
