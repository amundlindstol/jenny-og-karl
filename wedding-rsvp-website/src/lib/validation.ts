import { z } from 'zod';
import type { ValidationError, RSVPFormData, GuestEntry } from '../types';
import { 
  invitationCodeSchema, 
  rsvpFormDataSchema, 
  guestEntrySchema,
  guestResponseSchema 
} from '../types';

/**
 * Validation utility functions for the wedding RSVP website
 */

/**
 * Validate invitation code format with detailed response
 */
export function validateInvitationCodeDetailed(code: string): { isValid: boolean; error?: string; normalizedCode?: string } {
  try {
    const normalizedCode = invitationCodeSchema.parse(code);
    return { isValid: true, normalizedCode };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.issues[0]?.message || 'Invalid invitation code' };
    }
    return { isValid: false, error: 'Invalid invitation code format' };
  }
}

/**
 * Validate RSVP form data
 */
export function validateRSVPForm(data: RSVPFormData): { isValid: boolean; errors: ValidationError[]; validatedData?: RSVPFormData } {
  try {
    const validatedData = rsvpFormDataSchema.parse(data);
    return { isValid: true, errors: [], validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationError[] = error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return { isValid: false, errors };
    }
    return { 
      isValid: false, 
      errors: [{ field: 'general', message: 'Validation failed' }] 
    };
  }
}

/**
 * Validate guest entry data from spreadsheet
 */
export function validateGuestEntry(data: any): { isValid: boolean; errors: ValidationError[]; validatedData?: GuestEntry } {
  try {
    const validatedData = guestEntrySchema.parse(data);
    return { isValid: true, errors: [], validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationError[] = error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return { isValid: false, errors };
    }
    return { 
      isValid: false, 
      errors: [{ field: 'general', message: 'Guest entry validation failed' }] 
    };
  }
}

/**
 * Validate individual guest response
 */
export function validateGuestResponse(data: any): { isValid: boolean; error?: string } {
  try {
    guestResponseSchema.parse(data);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.issues[0]?.message || 'Invalid guest response' };
    }
    return { isValid: false, error: 'Guest response validation failed' };
  }
}

/**
 * Sanitize and normalize form input
 */
export function sanitizeFormInput(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

/**
 * Check if email is valid (optional field)
 */
export function isValidEmail(email: string): boolean {
  if (!email || email.trim() === '') return true; // Optional field
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0].message;
  
  return errors.map(error => `${error.field}: ${error.message}`).join(', ');
}

/**
 * Check if RSVP form has any attending guests
 */
export function hasAttendingGuests(formData: RSVPFormData): boolean {
  return formData.guests.some(guest => guest.attending);
}

/**
 * Get attending guests count
 */
export function getAttendingGuestsCount(formData: RSVPFormData): number {
  return formData.guests.filter(guest => guest.attending).length;
}

/**
 * Validate that at least one guest is attending (business rule)
 */
export function validateAtLeastOneAttending(formData: RSVPFormData): { isValid: boolean; error?: string } {
  const attendingCount = getAttendingGuestsCount(formData);
  
  if (attendingCount === 0) {
    return { 
      isValid: false, 
      error: 'Please select at least one guest as attending, or mark all as not attending' 
    };
  }
  
  return { isValid: true };
}

/**
 * Create a safe error message for API responses
 */
export function createSafeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}