import { z } from 'zod';
import { googleSheetsClient, handleSheetsError, type SheetsError } from './google-sheets';
import type { 
  GuestEntry, 
  RSVPFormData, 
  RSVPFormDataValidated,
  GuestEntryValidated 
} from '../types';
import { 
  invitationCodeSchema, 
  rsvpFormDataSchema, 
  guestEntrySchema 
} from '../types';

// Google Sheets column mapping (based on design document)
const SHEET_COLUMNS = {
  INVITATION_CODE: 'A',
  GUEST_NAMES: 'B', 
  RSVP_STATUS: 'C',
  DIETARY_RESTRICTIONS: 'D',
  PERSONAL_MESSAGE: 'E',
  SUBMISSION_DATE: 'F',
  EMAIL: 'G',
} as const;

const SHEET_NAME = 'Guest_List';

export class SheetsService {
  private sheets;
  private spreadsheetId: string;

  constructor() {
    this.sheets = googleSheetsClient.getClient();
    this.spreadsheetId = googleSheetsClient.getSpreadsheetId();
  }

  /**
   * Validate invitation code against spreadsheet data
   */
  async validateInvitationCode(code: string): Promise<GuestEntry | null> {
    try {
      // Validate code format first
      const validatedCode = invitationCodeSchema.parse(code);

      // Read all data from the sheet
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${SHEET_NAME}!A:G`,
      });

      const rows = response.data.values || [];
      
      // Skip header row and find matching invitation code
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row[0] && row[0].toUpperCase() === validatedCode) {
          return this.parseRowToGuestEntry(row);
        }
      }

      return null; // Code not found
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error('Invalid invitation code format');
      }
      throw handleSheetsError(error);
    }
  }

  /**
   * Get guest names by invitation code
   */
  async getGuestsByCode(code: string): Promise<string[]> {
    const guestEntry = await this.validateInvitationCode(code);
    return guestEntry ? guestEntry.guestNames : [];
  }

  /**
   * Update RSVP response in spreadsheet
   */
  async updateRSVPResponse(response: RSVPFormData): Promise<boolean> {
    try {
      // Validate the response data
      const validatedResponse: RSVPFormDataValidated = rsvpFormDataSchema.parse(response);
      const code = validatedResponse.invitationCode;

      // Find the row with the matching invitation code
      const rowIndex = await this.findRowByInvitationCode(code);
      if (!rowIndex) {
        throw new Error('Invitation code not found');
      }

      // Prepare the update data
      const guestNames = validatedResponse.guests.map(g => g.name).join(', ');
      const attendingGuests = validatedResponse.guests.filter(g => g.attending);
      const rsvpStatus = attendingGuests.length === 0 ? 'not_attending' : 
                        attendingGuests.length === validatedResponse.guests.length ? 'attending' : 'attending';
      
      const dietaryRestrictions = validatedResponse.guests
        .filter(g => g.attending && g.dietaryRestrictions)
        .map(g => `${g.name}: ${g.dietaryRestrictions}`)
        .join('; ');

      const submissionDate = new Date().toISOString();

      // Update the row
      const updateRange = `${SHEET_NAME}!A${rowIndex}:G${rowIndex}`;
      const updateValues = [
        code,
        guestNames,
        rsvpStatus,
        dietaryRestrictions,
        validatedResponse.personalMessage,
        submissionDate,
        validatedResponse.contactEmail || '',
      ];

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: updateRange,
        valueInputOption: 'RAW',
        resource: {
          values: [updateValues],
        },
      });

      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues.map((issue) => issue.message).join(', ');
        throw new Error(`Validation error: ${errorMessages}`);
      }
      throw handleSheetsError(error);
    }
  }

  /**
   * Check if invitation code has already been used for RSVP
   */
  async isRSVPSubmitted(code: string): Promise<boolean> {
    try {
      const guestEntry = await this.validateInvitationCode(code);
      return guestEntry ? guestEntry.rsvpStatus !== 'pending' : false;
    } catch (error) {
      throw handleSheetsError(error);
    }
  }

  /**
   * Get all RSVP responses (for admin purposes)
   */
  async getAllRSVPs(): Promise<GuestEntry[]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${SHEET_NAME}!A:G`,
      });

      const rows = response.data.values || [];
      const guestEntries: GuestEntry[] = [];

      // Skip header row
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row[0]) { // Only process rows with invitation codes
          guestEntries.push(this.parseRowToGuestEntry(row));
        }
      }

      return guestEntries;
    } catch (error) {
      throw handleSheetsError(error);
    }
  }

  /**
   * Private helper: Find row index by invitation code
   */
  private async findRowByInvitationCode(code: string): Promise<number | null> {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `${SHEET_NAME}!A:A`,
    });

    const rows = response.data.values || [];
    
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] && rows[i][0].toUpperCase() === code) {
        return i + 1; // Return 1-based row index
      }
    }

    return null;
  }

  /**
   * Private helper: Parse spreadsheet row to GuestEntry with validation
   */
  private parseRowToGuestEntry(row: any[]): GuestEntry {
    const rawEntry = {
      invitationCode: row[0] || '',
      guestNames: row[1] ? row[1].split(',').map((name: string) => name.trim()) : [],
      rsvpStatus: (row[2] as 'pending' | 'attending' | 'not_attending') || 'pending',
      dietaryRestrictions: row[3] ? row[3].split(';').map((item: string) => item.trim()) : [],
      personalMessage: row[4] || '',
      submissionDate: row[5] || '',
      email: row[6] || '',
    };

    // Validate the parsed data
    try {
      const validatedEntry: GuestEntryValidated = guestEntrySchema.parse(rawEntry);
      return validatedEntry;
    } catch (error) {
      // If validation fails, return the raw entry but log the error
      console.warn('Failed to validate guest entry from spreadsheet:', error);
      return rawEntry;
    }
  }

  /**
   * Health check for Google Sheets connection
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; message: string }> {
    try {
      const isConnected = await googleSheetsClient.testConnection();
      return {
        status: isConnected ? 'healthy' : 'unhealthy',
        message: isConnected ? 'Google Sheets API connection successful' : 'Failed to connect to Google Sheets API'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Google Sheets API error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// Export singleton instance
export const sheetsService = new SheetsService();