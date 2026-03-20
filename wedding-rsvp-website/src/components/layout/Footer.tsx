import React from "react";
import { text } from "@/lib/strings";

export function Footer() {
  return (
    <footer className="bg-primary-950 text-primary-50 py-6 sm:py-8 mt-12 sm:mt-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center space-y-3 sm:space-y-4">
          <div>
            <h3 className="text-lg sm:text-xl font-serif mb-2">Spørsmål?</h3>
            <div className="space-y-2">
              <p className="text-primary-200 text-sm sm:text-base">
                Kontakt Jenny på{" "}
                <a
                  href={`mailto:${text.contactEmail}`}
                  className="text-primary-300 hover:text-white transition-colors underline break-all"
                >
                  {text.contactEmail}
                </a>
              </p>
              <p className="text-primary-200 text-sm sm:text-base">
                Eller tlf:{" "}
                <a
                  href={`tel:${text.contactPhone}`}
                  className="text-primary-300 hover:text-white transition-colors underline"
                >
                  {text.contactPhone}
                </a>
              </p>
            </div>
            <h4 className={"font-serif mb-2 mt-4"}>Toastmastere</h4>
            <div className={"space-y-2"}>
              <p className="text-primary-200 text-sm sm:text-base">
                Amund Lindstøl{" "}
                <a
                  href={`mailto:${text.contactEmailToastmaster}`}
                  className="text-primary-300 hover:text-white transition-colors underline"
                >
                  {text.contactEmailToastmaster}
                </a>
              </p>
              <p className="text-primary-200 text-sm sm:text-base">
                Mads Pastrana{" "}
                <a
                  href={`tel:${text.contactPhoneToastmaster}`}
                  className="text-primary-300 hover:text-white transition-colors underline"
                >
                  {text.contactPhoneToastmaster}
                </a>
              </p>
            </div>
          </div>
          <div className="border-t border-primary-900 pt-3 sm:pt-4">
            <p className="text-sm text-primary-300">
              Vi gleder oss til å feire med dere! 💚
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
