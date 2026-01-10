import React, {useCallback, useState} from 'react';
import {Button, Card, CardContent, CardHeader, CardTitle, Input, LoadingOverlay, Textarea} from '@/components/ui';
import {GuestCard} from './GuestCard';
import type {GuestEntry, GuestResponse, RSVPFormData, ValidationError} from '@/types';
import {rsvpFormDataSchema} from '@/types';
import {fetchWithRecovery, NetworkErrorType} from '@/lib/network-recovery';
import {cn} from '@/lib/utils';

interface RSVPFormProps {
  guestEntry: GuestEntry;
  onSubmit: (formData: RSVPFormData) => Promise<void>;
  onCancel?: () => void;
  className?: string;
}

export function RSVPForm({ guestEntry, onSubmit, onCancel, className }: RSVPFormProps) {
  // Initialize form data with guest names from the invitation
  const [formData, setFormData] = useState<RSVPFormData>(() => ({
    invitationCode: guestEntry.invitationCode,
    guests: guestEntry.guestNames.map(name => ({
      name,
      attending: false,
      dietaryRestrictions: guestEntry.dietaryRestrictions?.find(it => it.includes(name))?.split(':')?.[1] || ''
    })),
    personalMessage: guestEntry.personalMessage ?? '',
    contactEmail: guestEntry.email ?? ''
  }));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [submitError, setSubmitError] = useState('');
  const [submitAttempts, setSubmitAttempts] = useState(0);
  const [isValidating, setIsValidating] = useState(false);

  // Handle guest response changes
  const handleGuestChange = useCallback((index: number, updatedGuest: GuestResponse) => {
    setFormData(prev => ({
      ...prev,
      guests: prev.guests.map((guest, i) => i === index ? updatedGuest : guest)
    }));
    
    // Clear any existing errors for this guest
    setErrors(prev => prev.filter(error => !error.field.startsWith(`guests.${index}`)));
  }, []);

  // Handle personal message change
  const handlePersonalMessageChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      personalMessage: e.target.value
    }));
    
    // Clear personal message errors
    setErrors(prev => prev.filter(error => error.field !== 'personalMessage'));
  }, []);

  // Handle contact email change
  const handleContactEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      contactEmail: e.target.value
    }));
    
    // Clear email errors
    setErrors(prev => prev.filter(error => error.field !== 'contactEmail'));
  }, []);

  // Validate form data with loading state
  const validateForm = useCallback((): boolean => {
    setIsValidating(true);
    try {
      rsvpFormDataSchema.parse(formData);
      setErrors([]);
      return true;
    } catch (error: any) {
      if (error.errors) {
        const validationErrors: ValidationError[] = error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }));
        setErrors(validationErrors);
      }
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [formData]);

  // Handle form submission with enhanced error handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitAttempts(prev => prev + 1);

    try {
      // Use enhanced fetch with retry logic
      const response = await fetchWithRecovery('/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to submit RSVP');
      }

      // Call the onSubmit callback with the form data
      await onSubmit(formData);
      setSubmitAttempts(0); // Reset attempts on success
    } catch (error: any) {
      let errorMessage = 'Failed to submit RSVP. Please try again.';
      
      // Handle different types of network errors
      if (error.type === NetworkErrorType.TIMEOUT) {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else if (error.type === NetworkErrorType.CONNECTION_FAILED) {
        errorMessage = 'Connection failed. Please check your internet connection and try again.';
      } else if (error.type === NetworkErrorType.RATE_LIMITED) {
        errorMessage = 'Too many requests. Please wait a moment before trying again.';
      } else if (error.type === NetworkErrorType.SERVER_ERROR) {
        errorMessage = 'Server error. Please try again in a moment.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get error for specific field
  const getFieldError = (fieldName: string): string | undefined => {
    return errors.find(error => error.field === fieldName)?.message;
  };

  // Check if any guests are attending
  const hasAttendingGuests = formData.guests.some(guest => guest.attending);
  const attendingCount = formData.guests.filter(guest => guest.attending).length;
  const totalGuests = formData.guests.length;

  return (
    <div className={cn('max-w-2xl mx-auto', className)}>
      <LoadingOverlay isLoading={isSubmitting} message="Submitting your RSVP...">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">RSVP for {guestEntry.invitationCode}</CardTitle>
            <p className="text-rose-600 text-sm sm:text-base">
              Vennligst la oss vite om du blir med oss på vår spesielle dag!
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Guest Responses */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-rose-900 border-b border-rose-200 pb-2">
                  Gjestesvar
                </h3>
                
                {formData.guests.map((guest, index) => (
                  <GuestCard
                    key={`${guest.name}-${index}`}
                    guest={guest}
                    index={index}
                    onChange={handleGuestChange}
                    error={getFieldError(`guests.${index}`)}
                  />
                ))}
              </div>

              {/* RSVP Summary */}
              {totalGuests > 1 && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 sm:p-4">
                  <p className="text-rose-800 font-medium text-sm sm:text-base">
                    RSVP-sammendrag: {attendingCount} av {totalGuests} gjester deltar
                  </p>
                </div>
              )}

              {/* Contact Email */}
              <div>
                <Input
                  label="Kontakt e-post (valgfritt)"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleContactEmailChange}
                  placeholder="din.epost@example.com"
                  error={getFieldError('contactEmail')}
                  helperText="Vi bruker denne til å sende deg viktige oppdateringer om bryllupet"
                  disabled={isSubmitting}
                />
              </div>

              {/* Personal Message */}
              <div>
                <Textarea
                  label="Personlig melding (valgfritt)"
                  value={formData.personalMessage}
                  onChange={handlePersonalMessageChange}
                  placeholder="Del din glede, ønsker eller spørsmål du måtte ha..."
                  error={getFieldError('personalMessage')}
                  helperText="La oss vite hvor glade dere er eller om dere har spørsmål!"
                  rows={4}
                  maxLength={1000}
                  disabled={isSubmitting}
                />
                {formData.personalMessage && (
                  <p className="text-xs text-rose-500 text-right mt-1">
                    {formData.personalMessage.length}/1000 tegn
                  </p>
                )}
              </div>

              {/* Submit Error */}
              {submitError && (
                <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 flex items-center gap-2 text-sm sm:text-base">
                    <span className="text-red-500">⚠</span>
                    {submitError}
                  </p>
                  {submitAttempts > 1 && (
                    <p className="text-red-500 text-xs mt-2">
                      Forsøk {submitAttempts}. Hvis dette fortsetter, vennligst kontakt oss direkte.
                    </p>
                  )}
                </div>
              )}

              {/* Validation in progress */}
              {isValidating && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-600 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Validerer skjema...
                  </p>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-rose-200">
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto order-2 sm:order-1"
                  >
                    Tilbake til kodeinntasting
                  </Button>
                )}
                
                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting || isValidating}
                  className="w-full sm:flex-1 sm:min-w-[200px] order-1 sm:order-2"
                  size="lg"
                >
                  {isSubmitting ? 'Sender inn RSVP...' : 'Send inn RSVP'}
                </Button>
              </div>

              {/* Helpful Note */}
              <div className="text-xs sm:text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-3">
                <p className="font-medium mb-1">📝 Merk:</p>
                <p>
                  Du kan endre RSVP-en din senere ved å skrive inn invitasjonskoden din på nytt. 
                  Vi oppdaterer svaret ditt med den nyeste informasjonen.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </LoadingOverlay>
    </div>
  );
}