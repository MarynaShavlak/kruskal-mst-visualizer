import { Fragment, useMemo } from "react"
import { Pause, Play, StepBack, StepForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  directedEdgeId,
  type DirectedGraph,
  type Vertex,
} from "@/lib/directedGraph"
import { INF, reconstructPath } from "@/lib/floydWarshall"
import {
  buildFloydWarshallTrace,
  type FwFrame,
  type FwTrace,
} from "@/lib/floydWarshallTrace"
import { cellRole } from "@/algorithms/floyd-warshall/playback/highlight"
import { usePlayer, type Player } from "@/algorithms/floyd-warshall/playback/use-player"
import {
  abcdefPreset,
  pqrsPreset,
  xyzPreset,
} from "@/store/directed-presets"
import type { XY } from "@/store/directed-graph-store"
import { setHash } from "@/hooks/use-route"
import { cn } from "@/lib/utils"

export type PresetId = "abcdef" | "pqrs" | "xyz"

function presetFor(id: PresetId): { graph: DirectedGraph; positions: Record<Vertex, XY> } {
  if (id === "pqrs") return pqrsPreset()
  if (id === "xyz") return xyzPreset()
  return abcdefPreset()
}

/** Кадри «після кожної проміжної вершини k» (init + усі k-done) — для евакуації. */
function kStepFrames(trace: FwTrace): FwFrame[] {
  return trace.frames.filter(
    (f) => f.sub.kind === "init" || f.sub.kind === "k-done",
  )
}

// ── Компактна матриця D одного кадру (span-only, для markdown) ────────────────

function MiniMatrix({
  order,
  frame,
}: {
  order: readonly Vertex[]
  frame: FwFrame
}) {
  const n = order.length
  const m = frame.matrix
  const headPivot =
    "bg-indigo-500/20 font-semibold text-indigo-700 dark:text-indigo-300"
  const headPlain = "bg-muted/60 font-semibold text-muted-foreground"

  return (
    <span
      className="grid w-max gap-px text-center text-xs tabular-nums"
      style={{ gridTemplateColumns: `auto repeat(${n}, minmax(1.6rem, 1fr))` }}
    >
      <span className={cn("px-1 py-0.5", headPlain)}>·</span>
      {order.map((v, c) => (
        <span key={`c-${v}`} className={cn("px-1 py-0.5", c === frame.k ? headPivot : headPlain)}>
          {v}
        </span>
      ))}
      {order.map((vi, r) => (
        <Fragment key={`r-${vi}`}>
          <span className={cn("px-1 py-0.5", r === frame.k ? headPivot : headPlain)}>
            {vi}
          </span>
          {m[r].map((val, c) => {
            const role = cellRole(frame, r, c)
            const empty = val === INF
            return (
              <span
                key={c}
                className={cn(
                  "border border-border/40 px-1 py-0.5",
                  role.improved
                    ? "bg-emerald-400/35"
                    : role.pivot
                      ? "bg-indigo-500/10"
                      : undefined,
                  r === c && !role.improved && "text-muted-foreground",
                  empty && "text-muted-foreground/40",
                  !empty && val < 0 && "font-semibold text-destructive",
                )}
              >
                {empty ? "∞" : val}
              </span>
            )
          })}
        </Fragment>
      ))}
    </span>
  )
}

function MiniControls({ player, count }: { player: Player; count: number }) {
  return (
    <span className="mb-2 flex flex-wrap items-center gap-2">
      <Button
        size="icon-sm"
        variant="outline"
        onClick={() => player.dispatch({ type: "prev" })}
        disabled={player.index <= 0}
        title="Крок назад"
      >
        <StepBack />
      </Button>
      <Button
        size="icon"
        onClick={() => player.dispatch({ type: "toggle" })}
        title={player.isPlaying ? "Пауза" : "Грати"}
      >
        {player.isPlaying ? <Pause /> : <Play />}
      </Button>
      <Button
        size="icon-sm"
        variant="outline"
        onClick={() => player.dispatch({ type: "next" })}
        disabled={player.index >= count - 1}
        title="Крок вперед"
      >
        <StepForward />
      </Button>
      <span className="text-xs tabular-nums text-muted-foreground">
        {player.index + 1} / {count}
      </span>
    </span>
  )
}

/** Інтерактивний міні-плеєр: матриця D «дозріває» крок за кроком по `k`. */
export function FwMatrixWidget({ preset }: { preset: PresetId }) {
  const { graph } = useMemo(() => presetFor(preset), [preset])
  const { trace, result } = useMemo(() => buildFloydWarshallTrace(graph), [graph])
  const frames = useMemo(() => kStepFrames(trace), [trace])
  const player = usePlayer(frames.length, frames)
  const frame = frames[Math.min(player.index, frames.length - 1)]

  return (
    <span className="not-prose my-4 block rounded-lg border bg-card p-3">
      <MiniControls player={player} count={frames.length} />
      <span className="mb-2 block min-h-[2.5em] text-xs text-muted-foreground">
        {frame.caption}
      </span>
      <span className="block overflow-auto">
        <MiniMatrix order={result.order} frame={frame} />
      </span>
    </span>
  )
}

/** Статичний знімок матриці D: початковий, фінальний або після вершини k. */
export function FwMatrixSnapshot({
  preset,
  at,
}: {
  preset: PresetId
  at: "initial" | "final" | number
}) {
  const { graph } = useMemo(() => presetFor(preset), [preset])
  const { trace, result } = useMemo(() => buildFloydWarshallTrace(graph), [graph])
  const steps = useMemo(() => kStepFrames(trace), [trace]) // [init, k=0, k=1, …]
  const frame =
    at === "initial"
      ? steps[0]
      : at === "final"
        ? steps[steps.length - 1]
        : steps[Math.min(at + 1, steps.length - 1)]

  return (
    <span className="not-prose my-4 block rounded-lg border bg-card p-3">
      <span className="mb-2 block text-xs text-muted-foreground">
        {frame.caption}
      </span>
      <span className="block overflow-auto">
        <MiniMatrix order={result.order} frame={frame} />
      </span>
    </span>
  )
}

