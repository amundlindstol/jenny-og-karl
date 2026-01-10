import React from 'react';

export function Footer() {
  return (
    <footer className="bg-primary-950 text-primary-50 py-6 sm:py-8 mt-12 sm:mt-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center space-y-3 sm:space-y-4">
          <div>
            <h3 className="text-lg sm:text-xl font-serif mb-2">Spørsmål?</h3>
            <div className="space-y-2">
              <p className="text-primary-200 text-sm sm:text-base">
                Kontakt oss på{' '}
                <a 
                  href="mailto:jenny.karl.bryllup@example.com" 
                  className="text-primary-300 hover:text-white transition-colors underline break-all"
                >
                  jenny.karl.bryllup@example.com
                </a>
              </p>
              <p className="text-primary-200 text-sm sm:text-base">
                Eller ring Jenny på{' '}
                <a 
                  href="tel:+4712345678" 
                  className="text-primary-300 hover:text-white transition-colors"
                >
                  +47 12 34 56 78
                </a>
              </p>
            </div>
          </div>
          <div className="border-t border-primary-900 pt-3 sm:pt-4">
            <p className="text-sm text-primary-300">
              Vi gleder oss til å feire med dere! 💕
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}