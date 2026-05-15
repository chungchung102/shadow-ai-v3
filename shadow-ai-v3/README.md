# Shadow AI — v0.3

AI language speaking trainer. Luyện kaiwa + shadowing với AI theo cấp độ và chủ đề.

---

## Cấu trúc project

```
shadow-ai-v3/
├── backend/
│   ├── main.py                      ← FastAPI entry, CORS, routes
│   ├── requirements.txt
│   ├── .env.example                 ← copy → .env rồi điền key
│   ├── routes/
│   │   ├── chat.py                  ← POST /api/chat (kaiwa)
│   │   └── shadowing.py             ← POST /api/shadowing/generate
│   ├── services/
│   │   └── gemini_service.py        ← Gemini calls + history trim
│   ├── prompts/
│   │   └── kaiwa_prompt.py          ← system prompt builder
│   └── models/
│       └── chat.py                  ← Pydantic models
│
└── frontend/src/
    ├── app/
    │   └── page.tsx                 ← main page, tab Kaiwa/Shadowing
    ├── components/
    │   ├── ChatConfig.tsx           ← language/level/topic/mode dropdowns
    │   ├── ChatMessage.tsx          ← bubble + markdown + TTS buttons
    │   ├── ChatInput.tsx            ← textarea + mic + loading lock
    │   └── ShadowingMode.tsx        ← full shadowing UI + scoring
    └── hooks/
        ├── useChat.ts               ← history, loading, auto-scroll
        ├── useTTS.ts                ← Browser Speech API (text → voice)
        └── useSTT.ts                ← Browser Speech Recognition (voice → text)
```

---

## Setup

### 1. Backend

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt

# Tạo file .env
cp .env.example .env
# Mở .env → điền GEMINI_API_KEY=key_của_bạn

uvicorn main:app --reload
# → http://127.0.0.1:8000
# → http://127.0.0.1:8000/docs  (Swagger UI để test)
```

### 2. Frontend

```bash
cd frontend

# Nếu chưa có Next.js project:
npx create-next-app@latest . \
  --typescript --tailwind --eslint \
  --app --src-dir --no-import-alias

# Copy tất cả file trong src/ vào project rồi chạy:
npm run dev
# → http://localhost:3000
```

> **Lưu ý:** STT (mic) chỉ hoạt động trên Chrome/Edge.
> TTS dùng `window.speechSynthesis` — free, không cần API key.

---

## Tính năng v0.3

### 💬 Kaiwa Mode
- Chọn ngôn ngữ + level + chủ đề + persona (teacher / friend / manager / customer / interviewer)
- AI roleplay đúng level, sửa ngữ pháp, đề xuất cách nói native hơn
- Nhập bằng bàn phím hoặc **mic** (Chrome STT)
- Nút **Nghe / Nghe chậm** dưới mỗi tin AI (Browser TTS)
- Chat history, auto-scroll, typing animation

### 🎙️ Shadowing Mode
- AI tạo 5 câu theo level + chủ đề
- Nút **Nghe** (tốc độ thường) và **Chậm** (0.65x)
- Nút **Nhại lại** → mic ghi âm → so sánh → chấm điểm %
- Hiển thị romanji / pinyin / romanization (toggle ẩn/hiện)
- Dịch nghĩa (toggle)
- Điều hướng câu trước / câu tiếp

---

## Fixes so với v0.2

| v0.2 thiếu | v0.3 có |
|---|---|
| Chỉ có Kaiwa | Tab Kaiwa + Shadowing |
| Không có TTS | useTTS — Nghe / Nghe chậm |
| Không có STT mic | useSTT — mic input Chrome |
| ChatMessage thiếu `language` prop | Đã truyền đúng |
| ChatInput thiếu `language` prop | Đã truyền đúng |
| Page chưa wire đủ props | page.tsx hoàn chỉnh |
| ChatConfig không có showMode | Ẩn mode khi ở tab Shadowing |
| Không có Shadowing UI | ShadowingMode.tsx đầy đủ |
| Không có shadowing backend | /api/shadowing/generate |
| Không có scoring | scoreSimilarity() + ScoreBadge |

---

## Bước tiếp theo (v0.4)

- [ ] Supabase auth (đăng nhập Google)
- [ ] Lưu lịch sử học + streak
- [ ] Dashboard: biểu đồ shadowing score theo ngày
- [ ] Trang chọn chủ đề với UI card thay vì dropdown
- [ ] Auto-play TTS khi AI reply trong Kaiwa (toggle)
