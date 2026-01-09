import { NextResponse } from 'next/server';
import { sheetsService } from '@/lib/sheets-service';

export async function GET() {
  try {
    const healthCheck = await sheetsService.healthCheck();
    
    return NextResponse.json(
      {
        status: healthCheck.status,
        message: healthCheck.message,
        timestamp: new Date().toISOString(),
      },
      { status: healthCheck.status === 'healthy' ? 200 : 503 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}