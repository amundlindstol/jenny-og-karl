"use client";

import React from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import { Button, Card } from "@/components/ui";

interface FormErrorBoundaryProps {
  children: React.ReactNode;
  onReset?: () => void;
}

export function FormErrorBoundary({
  children,
  onReset,
}: FormErrorBoundaryProps) {
  const handleFormError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log form-specific error details
    console.error("Form error occurred:", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  };

  const renderFormErrorFallback = (
    error: Error,
    errorInfo: React.ErrorInfo,
    retry: () => void,
  ) => (
    <Card className="p-6 text-center border-red-200 bg-red-50">
      {/* Error Icon */}
      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-5 h-5 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>

      {/* Error Title */}
      <h3 className="text-base font-serif text-gray-800 mb-2">Form Error</h3>

      {/* Error Message */}
      <p className="text-gray-600 mb-4 text-sm">
        Det var et problem med skjemaet. Vennligst prøv igjen eller oppdater
        siden.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <Button onClick={retry} variant="outline" size="sm">
          Prøv igjen
        </Button>
        {onReset && (
          <Button onClick={onReset} variant="ghost" size="sm">
            Tilbakestill skjema
          </Button>
        )}
      </div>
    </Card>
  );

  return (
    <ErrorBoundary fallback={renderFormErrorFallback} onError={handleFormError}>
      {children}
    </ErrorBoundary>
  );
}
