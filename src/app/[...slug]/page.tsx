import { notFound } from "next/navigation";
import { Construction } from "lucide-react";
import { flatNavItems } from "@/lib/nav";

export default async function PlaceholderPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const href = `/${slug.join("/")}`;
  const item = flatNavItems.find((navItem) => navItem.href === href);

  if (!item) {
    notFound();
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="flex max-w-md flex-col items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-10 py-12 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--pink-100)] text-[var(--pink-600)]">
          <Construction size={26} />
        </div>
        <h1 className="text-lg font-semibold text-[var(--foreground)]">{item.label}</h1>
        {item.description && (
          <p className="text-sm text-[var(--muted)]">{item.description}</p>
        )}
        <p className="mt-2 rounded-full bg-[var(--pink-50)] px-4 py-1.5 text-xs font-semibold text-[var(--pink-600)]">
          Modul în construcție — urmează în etapa următoare
        </p>
      </div>
    </div>
  );
}
