'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout';
import { RSVPForm } from '@/components/forms';
import { Card, Button } from '@/components/ui';
import type { GuestEntry, RSVPFormData } from '@/types';

export default function RSVPPage() {
  const router = useRouter();
  const [guestEntry, setGuestEntry] = useState<GuestEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get guest data from sessionStorage
    const storedGuestEntry = sessionStorage.getItem('guestEntry');
    if (storedGuestEntry) {
      try {
        const parsedGuestEntry = JSON.parse(storedGuestEntry);
        setGuestEntry(parsedGuestEntry);
      } catch (error) {
        console.error('Error parsing guest entry:', error);
        router.push('/');
      }
    } else {
      // No guest data found, redirect to homepage
      router.push('/');
    }
    setIsLoading(false);
  }, [router]);

  const handleRSVPSubmit = async (formData: RSVPFormData) => {
    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit RSVP');
      }

      // Store RSVP data for confirmation page
      sessionStorage.setItem('rsvpSubmission', JSON.stringify(formData));
      router.push('/confirmation');
    } catch (error) {
      console.error('RSVP submission error:', error);
      // The RSVPForm component will handle displaying the error
      throw error;
    }
  };

  const handleStartOver = () => {
    sessionStorage.removeItem('guestEntry');
    router.push('/');
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your RSVP form...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!guestEntry) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
          <Card className="max-w-md mx-auto p-8 text-center">
            <h1 className="text-2xl font-serif text-gray-800 mb-4">
              RSVP Access Required
            </h1>
            <p className="text-gray-600 mb-6">
              Please enter your invitation code to access the RSVP form.
            </p>
            <Button onClick={() => router.push('/')} className="w-full">
              Enter Invitation Code
            </Button>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif text-gray-800 mb-4">
              RSVP for Sarah & Michael's Wedding
            </h1>
            <p className="text-gray-600">
              Saturday, June 15th, 2024 • Beautiful Wedding Venue
            </p>
          </div>

          {/* Guest Information */}
          <Card className="p-6 mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Invitation for:
                </h2>
                <div className="space-y-1">
                  {guestEntry.guestNames.map((name, index) => (
                    <p key={index} className="text-gray-700">{name}</p>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Code: {guestEntry.invitationCode}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartOver}
                className="text-sm"
              >
                Start Over
              </Button>
            </div>
          </Card>

          {/* RSVP Form */}
          <Card className="p-8">
            <RSVPForm
              guestEntry={guestEntry}
              onSubmit={handleRSVPSubmit}
            />
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}