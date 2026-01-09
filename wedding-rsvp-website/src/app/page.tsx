'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout';
import { InvitationCodeForm } from '@/components/forms';
import { Card } from '@/components/ui';
import type { GuestEntry } from '@/types';

export default function Home() {
  const router = useRouter();
  const [error, setError] = useState('');

  const handleValidCode = (guestEntry: GuestEntry) => {
    // Store guest data in sessionStorage for the RSVP page
    sessionStorage.setItem('guestEntry', JSON.stringify(guestEntry));
    router.push('/rsvp');
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
        {/* Hero Section */}
        <section className="relative py-20 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-serif text-gray-800 mb-6">
              Sarah & Michael
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 font-light">
              Together with our families, we invite you to celebrate our wedding
            </p>
            
            {/* Wedding Date & Venue */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-8 mb-12 shadow-lg">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Date & Time</h3>
                  <p className="text-gray-600">
                    Saturday, June 15th, 2024<br />
                    4:00 PM Ceremony<br />
                    6:00 PM Reception
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Venue</h3>
                  <p className="text-gray-600">
                    Beautiful Wedding Venue<br />
                    123 Wedding St<br />
                    City, State 12345
                  </p>
                </div>
              </div>
            </div>

            {/* RSVP Section */}
            <Card className="max-w-md mx-auto p-8">
              <h2 className="text-2xl font-serif text-gray-800 mb-6">RSVP</h2>
              <p className="text-gray-600 mb-6">
                Please enter your invitation code to respond to our wedding invitation.
              </p>
              <InvitationCodeForm
                onValidCode={handleValidCode}
                onError={handleError}
              />
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </Card>
          </div>
        </section>

        {/* Event Schedule */}
        <section className="py-16 px-4 bg-white/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-serif text-gray-800 text-center mb-12">
              Schedule of Events
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">3:30 PM</h3>
                <h4 className="text-lg text-gray-700 mb-2">Guest Arrival</h4>
                <p className="text-gray-600">
                  Please arrive early for seating and to enjoy pre-ceremony music
                </p>
              </Card>
              <Card className="p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">4:00 PM</h3>
                <h4 className="text-lg text-gray-700 mb-2">Ceremony</h4>
                <p className="text-gray-600">
                  Join us as we exchange vows in the beautiful garden setting
                </p>
              </Card>
              <Card className="p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">6:00 PM</h3>
                <h4 className="text-lg text-gray-700 mb-2">Reception</h4>
                <p className="text-gray-600">
                  Dinner, dancing, and celebration in the main ballroom
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Venue Information & Directions */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-serif text-gray-800 text-center mb-12">
              Venue & Directions
            </h2>
            <div className="grid md:grid-cols-2 gap-12">
              <Card className="p-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Getting There</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    <strong>Address:</strong><br />
                    Beautiful Wedding Venue<br />
                    123 Wedding St<br />
                    City, State 12345
                  </p>
                  <p>
                    <strong>Parking:</strong><br />
                    Complimentary valet parking available on-site
                  </p>
                  <p>
                    <strong>Transportation:</strong><br />
                    Shuttle service available from downtown hotels
                  </p>
                </div>
              </Card>
              
              <Card className="p-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Accommodations</h3>
                <div className="space-y-4 text-gray-600">
                  <div>
                    <p className="font-medium">Grand Hotel Downtown</p>
                    <p className="text-sm">456 Main St • (555) 123-4567</p>
                    <p className="text-sm">Group rate available with code: SARAH2024</p>
                  </div>
                  <div>
                    <p className="font-medium">Garden Inn & Suites</p>
                    <p className="text-sm">789 Park Ave • (555) 987-6543</p>
                    <p className="text-sm">Complimentary breakfast included</p>
                  </div>
                  <p className="text-sm italic">
                    Please book by May 15th for group rates
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Additional Information */}
        <section className="py-16 px-4 bg-white/50">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-serif text-gray-800 mb-8">
              Additional Information
            </h2>
            <div className="space-y-6 text-gray-600">
              <p>
                <strong>Dress Code:</strong> Cocktail attire. We suggest garden party elegant - 
                think flowy dresses and light suits in soft colors.
              </p>
              <p>
                <strong>Weather:</strong> Our ceremony will be outdoors with an indoor backup plan. 
                The reception is indoors with air conditioning.
              </p>
              <p>
                <strong>Registry:</strong> Your presence is the only present we need! 
                If you wish to give a gift, we have registries at Target and Williams Sonoma.
              </p>
              <p>
                <strong>Questions?</strong> Please contact us at{' '}
                <a href="mailto:sarah.michael.wedding@email.com" className="text-rose-600 hover:text-rose-700">
                  sarah.michael.wedding@email.com
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
