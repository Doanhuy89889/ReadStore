import type { Metadata } from "next";
import { Lora } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import BotpressChat from "@/components/chat/ChatWidget";

const display = Lora({ subsets: ["latin", "vietnamese"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: "ReadStore",
  description: "Website bán sách trực tuyến",
  icons: { icon: "/logo.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={display.variable}>
      <body>
        <Toaster richColors />
        {children}
        <BotpressChat />
      </body>
    </html>
  );
}
