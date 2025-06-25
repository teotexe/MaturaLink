"use client";
import { useState } from "react";

type MacroargumentFormProps = {
  onAdd: (newMacro: { id: number; name: string }) => void;
};

export function MacroargumentForm({ onAdd }: MacroargumentFormProps) {
  const [newMacroName, setNewMacroName] = useState("");

  const handleAddMacro = async () => {
    if (!newMacroName.trim()) return;

    const res = await fetch("/api/macroarguments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newMacroName }),
    });

    if (!res.ok) {
      alert("Errore nella creazione del macroargomento");
      return;
    }

    const macro = await res.json();
    onAdd(macro);
    setNewMacroName("");
  };

  return (
    <section className="card bg-base-100 shadow-md p-6 max-w-md mx-auto">
      <h2 className="card-title text-2xl mb-4">Add New Macroargument</h2>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="New Macroargument Name"
          className="input input-bordered flex-grow"
          value={newMacroName}
          onChange={(e) => setNewMacroName(e.target.value)}
        />
        <button
          type="button"
          onClick={handleAddMacro}
          className="btn btn-secondary"
        >
          Add Macro
        </button>
      </div>
    </section>
  );
}
