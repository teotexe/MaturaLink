"use client";

import React, { useEffect, useState } from "react";

type Subject = {
  id: number;
  name: string;
  color?: string | null;
};

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/subjects")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch subjects");
        return res.json();
      })
      .then((data) => {
        setSubjects(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  async function updateSubject(id: number, name: string, color: string) {
    try {
      const res = await fetch(`/api/subjects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Update failed");
      }

      const updated = await res.json();
      setSubjects((subs) => subs.map((s) => (s.id === id ? updated : s)));
    } catch (e: any) {
      alert("Error updating subject: " + e.message);
    }
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-32">
        <span className="loading loading-spinner loading-lg"></span>
        <span className="ml-2">Loading subjects...</span>
      </div>
    );
  if (error)
    return (
      <div className="alert alert-error max-w-lg mx-auto mt-8">
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current flex-shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2v4m0 4h.01"
            />
          </svg>
          <span>Error: {error}</span>
        </div>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-center">Subjects Editor</h1>

      <table className="table w-full border border-base-300">
        <thead>
          <tr>
            <th className="border border-base-300 bg-base-200">Name</th>
            <th className="border border-base-300 bg-base-200">Color</th>
            <th className="border border-base-300 bg-base-200">Preview</th>
            <th className="border border-base-300 bg-base-200">Actions</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map(({ id, name, color }) => (
            <EditableRow
              key={id}
              id={id}
              initialName={name}
              initialColor={color || ""}
              onSave={updateSubject}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EditableRow({
  id,
  initialName,
  initialColor,
  onSave,
}: {
  id: number;
  initialName: string;
  initialColor: string;
  onSave: (id: number, name: string, color: string) => void;
}) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);

  const [editing, setEditing] = useState(false);

  function handleSave() {
    if (!name.trim()) {
      alert("Name cannot be empty");
      return;
    }
    onSave(id, name.trim(), color.trim());
    setEditing(false);
  }

  return (
    <tr>
      <td className="border border-base-300 p-2">
        {editing ? (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input input-bordered w-full max-w-xs"
          />
        ) : (
          <span>{name}</span>
        )}
      </td>
      <td className="border border-base-300 p-2">
        {editing ? (
          <input
            type="color"
            value={color || "#000000"}
            onChange={(e) => setColor(e.target.value)}
            className="w-12 h-10 p-0 border-none cursor-pointer"
            title="Pick a color"
          />
        ) : (
          <span>{color || "—"}</span>
        )}
      </td>
      <td className="border border-base-300 p-2">
        <div
          className="w-8 h-8 rounded border border-base-400"
          style={{ backgroundColor: color || "transparent" }}
          aria-label={`Color preview for ${initialName}`}
        />
      </td>
      <td className="border border-base-300 p-2 space-x-2">
        {editing ? (
          <>
            <button className="btn btn-sm btn-success" onClick={handleSave}>
              Save
            </button>
            <button
              className="btn btn-sm btn-error"
              onClick={() => {
                setEditing(false);
                setName(initialName);
                setColor(initialColor);
              }}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            className="btn btn-sm btn-primary"
            onClick={() => setEditing(true)}
          >
            Edit
          </button>
        )}
      </td>
    </tr>
  );
}
