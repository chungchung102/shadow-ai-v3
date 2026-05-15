from openai import AsyncOpenAI
import os
import json
import httpx
import time
from pathlib import Path
from dotenv import load_dotenv
from models.chat import Message
from prompts.kaiwa_prompt import build_system_prompt

MAX_HISTORY = 20

load_dotenv(dotenv_path=Path(__file__).resolve().parents[1] / ".env")

openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
if not openrouter_api_key:
    raise RuntimeError(
        "Missing OPENROUTER_API_KEY. Add it to backend/.env or set it in your shell before starting the backend."
    )

client = AsyncOpenAI(
    api_key=openrouter_api_key,
    base_url="https://openrouter.ai/api/v1",
)

# Cache để không fetch lại mỗi request
_free_models_cache: list[str] = []
_cache_timestamp: float = 0
CACHE_TTL = 3600  # 1 giờ


async def get_free_models() -> list[str]:
    """Fetch danh sách free models từ OpenRouter API, cache lại 1 giờ."""
    global _free_models_cache, _cache_timestamp

    if _free_models_cache and (time.time() - _cache_timestamp) < CACHE_TTL:
        return _free_models_cache

    try:
        async with httpx.AsyncClient(timeout=10) as http:
            resp = await http.get(
                "https://openrouter.ai/api/v1/models",
                headers={"Authorization": f"Bearer {openrouter_api_key}"},
            )
            resp.raise_for_status()
            data = resp.json()

        models = []
        for m in data.get("data", []):
            model_id: str = m.get("id", "")
            pricing = m.get("pricing", {})
            # Free model = prompt price == "0"
            prompt_price = str(pricing.get("prompt", "1"))
            completion_price = str(pricing.get("completion", "1"))
            if prompt_price == "0" and completion_price == "0":
                models.append(model_id)

        if models:
            _free_models_cache = models
            _cache_timestamp = time.time()
            print(f"[OpenRouter] Fetched {len(models)} free models")
        else:
            # Fallback cứng nếu API trả về rỗng bất ngờ
            print("[OpenRouter] Không tìm thấy free model, dùng fallback.")
            _free_models_cache = ["openrouter/free"]

    except Exception as e:
        print(f"[OpenRouter] Lỗi khi fetch models: {e}. Dùng fallback.")
        if not _free_models_cache:
            _free_models_cache = ["openrouter/free"]

    return _free_models_cache


async def _call_with_fallback(messages: list[dict], max_tokens: int = 1000) -> str:
    """Gọi API với auto-fallback qua toàn bộ free models."""
    free_models = await get_free_models()
    last_error = None

    for model in free_models:
        try:
            response = await client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=max_tokens,
            )
            return response.choices[0].message.content
        except Exception as e:
            error_str = str(e)
            # Bỏ qua model bị deprecated hoặc không tồn tại, thử tiếp
            if any(code in error_str for code in ["404", "deprecated", "not found"]):
                last_error = e
                continue
            # Lỗi khác (rate limit, auth...) cũng fallback
            last_error = e
            continue

    raise Exception(f"Tất cả {len(free_models)} free models đều lỗi: {last_error}")


async def get_ai_reply(
    message: str,
    history: list[Message],
    language: str,
    level: str,
    topic: str,
    mode: str,
) -> str:
    system_prompt = build_system_prompt(language, level, topic, mode)
    trimmed = history[-MAX_HISTORY:]

    messages = [{"role": "system", "content": system_prompt}]
    for msg in trimmed:
        messages.append({
            "role": "user" if msg.role == "user" else "assistant",
            "content": msg.content,
        })
    messages.append({"role": "user", "content": message})

    return await _call_with_fallback(messages)


async def get_shadowing_sentences(
    language: str,
    level: str,
    topic: str,
    count: int = 5,
) -> list:
    prompt = f"""Generate exactly {count} shadowing practice sentences for a language learner.
Language: {language}, Level: {level}, Topic: {topic}

Rules:
- Natural, realistic, level-appropriate sentences.
- SHORT for beginners (N5/A1/A2).

Return ONLY a valid JSON array. No markdown, no backticks, no explanation.
[{{"target": "sentence in {language}", "romanji": "romanization hint", "translation": "Vietnamese translation"}}]"""

    messages = [{"role": "user", "content": prompt}]

    free_models = await get_free_models()
    last_error = None

    for model in free_models:
        try:
            response = await client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=1000,
            )
            raw = response.choices[0].message.content.strip()
            # Strip markdown fences nếu model thêm vào
            if raw.startswith("```"):
                parts = raw.split("```")
                raw = parts[1] if len(parts) > 1 else raw
                if raw.startswith("json"):
                    raw = raw[4:]
            return json.loads(raw.strip())
        except json.JSONDecodeError:
            # Model trả về text không phải JSON → thử model tiếp
            last_error = Exception(f"Model {model} trả về JSON không hợp lệ")
            continue
        except Exception as e:
            last_error = e
            continue

    raise Exception(f"Không tạo được câu shadowing: {last_error}")
