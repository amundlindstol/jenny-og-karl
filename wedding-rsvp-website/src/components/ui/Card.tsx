import React, {forwardRef} from 'react';
import {cn} from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-white dark:bg-stone-900 border border-primary-100 dark:border-primary-800 shadow-sm hover:shadow-md transition-all duration-300',
      elevated: 'bg-white dark:bg-stone-900 shadow-lg hover:shadow-xl border border-primary-100 dark:border-primary-800 hover:border-primary-200 dark:hover:border-primary-700 transition-all duration-300 hover:-translate-y-1',
      outlined: 'bg-white dark:bg-stone-900 border-2 border-primary-200 dark:border-primary-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-sm transition-all duration-300',
      glass: 'glass border border-primary-200/50 dark:border-primary-700/50 hover:border-primary-300/50 dark:hover:border-primary-600/50 transition-all duration-300'
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl p-6 animate-fade-in',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 pb-4', className)}
      {...props}
    />
  )
);

CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-xl font-semibold text-primary-900 dark:text-primary-100 font-serif', className)}
      {...props}
    />
  )
);

CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-primary-600 dark:text-primary-300 leading-relaxed', className)}
      {...props}
    />
  )
);

CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('space-y-4', className)} {...props} />
  )
);

CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center pt-4 border-t border-primary-100 dark:border-primary-800', className)}
      {...props}
    />
  )
);

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };