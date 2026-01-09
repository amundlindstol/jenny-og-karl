import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    const hasError = !!error;
    
    return (
      <div className="space-y-2 animate-fade-in">
        {label && (
          <label className="text-sm font-medium text-rose-900 block font-serif">
            {label}
          </label>
        )}
        <textarea
          className={cn(
            'flex min-h-[120px] w-full rounded-lg border-2 border-rose-200 bg-white px-4 py-3 text-base',
            'placeholder:text-rose-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20',
            'disabled:cursor-not-allowed disabled:opacity-50 resize-vertical transition-all duration-300',
            'hover:border-rose-300 hover:shadow-sm',
            hasError && 'border-red-400 focus:border-red-500 focus:ring-red-500/20 hover:border-red-400',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600 flex items-center gap-1 animate-slide-in-up">
            <span className="text-red-500">⚠</span>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-sm text-rose-600">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };