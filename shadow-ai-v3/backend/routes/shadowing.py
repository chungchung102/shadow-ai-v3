from fastapi import APIRouter
from pydantic import BaseModel
from services.gemini_service import get_shadowing_sentences

router = APIRouter()

class ShadowingRequest(BaseModel):
    language: str = "Japanese"
    level: str = "N5"
    topic: str = "daily life"
    count: int = 5  # how many sentences to generate

class ShadowingSentence(BaseModel):
    target: str        # sentence in target language
    romanji: str       # romanji / pronunciation hint
    translation: str   # Vietnamese translation

class ShadowingResponse(BaseModel):
    sentences: list[ShadowingSentence] = []
    error: str | None = None

@router.post("/shadowing/generate", response_model=ShadowingResponse)
async def generate_shadowing(req: ShadowingRequest):
    try:
        sentences = await get_shadowing_sentences(
            language=req.language,
            level=req.level,
            topic=req.topic,
            count=req.count,
        )
        return ShadowingResponse(sentences=sentences)
    except Exception as e:
        return ShadowingResponse(error=str(e))
