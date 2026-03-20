import React from "react";

export function PrePartySignup() {
  const [input, setInput] = React.useState("");
  const [status, setStatus] = React.useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = React.useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const names = input
      .split("\n")
      .map((n) => n.trim())
      .filter(Boolean);
    if (names.length === 0) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/pre-party", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(
          `Takk! ${names.length === 1 ? names[0] : names.length + " personer"} er påmeldt.`,
        );
        setInput("");
      } else {
        setStatus("error");
        setMessage(data.message || "Noe gikk galt. Prøv igjen.");
      }
    } catch {
      setStatus("error");
      setMessage("Noe gikk galt. Prøv igjen.");
    }
  }

  if (status === "success") {
    return (
      <p className="text-primary-700 text-sm mt-4 text-center">{message} 🎉</p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 text-left">
      <label className="block text-sm text-primary-700 mb-1 font-medium">
        <p className={"font-bold"}>Hvem kommer?</p> Skriv ett navn per linje
        slik at vi vet omtrent hvor mange som møter opp.
      </label>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={3}
        placeholder={"Ola Nordmann\nKari Nordmann"}
        className="w-full rounded-lg border border-primary-200 bg-white/70 px-3 py-2 text-sm text-primary-900 placeholder:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
        disabled={status === "loading"}
      />
      {status === "error" && (
        <p className="text-red-600 text-xs mt-1">{message}</p>
      )}
      <button
        type="submit"
        disabled={status === "loading" || !input.trim()}
        className="mt-2 w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-secondary-50 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        {status === "loading" ? "Sender..." : "Meld på"}
      </button>
    </form>
  );
}
