import { useState } from "react"
import { REFERENCE_MST_EDGE_IDS } from "@/lib/exampleGraph"
import type { Edge, Graph, Vertex } from "@/lib/graph"
import { examplePreset } from "@/store/presets"
import type { XY } from "@/store/graph-store"
import { maxWeightEdgeId, mstCycle } from "@/features/learn/proof-logic"

interface ProofEdgeStyle {
  stroke: string
  width: number
  dash?: string
}

/** Спільний SVG-граф для доведень: кліки по вершинах/ребрах, кастомні стилі. */
function ProofGraph({
  graph,
  positions,
  vertexFill,
  edgeStyle,
  onVertexClick,
  onEdgeClick,
}: {
  graph: Graph
  positions: Record<Vertex, XY>
  vertexFill: (v: Vertex) => string
  edgeStyle: (e: Edge) => ProofEdgeStyle
  onVertexClick?: (v: Vertex) => void
  onEdgeClick?: (e: Edge) => void
}) {
  const xs = graph.vertices.map((v) => positions[v].x)
  const ys = graph.vertices.map((v) => positions[v].y)
  const pad = 34
  const minX = Math.min(...xs) - pad
  const maxX = Math.max(...xs) + pad
  const minY = Math.min(...ys) - pad
  const maxY = Math.max(...ys) + pad
  const viewBox = `${minX} ${minY} ${maxX - minX} ${maxY - minY}`

  return (
    <svg viewBox={viewBox} className="h-[300px] w-full" preserveAspectRatio="xMidYMid meet">
      {graph.edges.map((e) => {
        const a = positions[e.u]
        const b = positions[e.v]
        const s = edgeStyle(e)
        const mx = (a.x + b.x) / 2
        const my = (a.y + b.y) / 2
        return (
          <g
            key={e.id}
            onClick={() => onEdgeClick?.(e)}
            style={{ cursor: onEdgeClick ? "pointer" : undefined }}
          >
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={s.stroke} strokeWidth={s.width} strokeDasharray={s.dash} strokeLinecap="round" />
            {onEdgeClick && (
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="transparent" strokeWidth={14} />
            )}
            <rect x={mx - 10} y={my - 9} width={20} height={18} rx={4} opacity={0.9} style={{ fill: "var(--card)" }} />
            <text x={mx} y={my} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600} style={{ fill: "var(--foreground)" }}>
              {e.weight}
            </text>
          </g>
        )
      })}
      {graph.vertices.map((v) => {
        const p = positions[v]
        return (
          <g
            key={v}
            onClick={() => onVertexClick?.(v)}
            style={{ cursor: onVertexClick ? "pointer" : undefined }}
          >
            <circle cx={p.x} cy={p.y} r={15} fill={vertexFill(v)} stroke="#ffffff" strokeWidth={2} />
            <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600} fill="#ffffff">
              {v}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function initialCut(graph: Graph): Record<Vertex, "A" | "B"> {
  const cut: Record<Vertex, "A" | "B"> = {}
  const half = Math.ceil(graph.vertices.length / 2)
  graph.vertices.forEach((v, i) => {
    cut[v] = i < half ? "A" : "B"
  })
  return cut
}

export function CutPropertyWidget() {
  const { graph, positions } = examplePreset()
  const [side, setSide] = useState<Record<Vertex, "A" | "B">>(() =>
    initialCut(graph),
  )

  const crossing = graph.edges.filter((e) => side[e.u] !== side[e.v])
  const minCross =
    crossing.length > 0
      ? crossing.reduce((m, e) => (e.weight < m.weight ? e : m))
      : null

  return (
    <span className="not-prose my-4 block rounded-lg border bg-card p-3">
      <span className="mb-1 block text-sm font-medium">
        Властивість розрізу (інтерактивно)
      </span>
      <span className="mb-2 block text-xs text-muted-foreground">
        Клікни по вершинах, щоб перекидати їх між двома сторонами розрізу (синя /
        помаранчева). Мінімальне ребро, що перетинає розріз (зелене), завжди
        належить якійсь МОД.
      </span>
      <ProofGraph
        graph={graph}
        positions={positions}
        vertexFill={(v) => (side[v] === "A" ? "#2563eb" : "#ea580c")}
        edgeStyle={(e) => {
          if (minCross && e.id === minCross.id) return { stroke: "#16a34a", width: 4 }
          if (side[e.u] !== side[e.v]) return { stroke: "#d97706", width: 2.5, dash: "5 4" }
          return { stroke: "#cbd5e1", width: 1.5 }
        }}
        onVertexClick={(v) =>
          setSide((s) => ({ ...s, [v]: s[v] === "A" ? "B" : "A" }))
        }
      />
      <span className="mt-2 block text-sm">
        {minCross ? (
          <>
            Мінімальне ребро через розріз:{" "}
            <b>
              {minCross.u}–{minCross.v}
            </b>{" "}
            (вага {minCross.weight}) — безпечне для додавання в МОД.
          </>
        ) : (
          "Перенесіть вершини так, щоб обидві сторони були непорожні."
        )}
      </span>
    </span>
  )
}

export function ExchangeArgumentWidget() {
  const { graph, positions } = examplePreset()
  const mst = new Set(REFERENCE_MST_EDGE_IDS)
  const byId = new Map(graph.edges.map((e) => [e.id, e]))
  // Початково обране показове не-деревне ребро (можна клікнути інше).
  const [selected, setSelected] = useState<string | null>("B|C")

  const cycle = selected ? mstCycle(graph, mst, selected) : null
  const treeInCycle = cycle ? [...cycle].filter((id) => mst.has(id)) : []
  const heaviestTreeId = cycle ? maxWeightEdgeId(graph, treeInCycle) : null
  const selEdge = selected ? byId.get(selected) : undefined
  const heaviest = heaviestTreeId ? byId.get(heaviestTreeId) : undefined

  return (
    <span className="not-prose my-4 block rounded-lg border bg-card p-3">
      <span className="mb-1 block text-sm font-medium">
        Аргумент обміну (інтерактивно)
      </span>
      <span className="mb-2 block text-xs text-muted-foreground">
        Зелене — ребра МОД. Клікни по <b>не-деревному</b> (сірому) ребру: воно
        замикає цикл із МОД. Найважче ДЕРЕВНЕ ребро циклу (червоне) має вагу ≤
        обраного — тож обмін не зменшить вагу, отже МОД оптимальне.
      </span>
      <ProofGraph
        graph={graph}
        positions={positions}
        vertexFill={() => "#0891b2"}
        edgeStyle={(e) => {
          if (e.id === selected) return { stroke: "#d97706", width: 4 }
          if (heaviestTreeId && e.id === heaviestTreeId) return { stroke: "#dc2626", width: 4 }
          if (cycle?.has(e.id)) return { stroke: "#f59e0b", width: 3, dash: "5 4" }
          if (mst.has(e.id)) return { stroke: "#16a34a", width: 3 }
          return { stroke: "#cbd5e1", width: 1.5 }
        }}
        onEdgeClick={(e) => {
          if (!mst.has(e.id)) setSelected(e.id)
        }}
      />
      <span className="mt-2 block text-sm">
        {selEdge && heaviest ? (
          <>
            Обране{" "}
            <b>
              {selEdge.u}–{selEdge.v}
            </b>{" "}
            (вага {selEdge.weight}) замикає цикл; найважче деревне ребро циклу —{" "}
            <b>
              {heaviest.u}–{heaviest.v}
            </b>{" "}
            (вага {heaviest.weight}). Оскільки {selEdge.weight} ≥{" "}
            {heaviest.weight}, обмін не зменшує вагу.
          </>
        ) : (
          "Клікни по сірому (не-деревному) ребру."
        )}
      </span>
    </span>
  )
}
