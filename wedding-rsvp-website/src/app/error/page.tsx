'use client';

import {Suspense} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {MainLayout} from '@/components/layout';
import {Button, Card} from '@/components/ui';

function ErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get error details from URL parameters
  const errorType = searchParams.get('type') || 'general';
  const errorMessage = searchParams.get('message') || 'An unexpected error occurred';

  const getErrorContent = () => {
    switch (errorType) {
      case 'invalid_code':
        return {
          title: 'Ugyldig invitasjonskode',
          message: 'Invitasjonskoden du skrev inn er ikke gyldig. Vennligst sjekk bryllupsinvitasjonen din og prøv igjen.',
          icon: (
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          actions: [
            { label: 'Prøv igjen', action: () => router.push('/'), primary: true },
            { label: 'Kontakt oss', action: () => window.location.href = 'mailto:jenny.karl.bryllup@email.com', primary: false }
          ]
        };
      
      case 'submission_failed':
        return {
          title: 'RSVP-innsending feilet',
          message: 'Vi klarte ikke å lagre RSVP-svaret ditt. Vennligst prøv å sende inn igjen.',
          icon: (
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          actions: [
            { label: 'Prøv igjen', action: () => router.back(), primary: true },
            { label: 'Start på nytt', action: () => router.push('/'), primary: false },
            { label: 'Kontakt oss', action: () => window.location.href = 'mailto:jenny.karl.bryllup@email.com', primary: false }
          ]
        };
      
      case 'network_error':
        return {
          title: 'Tilkoblingsproblem',
          message: 'Vi har problemer med å koble til våre servere. Vennligst sjekk internettforbindelsen din og prøv igjen.',
          icon: (
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
          ),
          actions: [
            { label: 'Prøv på nytt', action: () => router.back(), primary: true },
            { label: 'Gå hjem', action: () => router.push('/'), primary: false }
          ]
        };
      
      case 'duplicate_submission':
        return {
          title: 'RSVP allerede sendt inn',
          message: 'En RSVP har allerede blitt sendt inn for denne invitasjonskoden. Hvis du trenger å gjøre endringer, vennligst kontakt oss.',
          icon: (
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          actions: [
            { label: 'Kontakt oss', action: () => window.location.href = 'mailto:jenny.karl.bryllup@email.com', primary: true },
            { label: 'Gå hjem', action: () => router.push('/'), primary: false }
          ]
        };
      
      default:
        return {
          title: 'Noe gikk galt',
          message: errorMessage || 'En uventet feil oppstod. Vennligst prøv igjen eller kontakt oss for hjelp.',
          icon: (
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          actions: [
            { label: 'Prøv igjen', action: () => router.back(), primary: true },
            { label: 'Gå hjem', action: () => router.push('/'), primary: false },
            { label: 'Kontakt oss', action: () => window.location.href = 'mailto:jenny.karl.bryllup@email.com', primary: false }
          ]
        };
    }
  };

  const errorContent = getErrorContent();

  return (
    <Card className="max-w-md mx-auto p-4 sm:p-6 lg:p-8 text-center mx-4 sm:mx-auto">
      {/* Error Icon */}
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
        {errorContent.icon}
      </div>

      {/* Error Title */}
      <h1 className="text-xl sm:text-2xl font-serif text-gray-800 dark:text-white mb-3 sm:mb-4 leading-tight">
        {errorContent.title}
      </h1>

      {/* Error Message */}
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 leading-relaxed">
        {errorContent.message}
      </p>

      {/* Action Buttons */}
      <div className="space-y-2 sm:space-y-3">
        {errorContent.actions.map((action, index) => (
          <Button
            key={index}
            onClick={action.action}
            variant={action.primary ? 'primary' : 'outline'}
            className="w-full"
            size="md"
          >
            {action.label}
          </Button>
        ))}
      </div>

      {/* Additional Help */}
      <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-800">
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">Need help?</p>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
          Send en epost til{' '}
          <a 
            href="mailto:jenny.karl.bryllup@email.com" 
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline break-all"
          >
            jenny.karl.bryllup@email.com
          </a>
        </p>
      </div>
    </Card>
  );
}

function ErrorPageFallback() {
  return (
    <Card className="max-w-md mx-auto p-4 sm:p-6 lg:p-8 text-center mx-4 sm:mx-auto">
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 className="text-xl sm:text-2xl font-serif text-gray-800 dark:text-white mb-3 sm:mb-4 leading-tight">Noe gikk galt</h1>
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 sm:mb-8">En ukjent feil oppstod. Vennligst prøv igjen</p>
      <Button onClick={() => window.location.href = '/'} className="w-full">
        Hjem
      </Button>
    </Card>
  );
}

export default function ErrorPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-900 flex items-center justify-center py-6 sm:py-8 lg:py-12 px-4">
        <Suspense fallback={<ErrorPageFallback />}>
          <ErrorContent />
        </Suspense>
      </div>
    </MainLayout>
  );
}