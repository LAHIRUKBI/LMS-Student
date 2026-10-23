import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/app/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// PWA එක දුරකථනයේ ක්‍රියාත්මක වන විට status bar වර්ණය සැකසීම
export const viewport: Viewport = {
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "NovaSkill",
  description: "Student Web Application",
  manifest: "/manifest.json", // manifest.json ගොනුව මෙතැනින් සම්බන්ධ කෙරේ
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NovaSkill",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Footer />
      </body>
    </html>
  );
}