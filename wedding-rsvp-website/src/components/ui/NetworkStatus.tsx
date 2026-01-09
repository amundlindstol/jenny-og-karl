import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface NetworkStatusProps {
  className?: string;
  showWhenOnline?: boolean;
}

export function NetworkStatus({ className, showWhenOnline = false }: NetworkStatusProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (showWhenOnline) {
        setShowStatus(true);
        // Hide the "back online" message after 3 seconds
        setTimeout(() => setShowStatus(false), 3000);
      } else {
        setShowStatus(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showWhenOnline]);

  if (!showStatus) {
    return null;
  }

  return (
    <div className={cn(
      'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300',
      isOnline 
        ? 'bg-green-100 border border-green-200 text-green-800' 
        : 'bg-red-100 border border-red-200 text-red-800',
      className
    )}>
      <div className="flex items-center gap-2">
        {isOnline ? (
          <>
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
            <span className="text-sm font-medium">Back online</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728" />
            </svg>
            <span className="text-sm font-medium">No internet connection</span>
          </>
        )}
      </div>
    </div>
  );
}