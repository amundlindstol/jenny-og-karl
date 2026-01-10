import React, {forwardRef} from 'react';
import {cn} from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    disabled,
    children, 
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transform active:scale-95';
    
    const variants = {
      primary: 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 dark:from-primary-500 dark:to-primary-600 dark:hover:from-primary-600 dark:hover:to-primary-700 focus:ring-primary-500 shadow-lg hover:shadow-xl hover:-translate-y-0.5',
      secondary: 'bg-gradient-to-r from-primary-100 to-primary-200 text-primary-900 hover:from-primary-200 hover:to-primary-300 dark:from-primary-800 dark:to-primary-900 dark:text-primary-100 dark:hover:from-primary-700 dark:hover:to-primary-800 focus:ring-primary-500 shadow-sm hover:shadow-md',
      outline: 'border-2 border-primary-300 text-primary-700 hover:bg-primary-50 hover:border-primary-400 dark:border-primary-600 dark:text-primary-300 dark:hover:bg-primary-900/50 dark:hover:border-primary-500 focus:ring-primary-500 shadow-sm hover:shadow-md',
      ghost: 'text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/50 focus:ring-primary-500 hover:shadow-sm'
    };
    
    const sizes = {
      sm: 'h-9 px-4 text-sm',
      md: 'h-12 px-6 text-base',
      lg: 'h-14 px-8 text-lg'
    };
    
    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };