// Core types for the wedding RSVP website

export interface GuestEntry {
  invitationCode: string;
  guestNames: string[];
  rsvpStatus: 'pending' | 'attending' | 'not_attending';
  dietaryRestrictions: string[];
  personalMessage: string;
  submissionDate: string;
}

export interface RSVPFormData {
  invitationCode: string;
  guests: {
    name: string;
    attending: boolean;
    dietaryRestrictions: string;
  }[];
  personalMessage: string;
  contactEmail: string;
}

export interface WeddingInfo {
  coupleName: string;
  date: string;
  venue: string;
  address: string;
  time: string;
}