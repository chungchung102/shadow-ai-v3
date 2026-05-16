"use client";

import { useState } from "react";
import { useChat, ChatConfig } from "@/hooks/useChat";
import ChatConfigPanel from "@/components/ChatConfig";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import ShadowingMode from "@/components/ShadowingMode";

type Tab = "kaiwa" | "shadowing";

export default function Home() {
  const [tab, setTab] = useState<Tab>("kaiwa");
  const [config, setConfig] = useState<ChatConfig>({
    language: "Japanese",
    level: "N5",
    topic: "daily life",
    mode: "teacher",
  });

  const { history, loading, error, sendMessage, clearHistory, bottomRef } = useChat(config);

  const handleConfigChange = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    clearHistory();
  };

  return (
    <div style={{
      minHeight: "100dvh",
      background: "var(--c-bg)",
      display: "flex",
      flexDirection: "column",
      maxWidth: 520,
      margin: "0 auto",
      padding: "0 0 env(safe-area-inset-bottom)",
    }}>

      {/* ── Top bar ── */}
      <div style={{
        padding: "16px 16px 0",
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "var(--c-bg)",
        paddingTop: "max(16px, env(safe-area-inset-top))",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <h1 style={{
              fontSize: "1.4rem",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}>
              <span className="grad-text">Shadow</span>
              <span style={{ color: "var(--c-text)" }}> AI</span>
            </h1>
            <p style={{ color: "var(--c-muted)", fontSize: "0.75rem", marginTop: 2 }}>
              AI language speaking trainer
            </p>
          </div>

          {/* Tab switcher */}
          <div style={{
            display: "flex",
            background: "var(--c-card)",
            border: "1.5px solid var(--c-border)",
            borderRadius: 14,
            padding: 4,
            gap: 4,
          }}>
            <TabBtn active={tab === "kaiwa"} onClick={() => setTab("kaiwa")} icon="💬" label="Kaiwa" />
            <TabBtn active={tab === "shadowing"} onClick={() => setTab("shadowing")} icon="🎙️" label="Shadowing" />
          </div>
        </div>

        {/* Config */}
        <ChatConfigPanel
          {...config}
          onChange={handleConfigChange}
          disabled={loading}
          showMode={tab === "kaiwa"}
        />

        {/* Divider */}
        <div style={{ height: 1, background: "var(--c-border)", marginBottom: 0 }} />
      </div>

      {/* ── Kaiwa tab ── */}
      {tab === "kaiwa" && (
        <>
          {/* Chat scroll area */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 16px 8px",
            display: "flex",
            flexDirection: "column",
          }}>
            {history.length === 0 && !loading && <EmptyKaiwa />}

            {history.map((msg, i) => (
              <ChatMessage key={i} message={msg} language={config.language} />
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="fade-up" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "linear-gradient(135deg, #7c3aed, #2dd4bf)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, fontSize: "0.6rem", fontWeight: 900, color: "#fff",
                }}>AI</div>
                <div style={{
                  background: "var(--c-card)",
                  border: "1.5px solid var(--c-border)",
                  borderRadius: "18px 18px 18px 4px",
                  padding: "12px 16px",
                  display: "flex", gap: 6, alignItems: "center",
                }}>
                  <span className="dot-1" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--c-purple)", display: "inline-block" }} />
                  <span className="dot-2" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--c-pink)", display: "inline-block" }} />
                  <span className="dot-3" style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--c-teal)", display: "inline-block" }} />
                </div>
              </div>
            )}

            {error && (
              <div className="fade-up" style={{
                background: "rgba(248,113,113,0.1)",
                border: "1.5px solid rgba(248,113,113,0.3)",
                borderRadius: 14, padding: "12px 16px",
                color: "var(--c-red)", fontSize: "0.9rem", marginBottom: 12,
              }}>
                ⚠️ {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div style={{
            padding: "12px 16px",
            background: "var(--c-bg)",
            borderTop: "1px solid var(--c-border)",
          }}>
            <ChatInput onSend={sendMessage} disabled={loading} language={config.language} />

            {history.length > 0 && (
              <button
                onClick={clearHistory}
                style={{
                  display: "block", margin: "10px auto 0",
                  color: "var(--c-dim)", fontSize: "0.78rem",
                  background: "none", border: "none", cursor: "pointer",
                }}
              >
                Xóa hội thoại
              </button>
            )}
          </div>
        </>
      )}

      {/* ── Shadowing tab ── */}
      {/* {tab === "shadowing" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
          <ShadowingMode
            language={config.language}
            level={config.level}
            topic={config.topic}
          />
        </div>
      )} */}
      {/* ── Shadowing tab ── */}
{tab === "shadowing" && (
  <div
    style={{
      flex: 1,
      overflowY: "auto",
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: 16,
    }}
  >

    {/* Anime Practice Card */}
    <a
      href="https://aanime.tv/?utm_source=khophim_cta&utm_medium=khophim_cta&utm_campaign=khophim_cta&utm_term=khophim_cta&fbclid=IwY2xjawRdl_1leHRuA2FlbQIxMABicmlkETE2aW1URmZkVUdPVGJSS2RRc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHtLNLySUOVME6v2wYiPNXfPay4mGhEM_GbUaAUsOKbmwgyAyV9RqWKO4idOG_aem_SUmJqwXVpcjI8-HOfbC_uQ"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        textDecoration: "none",
      }}
    >
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(124,58,237,0.22), rgba(45,212,191,0.18))",
          border: "1.5px solid var(--c-border)",
          borderRadius: 20,
          padding: "16px",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontSize: "1rem",
                fontWeight: 900,
                color: "var(--c-text)",
                marginBottom: 6,
              }}
            >
              🎌 Anime Shadowing
            </div>

            <p
              style={{
                color: "var(--c-muted)",
                fontSize: "0.82rem",
                lineHeight: 1.6,
              }}
            >
              Luyện nghe tiếng Nhật thực tế qua anime và shadowing.
            </p>
          </div>

          <div
            style={{
              flexShrink: 0,
              width: 44,
              height: 44,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg,#7c3aed,#2dd4bf)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "1.1rem",
              fontWeight: 900,
            }}
          >
            ↗
          </div>
        </div>
      </div>
    </a>

    {/* Shadowing */}
    <ShadowingMode
      language={config.language}
      level={config.level}
      topic={config.topic}
    />
  </div>
)}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TabBtn({
  active, onClick, icon, label,
}: { active: boolean; onClick: () => void; icon: string; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 5,
        padding: "7px 12px", borderRadius: 10, border: "none",
        background: active ? "linear-gradient(135deg, #7c3aed, #a78bfa)" : "transparent",
        color: active ? "#fff" : "var(--c-muted)",
        fontSize: "0.82rem", fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.2s",
        whiteSpace: "nowrap",
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function EmptyKaiwa() {
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      textAlign: "center", padding: "48px 24px", gap: 16,
      minHeight: 300,
    }}>
      <div style={{ fontSize: "3rem" }}>💬</div>
      <div>
        <p style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--c-text)" }}>
          Bắt đầu hội thoại
        </p>
        <p style={{
          color: "var(--c-muted)", fontSize: "0.9rem",
          marginTop: 8, lineHeight: 1.7, maxWidth: 280,
        }}>
          Chọn ngôn ngữ, level và chủ đề phía trên, rồi nhập câu đầu tiên hoặc nói bằng mic.
        </p>
      </div>
      <div style={{
        display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center",
        marginTop: 4,
      }}>
        {["🍜 Thử ramen shop", "💼 Thử job interview", "👋 Thử daily life"].map(s => (
          <span key={s} style={{
            background: "var(--c-card)", border: "1.5px solid var(--c-border)",
            borderRadius: 99, padding: "5px 12px",
            color: "var(--c-muted)", fontSize: "0.78rem", fontWeight: 600,
          }}>{s}</span>
        ))}
      </div>
    </div>
  );
}
