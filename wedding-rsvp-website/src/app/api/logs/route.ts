import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

interface ClientLogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: Record<string, any>;
  timestamp: string;
  userAgent?: string;
  url?: string;
}

export async function POST(request: NextRequest) {
  try {
    const logEntry: ClientLogEntry = await request.json();
    
    // Validate log entry
    if (!logEntry.level || !logEntry.message) {
      return NextResponse.json(
        { error: 'Invalid log entry format' },
        { status: 400 }
      );
    }
    
    // Add server-side context
    const serverContext = {
      ...logEntry.context,
      source: 'client',
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || logEntry.userAgent,
    };
    
    // Log based on level
    switch (logEntry.level) {
      case 'error':
        logger.error(`Client Error: ${logEntry.message}`, undefined, serverContext);
        break;
      case 'warn':
        logger.warn(`Client Warning: ${logEntry.message}`, serverContext);
        break;
      case 'info':
        logger.info(`Client Info: ${logEntry.message}`, serverContext);
        break;
      case 'debug':
        logger.debug(`Client Debug: ${logEntry.message}`, serverContext);
        break;
      default:
        logger.info(`Client Log: ${logEntry.message}`, serverContext);
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
    
  } catch (error) {
    logger.error('Failed to process client log', error as Error);
    return NextResponse.json(
      { error: 'Failed to process log entry' },
      { status: 500 }
    );
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}