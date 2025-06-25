"use client";
import React, { useState } from "react";

type Macroargument = { id: number; name: string };
type Subject = { id: number; name: string };
type LinkInput = {
  description: string;
  macroargumentId: string;
};

type ArgumentFormProps = {
  subjects: Subject[];
  macroarguments: Macroargument[];
  onArgumentAdded: () => void; // callback to refresh or handle after adding argument
};

export function ArgumentForm({
  subjects,
  macroarguments,
  onArgumentAdded,
}: ArgumentFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSubjectName, setSelectedSubjectName] = useState("");
  const [links, setLinks] = useState<LinkInput[]>([
    { description: "", macroargumentId: "" },
  ]);

  function handleLinkChange(
    index: number,
    field: keyof LinkInput,
    value: string | number
  ) {
    const newLinks = [...links];
    newLinks[index][field] = value.toString();
    setLinks(newLinks);
  }

  function addLink() {
    setLinks((prev) => [...prev, { description: "", macroargumentId: "" }]);
  }

  function removeLink(index: number) {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  }

  const handleAddArgument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !selectedSubjectName) return;

    // 1. Create argument
    const resArg = await fetch("/api/arguments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        subjectName: selectedSubjectName,
      }),
    });

    if (!resArg.ok) {
      alert("Errore nella creazione dell'argomento");
      return;
    }

    const newArgument = await resArg.json();

    // 2. Create links
    for (const link of links) {
      if (link.description && link.macroargumentId) {
        await fetch("/api/links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: link.description,
            argumentId: newArgument.id,
            macroargumentId: link.macroargumentId,
          }),
        });
      }
    }

    // Reset form
    setTitle("");
    setDescription("");
    setSelectedSubjectName("");
    setLinks([{ description: "", macroargumentId: "" }]);

    onArgumentAdded();
  };

  return (
    <section className="card bg-base-100 shadow-md p-6">
      <h2 className="card-title text-2xl mb-4">Add New Argument with Links</h2>
      <form onSubmit={handleAddArgument} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          className="input input-bordered w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Description"
          className="textarea textarea-bordered w-full"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <select
          className="select select-bordered w-full"
          value={selectedSubjectName}
          onChange={(e) => setSelectedSubjectName(e.target.value)}
        >
          <option value="">-- Select Subject --</option>
          {subjects
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
        </select>

        {/* Dynamic Links */}
        <div className="space-y-4 mt-4">
          <h3 className="font-semibold text-lg mb-2">Links</h3>
          {links.map((link, i) => (
            <div key={i} className="flex gap-2 items-center">
              <textarea
                placeholder="Link Description"
                className="textarea textarea-bordered w-full"
                value={link.description}
                onChange={(e) =>
                  handleLinkChange(i, "description", e.target.value)
                }
              />
              <select
                className="select select-bordered w-48"
                value={link.macroargumentId}
                onChange={(e) =>
                  handleLinkChange(i, "macroargumentId", Number(e.target.value))
                }
              >
                <option value="">-- Select Macroargument --</option>
                {macroarguments.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              {links.length > 1 && (
                <button
                  type="button"
                  className="btn btn-error btn-sm"
                  onClick={() => removeLink(i)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="btn btn-secondary btn-sm mt-2"
            onClick={addLink}
          >
            Add Link
          </button>
        </div>

        <button type="submit" className="btn btn-primary w-full mt-6">
          Add Argument + Links
        </button>
      </form>
    </section>
  );
}
