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
    
    // Handle specific error types
    let errorMessage = 'Unable to validate invitation code. Please try again.';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('Invalid invitation code format')) {
        errorMessage = error.message;
        statusCode = 400;
      } else if (error.message.includes('not found')) {
        errorMessage = 'Invitation code not found. Please check your code and try again.';
        statusCode = 404;
      } else if (error.message.includes('API')) {
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