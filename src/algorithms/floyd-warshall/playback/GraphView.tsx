import { Panel } from "@/algorithms/shared/playback/Panel"
import type { FwFrame } from "@/lib/floydWarshallTrace"
import { useT } from "@/i18n/use-t"
import {
  directedEdgeId,
  type DirectedGraph,
  type Vertex,
} from "@/lib/directedGraph"
import { circularLayout } from "@/store/presets"
import type { XY } from "@/store/directed-graph-store"

const R = 17 // радіус вузла

// Кольори ролей вершин на кадрі.
const C_I = "#2563eb" // звідки (i)
const C_J = "#d97706" // куди (j)
const C_K = "#9333ea" // проміжна (k)

/**
 * Орієнтований граф під час програвання. Стрілки — напрям ребер; кільця
 * виділяють активні вершини i (звідки), j (куди), k (проміжна). На кадрі
 * порівняння пунктир показує маршрут «i → k → j», який зараз перевіряємо.
 */
export function GraphView({
  graph,
  positions,
  frame,
  order,
  className,
}: {
  graph: DirectedGraph
  positions: Record<Vertex, XY>
  frame: FwFrame
  order: readonly Vertex[]
  className?: string
}) {
  const t = useT()
  const allHavePos = graph.vertices.every((v) => positions[v])
  const pos = allHavePos ? positions : circularLayout(graph.vertices)

  const iV = frame.cell ? order[frame.cell[0]] : null
  const jV = frame.cell ? order[frame.cell[1]] : null
  const kV = frame.k !== null ? order[frame.k] : null

  const xs = graph.vertices.map((v) => pos[v].x)
  const ys = graph.vertices.map((v) => pos[v].y)
  const pad = 40
  const minX = Math.min(...xs, 0) - pad
  const maxX = Math.max(...xs, 100) + pad
  const minY = Math.min(...ys, 0) - pad
  const maxY = Math.max(...ys, 100) + pad
  const viewBox = `${minX} ${minY} ${maxX - minX} ${maxY - minY}`

  const edgeExists = (from: Vertex, to: Vertex): boolean =>
    graph.edges.some((e) => e.id === directedEdgeId(from, to))

  return (
    <Panel title={t("play.graphDirected")} className={className} bodyClassName="p-0">
      <svg
        viewBox={viewBox}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <marker
            id="fw-arrow"
            markerWidth="9"
            markerHeight="9"
            refX="7.5"
            refY="4"
            orient="auto-start-reverse"
          >
            <path d="M0,0 L8,4 L0,8 z" fill="#94a3b8" />
          </marker>
        </defs>

        {/* пунктирний маршрут i → k → j, що перевіряємо */}
        {iV && jV && kV && (
          <g opacity={0.9}>
            <ViaLink a={pos[iV]} b={pos[kV]} color={C_K} />
            <ViaLink a={pos[kV]} b={pos[jV]} color={C_K} />
            <ViaLink a={pos[iV]} b={pos[jV]} color={C_J} dash="2 5" />
          </g>
        )}

        {graph.edges.map((e) => {
          const a = pos[e.from]
          const b = pos[e.to]
          const twoWay = edgeExists(e.to, e.from)
          const seg = segment(a, b, twoWay ? offsetSign(e.from, e.to) : 0)
          const mx = (seg.x1 + seg.x2) / 2
          const my = (seg.y1 + seg.y2) / 2
          return (
            <g key={e.id}>
              <line
                x1={seg.x1}
                y1={seg.y1}
                x2={seg.x2}
                y2={seg.y2}
                stroke={e.weight < 0 ? "#ef4444" : "#94a3b8"}
                strokeWidth={1.6}
                markerEnd="url(#fw-arrow)"
              />
              <rect
                x={mx - 10}
                y={my - 9}
                width={20}
                height={18}
                rx={4}
                opacity={0.92}
                style={{ fill: "var(--card)" }}
              />
              <text
                x={mx}
                y={my}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={11}
                fontWeight={600}
                style={{ fill: e.weight < 0 ? "#ef4444" : "var(--foreground)" }}
              >
                {e.weight}
              </text>
            </g>
          )
        })}

        {graph.vertices.map((v) => {
          const p = pos[v]
          const ring =
            v === kV ? C_K : v === iV ? C_I : v === jV ? C_J : null
          const fill =
            v === kV ? C_K : v === iV ? C_I : v === jV ? C_J : "#64748b"
          return (
            <g key={v}>
              {ring && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={R + 5}
                  fill="none"
                  stroke={ring}
                  strokeWidth={3}
                />
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r={R}
                fill={fill}
                stroke="#ffffff"
                strokeWidth={2}
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

      <div className="flex flex-wrap gap-x-3 gap-y-1 border-t px-3 py-2 text-[11px] text-muted-foreground">
        <Dot color={C_I}>{t("play.legIFrom")}</Dot>
        <Dot color={C_K}>{t("play.legKInter")}</Dot>
        <Dot color={C_J}>{t("play.legJTo")}</Dot>
      </div>
    </Panel>
  )
}

/** Пунктирний конектор між центрами двох вершин (з відступом від кіл). */
function ViaLink({
  a,
  b,
  color,
  dash = "5 4",
}: {
  a: XY
  b: XY
  color: string
  dash?: string
}) {
  const seg = segment(a, b, 0)
  return (
    <line
      x1={seg.x1}
      y1={seg.y1}
      x2={seg.x2}
      y2={seg.y2}
      stroke={color}
      strokeWidth={2.5}
      strokeDasharray={dash}
      strokeLinecap="round"
    />
  )
}

interface Seg {
  x1: number
  y1: number
  x2: number
  y2: number
}

/**
 * Відрізок від краю вузла a до краю вузла b (скорочений на радіус R), з
 * перпендикулярним зсувом `off` (для розведення зустрічної пари ребер).
 */
function segment(a: XY, b: XY, off: number): Seg {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  const px = -uy * off
  const py = ux * off
  return {
    x1: a.x + ux * R + px,
    y1: a.y + uy * R + py,
    x2: b.x - ux * (R + 4) + px,
    y2: b.y - uy * (R + 4) + py,
  }
}

/** Стабільний знак зсуву для зустрічної пари (щоб ребра розійшлися). */
function offsetSign(from: Vertex, to: Vertex): number {
  return from < to ? 9 : -9
}

function Dot({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className="inline-block size-2.5 rounded-full"
        style={{ background: color }}
      />
      {children}
    </span>
  )
}
