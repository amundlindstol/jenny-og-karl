'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MainLayout } from '@/components/layout';
import { Card, Button } from '@/components/ui';

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
          title: 'Invalid Invitation Code',
          message: 'The invitation code you entered is not valid. Please check your wedding invitation and try again.',
          icon: (
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          actions: [
            { label: 'Try Again', action: () => router.push('/'), primary: true },
            { label: 'Contact Us', action: () => window.location.href = 'mailto:sarah.michael.wedding@email.com', primary: false }
          ]
        };
      
      case 'submission_failed':
        return {
          title: 'RSVP Submission Failed',
          message: 'We were unable to save your RSVP response. Please try submitting again.',
          icon: (
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          actions: [
            { label: 'Try Again', action: () => router.back(), primary: true },
            { label: 'Start Over', action: () => router.push('/'), primary: false },
            { label: 'Contact Us', action: () => window.location.href = 'mailto:sarah.michael.wedding@email.com', primary: false }
          ]
        };
      
      case 'network_error':
        return {
          title: 'Connection Problem',
          message: 'We\'re having trouble connecting to our servers. Please check your internet connection and try again.',
          icon: (
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
          ),
          actions: [
            { label: 'Retry', action: () => router.back(), primary: true },
            { label: 'Go Home', action: () => router.push('/'), primary: false }
          ]
        };
      
      case 'duplicate_submission':
        return {
          title: 'RSVP Already Submitted',
          message: 'An RSVP has already been submitted for this invitation code. If you need to make changes, please contact us.',
          icon: (
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          actions: [
            { label: 'Contact Us', action: () => window.location.href = 'mailto:sarah.michael.wedding@email.com', primary: true },
            { label: 'Go Home', action: () => router.push('/'), primary: false }
          ]
        };
      
      default:
        return {
          title: 'Something Went Wrong',
          message: errorMessage || 'An unexpected error occurred. Please try again or contact us for assistance.',
          icon: (
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          actions: [
            { label: 'Try Again', action: () => router.back(), primary: true },
            { label: 'Go Home', action: () => router.push('/'), primary: false },
            { label: 'Contact Us', action: () => window.location.href = 'mailto:sarah.michael.wedding@email.com', primary: false }
          ]
        };
    }
  };

  const errorContent = getErrorContent();

  return (
    <Card className="max-w-md mx-auto p-8 text-center">
      {/* Error Icon */}
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        {errorContent.icon}
      </div>

      {/* Error Title */}
      <h1 className="text-2xl font-serif text-gray-800 mb-4">
        {errorContent.title}
      </h1>

      {/* Error Message */}
      <p className="text-gray-600 mb-8 leading-relaxed">
        {errorContent.message}
      </p>

      {/* Action Buttons */}
      <div className="space-y-3">
        {errorContent.actions.map((action, index) => (
          <Button
            key={index}
            onClick={action.action}
            variant={action.primary ? 'primary' : 'outline'}
            className="w-full"
          >
            {action.label}
          </Button>
        ))}
      </div>

      {/* Additional Help */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500 mb-2">Need help?</p>
        <p className="text-sm text-gray-600">
          Email us at{' '}
          <a 
            href="mailto:sarah.michael.wedding@email.com" 
            className="text-rose-600 hover:text-rose-700 underline"
          >
            sarah.michael.wedding@email.com
          </a>
        </p>
      </div>
    </Card>
  );
}

function ErrorPageFallback() {
  return (
    <Card className="max-w-md mx-auto p-8 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 className="text-2xl font-serif text-gray-800 mb-4">Something Went Wrong</h1>
      <p className="text-gray-600 mb-8">An unexpected error occurred. Please try again.</p>
      <Button onClick={() => window.location.href = '/'} className="w-full">
        Go Home
      </Button>
    </Card>
  );
}

export default function ErrorPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center py-12 px-4">
        <Suspense fallback={<ErrorPageFallback />}>
          <ErrorContent />
        </Suspense>
      </div>
    </MainLayout>
  );
}