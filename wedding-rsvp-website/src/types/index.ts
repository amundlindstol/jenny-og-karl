import { z } from 'zod';

// Core types for the wedding RSVP website

// RSVP Status enum
export const RSVPStatus = {
  PENDING: 'pending',
  ATTENDING: 'attending',
  NOT_ATTENDING: 'not_attending',
} as const;

export type RSVPStatusType = typeof RSVPStatus[keyof typeof RSVPStatus];

// Guest Entry interface matching Google Sheets structure
export interface GuestEntry {
  invitationCode: string;
  guestNames: string[];
  rsvpStatus: RSVPStatusType;
  dietaryRestrictions: string[];
  personalMessage: string;
  submissionDate: string;
  email?: string;
}

// Individual guest response within an RSVP form
export interface GuestResponse {
  name: string;
  attending: boolean;
  dietaryRestrictions: string;
}

// RSVP Form data structure for form handling
export interface RSVPFormData {
  invitationCode: string;
  guests: GuestResponse[];
  personalMessage: string;
  contactEmail?: string;
}

// Wedding information interface
export interface WeddingInfo {
  coupleName: string;
  date: string;
  venue: string;
  address: string;
  time: string;
  description?: string;
}

// API Response types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Zod Validation Schemas

// Invitation code validation - alphanumeric, 4-8 characters
export const invitationCodeSchema = z
  .string()
  .min(4, 'Invitation code must be at least 4 characters')
  .max(8, 'Invitation code must be at most 8 characters')
  .regex(/^[A-Za-z0-9]+$/, 'Invitation code must contain only letters and numbers')
  .transform(code => code.toUpperCase());

// RSVP Status validation
export const rsvpStatusSchema = z.enum(['pending', 'attending', 'not_attending']);

// Guest response validation
export const guestResponseSchema = z.object({
  name: z
    .string()
    .min(1, 'Guest name is required')
    .max(100, 'Guest name must be less than 100 characters')
    .trim(),
  attending: z.boolean(),
  dietaryRestrictions: z
    .string()
    .max(500, 'Dietary restrictions must be less than 500 characters')
    .optional()
    .default(''),
});

// RSVP Form data validation
export const rsvpFormDataSchema = z.object({
  invitationCode: invitationCodeSchema,
  guests: z
    .array(guestResponseSchema)
    .min(1, 'At least one guest is required')
    .max(10, 'Maximum 10 guests allowed per invitation'),
  personalMessage: z
    .string()
    .max(1000, 'Personal message must be less than 1000 characters')
    .optional()
    .default(''),
  contactEmail: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
});

// Guest Entry validation (for data from Google Sheets)
export const guestEntrySchema = z.object({
  invitationCode: invitationCodeSchema,
  guestNames: z
    .array(z.string().min(1, 'Guest name cannot be empty'))
    .min(1, 'At least one guest name is required'),
  rsvpStatus: rsvpStatusSchema,
  dietaryRestrictions: z.array(z.string()).default([]),
  personalMessage: z.string().default(''),
  submissionDate: z.string().default(''),
  email: z.string().email().optional().or(z.literal('')),
});

// Wedding information validation
export const weddingInfoSchema = z.object({
  coupleName: z.string().min(1, 'Couple name is required'),
  date: z.string().min(1, 'Wedding date is required'),
  venue: z.string().min(1, 'Venue is required'),
  address: z.string().min(1, 'Address is required'),
  time: z.string().min(1, 'Time is required'),
  description: z.string().optional(),
});

// API Response validation
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

// Type inference from Zod schemas
export type InvitationCode = z.infer<typeof invitationCodeSchema>;
export type RSVPFormDataValidated = z.infer<typeof rsvpFormDataSchema>;
export type GuestEntryValidated = z.infer<typeof guestEntrySchema>;
export type GuestResponseValidated = z.infer<typeof guestResponseSchema>;
export type WeddingInfoValidated = z.infer<typeof weddingInfoSchema>;
export type APIResponseValidated<T = any> = z.infer<typeof apiResponseSchema> & { data?: T };

// Utility type for partial updates
export type PartialGuestEntry = Partial<GuestEntry> & Pick<GuestEntry, 'invitationCode'>;

// Form state types for UI components
export interface FormState {
  isLoading: boolean;
  isSubmitting: boolean;
  errors: ValidationError[];
  isDirty: boolean;
}

export interface RSVPFormState extends FormState {
  currentStep: number;
  totalSteps: number;
  guestEntry?: GuestEntry;
}