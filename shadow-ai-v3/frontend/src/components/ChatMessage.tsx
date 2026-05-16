"use client";

import { Message } from "@/hooks/useChat";
import { useTTS } from "@/hooks/useTTS";

interface Props {
  message: Message;
  language: string;
}

function renderMarkdown(text: string): React.ReactNode[] {
  return text.split("\n").map((line, i) => {
    if (/^---+$/.test(line.trim()))
      return <hr key={i} style={{ borderColor: "var(--c-border)", margin: "8px 0" }} />;
    if (!line.trim()) return <div key={i} style={{ height: 4 }} />;

    const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    const inline = parts.map((p, j) => {
      if (p.startsWith("**") && p.endsWith("**"))
        return <strong key={j} style={{ color: "var(--c-yellow)" }}>{p.slice(2, -2)}</strong>;
      if (p.startsWith("*") && p.endsWith("*"))
        return <em key={j} style={{ color: "var(--c-teal)" }}>{p.slice(1, -1)}</em>;
      // Highlight correction lines
      if (line.startsWith("💡") || line.startsWith("✨"))
        return <span key={j} style={{ color: "var(--c-purple)" }}>{p}</span>;
      return p;
    });
    return <p key={i} style={{ lineHeight: 1.7 }}>{inline}</p>;
  });
}

export default function ChatMessage({ message, language }: Props) {
  const isUser = message.role === "user";
  const { speak, speakSlow, stop, speaking } = useTTS(language);
  const replyOnly = message.content.split(/^---/m)[0].trim();

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 fade-up`}>
      {!isUser && (
        <div
          className="shrink-0 mr-2 mt-1 flex items-center justify-center rounded-full text-xs font-black"
          style={{
            width: 32, height: 32,
            background: "linear-gradient(135deg, #7c3aed, #2dd4bf)",
            color: "#fff",
            fontSize: "0.65rem",
            letterSpacing: "0.05em",
          }}
        >
          AI
        </div>
      )}

      <div className="flex flex-col gap-1.5" style={{ maxWidth: "82%" }}>
        <div
          className="px-4 py-3 rounded-2xl text-base"
          style={isUser ? {
            background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
            color: "#fff",
            borderRadius: "18px 18px 4px 18px",
            fontSize: "1rem",
            lineHeight: 1.6,
          } : {
            background: "var(--c-card)",
            border: "1.5px solid var(--c-border)",
            color: "var(--c-text)",
            borderRadius: "18px 18px 18px 4px",
            fontSize: "1rem",
            lineHeight: 1.6,
          }}
        >
          {isUser
            ? <p style={{ lineHeight: 1.6 }}>{message.content}</p>
            : <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {renderMarkdown(message.content)}
              </div>
          }
        </div>

        {/* TTS controls */}
        {!isUser && (
          <div className="flex gap-3 pl-1">
            <button
              onClick={() => speaking ? stop() : speak(replyOnly)}
              style={{ color: speaking ? "var(--c-teal)" : "var(--c-muted)", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 4 }}
            >
              {speaking ? <StopIcon /> : <SpeakIcon />}
              {speaking ? "Dừng" : "Nghe"}
            </button>
            {!speaking && (
              <button
                onClick={() => speakSlow(replyOnly)}
                style={{ color: "var(--c-muted)", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 4 }}
              >
                <SlowIcon /> Chậm
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SpeakIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
function SlowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" opacity="0.5"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
function StopIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" rx="1"/>
      <rect x="14" y="4" width="4" height="16" rx="1"/>
    </svg>
  );
}
