import { motion } from "motion/react"
import type { Graph, Vertex } from "@/lib/graph"
import type { PrimFrame } from "@/lib/primTrace"
import {
  edgeStatuses,
  vertexRole,
  type PrimEdgeStatus,
} from "@/algorithms/prim/playback/highlight"
import { Panel } from "@/algorithms/shared/playback/Panel"
import { useT } from "@/i18n/use-t"
import { circularLayout } from "@/store/presets"
import type { XY } from "@/store/prim-graph-store"

const EDGE_STYLE: Record<
  PrimEdgeStatus,
  { stroke: string; width: number; dash?: string; opacity: number }
> = {
  tree: { stroke: "#16a34a", width: 4, opacity: 1 },
  candidate: { stroke: "#2563eb", width: 2, dash: "6 4", opacity: 0.9 },
  stale: { stroke: "#94a3b8", width: 1.5, dash: "3 4", opacity: 0.4 },
  popped: { stroke: "#ef4444", width: 4, opacity: 1 },
  poppedSkip: { stroke: "#ef4444", width: 2, dash: "5 4", opacity: 0.7 },
  pending: { stroke: "#94a3b8", width: 1.5, opacity: 0.65 },
}

interface Ring {
  stroke: string
  width: number
  dash?: string
}

function ringFor(frame: PrimFrame, v: Vertex): Ring | null {
  const r = vertexRole(frame, v)
  if (r.justAdded) return { stroke: "#d97706", width: 3 }
  if (r.examining) return { stroke: "#d97706", width: 2.5, dash: "3 3" }
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
  frame: PrimFrame
  title?: string
  className?: string
}) {
  const t = useT()
  const allHavePos = graph.vertices.every((v) => positions[v])
  const pos = allHavePos ? positions : circularLayout(graph.vertices)
  const statuses = edgeStatuses(frame)
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
      title={title ?? t("play.primGraph")}
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
              <rect
                x={mx - 11}
                y={my - 9}
                width={22}
                height={18}
                rx={4}
                opacity={0.9}
                style={{ fill: "var(--card)" }}
              />
              <text
                x={mx}
                y={my}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={12}
                fontWeight={600}
                style={{ fill: "var(--foreground)" }}
              >
                {e.weight}
              </text>
            </g>
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
