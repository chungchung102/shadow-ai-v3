"use client";

import { useRef, useState } from "react";

interface Props {
  language: string;
  level: string;
  topic: string;
  mode: string;
  onChange: (key: string, value: string) => void;
  disabled?: boolean;
  showMode?: boolean;
}

const LANGUAGES = [
  { value: "Japanese", flag: "🇯🇵" },
  { value: "English",  flag: "🇺🇸" },
  { value: "Korean",   flag: "🇰🇷" },
  { value: "Chinese",  flag: "🇨🇳" },
];

const LEVELS: Record<string, string[]> = {
  Japanese: ["N5","N4","N3","N2","N1"],
  English:  ["A1","A2","B1","B2","C1","C2"],
  Korean:   ["A1","A2","B1","B2"],
  Chinese:  ["HSK1","HSK2","HSK3","HSK4"],
};

// const TOPICS = [
//   { value: "daily life",          icon: "🌅" },
//   { value: "ramen shop",          icon: "🍜" },
//   { value: "convenience store",   icon: "🏪" },
//   { value: "coffee shop",         icon: "☕" },
//   { value: "job interview",       icon: "💼" },
//   { value: "workplace",           icon: "🏢" },
//   { value: "travel",              icon: "✈️" },
//   { value: "shopping",            icon: "🛍️" },
//   { value: "school",              icon: "📚" },
//   { value: "anime & manga",       icon: "⛩️" },
// ];

// const TOPICS = [
//   { value: "daily life",        label: "daily",      icon: "🌅" },
//   { value: "ramen shop",        label: "ramen",      icon: "🍜" },
//   { value: "convenience store", label: "konbini",    icon: "🏪" },
//   { value: "coffee shop",       label: "cafe",       icon: "☕" },
//   { value: "job interview",     label: "interview",  icon: "💼" },
//   { value: "workplace",         label: "office",     icon: "🏢" },
//   { value: "travel",            label: "travel",     icon: "✈️" },
//   { value: "shopping",          label: "shopping",   icon: "🛍️" },
//   { value: "school",            label: "school",     icon: "📚" },
//   { value: "anime & manga",     label: "anime",      icon: "🎌" },
// ];

const TOPICS = [
  { value: "daily life", label: "daily", icon: "🌅" },
  { value: "ramen shop", label: "ramen", icon: "🍜" },
  { value: "convenience store", label: "konbini", icon: "🏪" },
  { value: "coffee shop", label: "cafe", icon: "☕" },
  { value: "job interview", label: "interview", icon: "💼" },
  { value: "workplace", label: "office", icon: "🏢" },
  { value: "travel", label: "travel", icon: "✈️" },
  { value: "shopping", label: "shopping", icon: "🛍️" },
  { value: "school", label: "school", icon: "📚" },
  { value: "anime & manga", label: "anime", icon: "🎌" },
  { value: "dating", label: "dating", icon: "💕" },
  { value: "hospital", label: "hospital", icon: "🏥" },
  { value: "hotel", label: "hotel", icon: "🏨" },
];
const MODES = [
  { value: "teacher",     label: "Teacher",     icon: "👩‍🏫" },
  { value: "friend",      label: "Friend",      icon: "👋" },
  { value: "manager",     label: "Manager",     icon: "💼" },
  { value: "customer",    label: "Customer",    icon: "🛍️" },
  { value: "interviewer", label: "Interviewer", icon: "🎤" },
];