// ── Статичний орієнтований граф (з опційним підсвіченим шляхом) ───────────────

const NODE_R = 16

interface Seg {
  x1: number
  y1: number
  x2: number
  y2: number
}

function segment(a: XY, b: XY, off: number): Seg {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  const px = -uy * off
  const py = ux * off
  return {
    x1: a.x + ux * NODE_R + px,
    y1: a.y + uy * NODE_R + py,
    x2: b.x - ux * (NODE_R + 4) + px,
    y2: b.y - uy * (NODE_R + 4) + py,
  }
}

/** Орієнтований граф пресету; якщо задано `path` — підсвічує найкоротший маршрут. */
export function FwGraphWidget({
  preset,
  path,
}: {
  preset: PresetId
  path?: [string, string]
}) {
  const { graph, positions } = useMemo(() => presetFor(preset), [preset])
  const { result } = useMemo(() => buildFloydWarshallTrace(graph), [graph])
  const order = result.order

  const { pathEdges, pathVertices } = useMemo(() => {
    const edges = new Set<string>()
    const verts = new Set<string>()
    if (path && !result.hasNegativeCycle) {
      const u = order.indexOf(path[0])
      const v = order.indexOf(path[1])
      if (u >= 0 && v >= 0) {
        try {
          const idxs = reconstructPath(result.nxt, u, v)
          if (idxs) {
            idxs.forEach((ix) => verts.add(order[ix]))
            for (let t = 0; t + 1 < idxs.length; t++) {
              edges.add(directedEdgeId(order[idxs[t]], order[idxs[t + 1]]))
            }
          }
        } catch {
          /* від'ємний цикл — без підсвітки шляху */
        }
      }
    }
    return { pathEdges: edges, pathVertices: verts }
  }, [path, result, order])

  const xs = graph.vertices.map((v) => positions[v].x)
  const ys = graph.vertices.map((v) => positions[v].y)
  const pad = 38
  const minX = Math.min(...xs) - pad
  const maxX = Math.max(...xs) + pad
  const minY = Math.min(...ys) - pad
  const maxY = Math.max(...ys) + pad
  const viewBox = `${minX} ${minY} ${maxX - minX} ${maxY - minY}`

  const edgeColor = (id: string, negative: boolean): string => {
    if (pathEdges.has(id)) return "#16a34a"
    return negative ? "#ef4444" : "#94a3b8"
  }

  return (
    <span className="not-prose my-4 block rounded-lg border bg-card p-2">
      <svg viewBox={viewBox} className="h-[300px] w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          {[
            ["gray", "#94a3b8"],
            ["green", "#16a34a"],
            ["red", "#ef4444"],
          ].map(([id, color]) => (
            <marker
              key={id}
              id={`fwl-arrow-${id}`}
              markerWidth="9"
              markerHeight="9"
              refX="7.5"
              refY="4"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L8,4 L0,8 z" fill={color} />
            </marker>
          ))}
        </defs>

        {graph.edges.map((e) => {
          const a = positions[e.from]
          const b = positions[e.to]
          const twoWay = graph.edges.some((o) => o.from === e.to && o.to === e.from)
          const seg = segment(a, b, twoWay ? (e.from < e.to ? 9 : -9) : 0)
          const onPath = pathEdges.has(e.id)
          const color = edgeColor(e.id, e.weight < 0)
          const markerId = onPath ? "green" : e.weight < 0 ? "red" : "gray"
          const mx = (seg.x1 + seg.x2) / 2
          const my = (seg.y1 + seg.y2) / 2
          return (
            <g key={e.id}>
              <line
                x1={seg.x1}
                y1={seg.y1}
                x2={seg.x2}
                y2={seg.y2}
                stroke={color}
                strokeWidth={onPath ? 3 : 1.6}
                markerEnd={`url(#fwl-arrow-${markerId})`}
              />
              <rect x={mx - 9} y={my - 8} width={18} height={16} rx={4} opacity={0.92} style={{ fill: "var(--card)" }} />
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
          const p = positions[v]
          const onPath = pathVertices.has(v)
          return (
            <g key={v}>
              {onPath && (
                <circle cx={p.x} cy={p.y} r={NODE_R + 4} fill="none" stroke="#16a34a" strokeWidth={3} />
              )}
              <circle cx={p.x} cy={p.y} r={NODE_R} fill={onPath ? "#16a34a" : "#0891b2"} stroke="#ffffff" strokeWidth={2} />
              <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={600} fill="#ffffff">
                {v}
              </text>
            </g>
          )
        })}
      </svg>
      {path && (
        <span className="mt-1 block text-center text-xs text-muted-foreground">
          Зелений — найкоротший шлях {path[0]} → {path[1]}.
        </span>
      )}
    </span>
  )
}

/** Запасна картка для статичних фігур без живого віджета (+ опційний перехід). */
export function FigureCard({
  caption,
  cta,
}: {
  caption: string
  cta?: { label: string; route: string }
}) {
  return (
    <span className="not-prose my-4 block rounded-lg border border-dashed bg-muted/30 p-4 text-center">
      <span className="block text-sm text-muted-foreground">{caption}</span>
      {cta && (
        <Button size="sm" variant="outline" className="mt-3" onClick={() => setHash(cta.route)}>
          {cta.label} →
        </Button>
      )}
    </span>
  )
}
