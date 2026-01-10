"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout";
import { RSVPForm } from "@/components/forms";
import { Button, Card } from "@/components/ui";
import type { GuestEntry, RSVPFormData } from "@/types";

export default function RSVPPage() {
  const router = useRouter();
  const [guestEntry, setGuestEntry] = useState<GuestEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get guest data from sessionStorage
    const storedGuestEntry = sessionStorage.getItem("guestEntry");
    if (storedGuestEntry) {
      try {
        const parsedGuestEntry = JSON.parse(storedGuestEntry);
        setGuestEntry(parsedGuestEntry);
      } catch (error) {
        console.error("Error parsing guest entry:", error);
        router.push("/");
      }
    } else {
      // No guest data found, redirect to homepage
      router.push("/");
    }
    setIsLoading(false);
  }, [router]);

  const handleRSVPSubmit = async (formData: RSVPFormData) => {
    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit RSVP");
      }

      // Store RSVP data for confirmation page
      sessionStorage.setItem("rsvpSubmission", JSON.stringify(formData));

      // Update the stored guestEntry with the new data to ensure consistency
      const storedGuestEntry = sessionStorage.getItem("guestEntry");
      if (storedGuestEntry) {
        try {
          const guestEntry = JSON.parse(storedGuestEntry) as GuestEntry;
          const updatedGuestEntry: GuestEntry = {
            ...guestEntry,
            guestStatuses: formData.guests.map((g) =>
              g.attending ? "attending" : "not_attending",
            ),
            rsvpStatus: formData.guests.some((g) => g.attending)
              ? "attending"
              : "not_attending",
            dietaryRestrictions: formData.guests
              .filter((g) => g.attending && g.dietaryRestrictions)
              .map((g) => `${g.name}: ${g.dietaryRestrictions}`),
            personalMessage: formData.personalMessage,
            email: formData.contactEmail,
            submissionDate: new Date().toISOString(),
          };
          sessionStorage.setItem(
            "guestEntry",
            JSON.stringify(updatedGuestEntry),
          );
        } catch (e) {
          console.error("Error updating guestEntry in sessionStorage:", e);
        }
      }

      router.push("/confirmation");
    } catch (error) {
      console.error("RSVP submission error:", error);
      // The RSVPForm component will handle displaying the error
      throw error;
    }
  };

  const handleStartOver = () => {
    sessionStorage.removeItem("guestEntry");
    router.push("/");
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Laster inn RSVP-skjemaet ditt...
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!guestEntry) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-900 flex items-center justify-center">
          <Card className="max-w-md mx-auto p-8 text-center">
            <h1 className="text-2xl font-serif text-gray-800 dark:text-white mb-4">
              RSVP-tilgang kreves
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Vennligst skriv inn din invitasjonskode for å få tilgang til
              RSVP-skjemaet.
            </p>
            <Button onClick={() => router.push("/")} className="w-full">
              Skriv inn invitasjonskode
            </Button>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-900 py-6 sm:py-8 lg:py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-gray-800 dark:text-white mb-2 sm:mb-4 leading-tight">
              RSVP for Jenny & Karls bryllup
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Lørdag, 15. juni 2024 • Vakre Bryllupslokaler
            </p>
          </div>

          {/* Guest Information */}
          <Card className="p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex-1">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  Invitasjon til:
                </h2>
                <div className="space-y-1">
                  {guestEntry.guestNames.map((name, index) => (
                    <p
                      key={index}
                      className="text-sm sm:text-base text-gray-700 dark:text-gray-300"
                    >
                      {name}
                    </p>
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Kode: {guestEntry.invitationCode}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartOver}
                className="text-xs sm:text-sm w-full sm:w-auto"
              >
                Start på nytt og bruk annen kode
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/")}
                className="text-xs sm:text-sm w-full sm:w-auto"
              >
                Hjem
              </Button>
            </div>
          </Card>

          {/* RSVP Form */}
          <RSVPForm guestEntry={guestEntry} onSubmit={handleRSVPSubmit} />
        </div>
      </div>
    </MainLayout>
  );
}
