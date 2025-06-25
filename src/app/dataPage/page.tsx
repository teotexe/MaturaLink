"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArgumentForm } from "@/src/components/ArgumentForm";
import { MacroargumentForm } from "@/src/components/MacroargumentForm";
import ReactMarkdown from "react-markdown";

type Argument = {
  id: number;
  title: string;
  description: string;
  subject: { id: number; name: string };
  links: {
    id: number;
    description: string;
    macroargument: { id: number; name: string };
  }[];
};

type Subject = { id: number; name: string };
type Macroargument = { id: number; name: string };

export default function DataPage() {
  const [argumentsData, setArgumentsData] = useState<Argument[]>([]);
  const [groupBy, setGroupBy] = useState<"subject-macro" | "macro-subject">(
    "subject-macro"
  );
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [macroarguments, setMacroarguments] = useState<Macroargument[]>([]);

  const [selectedDescription, setSelectedDescription] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetch("/api/arguments")
      .then((res) => res.json())
      .then(setArgumentsData);

    fetch("/api/subjects")
      .then((res) => res.json())
      .then(setSubjects);

    fetch("/api/macroarguments")
      .then((res) => res.json())
      .then(setMacroarguments);
  }, []);

  function groupBySubjectThenMacro(args: Argument[]) {
    const result: Record<string, Record<string, Argument[]>> = {}; // subject → macro → args

    args.forEach((arg) => {
      const subjectName = arg.subject.name;
      if (!result[subjectName]) result[subjectName] = {};

      if (arg.links.length === 0) {
        // Caso argument senza link
        if (!result[subjectName]["No Macroargument"])
          result[subjectName]["No Macroargument"] = [];
        result[subjectName]["No Macroargument"].push(arg);
      } else {
        arg.links.forEach((link) => {
          const macroName = link.macroargument?.name ?? "No Macroargument";
          if (!result[subjectName][macroName])
            result[subjectName][macroName] = [];
          result[subjectName][macroName].push(arg);
        });
      }
    });

    return result;
  }

  function groupByMacroThenSubject(args: Argument[]) {
    const result: Record<string, Record<string, Argument[]>> = {}; // macro → subject → args

    args.forEach((arg) => {
      if (arg.links.length === 0) {
        if (!result["No Macroargument"]) result["No Macroargument"] = {};
        if (!result["No Macroargument"][arg.subject.name])
          result["No Macroargument"][arg.subject.name] = [];
        result["No Macroargument"][arg.subject.name].push(arg);
      } else {
        arg.links.forEach((link) => {
          const macroName = link.macroargument?.name ?? "No Macroargument";
          if (!result[macroName]) result[macroName] = {};
          if (!result[macroName][arg.subject.name])
            result[macroName][arg.subject.name] = [];
          result[macroName][arg.subject.name].push(arg);
        });
      }
    });

    return result;
  }

  const groupedData =
    groupBy === "subject-macro"
      ? groupBySubjectThenMacro(argumentsData)
      : groupByMacroThenSubject(argumentsData);

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-12">
      <div className="p-8 max-w-5xl mx-auto space-y-12">
        <section className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Arguments</h1>
          <button
            className="btn btn-outline"
            onClick={() =>
              setGroupBy((prev) =>
                prev === "subject-macro" ? "macro-subject" : "subject-macro"
              )
            }
          >
            Group: {groupBy === "subject-macro" ? "Macro" : "Arg"}
          </button>
        </section>

        <section>
          {Object.entries(groupedData).map(([firstKey, nested]) => (
            <div key={firstKey} className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{firstKey}</h2>

              {Object.entries(nested).map(([secondKey, args]) => (
                <div key={secondKey} className="mb-6 ml-4">
                  <h3 className="text-xl font-semibold mb-2">{secondKey}</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    {args.map((arg, index) => {
                      // Determine the correct macroargument key based on grouping
                      const currentGroupKey =
                        groupBy === "subject-macro" ? secondKey : firstKey;

                      const filteredLinks =
                        currentGroupKey === "No Macroargument"
                          ? []
                          : arg.links.filter(
                              (link) =>
                                link.macroargument?.name === currentGroupKey
                            );

                      return (
                        <li key={`${arg.id}-${index}`}>
                          <div className="flex items-center justify-between">
                            <Link href={`/edit/${arg.id}`}>
                              <strong>{arg.title}</strong>
                            </Link>

                            <button
                              onClick={() =>
                                setSelectedDescription(arg.description)
                              }
                              className="ml-4 btn btn-sm btn-outline"
                            >
                              Show Description
                            </button>
                          </div>

                          {filteredLinks.length > 0 && (
                            <ul className="list pl-6 mt-1 text-sm text-gray-600">
                              {filteredLinks.map((link) => (
                                <li key={link.id}>{link.description}</li>
                              ))}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </section>
      </div>
      {/* Form creazione nuovo argument */}
      <ArgumentForm
        subjects={subjects}
        macroarguments={macroarguments}
        onArgumentAdded={async () => {
          const updatedArgs = await fetch("/api/arguments").then((res) =>
            res.json()
          );
          setArgumentsData(updatedArgs);
        }}
      />
      {selectedDescription && (
        <>
          <input
            type="checkbox"
            id="description-modal"
            className="modal-toggle"
            checked
            readOnly
          />
          <div className="modal modal-open">
            <div className="modal-box max-h-[80vh] overflow-y-auto">
              <h3 className="font-bold text-lg mb-4">Description</h3>
              <div className="prose max-w-none whitespace-pre-wrap break-words">
                <ReactMarkdown>{selectedDescription}</ReactMarkdown>
              </div>
              <div className="modal-action">
                <button
                  onClick={() => setSelectedDescription(null)}
                  className="btn"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Form creazione macroargument */}
      <MacroargumentForm
        onAdd={(macro) => setMacroarguments((prev) => [...prev, macro])}
      />
    </div>
  );
}
