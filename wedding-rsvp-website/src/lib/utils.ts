// Utility functions for the wedding RSVP website

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function validateInvitationCode(code: string): boolean {
  // Basic validation - alphanumeric, 4-8 characters
  const regex = /^[A-Za-z0-9]{4,8}$/;
  return regex.test(code);
}