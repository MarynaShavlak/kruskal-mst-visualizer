import { useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { REFERENCE_MST_EDGE_IDS } from "@/lib/exampleGraph"
import { examplePreset } from "@/store/presets"
import {
  CutPropertyWidget,
  ExchangeArgumentWidget,
} from "@/features/learn/proofs"

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

/** Граф із трьома компонентами зв'язності (кожен колір — окрема компонента). */
function ComponentsExampleWidget() {
  const COLORS = ["#2563eb", "#16a34a", "#d97706"]
  const nodes: Record<string, { x: number; y: number; c: number }> = {
    A: { x: 70, y: 70, c: 0 },
    B: { x: 195, y: 50, c: 0 },
    C: { x: 120, y: 180, c: 0 },
    D: { x: 345, y: 70, c: 1 },
    E: { x: 455, y: 150, c: 1 },
    F: { x: 95, y: 320, c: 2 },
    G: { x: 245, y: 355, c: 2 },
    H: { x: 385, y: 305, c: 2 },
  }
  const edges: [string, string][] = [
    ["A", "B"],
    ["B", "C"],
    ["A", "C"],
    ["D", "E"],
    ["F", "G"],
    ["G", "H"],
  ]
  const xs = Object.values(nodes).map((n) => n.x)
  const ys = Object.values(nodes).map((n) => n.y)
  const pad = 34
  const viewBox = `${Math.min(...xs) - pad} ${Math.min(...ys) - pad} ${
    Math.max(...xs) - Math.min(...xs) + pad * 2
  } ${Math.max(...ys) - Math.min(...ys) + pad * 2}`

  return (
    <span className="not-prose my-4 block rounded-lg border bg-card p-2">
      <svg viewBox={viewBox} className="h-[260px] w-full" preserveAspectRatio="xMidYMid meet">
        {edges.map(([u, v]) => {
          const a = nodes[u]
          const b = nodes[v]
          return (
            <line
              key={`${u}-${v}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={COLORS[a.c]}
              strokeWidth={2.5}
              strokeLinecap="round"
              opacity={0.55}
            />
          )
        })}
        {Object.entries(nodes).map(([id, n]) => (
          <g key={id}>
            <circle cx={n.x} cy={n.y} r={16} fill={COLORS[n.c]} stroke="#ffffff" strokeWidth={2} />
            <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={600} fill="#ffffff">
              {id}
            </text>
          </g>
        ))}
      </svg>
      <span className="mt-1 block text-center text-xs text-muted-foreground">
        3 компоненти зв'язності (кожен колір — окрема компонента); has_path = True
        лише в межах однієї компоненти.
      </span>
    </span>
  )
}

type ParentMap = Record<string, string>
type PosMap = Record<string, { x: number; y: number }>

function pathToRoot(parent: ParentMap, node: string): string[] {
  const path = [node]
  let cur = node
  let guard = 0
  while (parent[cur] !== cur && guard++ < 100) {
    cur = parent[cur]
    path.push(cur)
  }
  return path
}

function krokWord(n: number): string {
  if (n === 1) return "крок"
  if (n >= 2 && n <= 4) return "кроки"
  return "кроків"
}

function MiniTree({
  parent,
  pos,
  path,
  onSelect,
}: {
  parent: ParentMap
  pos: PosMap
  path: ReadonlySet<string>
  onSelect: (id: string) => void
}) {
  const ids = Object.keys(parent)
  const xs = ids.map((id) => pos[id].x)
  const ys = ids.map((id) => pos[id].y)
  const pad = 24
  const viewBox = `${Math.min(...xs) - pad} ${Math.min(...ys) - pad} ${
    Math.max(...xs) - Math.min(...xs) + pad * 2
  } ${Math.max(...ys) - Math.min(...ys) + pad * 2}`

  return (
    <svg viewBox={viewBox} className="h-[180px] w-full" preserveAspectRatio="xMidYMid meet">
      {ids
        .filter((id) => parent[id] !== id)
        .map((id) => {
          const a = pos[id]
          const b = pos[parent[id]]
          const on = path.has(id) && path.has(parent[id])
          return (
            <line
              key={id}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={on ? "#d97706" : "#94a3b8"}
              strokeWidth={on ? 3 : 1.5}
              strokeLinecap="round"
            />
          )
        })}
      {ids.map((id) => {
        const p = pos[id]
        const on = path.has(id)
        return (
          <g key={id} onClick={() => onSelect(id)} style={{ cursor: "pointer" }}>
            <circle cx={p.x} cy={p.y} r={13} fill={on ? "#d97706" : "#0891b2"} stroke="#ffffff" strokeWidth={2} />
            <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600} fill="#ffffff">
              {id}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** Ланцюг проти плаского дерева DSU: клік по вузлу «робить» find і рахує кроки. */
function ChainVsFlatWidget() {
  const [target, setTarget] = useState("5")
  const chain: ParentMap = { "1": "1", "2": "1", "3": "2", "4": "3", "5": "4" }
  const flat: ParentMap = { "1": "1", "2": "1", "3": "1", "4": "1", "5": "1" }
  const chainPos: PosMap = {
    "1": { x: 50, y: 25 },
    "2": { x: 50, y: 90 },
    "3": { x: 50, y: 155 },
    "4": { x: 50, y: 220 },
    "5": { x: 50, y: 285 },
  }
  const flatPos: PosMap = {
    "1": { x: 175, y: 35 },
    "2": { x: 55, y: 165 },
    "3": { x: 135, y: 165 },
    "4": { x: 215, y: 165 },
    "5": { x: 295, y: 165 },
  }
  const chainPath = pathToRoot(chain, target)
  const flatPath = pathToRoot(flat, target)

  return (
    <span className="not-prose my-4 block rounded-lg border bg-card p-3">
      <span className="mb-2 block text-xs text-muted-foreground">
        Натисни будь-який вузол, щоб «знайти» його корінь (find). Без оптимізацій
        (ліворуч) — вироджений ланцюг, кроків багато; зі стисненням шляху
        (праворуч) — пласке дерево, лише 1 крок.
      </span>
      <span className="flex flex-col gap-4 sm:flex-row">
        <span className="block flex-1">
          <span className="mb-1 block text-center text-sm font-medium">
            Без оптимізацій (ланцюг)
          </span>
          <MiniTree parent={chain} pos={chainPos} path={new Set(chainPath)} onSelect={setTarget} />
          <span className="block text-center text-sm">
            find({target}) ={" "}
            <b className="text-amber-600">{chainPath.length - 1}</b>{" "}
            {krokWord(chainPath.length - 1)}
          </span>
        </span>
        <span className="block flex-1">
          <span className="mb-1 block text-center text-sm font-medium">
            Зі стисненням шляху (пласке)
          </span>
          <MiniTree parent={flat} pos={flatPos} path={new Set(flatPath)} onSelect={setTarget} />
          <span className="block text-center text-sm">
            find({target}) ={" "}
            <b className="text-green-600">{flatPath.length - 1}</b>{" "}
            {krokWord(flatPath.length - 1)}
          </span>
        </span>
      </span>
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
  if (name === "components_example.png") return <ComponentsExampleWidget />
  if (name === "chain_vs_flat.png") return <ChainVsFlatWidget />
  if (name === "cut_property.png") return <CutPropertyWidget />
  if (name === "exchange_argument.png") return <ExchangeArgumentWidget />
  if (/dsu|has_path|bfs|step|compare|build|steps/.test(name)) {
    return <FigureCard caption={caption} cta={{ label: "Відкрити плеєр", tab: "playback" }} />
  }
  if (name.includes("benchmark")) {
    return <FigureCard caption={caption} cta={{ label: "Відкрити бенчмарк", tab: "benchmark" }} />
  }
  return <FigureCard caption={caption} />
}
