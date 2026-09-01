import type { Metadata, Viewport } from "next";
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

const basePath =
  process.env.GITHUB_PAGES === "true"
    ? `/${process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "fitpush.vg"}`
    : "";

export const metadata: Metadata = {
  title: "FitPush — AI Fitness Coach",
  description: "Track South Indian diet, workouts, and get pushed to hit your recomposition goals.",
  metadataBase: new URL(
    process.env.GITHUB_PAGES === "true"
      ? `https://vamshiganesh98.github.io${basePath}`
      : "http://localhost:3000"
  ),
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FitPush",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#09090b",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="apple-touch-icon" href={`${basePath}/icon.svg`} />
      </head>
      <body className="min-h-full flex flex-col bg-zinc-950 text-white">{children}</body>
    </html>
  );
}
