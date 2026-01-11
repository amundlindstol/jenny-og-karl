import React from "react";
import { Footer, Header } from "./";
import { NetworkStatus } from "@/components/ui";
import { ErrorBoundary } from "@/components/error";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col  bg-linear-to-br from-primary-100 via-secondary-50 to-primary-200 dark:from-primary-950 dark:via-secondary-900 dark:to-primary-950">
        <NetworkStatus showWhenOnline={true} />
        <Header />
        <main className="flex-1 container mx-auto max-w-4xl">{children}</main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}
