'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import type { RSVPFormData } from '@/types';

export default function ConfirmationPage() {
  const router = useRouter();
  const [rsvpData, setRsvpData] = useState<RSVPFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get RSVP submission data from sessionStorage
    const storedRsvpData = sessionStorage.getItem('rsvpSubmission');
    if (storedRsvpData) {
      try {
        const parsedRsvpData = JSON.parse(storedRsvpData);
        setRsvpData(parsedRsvpData);
      } catch (error) {
        console.error('Error parsing RSVP data:', error);
        router.push('/');
      }
    } else {
      // No RSVP data found, redirect to homepage
      router.push('/');
    }
    setIsLoading(false);
  }, [router]);

  const handleNewRSVP = () => {
    // Clear stored data and go to homepage
    sessionStorage.removeItem('guestEntry');
    sessionStorage.removeItem('rsvpSubmission');
    router.push('/');
  };

  const handleModifyRSVP = () => {
    // Keep guest entry but remove submission to allow modification
    sessionStorage.removeItem('rsvpSubmission');
    router.push('/rsvp');
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading confirmation...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!rsvpData) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
          <Card className="max-w-md mx-auto p-8 text-center">
            <h1 className="text-2xl font-serif text-gray-800 mb-4">
              No RSVP Found
            </h1>
            <p className="text-gray-600 mb-6">
              We couldn't find your RSVP submission. Please start over.
            </p>
            <Button onClick={() => router.push('/')} className="w-full">
              Start New RSVP
            </Button>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const attendingGuests = rsvpData.guests.filter(guest => guest.attending);
  const notAttendingGuests = rsvpData.guests.filter(guest => !guest.attending);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 py-6 sm:py-8 lg:py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-gray-800 mb-2 sm:mb-4 leading-tight">
              Thank You!
            </h1>
            <p className="text-lg sm:text-xl text-gray-600">
              Your RSVP has been successfully submitted
            </p>
          </div>

          {/* RSVP Summary */}
          <Card className="p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-serif text-gray-800 mb-4 sm:mb-6 text-center">
              RSVP Summary
            </h2>
            
            {/* Attending Guests */}
            {attendingGuests.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-green-700 mb-2 sm:mb-3">
                  ✓ Attending ({attendingGuests.length} guest{attendingGuests.length !== 1 ? 's' : ''})
                </h3>
                <div className="space-y-2">
                  {attendingGuests.map((guest, index) => (
                    <div key={index} className="bg-green-50 p-3 rounded-md">
                      <p className="font-medium text-gray-800 text-sm sm:text-base">{guest.name}</p>
                      {guest.dietaryRestrictions && (
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          Dietary restrictions: {guest.dietaryRestrictions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Not Attending Guests */}
            {notAttendingGuests.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-2 sm:mb-3">
                  ✗ Unable to Attend ({notAttendingGuests.length} guest{notAttendingGuests.length !== 1 ? 's' : ''})
                </h3>
                <div className="space-y-2">
                  {notAttendingGuests.map((guest, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-md">
                      <p className="font-medium text-gray-600 text-sm sm:text-base">{guest.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Personal Message */}
            {rsvpData.personalMessage && (
              <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">Your Message</h3>
                <div className="bg-blue-50 p-3 sm:p-4 rounded-md">
                  <p className="text-gray-700 italic text-sm sm:text-base">"{rsvpData.personalMessage}"</p>
                </div>
              </div>
            )}

            {/* Contact Email */}
            {rsvpData.contactEmail && (
              <div className="text-xs sm:text-sm text-gray-600">
                <p>Contact email: {rsvpData.contactEmail}</p>
              </div>
            )}
          </Card>

          {/* Next Steps */}
          <Card className="p-4 sm:p-6 mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">What's Next?</h3>
            <div className="space-y-2 sm:space-y-3 text-gray-600 text-sm sm:text-base">
              <p>• You'll receive a confirmation email shortly with all the wedding details</p>
              <p>• Check our website closer to the date for any updates</p>
              <p>• If you need to make changes, you can modify your RSVP anytime</p>
              <p>• For questions, contact us at{' '}
                <a href="mailto:sarah.michael.wedding@email.com" className="text-rose-600 hover:text-rose-700 underline break-all">
                  sarah.michael.wedding@email.com
                </a>
              </p>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              onClick={handleModifyRSVP}
              variant="outline"
              className="w-full sm:flex-1"
            >
              Modify This RSVP
            </Button>
            <Button
              onClick={handleNewRSVP}
              className="w-full sm:flex-1"
            >
              Submit Another RSVP
            </Button>
          </div>

          {/* Wedding Details Reminder */}
          <div className="mt-8 sm:mt-12 text-center text-gray-600">
            <h4 className="font-semibold mb-2 text-sm sm:text-base">Save the Date</h4>
            <div className="text-sm sm:text-base space-y-1">
              <p>Saturday, June 15th, 2024</p>
              <p>4:00 PM Ceremony • 6:00 PM Reception</p>
              <p>Beautiful Wedding Venue</p>
              <p className="text-xs sm:text-sm mt-2">We can't wait to celebrate with you! 💕</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}