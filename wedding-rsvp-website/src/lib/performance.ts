/**
 * Performance monitoring and optimization utilities
 */

import { logger } from './logger';

export class PerformanceMonitor {
  private static timers = new Map<string, number>();

  /**
   * Start timing an operation
   */
  static startTimer(operation: string): void {
    this.timers.set(operation, performance.now());
  }

  /**
   * End timing an operation and log the result
   */
  static endTimer(operation: string, context?: Record<string, any>): number {
    const startTime = this.timers.get(operation);
    if (!startTime) {
      logger.warn(`Timer for operation "${operation}" was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(operation);
    
    logger.performance(operation, duration, context);
    return duration;
  }

  /**
   * Measure and log the execution time of an async function
   */
  static async measureAsync<T>(
    operation: string,
    fn: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - startTime;
      logger.performance(operation, duration, { ...context, success: true });
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      logger.performance(operation, duration, { ...context, success: false });
      throw error;
    }
  }

  /**
   * Measure and log the execution time of a synchronous function
   */
  static measure<T>(
    operation: string,
    fn: () => T,
    context?: Record<string, any>
  ): T {
    const startTime = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - startTime;
      logger.performance(operation, duration, { ...context, success: true });
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      logger.performance(operation, duration, { ...context, success: false });
      throw error;
    }
  }
}

/**
 * Web Vitals monitoring for Core Web Vitals
 */
export class WebVitalsMonitor {
  static init(): void {
    if (typeof window === 'undefined') return;

    // Monitor Largest Contentful Paint (LCP)
    this.observeLCP();
    
    // Monitor First Input Delay (FID)
    this.observeFID();
    
    // Monitor Cumulative Layout Shift (CLS)
    this.observeCLS();
  }

  private static observeLCP(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        logger.performance('LCP', lastEntry.startTime, {
          metric: 'Largest Contentful Paint',
          element: (lastEntry as any).element?.tagName,
        });
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }

  private static observeFID(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const fidEntry = entry as any; // First Input Delay entries have different properties
          logger.performance('FID', fidEntry.processingStart - fidEntry.startTime, {
            metric: 'First Input Delay',
            eventType: fidEntry.name,
          });
        });
      });
      
      observer.observe({ entryTypes: ['first-input'] });
    }
  }

  private static observeCLS(): void {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        });
        
        logger.performance('CLS', clsValue, {
          metric: 'Cumulative Layout Shift',
        });
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
    }
  }
}

/**
 * Bundle size and loading performance utilities
 */
export class LoadingMonitor {
  static logPageLoad(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      logger.performance('Page Load', navigation.loadEventEnd - navigation.fetchStart, {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        firstByte: navigation.responseStart - navigation.fetchStart,
        domInteractive: navigation.domInteractive - navigation.fetchStart,
      });
    });
  }

  static logResourceLoading(): void {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resource = entry as PerformanceResourceTiming;
          
          // Log slow resources (> 1 second)
          if (resource.duration > 1000) {
            logger.warn('Slow resource loading detected', {
              resource: resource.name,
              duration: resource.duration,
              size: resource.transferSize,
              type: resource.initiatorType,
            });
          }
        }
      });
    });
    
    observer.observe({ entryTypes: ['resource'] });
  }
}