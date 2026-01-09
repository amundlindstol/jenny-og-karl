import React from 'react';
import { Card, CardContent, Input, Textarea } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { GuestResponse } from '@/types';

interface GuestCardProps {
  guest: GuestResponse;
  index: number;
  onChange: (index: number, updatedGuest: GuestResponse) => void;
  error?: string;
  className?: string;
}

export function GuestCard({ guest, index, onChange, error, className }: GuestCardProps) {
  const handleAttendingChange = (attending: boolean) => {
    onChange(index, {
      ...guest,
      attending,
      // Clear dietary restrictions if not attending
      dietaryRestrictions: attending ? guest.dietaryRestrictions : ''
    });
  };

  const handleDietaryRestrictionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(index, {
      ...guest,
      dietaryRestrictions: e.target.value
    });
  };

  return (
    <Card className={cn('transition-all duration-200', className)} variant="outlined">
      <CardContent>
        <div className="space-y-4">
          {/* Guest Name Display */}
          <div>
            <h3 className="text-lg font-semibold text-rose-900 mb-2">
              {guest.name}
            </h3>
          </div>

          {/* Attendance Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-rose-900 block">
              Will you be attending?
            </label>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name={`attending-${index}`}
                  checked={guest.attending === true}
                  onChange={() => handleAttendingChange(true)}
                  className="w-4 h-4 text-rose-600 border-rose-300 focus:ring-rose-500"
                />
                <span className="text-rose-800 font-medium">Yes, I'll be there!</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name={`attending-${index}`}
                  checked={guest.attending === false}
                  onChange={() => handleAttendingChange(false)}
                  className="w-4 h-4 text-rose-600 border-rose-300 focus:ring-rose-500"
                />
                <span className="text-rose-800 font-medium">Sorry, can't make it</span>
              </label>
            </div>
          </div>

          {/* Dietary Restrictions - Only show if attending */}
          {guest.attending && (
            <div className="space-y-2">
              <Textarea
                label="Dietary Restrictions or Special Requests"
                value={guest.dietaryRestrictions}
                onChange={handleDietaryRestrictionsChange}
                placeholder="Please let us know about any dietary restrictions, allergies, or special meal requests..."
                helperText="Optional - Leave blank if no special requirements"
                rows={3}
                maxLength={500}
              />
              {guest.dietaryRestrictions && (
                <p className="text-xs text-rose-500 text-right">
                  {guest.dietaryRestrictions.length}/500 characters
                </p>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 flex items-center gap-1">
                <span className="text-red-500">⚠</span>
                {error}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}