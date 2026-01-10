import React, { useCallback, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { validateInvitationCodeDetailed } from "@/lib/validation";
import { fetchWithRecovery, NetworkErrorType } from "@/lib/network-recovery";
import type { GuestEntry } from "@/types";

interface InvitationCodeFormProps {
  onValidCode: (guestEntry: GuestEntry) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function InvitationCodeForm({
  onValidCode,
  onError,
  className,
}: InvitationCodeFormProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  // Real-time validation as user types
  const handleCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.toUpperCase();
      setCode(value);
      setError("");
      setRetryCount(0); // Reset retry count when user changes input

      // Clear validation error when user starts typing
      if (validationError) {
        setValidationError("");
      }

      // Real-time format validation
      if (value.length > 0) {
        const validation = validateInvitationCodeDetailed(value);
        if (!validation.isValid && value.length >= 4) {
          setValidationError(validation.error || "Invalid code format");
        } else {
          setValidationError("");
        }
      }
    },
    [validationError],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      setValidationError("Please enter your invitation code");
      return;
    }

    // Validate code format
    const validation = validateInvitationCodeDetailed(code);
    if (!validation.isValid) {
      setValidationError(validation.error || "Invalid invitation code format");
      return;
    }

    setIsLoading(true);
    setError("");
    setValidationError("");

    try {
      // Use enhanced fetch with retry logic
      const response = await fetchWithRecovery(
        `/api/guests/${validation.normalizedCode}`,
        {
          method: "GET",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to validate invitation code");
      }

      if (data.success && data.data) {
        onValidCode(data.data);
        setRetryCount(0);
      } else {
        const errorMessage =
          data.error ||
          "Invalid invitation code. Please check your code and try again.";
        setError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (err: any) {
      let errorMessage =
        "Unable to validate invitation code. Please try again.";

      // Handle different types of network errors
      if (err.type === NetworkErrorType.TIMEOUT) {
        errorMessage =
          "Request timed out. Please check your connection and try again.";
      } else if (err.type === NetworkErrorType.CONNECTION_FAILED) {
        errorMessage =
          "Connection failed. Please check your internet connection.";
      } else if (err.type === NetworkErrorType.RATE_LIMITED) {
        errorMessage = "Too many requests. Please wait a moment and try again.";
      } else if (err.type === NetworkErrorType.SERVER_ERROR) {
        errorMessage = "Server error. Please try again in a moment.";
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setRetryCount((prev) => prev + 1);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = validationError || error;
  const showRetryHint = retryCount > 0 && error;

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            label="Invitasjonskode"
            value={code}
            onChange={handleCodeChange}
            placeholder="Skriv inn din kode"
            error={displayError}
            helperText={
              !displayError
                ? "Skriv inn din kode fra din bryllupsinvitasjon"
                : undefined
            }
            disabled={isLoading}
            maxLength={8}
            className="text-center text-lg font-mono tracking-wider"
            autoComplete="off"
            autoFocus
          />

          {/* Retry hint */}
          {showRetryHint && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
              <p className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Forsøk {retryCount}. Hvis dette fortsetter, kontakt oss.
              </p>
            </div>
          )}
        </div>

        <Button
          type="submit"
          loading={isLoading}
          disabled={!code.trim() || !!validationError || isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? "Validerer..." : "Fortsett til RSVP"}
        </Button>
      </form>
    </div>
  );
}
