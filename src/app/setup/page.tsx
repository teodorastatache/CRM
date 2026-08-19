import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SetupForm } from "./setup-form";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-6">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
        <h1 className="text-xl font-extrabold text-[var(--foreground)]">
          Configurare cont admin
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Acest formular funcționează o singură dată — creează contul de proprietar
          pentru Infiniteea CRM. După ce e creat, această pagină redirecționează
          automat spre login.
        </p>
        <SetupForm />
      </div>
    </div>
  );
}
