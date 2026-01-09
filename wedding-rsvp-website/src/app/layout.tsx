import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PerformanceProvider } from "@/components/providers/PerformanceProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sarah & Michael's Wedding",
  description: "Join us in celebrating our special day - June 15th, 2024",
  keywords: "wedding, RSVP, Sarah, Michael, celebration",
  authors: [{ name: "Wedding RSVP System" }],
  robots: "noindex, nofollow", // Prevent search engine indexing for privacy
  viewport: "width=device-width, initial-scale=1",
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
        <PerformanceProvider>
          {children}
        </PerformanceProvider>
      </body>
    </html>
  );
}
