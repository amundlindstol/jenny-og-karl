import React from 'react';
import { Header, Footer } from './';
import { NetworkStatus } from '@/components/ui';
import { ErrorBoundary } from '@/components/error';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-rose-50 to-pink-50">
        <NetworkStatus showWhenOnline={true} />
        <Header />
        <main className="flex-1 container mx-auto px-4 py-4 sm:py-6 lg:py-8 max-w-4xl">
          {children}
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}