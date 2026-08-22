"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";

export type ComenziFieldDef = {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select";
  options?: readonly string[];
};

type Row = { id: string } & Record<string, unknown>;
type ModalState<T> = { mode: "create" } | { mode: "edit"; row: T } | null;

export function EditableComenziTable<T extends Row>({
  apiBase,
  rows,
  onRowsChange,
  columns,
  fields,
  searchable,
  searchPlaceholder,
  addLabel,
  emptyLabel,
}: {
  apiBase: string;
  rows: T[];
  onRowsChange: (updater: (rows: T[]) => T[]) => void;
  columns: Column<T>[];
  fields: ComenziFieldDef[];
  searchable?: (row: T, q: string) => boolean;
  searchPlaceholder?: string;
  addLabel: string;
  emptyLabel?: string;
}) {
  const [modal, setModal] = useState<ModalState<T>>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openCreate() {
    const initial: Record<string, string> = {};
    for (const f of fields) initial[f.key] = f.type === "select" ? (f.options?.[0] ?? "") : "";
    setValues(initial);
    setError(null);
    setModal({ mode: "create" });
  }

  function openEdit(row: T) {
    const initial: Record<string, string> = {};
    for (const f of fields) initial[f.key] = String(row[f.key] ?? "");
    setValues(initial);
    setError(null);
    setModal({ mode: "edit", row });
  }

  function closeModal() {
    setModal(null);
  }

  async function handleDelete(row: T) {
    if (!confirm(`Ștergi comanda ${row.id}?`)) return;
    const res = await fetch(`${apiBase}/${row.id}`, { method: "DELETE" });
    if (res.ok) {
      onRowsChange((r) => r.filter((x) => x.id !== row.id));
    }
  }

  async function handleSubmit() {
    if (!modal) return;
    setSaving(true);
    setError(null);
    const isCreate = modal.mode === "create";
    const url = isCreate ? apiBase : `${apiBase}/${modal.row.id}`;
    const method = isCreate ? "POST" : "PATCH";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "A apărut o eroare.");
        return;
      }
      const saved: T = await res.json();
      onRowsChange((r) => (isCreate ? [...r, saved] : r.map((x) => (x.id === saved.id ? saved : x))));
      setModal(null);
    } finally {
      setSaving(false);
    }
  }

  const tableColumns: Column<T>[] = [
    ...columns,
    {
      key: "__actions",
      label: "",
      align: "right",
      className: "!px-2 whitespace-nowrap",
      render: (row) => (
        <div className="flex justify-end gap-0.5">
          <button
            onClick={() => openEdit(row)}
            aria-label="Editează"
            className="rounded-lg p-1 text-[var(--muted)] hover:bg-[var(--beige-100)] hover:text-[var(--pink-600)]"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => handleDelete(row)}
            aria-label="Șterge"
            className="rounded-lg p-1 text-[var(--muted)] hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--pink-600)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--pink-700)]"
        >
          <Plus size={15} />
          {addLabel}
        </button>
      </div>
      <DataTable
        columns={tableColumns}
        rows={rows}
        getRowKey={(row) => row.id}
        searchable={searchable}
        searchPlaceholder={searchPlaceholder}
        emptyLabel={emptyLabel}
      />
      {modal && (
        <Modal
          title={modal.mode === "create" ? "Comandă nouă" : `Editează ${modal.row.id}`}
          onClose={closeModal}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="flex flex-col gap-3"
          >
            {fields.map((f) => (
              <label key={f.key} className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-[var(--foreground)]">{f.label}</span>
                {f.type === "select" ? (
                  <select
                    value={values[f.key] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                    className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  >
                    {f.options?.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                    value={values[f.key] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                    className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  />
                )}
              </label>
            ))}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--beige-100)]"
              >
                Anulează
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[var(--pink-600)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--pink-700)] disabled:opacity-60"
              >
                {saving ? "Se salvează..." : "Salvează"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
