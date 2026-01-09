import React from 'react';

export function Footer() {
  return (
    <footer className="bg-rose-900 text-rose-100 py-8 mt-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center space-y-4">
          <div>
            <h3 className="text-xl font-serif mb-2">Questions?</h3>
            <p className="text-rose-200">
              Contact us at{' '}
              <a 
                href="mailto:sarah.michael.wedding@example.com" 
                className="text-rose-300 hover:text-white transition-colors underline"
              >
                sarah.michael.wedding@example.com
              </a>
            </p>
            <p className="text-rose-200 mt-1">
              Or call Sarah at{' '}
              <a 
                href="tel:+1234567890" 
                className="text-rose-300 hover:text-white transition-colors"
              >
                (123) 456-7890
              </a>
            </p>
          </div>
          <div className="border-t border-rose-800 pt-4">
            <p className="text-sm text-rose-300">
              We can't wait to celebrate with you! 💕
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}