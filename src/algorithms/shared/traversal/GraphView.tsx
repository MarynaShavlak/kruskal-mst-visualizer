import { motion } from "motion/react"
import type { Graph, Vertex } from "@/lib/graph"
import type { TraversalFrame } from "@/lib/graphTraversal"
import {
  travEdgeStatuses,
  travVertexRole,
  type TravEdgeStatus,
} from "@/algorithms/shared/traversal/highlight"
import { Panel } from "@/algorithms/shared/playback/Panel"
import { useT } from "@/i18n/use-t"
import { circularLayout } from "@/store/presets"
import type { XY } from "@/store/create-graph-store"

// Обхід НЕ враховує ваги ребер, тож підписи ваг не показуємо — лише структуру.
const EDGE_STYLE: Record<
  TravEdgeStatus,
  { stroke: string; width: number; dash?: string; opacity: number }
> = {
  tree: { stroke: "#16a34a", width: 4, opacity: 1 },
  current: { stroke: "#d97706", width: 4, opacity: 1 },
  pending: { stroke: "#94a3b8", width: 1.5, opacity: 0.55 },
}

interface Ring {
  stroke: string
  width: number
  dash?: string
}

function ringFor(frame: TraversalFrame, v: Vertex): Ring | null {
  const r = travVertexRole(frame, v)
  if (r.current) return { stroke: "#d97706", width: 3 }
  if (r.inFrontier) return { stroke: "#2563eb", width: 2.5, dash: "4 3" }
  if (r.isStart) return { stroke: "#0891b2", width: 2.5 }
  return null
}

export function GraphView({
  graph,
  positions,
  frame,
  title,
  className,
}: {
  graph: Graph
  positions: Record<Vertex, XY>
  frame: TraversalFrame
  title?: string
  className?: string
}) {
  const t = useT()
  const allHavePos = graph.vertices.every((v) => positions[v])
  const pos = allHavePos ? positions : circularLayout(graph.vertices)
  const statuses = travEdgeStatuses(frame)
  const visited = new Set(frame.visited)

  const xs = graph.vertices.map((v) => pos[v].x)
  const ys = graph.vertices.map((v) => pos[v].y)
  const pad = 36
  const minX = Math.min(...xs, 0) - pad
  const maxX = Math.max(...xs, 100) + pad
  const minY = Math.min(...ys, 0) - pad
  const maxY = Math.max(...ys, 100) + pad
  const viewBox = `${minX} ${minY} ${maxX - minX} ${maxY - minY}`

  return (
    <Panel
      title={title ?? t("play.travGraph")}
      className={className}
      bodyClassName="p-0"
    >
      <svg
        viewBox={viewBox}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {graph.edges.map((e) => {
          const a = pos[e.u]
          const b = pos[e.v]
          const st = statuses.get(e.id) ?? "pending"
          const s = EDGE_STYLE[st]
          return (
            <motion.line
              key={e.id}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              strokeDasharray={s.dash}
              strokeLinecap="round"
              initial={false}
              animate={{ stroke: s.stroke, strokeWidth: s.width, opacity: s.opacity }}
            />
          )
        })}
        {graph.vertices.map((v) => {
          const p = pos[v]
          const ring = ringFor(frame, v)
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
                animate={{ fill: visited.has(v) ? "#16a34a" : "#94a3b8" }}
              />
              <text
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={13}
                fontWeight={600}
                fill="#ffffff"
              >
                {v}
              </text>
            </g>
          )
        })}
      </svg>
    </Panel>
  )
}
