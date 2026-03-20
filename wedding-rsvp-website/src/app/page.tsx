"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { MainLayout } from "@/components/layout";
import { text } from "@/lib/strings";
import { PrePartySignup } from "@/components/forms/PrePartySignup";

const linkCls =
  "text-primary-700 hover:text-primary-900 underline underline-offset-2 transition-colors";

function StickyTaleButton() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Link
      href="/tale"
      aria-label="Registrer deg for å holde tale"
      className={[
        "fixed bottom-6 right-6 z-50 flex items-center gap-2",
        "bg-primary-600 hover:bg-primary-700 text-secondary-50 font-medium",
        "px-5 py-3 rounded-full shadow-elegant transition-all duration-300",
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none",
      ].join(" ")}
    >
      🎤 <span>Holde tale?</span>
    </Link>
  );
}

export default function Home() {
  return (
    <MainLayout>
      <StickyTaleButton />
      <div className="min-h-screen">
        {/* ── Hero ── */}
        <section className="flex flex-col items-center text-center px-4 pt-4 pb-8">
          <p className="text-sm tracking-[0.25em] uppercase text-primary-600 mb-4 font-light">
            Vi gleder oss til å feire med dere
          </p>

          <p className="text-secondary-700 text-lg sm:text-xl font-light mb-8 tracking-wide">
            {text.weddingDateShort}
          </p>

          {/* Photo */}
          <div
            className="relative w-full max-w-2xl aspect-[3/2] mb-10"
            style={{
              maskImage:
                "radial-gradient(ellipse 50% 50% at 50% 50%, black 75%, transparent 100%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 50% 50% at 50% 50%, black 75%, transparent 100%)",
            }}
          >
            <Image
              src="/jenny-og-karl.jpeg"
              alt="Jenny og Karl"
              fill
              className="object-cover"
              priority
            />
          </div>
        </section>

        {/* ── Kvelden før ── */}
        <section className="pb-10 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-serif text-2xl sm:text-3xl text-primary-900 mb-8 gradient-text">
              Kvelden før bryllupet
            </h2>
            <div className="glass rounded-xl px-6 py-4 inline-block shadow-elegant w-full max-w-md">
              <p className="font-serif text-primary-900">{text.prePartyName}</p>
              <p className="text-primary-700 mb-4 leading-relaxed">
                Fredag {text.prePartyDate} kl. {text.prePartyTime} har vi booket{" "}
                <span className="font-medium">{text.prePartyName}</span> for en
                uformell sammenkomst kvelden før. Alle er hjertelig velkomne!
              </p>
              <Link
                href={text.prePartyAddressUrl}
                target="_blank"
                rel="noreferrer noopener"
                className={`text-sm ${linkCls}`}
              >
                {text.prePartyAddress}
              </Link>
              <PrePartySignup />
            </div>
          </div>
        </section>

        {/* ── Program ── */}
        <section className="py-10 sm:py-14 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif text-2xl sm:text-3xl text-primary-900 text-center mb-8 gradient-text">
              Program for dagen
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  time: "12:30",
                  title: "Gjesteankomst",
                  desc: "Kom tidlig og finn en god plass i kirken",
                },
                {
                  time: "13:00",
                  title: "Vielse",
                  desc: (
                    <>
                      {text.churchName}
                      <Link
                        href={text.churchAddressUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className={`text-sm mt-0.5 block ${linkCls}`}
                      >
                        {text.churchAddress}
                      </Link>
                    </>
                  ),
                },
                {
                  time: "17:00",
                  title: "Middag",
                  desc: (
                    <>
                      Middag, taler og dans på bordene
                      <Link
                        href={text.addressUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className={`text-sm mt-0.5 block ${linkCls}`}
                      >
                        {text.address}
                      </Link>
                    </>
                  ),
                },
              ].map(({ time, title, desc }) => (
                <div
                  key={time}
                  className="glass rounded-xl p-5 text-center hover-lift shadow-elegant"
                >
                  <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center mx-auto mb-3">
                    <span className="text-secondary-50 text-xs font-semibold">
                      {time}
                    </span>
                  </div>
                  <h3 className="font-serif text-primary-900 text-lg mb-1">
                    {title}
                  </h3>
                  <p className="text-sm text-primary-700 leading-relaxed">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Overnatting ── */}
        <section className="py-10 sm:py-14 px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-serif text-2xl sm:text-3xl text-primary-900 text-center mb-8 gradient-text">
              Overnatting i Risør
            </h2>
            <div className="space-y-3 mb-6">
              {text.hotels.map((hotel) => (
                <div
                  key={hotel.name}
                  className="glass rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 shadow-elegant hover-lift"
                >
                  <div>
                    <p className="font-serif text-primary-900 font-medium">
                      {hotel.name}
                    </p>
                    <Link
                      href={hotel.addressUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className={`text-sm ${linkCls}`}
                    >
                      {hotel.address}
                    </Link>
                  </div>
                  <Link
                    href={`tel:${hotel.phone}`}
                    className={`text-sm whitespace-nowrap ${linkCls}`}
                  >
                    {hotel.phoneFormatted}
                  </Link>
                </div>
              ))}
              <div className="glass rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 shadow-elegant hover-lift">
                <div>
                  <p className="font-serif text-primary-900 font-medium">
                    Det finnes også mange fine alternativer på
                  </p>
                  <Link
                    href={text.airbnbUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={`text-sm ${linkCls}`}
                  >
                    Airbnb i Risør
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── GAVE-info ── */}
        <section className="pb-10 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-serif text-2xl sm:text-3xl text-primary-900 mb-3 gradient-text">
              Gave
            </h2>
            <div className="glass rounded-xl px-6 py-6 shadow-elegant">
              <p className="text-primary-700 leading-relaxed">
                Brudeparet ønsker seg en god fest og god stemning. Dersom man
                likevel ønsker å gi en gave, tar de gjerne imot et bidrag til
                bryllupsreisen.
              </p>
            </div>
          </div>
        </section>

        {/* ── TALE-knapp ── */}
        <section className="py-6 px-4 text-center">
          <h2 className="font-serif text-2xl sm:text-3xl text-primary-900 mb-3 gradient-text">
            Vil du holde tale?
          </h2>
          <Link
            href="/tale"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-secondary-50 font-medium px-8 py-3 my-4 rounded-full shadow-elegant transition-colors"
          >
            Jeg skal holde tale!
          </Link>
          <p className="text-primary-700 mb-6 max-w-sm mx-auto leading-relaxed">
            Vi har satt av tid til taler under middagen, og det hadde vært så
            hyggelig å høre noen ord fra våre kjære gjester! Hvis du ønsker å
            holde en tale eller et annet type innslag, trykk på knappen over for
            å gi våre toastmastere beskjed.
          </p>
        </section>
      </div>
    </MainLayout>
  );
}
