'use client';

import {useEffect} from 'react';
import {Button} from '@/components/ui';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-900 flex items-center justify-center py-12 px-4">
          <div className="max-w-md mx-auto bg-white dark:bg-stone-900 rounded-lg shadow-lg p-8 text-center border border-primary-100 dark:border-primary-800">
            {/* Error Icon */}
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            {/* Error Title */}
            <h1 className="text-2xl font-serif text-gray-800 dark:text-white mb-4">
              Oops! Something went wrong
            </h1>

            {/* Error Message */}
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              We encountered an unexpected error. This has been logged and we'll look into it.
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button onClick={reset} className="w-full">
                Try Again
              </Button>
              <Button 
                onClick={() => window.location.href = '/'} 
                variant="outline" 
                className="w-full"
              >
                Go to Homepage
              </Button>
            </div>

            {/* Additional Help */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Still having trouble?</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Contact us at{' '}
                <a 
                  href="mailto:sarah.michael.wedding@email.com" 
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline"
                >
                  sarah.michael.wedding@email.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}