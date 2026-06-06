import { motion } from "motion/react"
import type { Graph, Vertex } from "@/lib/graph"
import type { Frame, Trace } from "@/lib/trace"
import {
  colorByRoot,
  componentRoots,
  edgeStatuses,
  type EdgeStatus,
} from "@/features/playback/highlight"
import { Panel } from "@/features/playback/Panel"
import { circularLayout } from "@/store/presets"
import type { XY } from "@/store/graph-store"

const EDGE_STYLE: Record<
  EdgeStatus,
  { stroke: string; width: number; dash?: string; opacity: number }
> = {
  accepted: { stroke: "#16a34a", width: 4, opacity: 1 },
  current: { stroke: "#d97706", width: 4, dash: "7 4", opacity: 1 },
  rejected: { stroke: "#ef4444", width: 1.5, dash: "4 4", opacity: 0.4 },
  pending: { stroke: "#94a3b8", width: 1.5, opacity: 0.85 },
}

interface Ring {
  stroke: string
  width: number
  dash?: string
}

/** Кільце-підсвітка вершини за підкроком кадру (BFS-фронтир або find-підйом). */
function vertexRing(
  v: Vertex,
  sub: Frame["sub"],
): Ring | null {
  if (sub.kind === "bfs-visit") {
    if (sub.at === v) return { stroke: "#d97706", width: 3 }
    if (sub.frontier.includes(v)) return { stroke: "#d97706", width: 2.5, dash: "3 3" }
    if (sub.visited.includes(v)) return { stroke: "#2563eb", width: 2 }
  } else if (sub.kind === "bfs-exhausted") {
    if (sub.visited.includes(v)) return { stroke: "#2563eb", width: 2 }
  } else if (sub.kind === "dsu-find") {
    if (sub.path.includes(v)) return { stroke: "#d97706", width: 3 }
  } else if (sub.kind === "dsu-compress") {
    if (sub.changed.includes(v) || sub.root === v) return { stroke: "#0891b2", width: 3 }
  }
  return null
}

export function GraphView({
  graph,
  positions,
  trace,
  frame,
  title = "Граф (кольори компонент)",
  className,
}: {
  graph: Graph
  positions: Record<Vertex, XY>
  trace: Trace
  frame: Frame
  title?: string
  className?: string
}) {
  const allHavePos = graph.vertices.every((v) => positions[v])
  const pos = allHavePos ? positions : circularLayout(graph.vertices)
  const colors = colorByRoot(componentRoots(graph, frame))
  const statuses = edgeStatuses(trace, frame)

  const xs = graph.vertices.map((v) => pos[v].x)
  const ys = graph.vertices.map((v) => pos[v].y)
  const pad = 36
  const minX = Math.min(...xs, 0) - pad
  const maxX = Math.max(...xs, 100) + pad
  const minY = Math.min(...ys, 0) - pad
  const maxY = Math.max(...ys, 100) + pad
  const viewBox = `${minX} ${minY} ${maxX - minX} ${maxY - minY}`

  return (
    <Panel title={title} className={className} bodyClassName="p-0">
      <svg viewBox={viewBox} className="h-full w-full" preserveAspectRatio="xMidYMid meet">
        {graph.edges.map((e) => {
          const a = pos[e.u]
          const b = pos[e.v]
          const st = statuses.get(e.id) ?? "pending"
          const s = EDGE_STYLE[st]
          const mx = (a.x + b.x) / 2
          const my = (a.y + b.y) / 2
          return (
            <g key={e.id}>
              <motion.line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                strokeDasharray={s.dash}
                strokeLinecap="round"
                initial={false}
                animate={{ stroke: s.stroke, strokeWidth: s.width, opacity: s.opacity }}
              />
              <rect x={mx - 11} y={my - 9} width={22} height={18} rx={4} fill="#ffffff" opacity={0.9} />
              <text x={mx} y={my} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600} fill="#1f2937">
                {e.weight}
              </text>
            </g>
          )
        })}
        {graph.vertices.map((v) => {
          const p = pos[v]
          const ring = vertexRing(v, frame.sub)
          return (
            <g key={v}>
              {ring && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={21}
                  fill="none"
                  stroke={ring.stroke}
                  strokeWidth={ring.width}
                  strokeDasharray={ring.dash}
                />
              )}
              <motion.circle
                cx={p.x}
                cy={p.y}
                r={16}
                stroke="#ffffff"
                strokeWidth={2}
                initial={false}
                animate={{ fill: colors.get(v) ?? "#94a3b8" }}
              />
              <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={600} fill="#ffffff">
                {v}
              </text>
            </g>
          )
        })}
      </svg>
    </Panel>
  )
}
