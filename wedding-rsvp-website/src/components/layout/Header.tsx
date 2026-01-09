import React from 'react';

export function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-rose-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-serif text-rose-900 mb-2">
            Sarah & Michael
          </h1>
          <p className="text-lg text-rose-700 font-light">
            June 15th, 2024 • Sunset Gardens, Napa Valley
          </p>
        </div>
      </div>
    </header>
  );
}