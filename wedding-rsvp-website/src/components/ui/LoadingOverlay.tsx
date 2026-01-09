import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { cn } from '@/lib/utils';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  className?: string;
  children: React.ReactNode;
}

export function LoadingOverlay({ 
  isLoading, 
  message = 'Loading...', 
  className,
  children 
}: LoadingOverlayProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
          <LoadingSpinner text={message} size="md" />
        </div>
      )}
    </div>
  );
}