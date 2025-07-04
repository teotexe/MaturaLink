"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import cytoscape from "cytoscape";
import coseBilkent from "cytoscape-cose-bilkent";

cytoscape.use(coseBilkent);

interface Subject {
  id: number;
  name: string;
  color?: string | null; // Ora ci aspettiamo anche il colore dal server
}

interface Macroargument {
  id: number;
  name: string;
}

interface LinkElement {
  id: number;
  description: string;
  macroargument: Macroargument;
}

interface ArgumentLink {
  id: number;
  fromArgumentId: number;
  toArgumentId: number;
  description: string;
}

interface ArgumentElement {
  id: number;
  title: string;
  description: string;
  subject: Subject;
  links: LinkElement[];
  fromArgumentLinks: ArgumentLink[];
  toArgumentLinks: ArgumentLink[];
}

export default function CytoscapeGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const router = useRouter();

  const [selectedNode, setSelectedNode] = useState<{
    id: string;
    label: string;
    description: string;
  } | null>(null);

  // Ora carichiamo soggetti con colore dall’API dedicata
  const [subjects, setSubjects] = useState<Subject[]>([]);
  // Mappa id -> colore, costruita dopo fetch soggetti
  const [subjectColorMap, setSubjectColorMap] = useState<Map<number, string>>(
    new Map()
  );

  const [selectedLinkDescription, setSelectedLinkDescription] = useState<
    string | null
  >(null);

  const [legendOpen, setLegendOpen] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Prendo prima i soggetti con i colori
      const subjectsRes = await fetch("/api/subjects");
      const subjectsData: Subject[] = await subjectsRes.json();
      subjectsData.sort((a, b) => a.name.localeCompare(b.name));
      setSubjects(subjectsData);

      const colorMap = new Map<number, string>();
      subjectsData.forEach((subject) => {
        colorMap.set(subject.id, subject.color || "#999999");
      });
      setSubjectColorMap(colorMap);

      // Poi carico gli argomenti (arguments)
      const res = await fetch("/api/arguments");
      const data: ArgumentElement[] = await res.json();

      const elements: cytoscape.ElementDefinition[] = [];

      // Mappa per contare i collegamenti a ciascun macroargomento
      const macroConnectionCount = new Map<number, number>();
      const macroMap = new Map<number, string>();

      data.forEach((arg) =>
        arg.links.forEach((link) => {
          const macroId = link.macroargument.id;
          macroConnectionCount.set(
            macroId,
            (macroConnectionCount.get(macroId) || 0) + 1
          );
          if (!macroMap.has(macroId)) {
            macroMap.set(macroId, `macro-${macroId}`);
          }
        })
      );

      // Crea nodi macro con conteggio connessioni
      for (const [macroId, cyId] of macroMap.entries()) {
        const count = macroConnectionCount.get(macroId) || 1;
        const macroName = data
          .flatMap((arg) => arg.links)
          .find((link) => link.macroargument.id === macroId)
          ?.macroargument.name;

        elements.push({
          data: {
            id: cyId,
            label: macroName,
            type: "macro",
            connectionCount: count,
          },
        });
      }

      // Argomenti + collegamenti
      data.forEach((arg) => {
        const argId = `arg-${arg.id}`;
        elements.push({
          data: {
            id: argId,
            label: arg.title,
            description: arg.description,
            type: "argument",
            subjectId: arg.subject.id,
          },
        });

        // existing macro links
        arg.links.forEach((link) => {
          const macroId = macroMap.get(link.macroargument.id);
          if (macroId) {
            elements.push({
              data: {
                id: `link-${link.id}`,
                source: argId,
                target: macroId,
                description: link.description,
                label: link.description.split("\n")[0],
              },
            });
          }
        });

        // Add fromArgumentLinks edges (from this arg to others)
        arg.fromArgumentLinks.forEach((link) => {
          elements.push({
            data: {
              id: `fromArgLink-${link.id}`,
              source: `arg-${link.fromArgumentId}`,
              target: `arg-${link.toArgumentId}`,
              description: link.description,
              label: link.description.split("\n")[0],
            },
          });
        });

        // Add toArgumentLinks edges (from others to this arg)
        // Note: These links should be already included from the other argument's fromArgumentLinks to avoid duplication
        // But if needed, you could also add them here with a different id, e.g.:
        /*
  arg.toArgumentLinks.forEach((link) => {
    elements.push({
      data: {
        id: `toArgLink-${link.id}`,
        source: `arg-${link.fromArgumentId}`,
        target: `arg-${link.toArgumentId}`,
        description: link.description,
        label: link.description.split("\n")[0],
      },
    });
  });
  */
      });

      if (cyRef.current) {
        cyRef.current.destroy();
      }

      cyRef.current = cytoscape({
        container: containerRef.current as HTMLDivElement,
        elements: elements,
        style: [
          {
            selector: "node[type='argument']",
            style: {
              "background-color": (ele: cytoscape.NodeSingular) => {
                const subjectId = ele.data("subjectId") as number;
                return colorMap.get(subjectId) || "#999999";
              },
              label: "data(label)",
              "text-valign": "center",
              color: "#fff",
              "text-outline-width": 2,
              "text-outline-color": (ele: cytoscape.NodeSingular) => {
                const subjectId = ele.data("subjectId") as number;
                return colorMap.get(subjectId) || "#999999";
              },
              "font-size": "10px",
              width: 40,
              height: 40,
            },
          },
          {
            selector: "node[type='macro']",
            style: {
              "background-color": "#0070f3",
              label: "data(label)",
              "text-valign": "center",
              color: "#fff",
              "text-outline-width": 2,
              "text-outline-color": "#0070f3",
              "font-size": "10px",
              width: (ele: cytoscape.NodeSingular) => {
                const count = ele.data("connectionCount") || 1;
                return Math.min(120, 40 + count * 10); // limite massimo
              },
              height: (ele: cytoscape.NodeSingular) => {
                const count = ele.data("connectionCount") || 1;
                return Math.min(120, 40 + count * 10);
              },
            },
          },
          {
            selector: "edge",
            style: {
              "curve-style": "bezier",
              "target-arrow-shape": "triangle",
              "line-color": "#ccc",
              "target-arrow-color": "#ccc",
              label: "data(label)",
              "font-size": "6px",
              "text-rotation": "autorotate",
              "text-margin-y": -10,
              color: "#000",
            },
          },
        ],
        layout: {
          name: "cose-bilkent",
          quality: "proof",
          randomize: false,
          edgeElasticity: 0.2, // ↑ Slightly more spring, less tight clustering
          nodeRepulsion: 20000, // ↑ Stronger repulsion = more node spacing
          nodeDimensionsIncludeLabels: true,
          gravity: 0.8, // ↓ Lower gravity reduces overall pull together
          gravityRange: 3.5, // Optional fine-tuning
          nestingFactor: 1.0,
          numIter: 4000,
          tile: true,
          fit: true,
          padding: 60, // ↑ Extra padding around the layout
          animate: false,
          tilingPaddingVertical: 30, // ↑ More padding between tiled components
          tilingPaddingHorizontal: 30,
          initialEnergyOnIncremental: 0.8,
        } as any,
      });

      cyRef.current.on("tap", "node[type='argument']", (event) => {
        const node = event.target;
        setSelectedNode({
          id: node.id(),
          label: node.data("label"),
          description: node.data("description"),
        });
      });

      cyRef.current.on("tap", "edge", (event) => {
        const edge = event.target;
        const fullDesc = edge.data("description");
        if (fullDesc) {
          setSelectedLinkDescription(fullDesc);
        }
      });
    }

    fetchData();

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        style={{ width: "100vw", height: "100vh", position: "relative" }}
      />
      <div className="fixed top-4 left-4 z-50 max-w-xs">
        <div
          tabIndex={0}
          className="collapse collapse-arrow border border-base-300 bg-white bg-opacity-90 rounded-box"
        >
          <input type="checkbox" className="peer" />
          <div className="collapse-title text-lg font-bold">Legenda</div>
          <div className="collapse-content">
            <ul className="mt-2">
              {subjects.map((subject) => (
                <li key={subject.id} className="flex items-center mb-1">
                  <span
                    className="inline-block w-4 h-4 mr-2 rounded"
                    style={{ backgroundColor: subject.color || "#999999" }}
                  />
                  {subject.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <input
        type="checkbox"
        id="modal-toggle"
        className="modal-toggle"
        checked={selectedNode !== null}
        readOnly
      />

      <div className="modal">
        <div className="modal-box max-h-[80vh] overflow-y-auto">
          <h3 className="font-bold text-lg mb-4">{selectedNode?.label}</h3>
          <div className="prose max-w-none whitespace-pre-wrap break-words">
            <ReactMarkdown>{selectedNode?.description || ""}</ReactMarkdown>
          </div>
          <div className="modal-action flex justify-between">
            <button className="btn" onClick={() => setSelectedNode(null)}>
              Chiudi
            </button>
            <button
              className="btn btn-primary flex items-center gap-2"
              onClick={() => {
                if (selectedNode) {
                  router.push(`/edit/${selectedNode.id.replace("arg-", "")}`);
                }
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-7-7l7 7"
                />
              </svg>
              Modifica
            </button>
          </div>
        </div>
      </div>

      {selectedLinkDescription && (
        <>
          <input
            type="checkbox"
            id="link-modal"
            className="modal-toggle"
            checked
            readOnly
          />
          <div className="modal modal-open">
            <div className="modal-box max-h-[80vh] overflow-y-auto">
              <h3 className="font-bold text-lg mb-4">
                Descrizione del collegamento
              </h3>
              <div className="prose max-w-none whitespace-pre-wrap break-words">
                <ReactMarkdown>{selectedLinkDescription}</ReactMarkdown>
              </div>
              <div className="modal-action">
                <button
                  className="btn"
                  onClick={() => setSelectedLinkDescription(null)}
                >
                  Chiudi
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
