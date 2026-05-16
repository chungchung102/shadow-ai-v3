"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export interface Message {
  role: "user" | "model";
  content: string;
}

export interface ChatConfig {
  language: string;
  level: string;
  topic: string;
  mode: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export function useChat(config: ChatConfig) {
  const [history, setHistory] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      setLoading(true);
      setError(null);

      // Optimistic update: show user message immediately
      const userMsg: Message = { role: "user", content: trimmed };
      setHistory((prev) => [...prev, userMsg]);

      try {
        const res = await fetch(`${API_URL}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            history: history, // send history before adding user msg (backend handles order)
            ...config,
          }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        if (data.error) {
          setError(data.error);
          // Remove optimistic user message on error
          setHistory((prev) => prev.slice(0, -1));
        } else {
          setHistory((prev) => [
            ...prev,
            { role: "model", content: data.reply },
          ]);
        }
      } catch (e) {
        setError("Không kết nối được backend. Kiểm tra lại xem backend đã chạy chưa.");
        setHistory((prev) => prev.slice(0, -1));
      } finally {
        setLoading(false);
      }
    },
    [loading, history, config]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    setError(null);
  }, []);

  return { history, loading, error, sendMessage, clearHistory, bottomRef };
}
