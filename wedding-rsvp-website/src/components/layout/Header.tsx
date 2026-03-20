"use client";

import React from "react";
import { text } from "@/lib/strings";
import { clsx } from "clsx";
import Link from "next/link";

export function Header() {
  const [atTop, setAtTop] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const onScroll = () => setAtTop(window.scrollY === 0);
    onScroll(); // initialize with real value immediately
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Use atTop=true (not scrolled) for SSR and before mount to match server HTML
  const isAtTop = mounted && atTop;

  return (
    <header
      className={clsx(
        "border-b border-primary-100 dark:border-primary-800 sticky top-0 z-50 transition-all duration-300",
        isAtTop ? "border-none" : "bg-primary-100 shadow-elegant-lg",
      )}
    >
      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-4xl">
        <div className="text-center">
          <Link href="/">
            <h1
              className={clsx(
                "font-serif text-primary-900 dark:text-primary-100 mb-1 sm:mb-2 leading-tight gradient-text transition-all duration-300",
                isAtTop
                  ? "text-5xl sm:text-6xl md:text-7xl"
                  : "text-3xl sm:text-4xl md:text-5xl",
              )}
            >
              Jenny 💕 Karl
            </h1>
          </Link>
          <p className="text-sm sm:text-base lg:text-lg text-primary-700 dark:text-primary-300 font-light px-2 sm:px-0 transition-opacity duration-300">
            {text.weddingDate} • {text.churchName}
          </p>
        </div>
      </div>
    </header>
  );
}
