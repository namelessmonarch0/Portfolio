import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kuday Yurter — Software, Data & AI",
  description:
    "I turn messy data into useful systems. Explore Kuday Yurter’s work in software engineering, data pipelines, and applied AI. Based in Houston, Texas.",
  openGraph: {
    title: "Kuday Yurter — Software, Data & AI",
    description:
      "Pipelines, AI agents, and software that makes things work better. A personal corner of the internet, with a little phosphor glow.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
