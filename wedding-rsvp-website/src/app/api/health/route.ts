import { NextResponse } from 'next/server';
import { sheetsService } from '@/lib/sheets-service';
import { logger } from '@/lib/logger';
import { PerformanceMonitor } from '@/lib/performance';

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  timestamp: string;
  checks: {
    googleSheets: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
      error?: string;
    };
    environment: {
      status: 'healthy' | 'unhealthy';
      missingVars?: string[];
    };
    memory?: {
      used: number;
      total: number;
      percentage: number;
    };
  };
  uptime: number;
  version: string;
}

export async function GET() {
  const startTime = performance.now();
  
  try {
    logger.info('Health check requested');
    
    // Check required environment variables
    const requiredEnvVars = [
      'GOOGLE_SHEETS_PRIVATE_KEY',
      'GOOGLE_SHEETS_CLIENT_EMAIL',
      'GOOGLE_SHEETS_SPREADSHEET_ID'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    const envStatus = missingVars.length === 0 ? 'healthy' : 'unhealthy';
    
    // Check Google Sheets connectivity
    let sheetsStatus: 'healthy' | 'unhealthy' = 'unhealthy';
    let sheetsResponseTime: number | undefined;
    let sheetsError: string | undefined;
    
    try {
      const sheetsStartTime = performance.now();
      const healthCheck = await sheetsService.healthCheck();
      sheetsResponseTime = performance.now() - sheetsStartTime;
      sheetsStatus = healthCheck.status === 'healthy' ? 'healthy' : 'unhealthy';
      
      if (healthCheck.status !== 'healthy') {
        sheetsError = healthCheck.message;
      }
    } catch (error) {
      sheetsError = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Google Sheets health check failed', error as Error);
    }
    
    // Memory usage (Node.js only)
    let memoryInfo;
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      memoryInfo = {
        used: Math.round(usage.heapUsed / 1024 / 1024), // MB
        total: Math.round(usage.heapTotal / 1024 / 1024), // MB
        percentage: Math.round((usage.heapUsed / usage.heapTotal) * 100)
      };
    }
    
    // Calculate uptime
    const uptime = typeof process !== 'undefined' && process.uptime ? process.uptime() : 0;
    
    // Determine overall status
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (envStatus === 'unhealthy' || sheetsStatus === 'unhealthy') {
      overallStatus = 'unhealthy';
    } else if (sheetsResponseTime && sheetsResponseTime > 5000) {
      overallStatus = 'degraded';
    }
    
    const response: HealthCheckResponse = {
      status: overallStatus,
      message: overallStatus === 'healthy' 
        ? 'All systems operational' 
        : overallStatus === 'degraded'
        ? 'Some systems experiencing delays'
        : 'System issues detected',
      timestamp: new Date().toISOString(),
      checks: {
        googleSheets: {
          status: sheetsStatus,
          responseTime: sheetsResponseTime,
          error: sheetsError
        },
        environment: {
          status: envStatus,
          missingVars: missingVars.length > 0 ? missingVars : undefined
        },
        ...(memoryInfo && { memory: memoryInfo })
      },
      uptime,
      version: process.env.npm_package_version || '1.0.0'
    };
    
    const totalTime = performance.now() - startTime;
    logger.info('Health check completed', { 
      status: overallStatus, 
      duration: totalTime,
      sheetsResponseTime 
    });
    
    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;
    
    return NextResponse.json(response, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    const totalTime = performance.now() - startTime;
    logger.error('Health check failed', error as Error, { duration: totalTime });
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        message: 'Health check failed',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}