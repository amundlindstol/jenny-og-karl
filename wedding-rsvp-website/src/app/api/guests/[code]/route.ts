import { NextRequest, NextResponse } from 'next/server';
import { sheetsService } from '@/lib/sheets-service';
import { validateInvitationCodeDetailed } from '@/lib/validation';
import type { APIResponse, GuestEntry } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    // Validate code format first
    const validation = validateInvitationCodeDetailed(code);
    if (!validation.isValid) {
      const response: APIResponse = {
        success: false,
        error: validation.error || 'Invalid invitation code format',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Validate code against Google Sheets
    const guestEntry: GuestEntry | null = await sheetsService.validateInvitationCode(validation.normalizedCode!);
    
    if (!guestEntry) {
      const response: APIResponse = {
        success: false,
        error: 'Invitation code not found. Please check your code and try again.',
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Return guest information for valid codes
    const response: APIResponse<GuestEntry> = {
      success: true,
      data: guestEntry,
      message: 'Invitation code validated successfully',
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error validating invitation code:', error);
    
    // Handle specific error types with enhanced error classification
    let errorMessage = 'Unable to validate invitation code. Please try again.';
    let statusCode = 500;

    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      // Client-side validation errors
      if (message.includes('invalid invitation code format')) {
        errorMessage = error.message;
        statusCode = 400;
      } 
      // Not found errors
      else if (message.includes('not found') || message.includes('code not found')) {
        errorMessage = 'Invitation code not found. Please check your code and try again.';
        statusCode = 404;
      }
      // Rate limiting and quota errors
      else if (message.includes('rate limit') || message.includes('quota') || message.includes('high traffic')) {
        errorMessage = 'Service is experiencing high traffic. Please try again in a moment.';
        statusCode = 503;
      }
      // Authentication/authorization errors
      else if (message.includes('authentication') || message.includes('access denied') || message.includes('permission')) {
        errorMessage = 'Service configuration error. Please contact us for assistance.';
        statusCode = 503;
      }
      // Network and connection errors
      else if (message.includes('network') || message.includes('timeout') || message.includes('connection')) {
        errorMessage = 'Network connection error. Please check your internet connection and try again.';
        statusCode = 503;
      }
      // Server errors
      else if (message.includes('server') || message.includes('unavailable')) {
        errorMessage = 'Service temporarily unavailable. Please try again later.';
        statusCode = 503;
      }
      // API-specific errors
      else if (message.includes('api')) {
        errorMessage = 'Service temporarily unavailable. Please try again in a moment.';
        statusCode = 503;
      }
    }

    const response: APIResponse = {
      success: false,
      error: errorMessage,
    };

    return NextResponse.json(response, { status: statusCode });
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}