"use client";

import { useState, useCallback } from "react";
import { useTTS } from "@/hooks/useTTS";
import { useSTT } from "@/hooks/useSTT";

interface Sentence {
  target: string;
  romanji: string;
  translation: string;
}

interface Props {
  language: string;
  level: string;
  topic: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function scoreSimilarity(target: string, spoken: string): number {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[、。？！,.!?\s]/g, "").trim();
  const a = normalize(target);
  const b = normalize(spoken);
  if (!b || !a) return 0;
  let matches = 0;
  const bArr = b.split("");
  for (const ch of a.split("")) {
    const idx = bArr.indexOf(ch);
    if (idx !== -1) { matches++; bArr.splice(idx, 1); }
  }
  return Math.round((matches / Math.max(a.length, b.length)) * 100);
}

function ScoreRing({ score }: { score: number }) {
  const r = 40;
  const circ = 2 * Math.PI * r; // ~251
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#4ade80" : score >= 50 ? "#fbbf24" : "#f87171";
  const label = score >= 80 ? "Tuyệt vời! 🎉" : score >= 50 ? "Khá tốt 👍" : "Thử lại 💪";

  return (
    <div className="flex flex-col items-center gap-2 fade-up">
      <div style={{ position: "relative", width: 100, height: 100 }}>
        <svg width="100" height="100" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="50" cy="50" r={r} fill="none" stroke="var(--c-border)" strokeWidth="8" />
          <circle
            cx="50" cy="50" r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.3s" }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: "1.5rem", fontWeight: 900, color }}>{score}%</span>
        </div>
      </div>
      <span style={{ color, fontWeight: 700, fontSize: "0.95rem" }}>{label}</span>
    </div>
  );
}

