import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function SectionCard({
  title,
  icon: Icon,
  action,
  children,
  className = "",
}: {
  title: string;
  icon?: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm ${className}`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {Icon && (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--pink-100)] text-[var(--pink-600)]">
              <Icon size={16} />
            </span>
          )}
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--foreground)]">
            {title}
          </h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
