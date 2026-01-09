'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout';
import { InvitationCodeForm } from '@/components/forms';
import { FormErrorBoundary } from '@/components/error';
import { Card, useToast } from '@/components/ui';
import type { GuestEntry } from '@/types';

export default function Home() {
  const router = useRouter();
  const [error, setError] = useState('');
  const { showSuccess, showError } = useToast();

  const handleValidCode = (guestEntry: GuestEntry) => {
    // Store guest data in sessionStorage for the RSVP page
    sessionStorage.setItem('guestEntry', JSON.stringify(guestEntry));
    showSuccess('Invitation code validated successfully!');
    router.push('/rsvp');
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    showError(errorMessage);
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100">
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 lg:py-20 px-4 text-center overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-32 h-32 bg-rose-300 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-pink-300 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>
          
          <div className="max-w-4xl mx-auto relative z-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-gray-800 mb-4 sm:mb-6 leading-tight animate-fade-in gradient-text">
              Sarah & Michael
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-6 sm:mb-8 font-light px-4 sm:px-0 animate-slide-in-up">
              Together with our families, we invite you to celebrate our wedding
            </p>
            
            {/* Wedding Date & Venue */}
            <div className="glass rounded-2xl p-4 sm:p-6 lg:p-8 mb-8 sm:mb-12 shadow-xl mx-4 sm:mx-0 animate-scale-in hover-lift">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                <div className="text-center sm:text-left">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 font-serif">Date & Time</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Saturday, June 15th, 2024<br />
                    4:00 PM Ceremony<br />
                    6:00 PM Reception
                  </p>
                </div>
                <div className="text-center sm:text-left border-t sm:border-t-0 sm:border-l border-gray-200 pt-4 sm:pt-0 sm:pl-4 lg:pl-8">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 font-serif">Venue</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Beautiful Wedding Venue<br />
                    123 Wedding St<br />
                    City, State 12345
                  </p>
                </div>
              </div>
            </div>

            {/* RSVP Section */}
            <Card variant="glass" className="max-w-md mx-auto p-4 sm:p-6 lg:p-8 mx-4 sm:mx-auto hover-lift">
              <h2 className="text-xl sm:text-2xl font-serif text-gray-800 mb-4 sm:mb-6 gradient-text">RSVP</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                Please enter your invitation code to respond to our wedding invitation.
              </p>
              <FormErrorBoundary onReset={() => setError('')}>
                <InvitationCodeForm
                  onValidCode={handleValidCode}
                  onError={handleError}
                />
              </FormErrorBoundary>
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md animate-slide-in-up">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </Card>
          </div>
        </section>

        {/* Event Schedule */}
        <section className="py-12 sm:py-16 px-4 bg-white/30 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-serif text-gray-800 text-center mb-8 sm:mb-12 gradient-text animate-fade-in">
              Schedule of Events
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <Card variant="glass" className="p-4 sm:p-6 text-center hover-lift animate-fade-in">
                <div className="w-12 h-12 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">3:30</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 font-serif">Guest Arrival</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Please arrive early for seating and to enjoy pre-ceremony music
                </p>
              </Card>
              <Card variant="glass" className="p-4 sm:p-6 text-center hover-lift animate-fade-in" style={{animationDelay: '0.2s'}}>
                <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">4:00</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 font-serif">Ceremony</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Join us as we exchange vows in the beautiful garden setting
                </p>
              </Card>
              <Card variant="glass" className="p-4 sm:p-6 text-center hover-lift animate-fade-in sm:col-span-2 lg:col-span-1" style={{animationDelay: '0.4s'}}>
                <div className="w-12 h-12 bg-gradient-to-r from-rose-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">6:00</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 font-serif">Reception</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Dinner, dancing, and celebration in the main ballroom
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Venue Information & Directions */}
        <section className="py-12 sm:py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-serif text-gray-800 text-center mb-8 sm:mb-12 gradient-text animate-fade-in">
              Venue & Directions
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
              <Card variant="glass" className="p-4 sm:p-6 lg:p-8 hover-lift animate-fade-in">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 font-serif">Getting There</h3>
                </div>
                <div className="space-y-3 sm:space-y-4 text-gray-600">
                  <div>
                    <p className="font-medium text-gray-800">Address:</p>
                    <p className="text-sm sm:text-base">
                      Beautiful Wedding Venue<br />
                      123 Wedding St<br />
                      City, State 12345
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Parking:</p>
                    <p className="text-sm sm:text-base">
                      Complimentary valet parking available on-site
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Transportation:</p>
                    <p className="text-sm sm:text-base">
                      Shuttle service available from downtown hotels
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card variant="glass" className="p-4 sm:p-6 lg:p-8 hover-lift animate-fade-in" style={{animationDelay: '0.2s'}}>
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 font-serif">Accommodations</h3>
                </div>
                <div className="space-y-3 sm:space-y-4 text-gray-600">
                  <div className="bg-white/50 p-3 rounded-lg">
                    <p className="font-medium text-gray-800">Grand Hotel Downtown</p>
                    <p className="text-sm">456 Main St • (555) 123-4567</p>
                    <p className="text-sm">Group rate available with code: SARAH2024</p>
                  </div>
                  <div className="bg-white/50 p-3 rounded-lg">
                    <p className="font-medium text-gray-800">Garden Inn & Suites</p>
                    <p className="text-sm">789 Park Ave • (555) 987-6543</p>
                    <p className="text-sm">Complimentary breakfast included</p>
                  </div>
                  <p className="text-sm italic text-rose-600 bg-rose-50 p-2 rounded animate-pulse">
                    Please book by May 15th for group rates
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Additional Information */}
        <section className="py-12 sm:py-16 px-4 bg-white/30 backdrop-blur-sm">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-serif text-gray-800 mb-6 sm:mb-8 gradient-text animate-fade-in">
              Additional Information
            </h2>
            <div className="space-y-4 sm:space-y-6 text-gray-600 text-left sm:text-center">
              <Card variant="glass" className="p-4 sm:p-6 hover-lift animate-fade-in">
                <div className="flex items-start sm:items-center sm:justify-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="text-left sm:text-center">
                    <p className="text-sm sm:text-base">
                      <span className="font-semibold text-gray-800">Dress Code:</span> Cocktail attire. We suggest garden party elegant - 
                      think flowy dresses and light suits in soft colors.
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card variant="glass" className="p-4 sm:p-6 hover-lift animate-fade-in" style={{animationDelay: '0.1s'}}>
                <div className="flex items-start sm:items-center sm:justify-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                  </div>
                  <div className="text-left sm:text-center">
                    <p className="text-sm sm:text-base">
                      <span className="font-semibold text-gray-800">Weather:</span> Our ceremony will be outdoors with an indoor backup plan. 
                      The reception is indoors with air conditioning.
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card variant="glass" className="p-4 sm:p-6 hover-lift animate-fade-in" style={{animationDelay: '0.2s'}}>
                <div className="flex items-start sm:items-center sm:justify-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                  <div className="text-left sm:text-center">
                    <p className="text-sm sm:text-base">
                      <span className="font-semibold text-gray-800">Registry:</span> Your presence is the only present we need! 
                      If you wish to give a gift, we have registries at Target and Williams Sonoma.
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card variant="glass" className="p-4 sm:p-6 hover-lift animate-fade-in" style={{animationDelay: '0.3s'}}>
                <div className="flex items-start sm:items-center sm:justify-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-left sm:text-center">
                    <p className="text-sm sm:text-base">
                      <span className="font-semibold text-gray-800">Questions?</span> Please contact us at{' '}
                      <a href="mailto:sarah.michael.wedding@email.com" className="text-rose-600 hover:text-rose-700 underline break-all transition-colors">
                        sarah.michael.wedding@email.com
                      </a>
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
