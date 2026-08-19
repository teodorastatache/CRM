"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { navGroups } from "@/lib/nav";

export function Sidebar() {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const group of navGroups) {
      if (group.items.some((item) => pathname === item.href)) {
        initial[group.title] = true;
      }
    }
    return initial;
  });

  function toggleGroup(title: string) {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  }

  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--pink-400)] to-[var(--pink-600)] text-white shadow-sm">
          <Sparkles size={20} />
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--foreground)]">Infiniteea</p>
          <p className="text-xs text-[var(--muted)]">E-commerce Command Center</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navGroups.map((group) => {
          const Icon = group.icon;
          const isRootLink = Boolean(group.href) && group.items.length === 0;
          const isActiveRoot = isRootLink && pathname === group.href;
          const isOpen = openGroups[group.title] ?? false;
          const hasActiveChild = group.items.some((item) => pathname === item.href);

          if (isRootLink) {
            return (
              <Link
                key={group.title}
                href={group.href!}
                className={`mb-1 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActiveRoot
                    ? "bg-gradient-to-r from-[var(--pink-500)] to-[var(--pink-600)] text-white shadow-sm"
                    : "text-[var(--foreground)] hover:bg-[var(--pink-50)]"
                }`}
              >
                <Icon size={17} />
                {group.title}
              </Link>
            );
          }

          return (
            <div key={group.title} className="mb-1">
              <button
                onClick={() => toggleGroup(group.title)}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wide transition-colors ${
                  hasActiveChild ? "text-[var(--pink-600)]" : "text-[var(--muted)] hover:text-[var(--pink-600)]"
                }`}
              >
                <Icon size={16} />
                <span className="flex-1">{group.title}</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${isOpen || hasActiveChild ? "rotate-180" : ""}`}
                />
              </button>
              {(isOpen || hasActiveChild) && (
                <div className="ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-[var(--border)] pl-3">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                          isActive
                            ? "bg-[var(--pink-100)] font-semibold text-[var(--pink-700)]"
                            : "text-[var(--foreground)] hover:bg-[var(--pink-50)]"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-[var(--border)] px-5 py-4">
        <p className="text-xs text-[var(--muted)]">Mod demonstrativ · date mock</p>
      </div>
    </aside>
  );
}