export default function ShadowingMode({ language, level, topic }: Props) {
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [spokenText, setSpokenText] = useState("");
  const [showRomanji, setShowRomanji] = useState(true);
  const [showTrans, setShowTrans] = useState(false);

  const { speak, speakSlow, stop, speaking } = useTTS(language);

  const { startListening, stopListening, listening } = useSTT({
    language,
    onResult: (t) => {
      setSpokenText(t);
      setScore(scoreSimilarity(sentences[idx]?.target ?? "", t));
    },
    onError: (e) => setError(e),
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    setSentences([]);
    setIdx(0);
    setScore(null);
    setSpokenText("");
    try {
      const res = await fetch(`${API_URL}/api/shadowing/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, level, topic, count: 5 }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setSentences(data.sentences);
    } catch {
      setError("Không kết nối được backend.");
    } finally {
      setLoading(false);
    }
  };

  const current = sentences[idx];

  const goNext = () => {
    if (idx < sentences.length - 1) {
      setIdx(i => i + 1); setScore(null); setSpokenText(""); stop();
    }
  };
  const goPrev = () => {
    if (idx > 0) {
      setIdx(i => i - 1); setScore(null); setSpokenText(""); stop();
    }
  };

  // Empty / loading state
  if (!current) {
    return (
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 20, padding: "48px 24px", textAlign: "center",
        minHeight: 400,
      }}>
        <div style={{ fontSize: "3.5rem" }}>🎙️</div>
        <div>
          <p style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--c-text)" }}>
            Shadowing Mode
          </p>
          <p style={{ color: "var(--c-muted)", marginTop: 8, fontSize: "0.95rem", lineHeight: 1.6 }}>
            AI tạo câu theo chủ đề và level của bạn.<br />
            Nghe → Nhại lại → Chấm điểm.
          </p>
        </div>

        {error && (
          <p style={{ color: "var(--c-red)", fontSize: "0.9rem" }}>{error}</p>
        )}

        <button
          onClick={load}
          disabled={loading}
          style={{
            background: loading ? "var(--c-border)" : "linear-gradient(135deg, #7c3aed, #2dd4bf)",
            color: "#fff",
            border: "none",
            borderRadius: 16,
            padding: "14px 32px",
            fontSize: "1rem",
            fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer",
            letterSpacing: "0.02em",
          }}
        >
          {loading ? "Đang tạo câu..." : "Bắt đầu luyện →"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingBottom: 24 }}>

      {/* Progress bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ color: "var(--c-muted)", fontSize: "0.85rem" }}>
          Câu {idx + 1} / {sentences.length}
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          {sentences.map((_, i) => (
            <div key={i} style={{
              width: 28, height: 4, borderRadius: 99,
              background: i === idx
                ? "linear-gradient(90deg, #7c3aed, #2dd4bf)"
                : i < idx ? "var(--c-purple)" : "var(--c-border)",
              transition: "background 0.3s",
            }} />
          ))}
        </div>
        <button
          onClick={load}
          style={{ color: "var(--c-muted)", fontSize: "0.8rem", background: "none", border: "none", cursor: "pointer" }}
        >
          Làm lại
        </button>
      </div>

      {/* Main card */}
      <div style={{
        background: "var(--c-card)",
        border: "1.5px solid var(--c-border)",
        borderRadius: 24,
        padding: "28px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        alignItems: "center",
      }}>

        {/* Target sentence */}
        <div style={{ textAlign: "center", width: "100%" }}>
          <p style={{
            fontSize: "1.6rem",
            fontWeight: 800,
            color: "var(--c-text)",
            lineHeight: 1.5,
            fontFamily: language === "Japanese" || language === "Chinese"
              ? "var(--font-jp)" : "var(--font-main)",
            letterSpacing: language === "Japanese" ? "0.05em" : "normal",
          }}>
            {current.target}
          </p>

          {/* Romanji toggle */}
          <button
            onClick={() => setShowRomanji(v => !v)}
            style={{
              marginTop: 10, color: "var(--c-purple)",
              fontSize: "0.82rem", background: "none", border: "none",
              cursor: "pointer", fontWeight: 600,
            }}
          >
            {showRomanji ? "Ẩn romanji ↑" : "Hiện romanji ↓"}
          </button>

          {showRomanji && (
            <p style={{
              color: "var(--c-muted)", fontSize: "0.9rem",
              marginTop: 4, lineHeight: 1.6,
            }}>
              {current.romanji}
            </p>
          )}

          {/* Translation toggle */}
          <button
            onClick={() => setShowTrans(v => !v)}
            style={{
              marginTop: 8, color: "var(--c-teal)",
              fontSize: "0.82rem", background: "none", border: "none",
              cursor: "pointer", fontWeight: 600,
            }}
          >
            {showTrans ? "Ẩn dịch ↑" : "Xem nghĩa ↓"}
          </button>

          {showTrans && (
            <p style={{
              color: "var(--c-teal)", fontSize: "0.9rem",
              marginTop: 4, lineHeight: 1.6,
            }}>
              {current.translation}
            </p>
          )}
        </div>

        {/* Play buttons */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={() => speaking ? stop() : speak(current.target)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "12px 22px", borderRadius: 14, border: "none",
              background: speaking
                ? "var(--c-border)"
                : "linear-gradient(135deg, #7c3aed, #a78bfa)",
              color: "#fff", fontSize: "0.95rem", fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {speaking ? "⏹ Dừng" : "▶ Nghe"}
          </button>

          <button
            onClick={() => speakSlow(current.target)}
            disabled={speaking}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "12px 22px", borderRadius: 14,
              border: "1.5px solid var(--c-border)",
              background: "transparent",
              color: "var(--c-muted)", fontSize: "0.95rem", fontWeight: 700,
              cursor: speaking ? "not-allowed" : "pointer",
              opacity: speaking ? 0.5 : 1,
            }}
          >
            🐢 Chậm
          </button>
        </div>

        {/* Record button */}
        <button
          onClick={listening ? stopListening : startListening}
          disabled={speaking}
          style={{
            position: "relative",
            width: "100%",
            padding: "16px",
            borderRadius: 16,
            border: "none",
            background: listening
              ? "linear-gradient(135deg, #ef4444, #f87171)"
              : "linear-gradient(135deg, #f472b6, #a78bfa)",
            color: "#fff",
            fontSize: "1.05rem",
            fontWeight: 800,
            cursor: speaking ? "not-allowed" : "pointer",
            opacity: speaking ? 0.4 : 1,
            letterSpacing: "0.02em",
          }}
          className={listening ? "mic-pulse" : ""}
        >
          {listening ? "🔴 Đang ghi... nhấn để dừng" : "🎤 Nhại lại"}
        </button>

        {error && (
          <p style={{ color: "var(--c-red)", fontSize: "0.85rem" }}>{error}</p>
        )}

        {/* Score section */}
        {score !== null && (
          <div className="fade-up" style={{
            width: "100%", display: "flex", flexDirection: "column",
            alignItems: "center", gap: 16,
            borderTop: "1px solid var(--c-border)", paddingTop: 20,
          }}>
            <ScoreRing score={score} />

            <div style={{ textAlign: "center", width: "100%" }}>
              {spokenText && (
                <div style={{ marginBottom: 8 }}>
                  <span style={{ color: "var(--c-muted)", fontSize: "0.8rem" }}>Bạn nói: </span>
                  <span style={{ color: "var(--c-yellow)", fontSize: "0.9rem", fontWeight: 600 }}>
                    "{spokenText}"
                  </span>
                </div>
              )}
              <div>
                <span style={{ color: "var(--c-muted)", fontSize: "0.8rem" }}>Chuẩn: </span>
                <span style={{ color: "var(--c-teal)", fontSize: "0.9rem", fontWeight: 600 }}>
                  "{current.target}"
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button
          onClick={goPrev}
          disabled={idx === 0}
          style={{
            background: "none", border: "none",
            color: idx === 0 ? "var(--c-dim)" : "var(--c-muted)",
            fontSize: "0.95rem", fontWeight: 700, cursor: idx === 0 ? "not-allowed" : "pointer",
          }}
        >
          ← Câu trước
        </button>

        <button
          onClick={goNext}
          disabled={idx === sentences.length - 1}
          style={{
            background: "none", border: "none",
            color: idx === sentences.length - 1 ? "var(--c-dim)" : "var(--c-purple)",
            fontSize: "0.95rem", fontWeight: 700,
            cursor: idx === sentences.length - 1 ? "not-allowed" : "pointer",
          }}
        >
          Câu tiếp →
        </button>
      </div>
    </div>
  );
}
