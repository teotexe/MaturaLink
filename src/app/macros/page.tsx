"use client";

import { useEffect, useState } from "react";
import { MacroargumentForm } from "@/src/components/MacroargumentForm";

type Macroargument = {
  id: number;
  name: string;
};

export default function EditMacroPage() {
  const [macros, setMacros] = useState<Macroargument[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    fetch("/api/macroarguments")
      .then((res) => res.json())
      .then(setMacros);
  }, []);

  const handleEdit = async (id: number) => {
    const res = await fetch(`/api/macroarguments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    if (res.ok) {
      const updated = await res.json();
      setMacros((prev) =>
        prev.map((m) => (m.id === id ? { ...m, name: updated.name } : m))
      );
      setEditingId(null);
      setNewName("");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Sei sicuro di voler eliminare questo macroargomento?"))
      return;
    const res = await fetch(`/api/macroarguments/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setMacros((prev) => prev.filter((m) => m.id !== id));
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Modifica Macroargomenti</h1>
      <ul className="space-y-4">
        {macros.map((macro) => (
          <li
            key={macro.id}
            className="flex items-center justify-between gap-4"
          >
            {editingId === macro.id ? (
              <>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="input input-bordered flex-grow max-w-xs"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(macro.id)}
                    className="btn btn-success"
                  >
                    Salva
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setNewName("");
                    }}
                    className="btn"
                  >
                    Annulla
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="font-medium">{macro.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(macro.id);
                      setNewName(macro.name);
                    }}
                    className="btn btn-outline"
                  >
                    Modifica
                  </button>
                  <button
                    onClick={() => handleDelete(macro.id)}
                    className="btn btn-error"
                  >
                    Elimina
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      <MacroargumentForm
        onAdd={(macro) => setMacros((prev) => [...prev, macro])}
      />
    </div>
  );
}
