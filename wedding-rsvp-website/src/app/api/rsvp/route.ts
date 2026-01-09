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
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('rate limit') || error.message.includes('quota')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Service temporarily unavailable',
            message: 'Our system is experiencing high traffic. Please try again in a few minutes.'
          } as APIResponse,
          { status: 503 }
        );
      }
      
      if (error.message.includes('permission') || error.message.includes('access')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Service configuration error',
            message: 'There was a problem with our system. Please contact us directly to submit your RSVP.'
          } as APIResponse,
          { status: 503 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Something went wrong while processing your RSVP. Please try again or contact us directly.'
      } as APIResponse,
      { status: 500 }
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