from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")

from routes.chat import router as chat_router
from routes.shadowing import router as shadowing_router

app = FastAPI(title="Shadow AI v0.3")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://shadow-ai-v3-frontend-v3.vercel.app",
        "https://shadow-ai-v3-frontend-v3-mazm53sr4-chungchung102s-projects.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api")
app.include_router(shadowing_router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok", "version": "0.3"}