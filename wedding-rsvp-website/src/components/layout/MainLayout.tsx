import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-rose-50 to-pink-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {children}
      </main>
      <Footer />
    </div>
  );
}