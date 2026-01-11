"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout";
import { InvitationCodeForm } from "@/components/forms";
import { FormErrorBoundary } from "@/components/error";
import { Button, Card, useToast } from "@/components/ui";
import type { GuestEntry } from "@/types";

export default function Home() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [existingRSVP, setExistingRSVP] = useState<string | null>();
  const { showSuccess, showError } = useToast();

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
    setExistingRSVP(localStorage.getItem("guestEntry"));
  }, []);

  const handleValidCode = (guestEntry: GuestEntry) => {
    // Store guest data in localStorage for the RSVP page
    localStorage.setItem("guestEntry", JSON.stringify(guestEntry));
    if (mounted) {
      showSuccess("Invitation code validated successfully!");
    }
    router.push("/rsvp");
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    if (mounted) {
      showError(errorMessage);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-linear-to-br from-primary-50 via-secondary-50 to-primary-100 dark:from-primary-950 dark:via-secondary-900 dark:to-primary-950">
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 lg:py-20 px-4 text-center overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-32 h-32 bg-primary-300 dark:bg-primary-700 rounded-full blur-3xl animate-pulse"></div>
            <div
              className="absolute bottom-20 right-10 w-40 h-40 bg-secondary-300 dark:bg-secondary-700 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>

          <div className="max-w-4xl mx-auto relative z-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-gray-800 mb-4 sm:mb-6 leading-tight animate-fade-in gradient-text">
              Jenny & Karl
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-6 sm:mb-8 font-light px-4 sm:px-0 animate-slide-in-up">
              Sammen med våre familier inviterer vi deg til å feire vårt bryllup
            </p>

            {/* Wedding Date & Venue */}
            <div className="glass rounded-2xl p-4 sm:p-6 lg:p-8 mb-8 sm:mb-12 shadow-xl mx-4 sm:mx-0 animate-scale-in hover-lift">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                <div className="text-center sm:text-left">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 font-serif">
                    Dato & Tid
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Lørdag, 15. juni 2024
                    <br />
                    16:00 Vielse
                    <br />
                    18:00 Bryllupsfest
                  </p>
                </div>
                <div className="text-center sm:text-left border-t sm:border-t-0 sm:border-l border-gray-200 pt-4 sm:pt-0 sm:pl-4 lg:pl-8">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 font-serif">
                    Lokale
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Vakre Bryllupslokaler
                    <br />
                    Bryllupsgata 123
                    <br />
                    Oslo, Norge 0123
                  </p>
                </div>
              </div>
            </div>

            {/* RSVP Section */}
            <Card
              variant="glass"
              className="max-w-md mx-auto p-4 sm:p-6 lg:p-8 mx-4 sm:mx-auto hover-lift"
            >
              <h2 className="text-xl sm:text-2xl font-serif text-gray-800 mb-4 sm:mb-6 gradient-text">
                RSVP
              </h2>
              {existingRSVP ? (
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  onClick={() => router.push("/rsvp")}
                >
                  Endre ditt svar
                </Button>
              ) : (
                <>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                    Vennligst skriv inn din invitasjonskode for å svare på
                    bryllupsinvitasjonen vår.
                  </p>
                  <FormErrorBoundary onReset={() => setError("")}>
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
                </>
              )}
            </Card>
          </div>
        </section>

        {/* Event Schedule */}
        <section className="py-12 sm:py-16 px-4 bg-white/30 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-serif text-gray-800 text-center mb-8 sm:mb-12 gradient-text animate-fade-in">
              Program for dagen
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <Card
                variant="glass"
                className="p-4 sm:p-6 text-center hover-lift animate-fade-in"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">15:30</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-2 font-serif">
                  Gjesteankomst
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  Vennligst kom tidlig for å finne plass og nyte musikk før
                  vielsen
                </p>
              </Card>
              <Card
                variant="glass"
                className="p-4 sm:p-6 text-center hover-lift animate-fade-in"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">16:00</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-2 font-serif">
                  Vielse
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  Bli med oss når vi utveksler løfter i de vakre hageomgivelsene
                </p>
              </Card>
              <Card
                variant="glass"
                className="p-4 sm:p-6 text-center hover-lift animate-fade-in sm:col-span-2 lg:col-span-1"
                style={{ animationDelay: "0.4s" }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">18:00</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-2 font-serif">
                  Bryllupsfest
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  Middag, dans og feiring i hovedsalen
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Venue Information & Directions */}
        <section className="py-12 sm:py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-serif text-gray-800 text-center mb-8 sm:mb-12 gradient-text animate-fade-in">
              Lokale & Veibeskrivelse
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
              <Card
                variant="glass"
                className="p-4 sm:p-6 lg:p-8 hover-lift animate-fade-in"
              >
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white font-serif">
                    Hvordan komme seg dit
                  </h3>
                </div>
                <div className="space-y-3 sm:space-y-4 text-gray-600 dark:text-gray-300">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">
                      Adresse:
                    </p>
                    <p className="text-sm sm:text-base">
                      Vakre Bryllupslokaler
                      <br />
                      Bryllupsgata 123
                      <br />
                      Oslo, Norge 0123
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">
                      Parkering:
                    </p>
                    <p className="text-sm sm:text-base">
                      Gratis valet-parkering tilgjengelig på stedet
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">
                      Transport:
                    </p>
                    <p className="text-sm sm:text-base">
                      Shuttleservice tilgjengelig fra hoteller i sentrum
                    </p>
                  </div>
                </div>
              </Card>

              <Card
                variant="glass"
                className="p-4 sm:p-6 lg:p-8 hover-lift animate-fade-in"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white font-serif">
                    Overnatting
                  </h3>
                </div>
                <div className="space-y-3 sm:space-y-4 text-gray-600 dark:text-gray-300">
                  <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                    <p className="font-medium text-gray-800 dark:text-gray-100">
                      Grand Hotel Sentrum
                    </p>
                    <p className="text-sm">Hovedgata 456 • 22 12 34 56</p>
                    <p className="text-sm">
                      Gruppepris tilgjengelig med kode: JENNY2024
                    </p>
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                    <p className="font-medium text-gray-800 dark:text-gray-100">
                      Garden Inn & Suites
                    </p>
                    <p className="text-sm">Parkveien 789 • 22 98 76 54</p>
                    <p className="text-sm">Gratis frokost inkludert</p>
                  </div>
                  <p className="text-sm italic text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/50 p-2 rounded animate-pulse">
                    Vennligst book innen 15. mai for gruppepriser
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
              Tilleggsinformasjon
            </h2>
            <div className="space-y-4 sm:space-y-6 text-gray-600 dark:text-gray-300 text-left sm:text-center">
              <Card
                variant="glass"
                className="p-4 sm:p-6 hover-lift animate-fade-in"
              >
                <div className="flex items-start sm:items-center sm:justify-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div className="text-left sm:text-center">
                    <p className="text-sm sm:text-base">
                      <span className="font-semibold text-gray-800 dark:text-gray-100">
                        Klesskode:
                      </span>{" "}
                      Cocktailantrekk. Vi foreslår elegant hagefest-stil - tenk
                      luftige kjoler og lette dresser i myke farger.
                    </p>
                  </div>
                </div>
              </Card>

              <Card
                variant="glass"
                className="p-4 sm:p-6 hover-lift animate-fade-in"
                style={{ animationDelay: "0.1s" }}
              >
                <div className="flex items-start sm:items-center sm:justify-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                      />
                    </svg>
                  </div>
                  <div className="text-left sm:text-center">
                    <p className="text-sm sm:text-base">
                      <span className="font-semibold text-gray-800 dark:text-gray-100">
                        Vær:
                      </span>{" "}
                      Vielsen vår vil være utendørs med en innendørs
                      reserveplan. Bryllupsfesten er innendørs med klimaanlegg.
                    </p>
                  </div>
                </div>
              </Card>

              <Card
                variant="glass"
                className="p-4 sm:p-6 hover-lift animate-fade-in"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="flex items-start sm:items-center sm:justify-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                      />
                    </svg>
                  </div>
                  <div className="text-left sm:text-center">
                    <p className="text-sm sm:text-base">
                      <span className="font-semibold text-gray-800 dark:text-gray-100">
                        Ønskeliste:
                      </span>{" "}
                      Din tilstedeværelse er den eneste gaven vi trenger! Hvis
                      du ønsker å gi en gave, har vi ønskelister hos Elkjøp og
                      Jernia.
                    </p>
                  </div>
                </div>
              </Card>

              <Card
                variant="glass"
                className="p-4 sm:p-6 hover-lift animate-fade-in"
                style={{ animationDelay: "0.3s" }}
              >
                <div className="flex items-start sm:items-center sm:justify-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="text-left sm:text-center">
                    <p className="text-sm sm:text-base">
                      <span className="font-semibold text-gray-800 dark:text-gray-100">
                        Spørsmål?
                      </span>{" "}
                      Vennligst kontakt oss på{" "}
                      <a
                        href="mailto:jenny.karl.bryllup@email.com"
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline break-all transition-colors"
                      >
                        jenny.karl.bryllup@email.com
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
