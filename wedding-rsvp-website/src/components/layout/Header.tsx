"use client";

import React from "react";
import { text } from "@/lib/strings";
import { clsx } from "clsx";

export function Header() {
  const [atTop, setAtTop] = React.useState(window?.scrollY === 0);

  React.useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY === 0);
    onScroll(); // initialize
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      className={clsx(
        "border-b border-primary-100 dark:border-primary-800 sticky top-0 z-50 transition-all duration-300",
        atTop ? "border-none" : "bg-primary-100 shadow-elegant-lg",
      )}
    >
      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-4xl">
        <div className="text-center">
          <h1
            className={clsx(
              "font-serif text-primary-900 dark:text-primary-100 mb-1 sm:mb-2 leading-tight gradient-text transition-all duration-300",
              atTop
                ? "text-5xl sm:text-6xl md:text-7xl"
                : "text-3xl sm:text-4xl md:text-5xl",
            )}
          >
            Jenny 💕 Karl
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-primary-700 dark:text-primary-300 font-light px-2 sm:px-0 transition-opacity duration-300">
            {text.weddingDate} • {text.churchName}
          </p>
        </div>
      </div>
    </header>
  );
}
