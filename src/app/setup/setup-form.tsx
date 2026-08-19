"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function SetupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Parolele nu coincid.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "A apărut o eroare.");
        setLoading(false);
        return;
      }
      router.push("/login");
    } catch {
      setError("Nu am putut contacta serverul. Încearcă din nou.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-xs font-semibold text-[var(--muted)]">
          Nume (opțional)
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--pink-400)]"
          placeholder="Teodora"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-[var(--muted)]">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--pink-400)]"
          placeholder="tu@infiniteea.ro"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-[var(--muted)]">
          Parolă (minim 8 caractere)
        </label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--pink-400)]"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-[var(--muted)]">
          Confirmă parola
        </label>
        <input
          type="password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--pink-400)]"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-[var(--pink-50)] px-3 py-2 text-sm font-medium text-[var(--pink-700)]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-lg bg-gradient-to-r from-[var(--pink-500)] to-[var(--pink-600)] px-4 py-2.5 text-sm font-bold text-white shadow-sm disabled:opacity-60"
      >
        {loading ? "Se creează contul..." : "Creează cont admin"}
      </button>
    </form>
  );
}
