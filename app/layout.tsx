import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
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
  icons: {
    icon: [
      {
        url: "/api/generate-image?width=32&height=32",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/api/generate-image?width=16&height=16",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/api/generate-image?width=48&height=48",
        sizes: "48x48",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/api/generate-image?width=180&height=180",
        sizes: "180x180",
        type: "image/png",
      },
      {
        url: "/api/generate-image?width=152&height=152",
        sizes: "152x152",
        type: "image/png",
      },
      {
        url: "/api/generate-image?width=120&height=120",
        sizes: "120x120",
        type: "image/png",
      },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/api/generate-image?width=16&height=16",
        color: "#667eea",
      },
      {
        rel: "icon",
        url: "/api/generate-image?width=192&height=192",
        sizes: "192x192",
        type: "image/png",
      },
      {
        rel: "icon",
        url: "/api/generate-image?width=512&height=512",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
  manifest: "/site.webmanifest",
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
        {children}
        <Toaster />
      </body>
    </html>
  );
}