export default function ChatConfigPanel({
  language, level, topic, mode, onChange, disabled, showMode = true,
}: Props) {
  const levels = LEVELS[language] ?? LEVELS["English"];
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setDragStart(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - dragStart) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="flex flex-col gap-3 mb-4">
      {/* Row 1: Language + Level */}
      <div className="flex gap-2">
        {/* Language */}
        <div className="flex gap-3 overflow-x-auto pb-0.5 flex-1" style={{ scrollbarWidth: "none" }}>
          {LANGUAGES.map((l) => (
            <button
              key={l.value}
              disabled={disabled}
              onClick={() => {
                onChange("language", l.value);
                onChange("level", LEVELS[l.value]?.[0] ?? "A1");
              }}
              className="shrink-0 flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-700 transition-all disabled:opacity-40"
              style={{
                background: language === l.value
                  ? "linear-gradient(135deg, #7c3aed, #a78bfa)"
                  : "var(--c-card)",
                color: language === l.value ? "#fff" : "var(--c-muted)",
                border: `1.5px solid ${language === l.value ? "#a78bfa" : "var(--c-border)"}`,
                fontWeight: 700,
                fontSize: "1rem",
              }}
            >
              <span>{l.flag}</span>

            </button>
          ))}
        </div>
      </div>

      {/* Row 2: Level pills */}
      <div className="flex gap-3 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
        {levels.map((l) => (
          <button
            key={l}
            disabled={disabled}
            onClick={() => onChange("level", l)}
            className="shrink-0 px-5 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
            style={{
              background: level === l
                ? "linear-gradient(135deg, #2dd4bf, #7c3aed)"
                : "var(--c-card)",
              color: level === l ? "#fff" : "var(--c-muted)",
              border: `1.5px solid ${level === l ? "#2dd4bf" : "var(--c-border)"}`,
              fontSize: "0.95rem",
              fontWeight: 700,
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Row 3: Topic pills
      <div className="flex gap-3 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
        {TOPICS.map((t) => (
          <button
            key={t.value}
            disabled={disabled}
            onClick={() => onChange("topic", t.value)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
            style={{
              background: topic === t.value
                ? "linear-gradient(135deg, #f472b6, #a78bfa)"
                : "var(--c-card)",
              color: topic === t.value ? "#fff" : "var(--c-muted)",
              border: `1.5px solid ${topic === t.value ? "#f472b6" : "var(--c-border)"}`,
              whiteSpace: "nowrap",
            }}
          >
            <span>{t.icon}</span>
            <span>{t.value}</span>
          </button>
        ))}
      </div> */}

      {/* Row 3: Topic pills */}
{/* <div
  style={{
    position: "relative",
  }}
>
  <div
    className="flex gap-2 overflow-x-auto pb-1"
    style={{
      scrollbarWidth: "none",
      WebkitOverflowScrolling: "touch",
      paddingRight: 8,
    }}
  >
    {TOPICS.map((t) => (
      <button
        key={t.value}
        disabled={disabled}
        onClick={() => onChange("topic", t.value)}
        className="shrink-0 flex items-center gap-1.5 transition-all disabled:opacity-40"
        style={{
          padding: "8px 12px",
          borderRadius: 999,
          border:
            topic === t.value
              ? "1.5px solid #f472b6"
              : "1.5px solid var(--c-border)",

          background:
            topic === t.value
              ? "linear-gradient(135deg,#f472b6,#a78bfa)"
              : "var(--c-card)",

          color:
            topic === t.value
              ? "#fff"
              : "var(--c-muted)",

          whiteSpace: "nowrap",
          fontSize: "0.78rem",
          fontWeight: 700,
          flexShrink: 0,

          boxShadow:
            topic === t.value
              ? "0 4px 14px rgba(244,114,182,0.25)"
              : "none",
        }}
      >
        <span>{t.icon}</span>
        <span>{t.label}</span>
      </button>
    ))}
  </div>
</div> */}

{/* Row 3: Topic pills */}
<div
  style={{
    width: "100%",
    position: "relative",
  }}
>
  <div
    className="hide-scrollbar"
    ref={scrollRef}
    onMouseDown={handleMouseDown}
    onMouseMove={handleMouseMove}
    onMouseUp={handleMouseUp}
    onMouseLeave={handleMouseUp}
    onWheel={(e) => {
      scrollRef.current && (scrollRef.current.scrollLeft += e.deltaY);
    }}
    style={{
      display: "flex",
      gap: 8,

      overflowX: "auto",
      overflowY: "hidden",

      WebkitOverflowScrolling: "touch",

      paddingBottom: 4,
      paddingRight: 24,

      width: "100%",
      cursor: isDragging ? "grabbing" : "grab",
    }}
  >
    {TOPICS.map((t) => (
      <button
        key={t.value}
        disabled={disabled}
        onClick={() => onChange("topic", t.value)}
        style={{
          flexShrink: 0,
          minWidth: "fit-content",

          display: "flex",
          alignItems: "center",
          gap: 6,

          padding: "8px 13px",

          borderRadius: 999,

          border:
            topic === t.value
              ? "1.5px solid #f472b6"
              : "1.5px solid var(--c-border)",

          background:
            topic === t.value
              ? "linear-gradient(135deg,#f472b6,#a78bfa)"
              : "var(--c-card)",

          color:
            topic === t.value
              ? "#fff"
              : "var(--c-muted)",

          whiteSpace: "nowrap",

          fontSize: "0.78rem",
          fontWeight: 700,

          cursor: "pointer",

          transition: "all .2s",
        }}
      >
        <span>{t.icon}</span>
        <span>{t.label}</span>
      </button>
    ))}
  </div>
</div>

      {/* Row 4: Mode (kaiwa only) */}
      {showMode && (
        <div className="flex gap-3 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
          {MODES.map((m) => (
            <button
              key={m.value}
              disabled={disabled}
              onClick={() => onChange("mode", m.value)}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
              style={{
                background: mode === m.value
                  ? "linear-gradient(135deg, #fbbf24, #f472b6)"
                  : "var(--c-card)",
                color: mode === m.value ? "#000" : "var(--c-muted)",
                border: `1.5px solid ${mode === m.value ? "#fbbf24" : "var(--c-border)"}`,
                whiteSpace: "nowrap",
              }}
            >
              <span>{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
