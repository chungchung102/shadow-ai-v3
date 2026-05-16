// "use client";

// import { useCallback, useEffect, useRef, useState } from "react";

// const LANG_TO_BCP47: Record<string, string> = {
//   Japanese: "ja-JP",
//   English:  "en-US",
//   Korean:   "ko-KR",
//   Chinese:  "zh-CN",
// };

// interface UseSTTOptions {
//   language: string;
//   onResult: (transcript: string) => void;
//   onError?: (err: string) => void;
// }

// export function useSTT({ language, onResult, onError }: UseSTTOptions) {
//   const [listening, setListening] = useState(false);
//   const [supported, setSupported] = useState(false);
//   const recogRef = useRef<any>(null);

//   useEffect(() => {
//     const SpeechRecognition =
//       (window as any).SpeechRecognition ||
//       (window as any).webkitSpeechRecognition;
//     setSupported(!!SpeechRecognition);
//   }, []);

//   const startListening = useCallback(() => {
//     const SpeechRecognition =
//       (window as any).SpeechRecognition ||
//       (window as any).webkitSpeechRecognition;

//     if (!SpeechRecognition) {
//       onError?.("Trình duyệt không hỗ trợ microphone. Dùng Chrome nhé.");
//       return;
//     }

//     const recognition: SpeechRecognition = new SpeechRecognition();
//     recognition.lang = LANG_TO_BCP47[language] ?? "en-US";
//     recognition.interimResults = false;
//     recognition.maxAlternatives = 1;

//     recognition.onstart = () => setListening(true);

//     recognition.onresult = (e: SpeechRecognitionEvent) => {
//       const transcript = e.results[0][0].transcript;
//       onResult(transcript);
//       setListening(false);
//     };

//     recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
//       const msgs: Record<string, string> = {
//         "not-allowed":    "Cần cho phép quyền microphone trong trình duyệt.",
//         "no-speech":      "Không nghe thấy gì. Thử lại nhé.",
//         "network":        "Lỗi mạng khi nhận diện giọng nói.",
//         "audio-capture":  "Không tìm thấy microphone.",
//       };
//       onError?.(msgs[e.error] ?? `Lỗi: ${e.error}`);
//       setListening(false);
//     };

//     recognition.onend = () => setListening(false);

//     recogRef.current = recognition;
//     recognition.start();
//   }, [language, onResult, onError]);

//   const stopListening = useCallback(() => {
//     recogRef.current?.stop();
//     setListening(false);
//   }, []);

//   return { startListening, stopListening, listening, supported };
// }

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const LANG_TO_BCP47: Record<string, string> = {
  Japanese: "ja-JP",
  English: "en-US",
  Korean: "ko-KR",
  Chinese: "zh-CN",
};

interface UseSTTOptions {
  language: string;
  onResult: (transcript: string) => void;
  onError?: (err: string) => void;
}

export function useSTT({
  language,
  onResult,
  onError,
}: UseSTTOptions) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);

  const recogRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    setSupported(!!SpeechRecognition);
  }, []);

  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      onError?.("Trình duyệt không hỗ trợ microphone. Hãy dùng Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = LANG_TO_BCP47[language] ?? "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (e: any) => {
      try {
        const transcript = e.results[0][0].transcript;
        onResult(transcript);
      } catch {
        onError?.("Không đọc được giọng nói.");
      }

      setListening(false);
    };

    recognition.onerror = (e: any) => {
      const msgs: Record<string, string> = {
        "not-allowed":
          "Cần cho phép quyền microphone trong trình duyệt.",

        "no-speech":
          "Không nghe thấy gì. Thử nói lại nhé.",

        network:
          "Lỗi mạng khi nhận diện giọng nói.",

        "audio-capture":
          "Không tìm thấy microphone.",
      };

      onError?.(msgs[e.error] ?? `Lỗi: ${e.error}`);

      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recogRef.current = recognition;

    recognition.start();
  }, [language, onResult, onError]);

  const stopListening = useCallback(() => {
    recogRef.current?.stop();
    setListening(false);
  }, []);

  return {
    startListening,
    stopListening,
    listening,
    supported,
  };
}