'use client';

import { useEffect } from 'react';
import { WebVitalsMonitor, LoadingMonitor } from '@/lib/performance';
import { logger } from '@/lib/logger';

interface PerformanceProviderProps {
  children: React.ReactNode;
}

export function PerformanceProvider({ children }: PerformanceProviderProps) {
  useEffect(() => {
    // Initialize performance monitoring
    try {
      WebVitalsMonitor.init();
      LoadingMonitor.logPageLoad();
      LoadingMonitor.logResourceLoading();
      
      logger.info('Performance monitoring initialized');
    } catch (error) {
      logger.error('Failed to initialize performance monitoring', error as Error);
    }

    // Global error handler for unhandled errors
    const handleError = (event: ErrorEvent) => {
      logger.error('Unhandled JavaScript error', undefined, {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    };

    // Global handler for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logger.error('Unhandled promise rejection', undefined, {
        reason: event.reason,
        stack: event.reason?.stack,
      });
    };

    // Add global error listeners
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return <>{children}</>;
}