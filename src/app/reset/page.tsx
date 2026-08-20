import { ResetForm } from "./reset-form";

export default function ResetPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-6">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
        <h1 className="text-xl font-extrabold text-[var(--foreground)]">
          Resetare parolă admin
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Ai nevoie de codul de resetare (setat ca variabilă de mediu în Vercel,
          nu de parola veche).
        </p>
        <ResetForm />
      </div>
    </div>
  );
}
