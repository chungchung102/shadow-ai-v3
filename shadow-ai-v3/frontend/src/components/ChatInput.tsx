"use client";

import { useState, useRef, useEffect } from "react";
import { useSTT } from "@/hooks/useSTT";

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
  language?: string;
}

export default function ChatInput({ onSend, disabled, language = "Japanese" }: Props) {
  const [value, setValue] = useState("");
  const [sttError, setSttError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { startListening, stopListening, listening, supported: micSupported } = useSTT({
    language,
    onResult: (t) => { setValue((p) => p ? p + " " + t : t); setSttError(null); },
    onError: (e) => setSttError(e),
  });

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [value]);

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {sttError && (
        <p style={{ color: "var(--c-red)", fontSize: "0.8rem", paddingLeft: 4 }}>{sttError}</p>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 10,
          background: "var(--c-card)",
          border: `1.5px solid ${listening ? "var(--c-red)" : "var(--c-border)"}`,
          borderRadius: 20,
          padding: "10px 12px",
          transition: "border-color 0.2s",
        }}
      >
        {/* Mic button */}
        {micSupported && (
          <button
            onClick={listening ? stopListening : startListening}
            disabled={disabled}
            style={{
              position: "relative",
              width: 44, height: 44,
              borderRadius: "50%",
              border: "none",
              background: listening
                ? "var(--c-red)"
                : "linear-gradient(135deg, #7c3aed, #2dd4bf)",
              color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              cursor: "pointer",
              opacity: disabled ? 0.4 : 1,
            }}
            className={listening ? "mic-pulse" : ""}
          >
            <MicIcon />
          </button>
        )}

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
          }}
          disabled={disabled || listening}
          rows={1}
          placeholder={listening ? "Đang nghe... nói ngay đi 🎙️" : "Nhập hoặc nói bằng mic..."}
          style={{
            flex: 1,
            resize: "none",
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--c-text)",
            fontSize: "1rem",
            lineHeight: 1.5,
            minHeight: 36,
            maxHeight: 120,
            fontFamily: "var(--font-main)",
          }}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={disabled || !value.trim() || listening}
          style={{
            width: 44, height: 44,
            borderRadius: "50%",
            border: "none",
            background: disabled || !value.trim()
              ? "var(--c-border)"
              : "linear-gradient(135deg, #a78bfa, #f472b6)",
            color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            cursor: disabled || !value.trim() ? "not-allowed" : "pointer",
            transition: "background 0.2s",
          }}
        >
          {disabled
            ? <SpinIcon />
            : <SendIcon />
          }
        </button>
      </div>
    </div>
  );
}

function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="2" width="6" height="12" rx="3" stroke="white" strokeWidth="2"/>
      <path d="M5 10a7 7 0 0 0 14 0" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="12" y1="17" x2="12" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="9" y1="21" x2="15" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  );
}
function SpinIcon() {
  return (
    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}
