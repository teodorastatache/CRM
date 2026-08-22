"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--foreground)]">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Închide"
            className="rounded-lg p-1 text-[var(--muted)] hover:bg-[var(--beige-100)] hover:text-[var(--foreground)]"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
