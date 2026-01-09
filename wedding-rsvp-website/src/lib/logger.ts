/**
 * Centralized logging utility for error tracking and monitoring
 */

export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: Record<string, any>;
  timestamp: string;
  userAgent?: string;
  url?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  
  private createLogEntry(
    level: LogEntry['level'], 
    message: string, 
    context?: Record<string, any>
  ): LogEntry {
    return {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };
  }

  private formatMessage(entry: LogEntry): string {
    const contextStr = entry.context ? ` | Context: ${JSON.stringify(entry.context)}` : '';
    return `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}${contextStr}`;
  }

  private logToConsole(entry: LogEntry): void {
    const message = this.formatMessage(entry);
    
    switch (entry.level) {
      case 'error':
        console.error(message);
        break;
      case 'warn':
        console.warn(message);
        break;
      case 'info':
        console.info(message);
        break;
      case 'debug':
        if (this.isDevelopment) {
          console.debug(message);
        }
        break;
    }
  }

  private async logToExternal(entry: LogEntry): Promise<void> {
    // In production, you could send logs to external services like:
    // - Vercel Analytics
    // - Sentry
    // - LogRocket
    // - Custom logging endpoint
    
    if (!this.isDevelopment && entry.level === 'error') {
      try {
        // Example: Send to a logging endpoint
        await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
        });
      } catch (error) {
        // Fallback to console if external logging fails
        console.error('Failed to send log to external service:', error);
      }
    }
  }

  info(message: string, context?: Record<string, any>): void {
    const entry = this.createLogEntry('info', message, context);
    this.logToConsole(entry);
    this.logToExternal(entry);
  }

  warn(message: string, context?: Record<string, any>): void {
    const entry = this.createLogEntry('warn', message, context);
    this.logToConsole(entry);
    this.logToExternal(entry);
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    const errorContext = {
      ...context,
      ...(error && {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack,
      }),
    };
    
    const entry = this.createLogEntry('error', message, errorContext);
    this.logToConsole(entry);
    this.logToExternal(entry);
  }

  debug(message: string, context?: Record<string, any>): void {
    const entry = this.createLogEntry('debug', message, context);
    this.logToConsole(entry);
  }

  // Performance logging
  performance(operation: string, duration: number, context?: Record<string, any>): void {
    this.info(`Performance: ${operation} completed in ${duration}ms`, {
      operation,
      duration,
      ...context,
    });
  }

  // API request logging
  apiRequest(method: string, url: string, status: number, duration: number): void {
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info';
    const entry = this.createLogEntry(level, `API ${method} ${url}`, {
      method,
      url,
      status,
      duration,
    });
    
    this.logToConsole(entry);
    this.logToExternal(entry);
  }
}

export const logger = new Logger();