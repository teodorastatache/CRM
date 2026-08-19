"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Email sau parolă incorectă.");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
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
          Parolă
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
        {loading ? "Se conectează..." : "Autentificare"}
      </button>
    </form>
  );
}
