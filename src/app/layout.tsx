import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { validateEnv } from "@/lib/env";
import "./globals.css";

if (typeof globalThis !== "undefined") {
  validateEnv();
}

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "SecureGate Authentication",
  description: "A premium, secure authentication flow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-background text-on-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
