import { NextRequest, NextResponse } from 'next/server';
import { sheetsService } from '@/lib/sheets-service';
import { rsvpFormDataSchema } from '@/types';
import type { RSVPFormData, APIResponse } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate request data
    let validatedData: RSVPFormData;
    try {
      validatedData = rsvpFormDataSchema.parse(body);
    } catch (error: any) {
      const errorMessages = error.errors?.map((err: any) => err.message).join(', ') || 'Invalid form data';
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          message: errorMessages
        } as APIResponse,
        { status: 400 }
      );
    }

    // Check if invitation code exists
    const existingEntry = await sheetsService.validateInvitationCode(validatedData.invitationCode);
    if (!existingEntry) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid invitation code',
          message: 'The provided invitation code was not found. Please check your code and try again.'
        } as APIResponse,
        { status: 404 }
      );
    }

    // Check for duplicate submission prevention
    // Allow updates to existing RSVPs, but log them
    const isAlreadySubmitted = await sheetsService.isRSVPSubmitted(validatedData.invitationCode);
    if (isAlreadySubmitted) {
      console.log(`RSVP update for invitation code: ${validatedData.invitationCode}`);
    }

    // Validate that guest names match what's in the spreadsheet
    const expectedGuestNames = existingEntry.guestNames.map(name => name.trim().toLowerCase());
    const providedGuestNames = validatedData.guests.map(guest => guest.name.trim().toLowerCase());
    
    const namesMatch = expectedGuestNames.length === providedGuestNames.length &&
                      expectedGuestNames.every(name => providedGuestNames.includes(name));
    
    if (!namesMatch) {
      return NextResponse.json(
        {
          success: false,
          error: 'Guest names mismatch',
          message: 'The guest names in your RSVP do not match our records. Please contact us if you need to make changes.'
        } as APIResponse,
        { status: 400 }
      );
    }

    // Sanitize input data
    const sanitizedData: RSVPFormData = {
      invitationCode: validatedData.invitationCode,
      guests: validatedData.guests.map(guest => ({
        name: guest.name.trim(),
        attending: guest.attending,
        dietaryRestrictions: guest.dietaryRestrictions?.trim() || ''
      })),
      personalMessage: validatedData.personalMessage?.trim() || '',
      contactEmail: validatedData.contactEmail?.trim() || ''
    };

    // Update RSVP in Google Sheets
    const updateSuccess = await sheetsService.updateRSVPResponse(sanitizedData);
    
    if (!updateSuccess) {
      throw new Error('Failed to update RSVP in spreadsheet');
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: isAlreadySubmitted ? 'RSVP updated successfully!' : 'RSVP submitted successfully!',
        data: {
          invitationCode: sanitizedData.invitationCode,
          submissionDate: new Date().toISOString(),
          isUpdate: isAlreadySubmitted
        }
      } as APIResponse,
      { status: 200 }
    );

  } catch (error) {
    console.error('RSVP submission error:', error);
    
    // Enhanced error handling with better classification
    let errorMessage = 'Something went wrong while processing your RSVP. Please try again or contact us directly.';
    let statusCode = 500;
    let errorType = 'Internal server error';

    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      // Rate limiting and quota errors
      if (message.includes('rate limit') || message.includes('quota') || message.includes('high traffic')) {
        errorMessage = 'Our system is experiencing high traffic. Please try again in a few minutes.';
        errorType = 'Service temporarily unavailable';
        statusCode = 503;
      }
      // Authentication/permission errors
      else if (message.includes('permission') || message.includes('access') || message.includes('authentication')) {
        errorMessage = 'There was a problem with our system. Please contact us directly to submit your RSVP.';
        errorType = 'Service configuration error';
        statusCode = 503;
      }
      // Network and connection errors
      else if (message.includes('network') || message.includes('timeout') || message.includes('connection')) {
        errorMessage = 'Network connection error. Please check your internet connection and try again.';
        errorType = 'Network error';
        statusCode = 503;
      }
      // Validation errors
      else if (message.includes('validation')) {
        errorMessage = 'There was an issue with the form data. Please check your entries and try again.';
        errorType = 'Validation error';
        statusCode = 400;
      }
      // Spreadsheet/data errors
      else if (message.includes('spreadsheet') || message.includes('not found')) {
        errorMessage = 'Unable to process your RSVP. Please contact us directly.';
        errorType = 'Data error';
        statusCode = 503;
      }
      // Server errors
      else if (message.includes('server') || message.includes('unavailable')) {
        errorMessage = 'Service temporarily unavailable. Please try again later.';
        errorType = 'Server error';
        statusCode = 503;
      }
    }

    // Return structured error response
    return NextResponse.json(
      {
        success: false,
        error: errorType,
        message: errorMessage
      } as APIResponse,
      { status: statusCode }
    );
  }
}

// Handle unsupported methods
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed',
      message: 'GET method is not supported for RSVP submission. Use POST instead.'
    } as APIResponse,
    { status: 405 }
  );
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed', 
      message: 'PUT method is not supported. Use POST to submit or update RSVPs.'
    } as APIResponse,
    { status: 405 }
  );
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed',
      message: 'DELETE method is not supported. Contact us directly to cancel your RSVP.'
    } as APIResponse,
    { status: 405 }
  );
}