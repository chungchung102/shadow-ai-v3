import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shadow AI — AI Language Trainer",
  description: "Luyện nói ngoại ngữ với AI theo cấp độ và chủ đề",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
