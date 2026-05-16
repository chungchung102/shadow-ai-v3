"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Map our language names to BCP-47 codes for SpeechSynthesis
const LANG_TO_BCP47: Record<string, string> = {
  Japanese: "ja-JP",
  English:  "en-US",
  Korean:   "ko-KR",
  Chinese:  "zh-CN",
};

export function useTTS(language: string) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    // Cleanup on unmount
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  const speak = useCallback(
    (text: string, rate = 0.9) => {
      if (!supported) return;

      // Strip markdown artifacts before speaking
      const clean = text
        .replace(/---[\s\S]*$/m, "")   // remove everything from divider down (corrections block)
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/💡.*$/gm, "")
        .replace(/✨.*$/gm, "")
        .trim();

      window.speechSynthesis.cancel();

      const utter = new SpeechSynthesisUtterance(clean);
      utter.lang = LANG_TO_BCP47[language] ?? "en-US";
      utter.rate = rate;
      utter.pitch = 1.0;

      // Pick best available voice for the language
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find((v) => v.lang.startsWith(utter.lang.slice(0, 2)));
      if (match) utter.voice = match;

      utter.onstart = () => setSpeaking(true);
      utter.onend   = () => setSpeaking(false);
      utter.onerror = () => setSpeaking(false);

      utteranceRef.current = utter;
      window.speechSynthesis.speak(utter);
    },
    [supported, language]
  );

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  // Slow mode — 0.65 rate
  const speakSlow = useCallback(
    (text: string) => speak(text, 0.65),
    [speak]
  );

  return { speak, speakSlow, stop, speaking, supported };
}
