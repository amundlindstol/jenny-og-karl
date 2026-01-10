import React from 'react';
import {Footer, Header} from './';
import {NetworkStatus} from '@/components/ui';
import {ErrorBoundary} from '@/components/error';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-900 transition-colors duration-300">
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