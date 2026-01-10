import Link from 'next/link';
import {MainLayout} from '@/components/layout';
import {Button, Card} from '@/components/ui';

export default function NotFound() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-900 flex items-center justify-center py-12 px-4">
        <Card className="max-w-md mx-auto p-8 text-center">
          {/* 404 Icon */}
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
            </svg>
          </div>

          {/* Error Title */}
          <h1 className="text-2xl font-serif text-gray-800 dark:text-white mb-4">
            Page Not Found
          </h1>

          {/* Error Message */}
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link href="/" className="block">
              <Button className="w-full">
                Go to Homepage
              </Button>
            </Link>
            <Link href="/rsvp" className="block">
              <Button variant="outline" className="w-full">
                Go to RSVP
              </Button>
            </Link>
          </div>

          {/* Additional Help */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Looking for something specific?</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Contact us at{' '}
              <a 
                href="mailto:sarah.michael.wedding@email.com" 
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline"
              >
                sarah.michael.wedding@email.com
              </a>
            </p>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}