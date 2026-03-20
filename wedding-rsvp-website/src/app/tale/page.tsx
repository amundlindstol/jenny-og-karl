"use client";

import React, { useState } from "react";
import { MainLayout } from "@/components/layout";
import { Button, Card } from "@/components/ui";
import Link from "next/link";

interface FormState {
  name: string;
  email: string;
  durationMinutes: string;
  message: string;
}

const initial: FormState = {
  name: "",
  email: "",
  durationMinutes: "",
  message: "",
};

export default function TalePage() {
  const [form, setForm] = useState<FormState>(initial);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const set =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const duration = parseInt(form.durationMinutes, 10);
    if (!form.name.trim() || isNaN(duration) || duration < 1 || duration > 7) {
      setErrorMsg("Fyll inn navn og en varighet mellom 1 og 7 minutter.");
      setStatus("error");
      return;
    }

    try {
      const res = await fetch("/api/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim() || undefined,
          durationMinutes: duration,
          message: form.message.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus("success");
        setForm(initial);
      } else {
        setErrorMsg(data.message || "Noe gikk galt.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Nettverksfeil. Prøv igjen.");
      setStatus("error");
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen flex flex-col items-center justify-start px-4 py-8">
        <div className="max-w-md w-full">
          <h1 className="font-serif text-3xl sm:text-4xl text-primary-900 text-center mb-2 gradient-text">
            Meld deg på som taler
          </h1>
          <p className="text-primary-700 text-center mb-8 leading-relaxed">
            Ønsker du å holde en tale eller et annet innslag? Fyll inn skjemaet
            nedenfor, så setter vi opp programmet.
          </p>

          {status === "success" ? (
            <Card variant="glass" className="p-8 text-center shadow-elegant-lg">
              <div className="w-14 h-14 rounded-full bg-primary-600 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-7 h-7 text-secondary-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="font-serif text-xl text-primary-900 mb-2">
                Takk!
              </h2>
              <p className="text-primary-700">
                Din tale er registrert. Vi gleder oss til å høre deg!
              </p>
              <Link
                className="mt-8 cursor-pointer inline-block bg-primary-600 hover:bg-primary-700 text-secondary-50 font-medium px-8 py-3 my-4 rounded-full shadow-elegant transition-colors"
                href={"/"}
              >
                Til forsiden
              </Link>
            </Card>
          ) : (
            <Card variant="glass" className="p-6 sm:p-8 shadow-elegant-lg">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    className="block text-sm font-medium text-primary-800 mb-1"
                    htmlFor="name"
                  >
                    Navn <span className="text-primary-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={set("name")}
                    required
                    placeholder="Ditt fulle navn"
                    className="w-full rounded-lg border border-primary-200 bg-secondary-50 px-4 py-2.5 text-primary-900 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400 transition"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-primary-800 mb-1"
                    htmlFor="email"
                  >
                    E-post
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    placeholder="din@epost.no"
                    className="w-full rounded-lg border border-primary-200 bg-secondary-50 px-4 py-2.5 text-primary-900 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400 transition"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-primary-800 mb-1"
                    htmlFor="duration"
                  >
                    Varighet (minutter){" "}
                    <span className="text-primary-500">*</span>
                  </label>
                  <input
                    id="duration"
                    type="number"
                    min={1}
                    max={7}
                    value={form.durationMinutes}
                    onChange={set("durationMinutes")}
                    required
                    placeholder="f.eks. 2"
                    className="w-full rounded-lg border border-primary-200 bg-secondary-50 px-4 py-2.5 text-primary-900 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400 transition"
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-primary-800 mb-1"
                    htmlFor="message"
                  >
                    Melding til toastmaster (valgfritt)
                  </label>
                  <textarea
                    id="message"
                    rows={3}
                    value={form.message}
                    onChange={set("message")}
                    placeholder="Noe vi bør vite?"
                    className="w-full rounded-lg border border-primary-200 bg-secondary-50 px-4 py-2.5 text-primary-900 placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400 transition resize-none"
                  />
                </div>

                {status === "error" && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                    {errorMsg}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? "Sender..." : "Registrer tale"}
                </Button>
              </form>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
