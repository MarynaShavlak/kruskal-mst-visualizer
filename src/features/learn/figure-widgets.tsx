import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { REFERENCE_MST_EDGE_IDS } from "@/lib/exampleGraph"
import { examplePreset } from "@/store/presets"

/** Живий міні-граф прикладу (опційно з підсвіченою МОД). */
function MiniGraph({ highlightMst = false }: { highlightMst?: boolean }) {
  const { graph, positions } = examplePreset()
  const mst = new Set(REFERENCE_MST_EDGE_IDS)
  const xs = graph.vertices.map((v) => positions[v].x)
  const ys = graph.vertices.map((v) => positions[v].y)
  const pad = 34
  const minX = Math.min(...xs) - pad
  const maxX = Math.max(...xs) + pad
  const minY = Math.min(...ys) - pad
  const maxY = Math.max(...ys) + pad
  const viewBox = `${minX} ${minY} ${maxX - minX} ${maxY - minY}`

  return (
    <span className="not-prose my-4 block rounded-lg border bg-card p-2">
      <svg viewBox={viewBox} className="h-[300px] w-full" preserveAspectRatio="xMidYMid meet">
        {graph.edges.map((e) => {
          const a = positions[e.u]
          const b = positions[e.v]
          const inMst = highlightMst && mst.has(e.id)
          const mx = (a.x + b.x) / 2
          const my = (a.y + b.y) / 2
          return (
            <g key={e.id}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={inMst ? "#16a34a" : "#94a3b8"}
                strokeWidth={inMst ? 3.5 : 1.5}
                strokeLinecap="round"
              />
              <rect x={mx - 10} y={my - 9} width={20} height={18} rx={4} fill="#ffffff" opacity={0.9} />
              <text x={mx} y={my} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600} fill="#1f2937">
                {e.weight}
              </text>
            </g>
          )
        })}
        {graph.vertices.map((v) => {
          const p = positions[v]
          return (
            <g key={v}>
              <circle cx={p.x} cy={p.y} r={15} fill="#0891b2" stroke="#ffffff" strokeWidth={2} />
              <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600} fill="#ffffff">
                {v}
              </text>
            </g>
          )
        })}
      </svg>
    </span>
  )
}

function FigureCard({
  caption,
  cta,
}: {
  caption: string
  cta?: { label: string; tab: string }
}) {
  return (
    <span className="not-prose my-4 block rounded-lg border border-dashed bg-muted/30 p-4 text-center">
      <span className="block text-sm text-muted-foreground">{caption}</span>
      {cta && (
        <Button
          size="sm"
          variant="outline"
          className="mt-3"
          onClick={() => {
            window.location.hash = cta.tab
          }}
        >
          {cta.label} →
        </Button>
      )}
    </span>
  )
}

/** Замінює статичну фігуру markdown живим віджетом або інформативною карткою. */
export function figureForSrc(src: string | undefined, alt: string | undefined): ReactNode {
  const name = (src ?? "").split("/").pop() ?? ""
  const caption = alt ?? ""

  if (name === "graph.png") return <MiniGraph />
  if (name === "spanning_tree_example.png" || name === "mst_result.png") {
    return <MiniGraph highlightMst />
  }
  if (/dsu|has_path|bfs|step|compare|build|steps/.test(name)) {
    return <FigureCard caption={caption} cta={{ label: "Відкрити плеєр", tab: "playback" }} />
  }
  if (name.includes("benchmark")) {
    return <FigureCard caption={caption} cta={{ label: "Відкрити бенчмарк", tab: "benchmark" }} />
  }
  return <FigureCard caption={caption} />
}
