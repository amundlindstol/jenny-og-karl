import React, {forwardRef} from 'react';
import {cn} from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, ...props }, ref) => {
    const hasError = !!error;
    
    return (
      <div className="space-y-2 animate-fade-in">
        {label && (
          <label className="text-sm font-medium text-primary-900 dark:text-primary-100 block font-serif">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'flex h-12 w-full rounded-lg border-2 border-primary-200 dark:border-primary-800 bg-white dark:bg-stone-900 px-4 py-2 text-base dark:text-stone-100',
            'placeholder:text-primary-400 dark:placeholder:text-primary-600 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
            'disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300',
            'hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-sm',
            hasError && 'border-red-400 dark:border-red-600 focus:border-red-500 dark:focus:border-red-500 focus:ring-red-500/20 hover:border-red-400',
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
          <p className="text-sm text-primary-600 dark:text-primary-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };