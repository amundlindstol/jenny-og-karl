import React from 'react';

export function Header() {
  return (
    <header className="glass border-b border-primary-100 dark:border-primary-800 sticky top-0 z-50 animate-slide-in-up">
      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-4xl">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-primary-900 dark:text-primary-100 mb-1 sm:mb-2 leading-tight gradient-text">
            Jenny & Karl
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-primary-700 dark:text-primary-300 font-light px-2 sm:px-0">
            15. juni 2024 • Sunset Gardens, Napa Valley
          </p>
        </div>
      </div>
    </header>
  );
}