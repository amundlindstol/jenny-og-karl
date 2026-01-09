import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, ...props }, ref) => {
    const hasError = !!error;
    
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-rose-900 block">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'flex h-12 w-full rounded-lg border border-rose-200 bg-white px-4 py-2 text-base',
            'placeholder:text-rose-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20',
            'disabled:cursor-not-allowed disabled:opacity-50',
            hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600 flex items-center gap-1">
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

Input.displayName = 'Input';

export { Input };