import { google } from 'googleapis';
import { z } from 'zod';

// Environment variable validation schema
const envSchema = z.object({
  GOOGLE_SHEETS_PRIVATE_KEY: z.string().min(1, 'Google Sheets private key is required'),
  GOOGLE_SHEETS_CLIENT_EMAIL: z.string().email('Valid Google Sheets client email is required'),
  GOOGLE_SHEETS_SPREADSHEET_ID: z.string().min(1, 'Google Sheets spreadsheet ID is required'),
});

// Validate environment variables
function validateEnv() {
  const env = {
    GOOGLE_SHEETS_PRIVATE_KEY: process.env.GOOGLE_SHEETS_PRIVATE_KEY,
    GOOGLE_SHEETS_CLIENT_EMAIL: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    GOOGLE_SHEETS_SPREADSHEET_ID: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
  };

  try {
    return envSchema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map((issue) => issue.message).join(', ');
      throw new Error(`Environment configuration error: ${errorMessages}`);
    }
    throw new Error('Environment configuration error: Unknown error');
  }
}

// Google Sheets client configuration
class GoogleSheetsClient {
  private sheets: any;
  private spreadsheetId: string;
  private static instance: GoogleSheetsClient;

  private constructor() {
    const env = validateEnv();
    
    // Parse the private key (handle escaped newlines)
    const privateKey = env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n');
    
    // Create JWT client for service account authentication
    const auth = new google.auth.JWT({
      email: env.GOOGLE_SHEETS_CLIENT_EMAIL,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    // Initialize Google Sheets API client
    this.sheets = google.sheets({ version: 'v4', auth });
    this.spreadsheetId = env.GOOGLE_SHEETS_SPREADSHEET_ID;
  }

  // Singleton pattern to ensure single instance
  public static getInstance(): GoogleSheetsClient {
    if (!GoogleSheetsClient.instance) {
      GoogleSheetsClient.instance = new GoogleSheetsClient();
    }
    return GoogleSheetsClient.instance;
  }

  // Get the sheets client
  public getClient() {
    return this.sheets;
  }

  // Get the spreadsheet ID
  public getSpreadsheetId(): string {
    return this.spreadsheetId;
  }

  // Test connection to Google Sheets
  public async testConnection(): Promise<boolean> {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });
      return !!response.data;
    } catch (error) {
      console.error('Google Sheets connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const googleSheetsClient = GoogleSheetsClient.getInstance();

// Export types and interfaces
export interface GoogleSheetsConfig {
  privateKey: string;
  clientEmail: string;
  spreadsheetId: string;
}

export interface SheetsError extends Error {
  code?: string;
  status?: number;
}

// Helper function to handle Google Sheets API errors
export function handleSheetsError(error: any): SheetsError {
  const sheetsError: SheetsError = new Error(
    error.message || 'Unknown Google Sheets API error'
  );
  
  if (error.code) {
    sheetsError.code = error.code;
  }
  
  if (error.response?.status) {
    sheetsError.status = error.response.status;
  }
  
  return sheetsError;
}