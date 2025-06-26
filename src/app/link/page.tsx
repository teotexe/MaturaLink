"use client";

import { useEffect, useState } from "react";

type Argument = {
  id: number;
  title: string;
  description: string;
};

type ArgumentLink = {
  id: number;
  description: string;
  fromArgumentId: number;
  toArgumentId: number;
  fromArgument: Argument;
  toArgument: Argument;
};

export default function ArgumentLinksPage() {
  const [argumentsList, setArgumentsList] = useState<Argument[]>([]);
  const [argumentLinks, setArgumentLinks] = useState<ArgumentLink[]>([]);
  const [fromId, setFromId] = useState<string>("");
  const [toId, setToId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    const [argsRes, linksRes] = await Promise.all([
      fetch("/api/arguments"),
      fetch("/api/argumentlinks"),
    ]);
    const argsData = await argsRes.json();
    const linksData = await linksRes.json();
    setArgumentsList(argsData);
    setArgumentLinks(linksData);
  }

  const handleSubmit = async () => {
    setError(null);
    setSuccess(false);
    if (!fromId || !toId || !description) {
      setError("All fields are required");
      return;
    }

    if (fromId === toId) {
      setError("Cannot link an argument to itself");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/argumentlinks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromArgumentId: parseInt(fromId),
          toArgumentId: parseInt(toId),
          description,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create link");
      }

      setSuccess(true);
      setFromId("");
      setToId("");
      setDescription("");
      fetchAll();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/argumentlinks/${id}`, { method: "DELETE" });
    fetchAll();
  };

  const handleEdit = async (id: number, newDescription: string) => {
    await fetch(`/api/argumentlinks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: newDescription }),
    });
    fetchAll();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Create Argument Link</h1>

      <div>
        <label className="label">
          <span className="label-text">From Argument</span>
        </label>
        <select
          className="select select-bordered w-full"
          value={fromId}
          onChange={(e) => setFromId(e.target.value)}
        >
          <option disabled value="">
            Select an argument
          </option>
          {argumentsList.map((arg) => (
            <option key={arg.id} value={arg.id}>
              {arg.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">
          <span className="label-text">To Argument</span>
        </label>
        <select
          className="select select-bordered w-full"
          value={toId}
          onChange={(e) => setToId(e.target.value)}
        >
          <option disabled value="">
            Select an argument
          </option>
          {argumentsList.map((arg) => (
            <option key={arg.id} value={arg.id}>
              {arg.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">
          <span className="label-text">Link Description</span>
        </label>
        <textarea
          className="textarea textarea-bordered w-full"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <button
        className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Link"}
      </button>

      {error && <div className="alert alert-error mt-4">{error}</div>}
      {success && (
        <div className="alert alert-success mt-4">
          Link created successfully!
        </div>
      )}

      <h2 className="text-2xl font-semibold mt-10">Existing Links</h2>
      <div className="space-y-4">
        {argumentLinks.map((link) => (
          <div key={link.id} className="card bg-base-100 shadow-md">
            <div className="card-body">
              <h3 className="card-title">
                {link.fromArgument.title} ➝ {link.toArgument.title}
              </h3>
              <div className="form-control">
                <input
                  type="text"
                  className="input input-bordered"
                  value={link.description}
                  onChange={(e) => {
                    const updated = argumentLinks.map((l) =>
                      l.id === link.id
                        ? { ...l, description: e.target.value }
                        : l
                    );
                    setArgumentLinks(updated);
                  }}
                />
              </div>
              <div className="card-actions justify-end mt-2">
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => handleEdit(link.id, link.description)}
                >
                  Save
                </button>
                <button
                  className="btn btn-error btn-sm"
                  onClick={() => handleDelete(link.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
