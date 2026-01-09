import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PerformanceProvider } from "@/components/providers/PerformanceProvider";
import { ToastProvider } from "@/components/ui";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jenny & Karls bryllup",
  description: "Bli med oss og feir vår spesielle dag - 15. juni 2024",
  keywords: "bryllup, RSVP, Jenny, Karl, feiring",
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
          <ToastProvider>
            {children}
          </ToastProvider>
        </PerformanceProvider>
      </body>
    </html>
  );
}
