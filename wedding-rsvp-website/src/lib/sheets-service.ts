import { z } from "zod";
import {
  googleSheetsClient,
  handleSheetsError,
  withRetry,
} from "./google-sheets";
import { logger } from "./logger";
import { PerformanceMonitor } from "./performance";
import { globalCache } from "./cache";
import type {
  GuestEntry,
  GuestEntryValidated,
  RSVPFormData,
  RSVPFormDataValidated,
} from "../types";
import {
  guestEntrySchema,
  invitationCodeSchema,
  rsvpFormDataSchema,
} from "../types";

const SPEECH_SHEET_NAME = "Taler";

// Google Sheets column mapping (based on design document)
const SHEET_COLUMNS = {
  INVITATION_CODE: "A",
  GUEST_NAMES: "B",
  RSVP_STATUS: "C",
  DIETARY_RESTRICTIONS: "D",
  PERSONAL_MESSAGE: "E",
  SUBMISSION_DATE: "F",
  EMAIL: "G",
} as const;

const SHEET_NAME = "Gjesteliste";
const OVERSIKT_SHEET_NAME = "Oversikt";

const OVERSIKT_COLUMNS = {
  INVITATION_CODE: "A",
  GUEST_NAME: "B",
} as const;

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
      "validateInvitationCode",
      async () => {
        try {
          logger.info("Validating invitation code", {
            code: code.substring(0, 3) + "***",
          });

          // Check cache first
          const cacheKey = `invitation_code_${code}`;
          const cached = globalCache.get<GuestEntry | null>(cacheKey);
          if (cached !== null) {
            logger.debug("Invitation code validation cache hit", {
              code: code.substring(0, 3) + "***",
            });
            return cached;
          }

          // Validate code format first
          const validatedCode = invitationCodeSchema.parse(code);

          // Read all data from the sheet with retry logic
          const response = await withRetry(async () => {
            return await this.sheets.spreadsheets.values.get({
              spreadsheetId: this.spreadsheetId,
              range: `${SHEET_NAME}!A:H`,
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

              logger.info("Invitation code validated successfully", {
                code: code.substring(0, 2) + "***",
                guestCount: result.guestNames.length,
              });

              return result;
            }
          }

          // Cache null result for 1 minute to prevent repeated invalid lookups
          globalCache.set(cacheKey, null, 60000);

          logger.warn("Invitation code not found", {
            code: code.substring(0, 2) + "***",
          });
          return null; // Code not found
        } catch (error) {
          logger.error("Failed to validate invitation code", error as Error, {
            code: code.substring(0, 2) + "***",
          });

          if (error instanceof z.ZodError) {
            throw new Error("Invalid invitation code format");
          }
          throw handleSheetsError(error);
        }
      },
      { code: code.substring(0, 3) + "***" },
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
      "updateRSVPResponse",
      async () => {
        try {
          logger.info("Updating RSVP response", {
            code: response.invitationCode.substring(0, 3) + "***",
            guestCount: response.guests.length,
          });

          // Validate the response data
          const validatedResponse: RSVPFormDataValidated =
            rsvpFormDataSchema.parse(response);
          const code = validatedResponse.invitationCode;

          // Find the row with the matching invitation code with retry logic
          const rowIndex = await withRetry(async () => {
            return await this.findRowByInvitationCode(code);
          });

          if (!rowIndex) {
            throw new Error("Invitation code not found");
          }

          // Prepare the update data
          const guestNames = validatedResponse.guests
            .map((g) => g.name)
            .join(", ");
          const guestStatuses = validatedResponse.guests
            .map((g) => (g.attending ? "is_attending" : "not_attending"))
            .join(", ");

          const dietaryRestrictions = validatedResponse.guests
            .filter((g) => g.attending && g.dietaryRestrictions)
            .map((g) => `${g.name}: ${g.dietaryRestrictions}`)
            .join("; ");

          const submissionDate = new Date().toISOString();

          // Update the row with retry logic
          const updateRange = `${SHEET_NAME}!A${rowIndex}:H${rowIndex}`;
          const updateValues = [
            code,
            guestNames,
            guestStatuses,
            dietaryRestrictions,
            validatedResponse.personalMessage,
            submissionDate,
            validatedResponse.contactEmail || "",
            validatedResponse.speechInMinutes?.toString() || "",
          ];

          await withRetry(async () => {
            return await this.sheets.spreadsheets.values.update({
              spreadsheetId: this.spreadsheetId,
              range: updateRange,
              valueInputOption: "RAW",
              resource: {
                values: [updateValues],
              },
            });
          });

          // Invalidate cache for this invitation code
          globalCache.delete(`invitation_code_${code}`);

          const attendingGuests = validatedResponse.guests.filter(
            (g) => g.attending,
          );
          const derivedOverallStatus =
            attendingGuests.length === 0 ? "not_attending" : "is_attending";

          logger.info("RSVP response updated successfully", {
            code: code.substring(0, 3) + "***",
            status: derivedOverallStatus,
            attendingCount: attendingGuests.length,
          });

          // Update Oversikt sheet
          try {
            await this.updateOversiktSheet(code, validatedResponse.guests);
          } catch (oversiktError) {
            // Log but don't fail the whole RSVP if Oversikt update fails
            logger.error(
              "Failed to update Oversikt sheet",
              oversiktError as Error,
              {
                code: code.substring(0, 3) + "***",
              },
            );
          }

          return true;
        } catch (error) {
          logger.error("Failed to update RSVP response", error as Error, {
            code: response.invitationCode.substring(0, 3) + "***",
          });

          if (error instanceof z.ZodError) {
            const errorMessages = error.issues
              .map((issue) => issue.message)
              .join(", ");
            throw new Error(`Validation error: ${errorMessages}`);
          }
          throw handleSheetsError(error);
        }
      },
      { code: response.invitationCode.substring(0, 3) + "***" },
    );
  }

  /**
   * Check if invitation code has already been used for RSVP
   */
  async isRSVPSubmitted(code: string): Promise<boolean> {
    try {
      const guestEntry = await this.validateInvitationCode(code);
      return guestEntry ? guestEntry.rsvpStatus !== "pending" : false;
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
        range: `${SHEET_NAME}!A:H`,
      });

      const rows = response.data.values || [];
      const guestEntries: GuestEntry[] = [];

      // Skip header row
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row[0]) {
          // Only process rows with invitation codes
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
   * Private helper: Find all row indices in Oversikt sheet for a code
   */
  private async findAllRowsInOversikt(
    code: string,
  ): Promise<{ rowIndex: number; guestName: string }[]> {
    try {
      const response = await withRetry(async () => {
        return await this.sheets.spreadsheets.values.get({
          spreadsheetId: this.spreadsheetId,
          range: `${OVERSIKT_SHEET_NAME}!A:B`,
        });
      });

      const rows = response.data.values || [];

      // If sheet is empty (only header or totally empty), we should return empty but also maybe add header
      if (rows.length === 0) {
        await this.initializeOversiktSheet();
        return [];
      }

      const matchingRows: { rowIndex: number; guestName: string }[] = [];

      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] && rows[i][0].toUpperCase() === code) {
          matchingRows.push({
            rowIndex: i + 1,
            guestName: rows[i][1] || "",
          });
        }
      }
      return matchingRows;
    } catch (error: any) {
      // If sheet doesn't exist, we might get an error.
      // We should handle that or assume it exists.
      // Based on instructions "add it your self", maybe I should try to create it if it fails?
      // But adding a sheet via API requires batchUpdate addSheet.
      // Let's assume it exists as requested "assume there is no existing code in 'Oversikt', add it your self".
      logger.error("Error finding rows in Oversikt sheet", error as Error);
      return [];
    }
  }

  /**
   * Private helper: Initialize Oversikt sheet with headers
   */
  private async initializeOversiktSheet(): Promise<void> {
    try {
      await withRetry(async () => {
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: `${OVERSIKT_SHEET_NAME}!A1:B1`,
          valueInputOption: "RAW",
          resource: {
            values: [["Kode", "Navn"]],
          },
        });
      });
    } catch (error) {
      logger.error("Failed to initialize Oversikt sheet", error as Error);
    }
  }

  /**
   * Private helper: Update the Oversikt sheet with attending guests individually
   */
  private async updateOversiktSheet(
    code: string,
    guests: { name: string; attending: boolean }[],
  ): Promise<void> {
    // 1. Get current state of Oversikt for this code
    const existingRows = await this.findAllRowsInOversikt(code);

    // 2. Identify guests who should be in the sheet (attending)
    const attendingGuests = guests.filter((g) => g.attending);
    const attendingGuestNames = attendingGuests.map((g) => g.name);

    // 3. Find rows to delete (guests who were there but are no longer attending/in the list)
    // We should be careful about name matching.
    const rowsToDelete = existingRows
      .filter((er) => !attendingGuestNames.includes(er.guestName))
      .map((er) => er.rowIndex)
      .sort((a, b) => b - a); // Sort descending to delete from bottom up

    // 4. Find guests to add (attending but not currently in the sheet)
    const existingGuestNames = existingRows.map((er) => er.guestName);
    const guestsToAdd = attendingGuestNames.filter(
      (name) => !existingGuestNames.includes(name),
    );

    // 5. Perform deletions
    if (rowsToDelete.length > 0) {
      await withRetry(async () => {
        // Get the sheet ID first for the request
        const spreadsheet = await this.sheets.spreadsheets.get({
          spreadsheetId: this.spreadsheetId,
        });
        const sheet = spreadsheet.data.sheets?.find(
          (s: any) => s.properties?.title === OVERSIKT_SHEET_NAME,
        );

        if (!sheet) return;

        const requests = rowsToDelete.map((rowIndex) => ({
          deleteDimension: {
            range: {
              sheetId: sheet.properties?.sheetId,
              dimension: "ROWS",
              startIndex: rowIndex - 1,
              endIndex: rowIndex,
            },
          },
        }));

        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId: this.spreadsheetId,
          resource: {
            requests,
          },
        });
      });
    }

    // 6. Perform additions
    if (guestsToAdd.length > 0) {
      const valuesToAdd = guestsToAdd.map((name) => [code, name]);
      await withRetry(async () => {
        await this.sheets.spreadsheets.values.append({
          spreadsheetId: this.spreadsheetId,
          range: `${OVERSIKT_SHEET_NAME}!A:B`,
          valueInputOption: "RAW",
          resource: {
            values: valuesToAdd,
          },
        });
      });
    }

    logger.debug("Oversikt sheet updated individually", {
      code,
      added: guestsToAdd.length,
      deleted: rowsToDelete.length,
    });
  }

  /**
   * Private helper: Parse spreadsheet row to GuestEntry with validation
   */
  private parseRowToGuestEntry(row: any[]): GuestEntry {
    const guestNames = row[1]
      ? row[1].split(",").map((name: string) => name.trim())
      : [];
    const rsvpStatusValue = row[2] || "";

    // Parse individual guest statuses if they exist (comma-separated in Column C)
    let guestStatuses: ("pending" | "is_attending" | "not_attending")[] = [];
    let rsvpStatus: "pending" | "is_attending" | "not_attending" = "pending";

    if (rsvpStatusValue.includes(",")) {
      guestStatuses = rsvpStatusValue.split(",").map((s: string) => {
        const trimmed = s.trim().toLowerCase();
        return trimmed === "is_attending" ||
          trimmed === "not_attending" ||
          trimmed === "pending"
          ? (trimmed as "pending" | "is_attending" | "not_attending")
          : "pending";
      });

      // Determine overall status
      if (guestStatuses.every((s) => s === "is_attending")) {
        rsvpStatus = "is_attending";
      } else if (guestStatuses.every((s) => s === "not_attending")) {
        rsvpStatus = "not_attending";
      } else if (guestStatuses.some((s) => s === "is_attending")) {
        rsvpStatus = "is_attending"; // Mixed, but at least one attending
      } else if (guestStatuses.some((s) => s === "not_attending")) {
        rsvpStatus = "not_attending"; // Mixed, but if no one is attending and some are not_attending
      } else {
        rsvpStatus = "pending";
      }
    } else {
      rsvpStatus =
        (rsvpStatusValue as "pending" | "is_attending" | "not_attending") ||
        "pending";
      // If only one status but multiple guests, replicate it or default to pending
      guestStatuses = guestNames.map(() => rsvpStatus);
    }

    const rawEntry = {
      invitationCode: row[0] || "",
      guestNames,
      guestStatuses,
      rsvpStatus,
      dietaryRestrictions: row[3]
        ? row[3].split(";").map((item: string) => item.trim())
        : [],
      personalMessage: row[4] || "",
      submissionDate: row[5] || "",
      email: row[6] || "",
      speechInMinutes: row[7] ? Number(row[7]) : undefined,
    };

    // Validate the parsed data
    try {
      const validatedEntry: GuestEntryValidated =
        guestEntrySchema.parse(rawEntry);
      return validatedEntry;
    } catch (error) {
      // If validation fails, return the raw entry but log the error
      console.warn("Failed to validate guest entry from spreadsheet:", error);
      return rawEntry;
    }
  }

  /**
   * Register a speech in the Taler sheet
   */
  async registerSpeech(data: {
    name: string;
    contact?: string;
    durationMinutes: number;
    intro?: string;
    message?: string;
  }): Promise<boolean> {
    try {
      logger.info("Registering speech", { name: data.name });

      const submissionDate = new Date().toISOString();
      const values = [
        [data.name, data.contact || "", data.durationMinutes.toString(), data.intro || "", data.message || "", submissionDate],
      ];

      // Ensure header row exists by checking first
      const existing = await withRetry(async () => {
        return await this.sheets.spreadsheets.values.get({
          spreadsheetId: this.spreadsheetId,
          range: `${SPEECH_SHEET_NAME}!A1:F1`,
        });
      });

      const rows = existing.data.values || [];
      if (rows.length === 0) {
        // Write header first
        await withRetry(async () => {
          await this.sheets.spreadsheets.values.update({
            spreadsheetId: this.spreadsheetId,
            range: `${SPEECH_SHEET_NAME}!A1:F1`,
            valueInputOption: "RAW",
            resource: { values: [["Navn", "E-post/Telefon", "Varighet (min)", "Introduksjon", "Melding", "Registrert"]] },
          });
        });
      }

      await withRetry(async () => {
        await this.sheets.spreadsheets.values.append({
          spreadsheetId: this.spreadsheetId,
          range: `${SPEECH_SHEET_NAME}!A:F`,
          valueInputOption: "RAW",
          resource: { values },
        });
      });

      logger.info("Speech registered successfully", { name: data.name });
      return true;
    } catch (error) {
      logger.error("Failed to register speech", error as Error);
      throw handleSheetsError(error);
    }
  }

  /**
   * Register pre-party attendance — one row per name in "KveldenFør" sheet
   */
  async registerPreParty(names: string[]): Promise<boolean> {
    try {
      const SHEET = "KveldenFør";
      const submissionDate = new Date().toISOString();

      // Ensure header row exists
      const existing = await withRetry(async () => {
        return await this.sheets.spreadsheets.values.get({
          spreadsheetId: this.spreadsheetId,
          range: `${SHEET}!A1:B1`,
        });
      });

      if ((existing.data.values || []).length === 0) {
        await withRetry(async () => {
          await this.sheets.spreadsheets.values.update({
            spreadsheetId: this.spreadsheetId,
            range: `${SHEET}!A1:B1`,
            valueInputOption: "RAW",
            resource: { values: [["Navn", "Registrert"]] },
          });
        });
      }

      const rows = names.map((name) => [name.trim(), submissionDate]);

      await withRetry(async () => {
        await this.sheets.spreadsheets.values.append({
          spreadsheetId: this.spreadsheetId,
          range: `${SHEET}!A:B`,
          valueInputOption: "RAW",
          resource: { values: rows },
        });
      });

      logger.info("Pre-party registrations added", { count: names.length });
      return true;
    } catch (error) {
      logger.error("Failed to register pre-party", error as Error);
      throw handleSheetsError(error);
    }
  }

  /**
   * Health check for Google Sheets connection
   */
  async healthCheck(): Promise<{
    status: "healthy" | "unhealthy";
    message: string;
  }> {
    try {
      const isConnected = await withRetry(async () => {
        return await googleSheetsClient.testConnection();
      });
      return {
        status: isConnected ? "healthy" : "unhealthy",
        message: isConnected
          ? "Google Sheets API connection successful"
          : "Failed to connect to Google Sheets API",
      };
    } catch (error) {
      return {
        status: "unhealthy",
        message: `Google Sheets API error: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }
}

// Export singleton instance
export const sheetsService = new SheetsService();
