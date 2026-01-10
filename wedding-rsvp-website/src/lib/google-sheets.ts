import {google} from 'googleapis';
import {z} from 'zod';

// Environment variable validation schema
const envSchema = z.object({
  GOOGLE_SHEETS_PRIVATE_KEY: z.string().min(1, 'Google Sheets private key is required'),
  GOOGLE_SHEETS_CLIENT_EMAIL: z.email('Valid Google Sheets client email is required'),
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

  // Test connection to Google Sheets with retry logic
  public async testConnection(): Promise<boolean> {
    try {
      await withRetry(async () => {
        const response = await this.sheets.spreadsheets.get({
          spreadsheetId: this.spreadsheetId,
        });
        if (!response.data) {
          throw new Error('No data received from spreadsheet');
        }
        return response.data;
      });
      return true;
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

// Rate limiting and retry configuration
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2,
};

// Helper function to sleep for a given duration
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Calculate exponential backoff delay
function calculateBackoffDelay(attempt: number, config: RetryConfig): number {
  const delay = config.baseDelay * Math.pow(config.backoffFactor, attempt - 1);
  return Math.min(delay, config.maxDelay);
}

// Enhanced error handling with retry logic
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= config.maxRetries + 1; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on certain error types
      if (shouldNotRetry(error)) {
        throw handleSheetsError(error);
      }

      // If this was the last attempt, throw the error
      if (attempt > config.maxRetries) {
        throw handleSheetsError(error);
      }

      // Calculate delay and wait before retry
      const delay = calculateBackoffDelay(attempt, config);
      console.warn(`Google Sheets API error (attempt ${attempt}/${config.maxRetries + 1}), retrying in ${delay}ms:`, error.message);
      await sleep(delay);
    }
  }

  throw handleSheetsError(lastError);
}

// Determine if an error should not be retried
function shouldNotRetry(error: any): boolean {
  const status = error.response?.status || error.status;
  const code = error.code;

  // Don't retry on client errors (4xx) except rate limiting
  if (status >= 400 && status < 500) {
    // Retry on rate limiting and quota errors
    if (status === 429 || code === 'RATE_LIMIT_EXCEEDED' || code === 'USER_RATE_LIMIT_EXCEEDED') {
      return false;
    }
    // Don't retry on other client errors
    return true;
  }

  // Don't retry on authentication/authorization errors
  if (status === 401 || status === 403) {
    return true;
  }

  // Retry on server errors (5xx) and network errors
  return false;
}

// Helper function to handle Google Sheets API errors
export function handleSheetsError(error: any): SheetsError {
  const status = error.response?.status || error.status;
  const code = error.code;
  let message = error.message || 'Unknown Google Sheets API error';

  // Provide user-friendly error messages
  if (status === 429 || code === 'RATE_LIMIT_EXCEEDED' || code === 'USER_RATE_LIMIT_EXCEEDED') {
    message = 'Service is experiencing high traffic. Please try again in a moment.';
  } else if (status === 401) {
    message = 'Authentication error. Please contact support.';
  } else if (status === 403) {
    message = 'Access denied. Please contact support.';
  } else if (status === 404) {
    message = 'Spreadsheet not found. Please contact support.';
  } else if (status >= 500) {
    message = 'Service temporarily unavailable. Please try again later.';
  } else if (error.message?.includes('network') || error.message?.includes('timeout')) {
    message = 'Network connection error. Please check your internet connection and try again.';
  }

  const sheetsError: SheetsError = new Error(message);
  
  if (code) {
    sheetsError.code = code;
  }
  
  if (status) {
    sheetsError.status = status;
  }
  
  return sheetsError;
}