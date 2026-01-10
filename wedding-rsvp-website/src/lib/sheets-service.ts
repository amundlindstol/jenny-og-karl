import {z} from 'zod';
import {googleSheetsClient, handleSheetsError, withRetry} from './google-sheets';
import {logger} from './logger';
import {PerformanceMonitor} from './performance';
import {globalCache} from './cache';
import type {GuestEntry, GuestEntryValidated, RSVPFormData, RSVPFormDataValidated} from '../types';
import {guestEntrySchema, invitationCodeSchema, rsvpFormDataSchema} from '../types';

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

const SHEET_NAME = 'Gjesteliste';

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
    return await PerformanceMonitor.measureAsync(
      'validateInvitationCode',
      async () => {
        try {
          logger.info('Validating invitation code', { code: code.substring(0, 3) + '***' });
          
          // Check cache first
          const cacheKey = `invitation_code_${code}`;
          const cached = globalCache.get<GuestEntry | null>(cacheKey);
          if (cached !== null) {
            logger.debug('Invitation code validation cache hit', { code: code.substring(0, 3) + '***' });
            return cached;
          }

          // Validate code format first
          const validatedCode = invitationCodeSchema.parse(code);

          // Read all data from the sheet with retry logic
          const response = await withRetry(async () => {
            return await this.sheets.spreadsheets.values.get({
              spreadsheetId: this.spreadsheetId,
              range: `${SHEET_NAME}!A:G`,
            });
          });

          const rows = response.data.values || [];
          
          // Skip header row and find matching invitation code
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (row[0] && row[0].toUpperCase() === validatedCode) {
              const result = this.parseRowToGuestEntry(row);
              
              // Cache the result for 5 minutes
              globalCache.set(cacheKey, result, 300000);
              
              logger.info('Invitation code validated successfully', { 
                code: code.substring(0, 3) + '***',
                guestCount: result.guestNames.length 
              });
              
              return result;
            }
          }

          // Cache null result for 1 minute to prevent repeated invalid lookups
          globalCache.set(cacheKey, null, 60000);
          
          logger.warn('Invitation code not found', { code: code.substring(0, 3) + '***' });
          return null; // Code not found
        } catch (error) {
          logger.error('Failed to validate invitation code', error as Error, { 
            code: code.substring(0, 3) + '***' 
          });
          
          if (error instanceof z.ZodError) {
            throw new Error('Invalid invitation code format');
          }
          throw handleSheetsError(error);
        }
      },
      { code: code.substring(0, 3) + '***' }
    );
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
    return await PerformanceMonitor.measureAsync(
      'updateRSVPResponse',
      async () => {
        try {
          logger.info('Updating RSVP response', { 
            code: response.invitationCode.substring(0, 3) + '***',
            guestCount: response.guests.length 
          });

          // Validate the response data
          const validatedResponse: RSVPFormDataValidated = rsvpFormDataSchema.parse(response);
          const code = validatedResponse.invitationCode;

          // Find the row with the matching invitation code with retry logic
          const rowIndex = await withRetry(async () => {
            return await this.findRowByInvitationCode(code);
          });

          if (!rowIndex) {
            throw new Error('Invitation code not found');
          }

          // Prepare the update data
          const guestNames = validatedResponse.guests.map(g => g.name).join(', ');
          const guestStatuses = validatedResponse.guests.map(g => g.attending ? 'attending' : 'not_attending').join(', ');
          
          const dietaryRestrictions = validatedResponse.guests
            .filter(g => g.attending && g.dietaryRestrictions)
            .map(g => `${g.name}: ${g.dietaryRestrictions}`)
            .join('; ');

          const submissionDate = new Date().toISOString();

          // Update the row with retry logic
          const updateRange = `${SHEET_NAME}!A${rowIndex}:G${rowIndex}`;
          const updateValues = [
            code,
            guestNames,
            guestStatuses,
            dietaryRestrictions,
            validatedResponse.personalMessage,
            submissionDate,
            validatedResponse.contactEmail || '',
          ];

          await withRetry(async () => {
            return await this.sheets.spreadsheets.values.update({
              spreadsheetId: this.spreadsheetId,
              range: updateRange,
              valueInputOption: 'RAW',
              resource: {
                values: [updateValues],
              },
            });
          });

          // Invalidate cache for this invitation code
          globalCache.delete(`invitation_code_${code}`);
          
          const attendingGuests = validatedResponse.guests.filter(g => g.attending);
          const derivedOverallStatus = attendingGuests.length === 0 ? 'not_attending' : 'attending';
          
          logger.info('RSVP response updated successfully', { 
            code: code.substring(0, 3) + '***',
            status: derivedOverallStatus,
            attendingCount: attendingGuests.length 
          });

          return true;
        } catch (error) {
          logger.error('Failed to update RSVP response', error as Error, { 
            code: response.invitationCode.substring(0, 3) + '***' 
          });
          
          if (error instanceof z.ZodError) {
            const errorMessages = error.issues.map((issue) => issue.message).join(', ');
            throw new Error(`Validation error: ${errorMessages}`);
          }
          throw handleSheetsError(error);
        }
      },
      { code: response.invitationCode.substring(0, 3) + '***' }
    );
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
    const response = await withRetry(async () => {
      return await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${SHEET_NAME}!A:A`,
      });
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
    const guestNames = row[1] ? row[1].split(',').map((name: string) => name.trim()) : [];
    const rsvpStatusValue = row[2] || '';
    
    // Parse individual guest statuses if they exist (comma-separated in Column C)
    let guestStatuses: ('pending' | 'attending' | 'not_attending')[] = [];
    let rsvpStatus: 'pending' | 'attending' | 'not_attending' = 'pending';

    if (rsvpStatusValue.includes(',')) {
      guestStatuses = rsvpStatusValue.split(',').map((s: string) => {
        const trimmed = s.trim().toLowerCase();
        return (trimmed === 'attending' || trimmed === 'not_attending' || trimmed === 'pending') 
          ? trimmed as 'pending' | 'attending' | 'not_attending'
          : 'pending';
      });
      
      // Determine overall status
      if (guestStatuses.every(s => s === 'attending')) {
        rsvpStatus = 'attending';
      } else if (guestStatuses.every(s => s === 'not_attending')) {
        rsvpStatus = 'not_attending';
      } else if (guestStatuses.some(s => s === 'attending')) {
        rsvpStatus = 'attending'; // Mixed, but at least one attending
      } else if (guestStatuses.some(s => s === 'not_attending')) {
        rsvpStatus = 'not_attending'; // Mixed, but if no one is attending and some are not_attending
      } else {
        rsvpStatus = 'pending';
      }
    } else {
      rsvpStatus = (rsvpStatusValue as 'pending' | 'attending' | 'not_attending') || 'pending';
      // If only one status but multiple guests, replicate it or default to pending
      guestStatuses = guestNames.map(() => rsvpStatus);
    }

    const rawEntry = {
      invitationCode: row[0] || '',
      guestNames,
      guestStatuses,
      rsvpStatus,
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
      const isConnected = await withRetry(async () => {
        return await googleSheetsClient.testConnection();
      });
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