"use client";

import { use } from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // or useRouter from 'next/router' if Next.js <13
import { MacroargumentForm } from "@/src/components/MacroargumentForm";

type Argument = {
  id: number;
  title: string;
  description: string;
  subject: { id: number; name: string };
  links: {
    id: number;
    description: string;
    macroargument: { id: number; name: string };
    macroargumentId: number;
  }[];
};

type Subject = { id: number; name: string };
type Macroargument = { id: number; name: string };

type LinkInput = {
  tempId?: string; // new field for temporary id
  id?: number;
  description: string;
  macroargumentId: string;
  isDeleted?: boolean;
};

export default function EditArgumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const argumentId = Number(id);
  const router = useRouter();

  // Data state
  const [argument, setArgument] = useState<Argument | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [macroarguments, setMacroarguments] = useState<Macroargument[]>([]);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSubjectName, setSelectedSubjectName] = useState("");

  const [links, setLinks] = useState<LinkInput[]>([]);

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      // Fetch argument with links
      const resArg = await fetch(`/api/arguments/${argumentId}`);
      if (!resArg.ok) {
        alert("Argument not found");
        router.push("/data"); // or other fallback page
        return;
      }
      const argData: Argument = await resArg.json();

      // Fetch subjects & macroarguments
      const [resSubjects, resMacros] = await Promise.all([
        fetch("/api/subjects"),
        fetch("/api/macroarguments"),
      ]);
      const subjectsData = await resSubjects.json();
      const macroargumentsData = await resMacros.json();

      setArgument(argData);
      setSubjects(subjectsData);
      setMacroarguments(macroargumentsData);

      // Init form fields
      setTitle(argData.title);
      setDescription(argData.description);
      setSelectedSubjectName(argData.subject.name);

      setLinks(
        argData.links.map((l) => ({
          id: l.id,
          description: l.description,
          macroargumentId: l.macroargument ? l.macroargument.id.toString() : "",
        }))
      );
    }

    fetchData();
  }, [argumentId, router]);

  function handleLinkChange(
    index: number,
    field: keyof LinkInput,
    value: string
  ) {
    setLinks((prev) => {
      const newLinks = [...prev];
      newLinks[index] = { ...newLinks[index], [field]: value };
      return newLinks;
    });
  }

  function addLink() {
    setLinks((prev) => [
      ...prev,
      {
        tempId: Date.now().toString(), // unique string
        description: "",
        macroargumentId: "",
      },
    ]);
  }

  function removeLink(index: number) {
    setLinks((prev) => {
      const newLinks = [...prev];
      // Mark as deleted if has id, else remove from array
      if (newLinks[index].id) {
        newLinks[index].isDeleted = true;
      } else {
        newLinks.splice(index, 1);
      }
      return newLinks;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !description || !selectedSubjectName) {
      alert("Fill all required fields");
      return;
    }

    // Update argument
    const resUpdateArg = await fetch(`/api/arguments/${argumentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        subjectName: selectedSubjectName,
      }),
    });

    if (!resUpdateArg.ok) {
      alert("Error updating argument");
      return;
    }

    // Update links
    for (const link of links) {
      if (link.isDeleted && link.id) {
        // Delete link
        await fetch(`/api/links/${link.id}`, {
          method: "DELETE",
        });
      } else if (link.id) {
        // Update existing link
        await fetch(`/api/links/${link.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: link.description,
            macroargumentId: link.macroargumentId,
            argumentId,
          }),
        });
      } else {
        // New link, create it if filled
        if (link.description && link.macroargumentId) {
          await fetch("/api/links", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              description: link.description,
              macroargumentId: link.macroargumentId,
              argumentId,
            }),
          });
        }
      }
    }

    router.push("/");
  }

  if (!argument) return <div>Loading...</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold mb-6">Edit Argument</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-semibold mb-1">Title</label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Description</label>
          <textarea
            className="textarea textarea-bordered w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Subject</label>
          <select
            className="select select-bordered w-full"
            value={selectedSubjectName}
            onChange={(e) => setSelectedSubjectName(e.target.value)}
            required
          >
            <option value="">-- Select Subject --</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Links</h2>
          {links.map((link, i) =>
            link.isDeleted ? null : (
              <div
                key={link.id ?? link.tempId ?? i}
                className="flex gap-2 items-center mb-3"
              >
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
                    handleLinkChange(i, "macroargumentId", e.target.value)
                  }
                >
                  <option value="">-- Select Macroargument --</option>
                  {macroarguments.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn btn-error btn-sm"
                  onClick={() => removeLink(i)}
                >
                  Remove
                </button>
              </div>
            )
          )}
          <button
            type="button"
            className="btn btn-secondary btn-sm mt-2"
            onClick={addLink}
          >
            Add Link
          </button>
        </div>
        <button type="submit" className="btn btn-primary w-full mt-6">
          Save Changes
        </button>

        <button
          type="button"
          className="btn btn-error w-full mt-2"
          onClick={async () => {
            if (!confirm("Are you sure you want to delete this argument?"))
              return;

            const res = await fetch(`/api/arguments/${argumentId}`, {
              method: "DELETE",
            });

            if (res.ok) {
              router.push("/"); // or another page after deletion
            } else {
              alert("Failed to delete argument");
            }
          }}
        >
          Delete Argument
        </button>
      </form>

      <MacroargumentForm
        onAdd={(macro) => setMacroarguments((prev) => [...prev, macro])}
      />
    </div>
  );
}
