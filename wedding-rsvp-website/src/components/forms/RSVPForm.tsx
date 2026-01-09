import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Textarea } from '@/components/ui';
import { GuestCard } from './GuestCard';
import { rsvpFormDataSchema } from '@/types';
import type { RSVPFormData, GuestResponse, GuestEntry, ValidationError } from '@/types';
import { cn } from '@/lib/utils';

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
      dietaryRestrictions: ''
    })),
    personalMessage: '',
    contactEmail: ''
  }));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [submitError, setSubmitError] = useState('');

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

  // Validate form data
  const validateForm = useCallback((): boolean => {
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
    }
  }, [formData]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await onSubmit(formData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit RSVP. Please try again.';
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
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">RSVP for {guestEntry.invitationCode}</CardTitle>
          <p className="text-rose-600 text-sm sm:text-base">
            Please let us know if you'll be joining us for our special day!
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Guest Responses */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-rose-900 border-b border-rose-200 pb-2">
                Guest Responses
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
                  RSVP Summary: {attendingCount} of {totalGuests} guests attending
                </p>
              </div>
            )}

            {/* Contact Email */}
            <div>
              <Input
                label="Contact Email (Optional)"
                type="email"
                value={formData.contactEmail}
                onChange={handleContactEmailChange}
                placeholder="your.email@example.com"
                error={getFieldError('contactEmail')}
                helperText="We'll use this to send you any important updates about the wedding"
              />
            </div>

            {/* Personal Message */}
            <div>
              <Textarea
                label="Personal Message (Optional)"
                value={formData.personalMessage}
                onChange={handlePersonalMessageChange}
                placeholder="Share your excitement, well wishes, or any questions you might have..."
                error={getFieldError('personalMessage')}
                helperText="Let us know how excited you are or if you have any questions!"
                rows={4}
                maxLength={1000}
              />
              {formData.personalMessage && (
                <p className="text-xs text-rose-500 text-right mt-1">
                  {formData.personalMessage.length}/1000 characters
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
                  Back to Code Entry
                </Button>
              )}
              
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={isSubmitting}
                className="w-full sm:flex-1 sm:min-w-[200px] order-1 sm:order-2"
                size="lg"
              >
                {isSubmitting ? 'Submitting RSVP...' : 'Submit RSVP'}
              </Button>
            </div>

            {/* Helpful Note */}
            <div className="text-xs sm:text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-3">
              <p className="font-medium mb-1">📝 Note:</p>
              <p>
                You can change your RSVP later by re-entering your invitation code. 
                We'll update your response with the latest information.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}