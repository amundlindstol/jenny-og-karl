import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { validateInvitationCodeDetailed } from '@/lib/validation';
import type { GuestEntry } from '@/types';

interface InvitationCodeFormProps {
  onValidCode: (guestEntry: GuestEntry) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function InvitationCodeForm({ onValidCode, onError, className }: InvitationCodeFormProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  // Real-time validation as user types
  const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setCode(value);
    setError('');
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('');
    }

    // Real-time format validation
    if (value.length > 0) {
      const validation = validateInvitationCodeDetailed(value);
      if (!validation.isValid && value.length >= 4) {
        setValidationError(validation.error || 'Invalid code format');
      } else {
        setValidationError('');
      }
    }
  }, [validationError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setValidationError('Please enter your invitation code');
      return;
    }

    // Validate code format
    const validation = validateInvitationCodeDetailed(code);
    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid invitation code format');
      return;
    }

    setIsLoading(true);
    setError('');
    setValidationError('');

    try {
      // Call API to validate code against Google Sheets
      const response = await fetch(`/api/guests/${validation.normalizedCode}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to validate invitation code');
      }

      if (data.success && data.data) {
        onValidCode(data.data);
      } else {
        const errorMessage = data.error || 'Invalid invitation code. Please check your code and try again.';
        setError(errorMessage);
        onError?.(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unable to validate invitation code. Please try again.';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = validationError || error;

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            label="Invitation Code"
            value={code}
            onChange={handleCodeChange}
            placeholder="Enter your invitation code"
            error={displayError}
            helperText={!displayError ? "Enter the code from your wedding invitation" : undefined}
            disabled={isLoading}
            maxLength={8}
            className="text-center text-lg font-mono tracking-wider"
            autoComplete="off"
            autoFocus
          />
        </div>
        
        <Button
          type="submit"
          loading={isLoading}
          disabled={!code.trim() || !!validationError || isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? 'Validating...' : 'Continue to RSVP'}
        </Button>
      </form>
    </div>
  );
}