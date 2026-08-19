import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-6">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
        <h1 className="text-xl font-extrabold text-[var(--foreground)]">
          Infiniteea CRM
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Autentifică-te pentru a continua.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
