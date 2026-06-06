import { useMemo } from "react"
import { Pause, Play, StepBack, StepForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Vertex } from "@/lib/graph"
import { kruskalHasPath } from "@/lib/kruskalHasPath"
import type { Frame } from "@/lib/trace"
import {
  colorByRoot,
  componentRoots,
  edgeStatuses,
  type EdgeStatus,
} from "@/features/playback/highlight"
import { usePlayer } from "@/features/playback/use-player"
import { examplePreset } from "@/store/presets"

const EDGE_STYLE: Record<
  EdgeStatus,
  { stroke: string; width: number; dash?: string; opacity: number }
> = {
  accepted: { stroke: "#16a34a", width: 4, opacity: 1 },
  current: { stroke: "#d97706", width: 4, dash: "7 4", opacity: 1 },
  rejected: { stroke: "#ef4444", width: 1.5, dash: "4 4", opacity: 0.4 },
  pending: { stroke: "#94a3b8", width: 1.5, opacity: 0.85 },
}

function bfsRing(v: Vertex, sub: Frame["sub"]): { stroke: string; dash?: string } | null {
  if (sub.kind === "bfs-visit") {
    if (sub.at === v) return { stroke: "#d97706" }
    if (sub.frontier.includes(v)) return { stroke: "#d97706", dash: "3 3" }
    if (sub.visited.includes(v)) return { stroke: "#2563eb" }
  } else if (sub.kind === "bfs-exhausted") {
    if (sub.visited.includes(v)) return { stroke: "#2563eb" }
  }
  return null
}

/** Вбудований міні-плеєр наївної версії: граф із компонентами + BFS-підсвітка. */
export function HasPathStepsWidget() {
  const { graph, positions } = useMemo(() => examplePreset(), [])
  const { trace } = useMemo(() => kruskalHasPath(graph), [graph])
  const player = usePlayer(trace.frames.length, trace)
  const frame = trace.frames[Math.min(player.index, trace.frames.length - 1)]
  const colors = colorByRoot(componentRoots(graph, frame))
  const statuses = edgeStatuses(trace, frame)

  const xs = graph.vertices.map((v) => positions[v].x)
  const ys = graph.vertices.map((v) => positions[v].y)
  const pad = 32
  const minX = Math.min(...xs) - pad
  const maxX = Math.max(...xs) + pad
  const minY = Math.min(...ys) - pad
  const maxY = Math.max(...ys) + pad
  const viewBox = `${minX} ${minY} ${maxX - minX} ${maxY - minY}`

  return (
    <span className="not-prose my-4 block rounded-lg border bg-card p-3">
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
          disabled={player.index >= trace.frames.length - 1}
          title="Крок вперед"
        >
          <StepForward />
        </Button>
        <span className="text-xs tabular-nums text-muted-foreground">
          {player.index + 1} / {trace.frames.length}
        </span>
      </span>

      <span className="mb-2 block min-h-[2.5em] text-xs text-muted-foreground">
        {frame.caption}
      </span>

      <svg viewBox={viewBox} className="h-[280px] w-full" preserveAspectRatio="xMidYMid meet">
        {graph.edges.map((e) => {
          const a = positions[e.u]
          const b = positions[e.v]
          const s = EDGE_STYLE[statuses.get(e.id) ?? "pending"]
          const mx = (a.x + b.x) / 2
          const my = (a.y + b.y) / 2
          return (
            <g key={e.id}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={s.stroke} strokeWidth={s.width} strokeDasharray={s.dash} strokeLinecap="round" opacity={s.opacity} />
              <rect x={mx - 10} y={my - 9} width={20} height={18} rx={4} opacity={0.9} style={{ fill: "var(--card)" }} />
              <text x={mx} y={my} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600} style={{ fill: "var(--foreground)" }}>
                {e.weight}
              </text>
            </g>
          )
        })}
        {graph.vertices.map((v) => {
          const p = positions[v]
          const ring = bfsRing(v, frame.sub)
          return (
            <g key={v}>
              {ring && (
                <circle cx={p.x} cy={p.y} r={20} fill="none" stroke={ring.stroke} strokeWidth={2.5} strokeDasharray={ring.dash} />
              )}
              <circle cx={p.x} cy={p.y} r={15} fill={colors.get(v) ?? "#94a3b8"} stroke="#ffffff" strokeWidth={2} />
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
