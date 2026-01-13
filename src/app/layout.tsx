import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GlobalSpeakingIndicator } from "@/components/GlobalSpeakingIndicator";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OSGED | ระบบคัดกรองการรู้คิดและอารมณ์ผู้สูงอายุ",
  description: "OSGED คือระบบคัดกรองการรู้คิดและอารมณ์สำหรับผู้สูงอายุ ช่วยประเมินความจำ อารมณ์ และสุขภาพจิตเบื้องต้นผ่านระบบออนไลน์",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GlobalSpeakingIndicator />

        {children}
      </body>
    </html>
  );
}
