import { useEffect, useMemo } from "react"
import type { Graph, Vertex } from "@/lib/graph"
import { kruskalDsu } from "@/lib/kruskalDsu"
import { kruskalHasPath } from "@/lib/kruskalHasPath"
import type { Frame, Trace } from "@/lib/trace"
import {
  colorByRoot,
  componentRoots,
  decisionFrameIndices,
  edgeStatuses,
  type EdgeStatus,
} from "@/algorithms/kruskal/playback/highlight"
import { MiniPlayerShell } from "@/algorithms/shared/learn/MiniPlayerShell"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { examplePreset } from "@/store/presets"

type Positions = Record<Vertex, { x: number; y: number }>

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

/** Кадр для «фокусу» на конкретному ребрі: для наївної — стан BFS, інакше рішення. */
export function seekForEdge(trace: Trace, edgeId: string, preferBfs: boolean): number {
  if (preferBfs) {
    for (let i = trace.frames.length - 1; i >= 0; i--) {
      const f = trace.frames[i]
      if (
        f.consideredEdgeId === edgeId &&
        (f.sub.kind === "bfs-visit" || f.sub.kind === "bfs-exhausted")
      ) {
        return i
      }
    }
  }
  for (let i = trace.frames.length - 1; i >= 0; i--) {
    const f = trace.frames[i]
    if (f.consideredEdgeId === edgeId && f.decision !== null) return i
  }
  for (let i = trace.frames.length - 1; i >= 0; i--) {
    if (trace.frames[i].consideredEdgeId === edgeId) return i
  }
  return -1
}

/** Span-граф для одного кадру: кольори компонент, статуси ребер, опц. BFS. */
function GraphCanvas({
  graph,
  positions,
  trace,
  frame,
  showBfs = false,
  height = 280,
}: {
  graph: Graph
  positions: Positions
  trace: Trace
  frame: Frame
  showBfs?: boolean
  height?: number
}) {
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
    <svg viewBox={viewBox} style={{ height }} className="w-full" preserveAspectRatio="xMidYMid meet">
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
        const ring = showBfs ? bfsRing(v, frame.sub) : null
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
  )
}

/** Вбудований міні-плеєр однієї версії: граф із компонентами (+ BFS для наївної). */
export function GraphStepsWidget({
  algo,
  focusEdge,
}: {
  algo: "dsu" | "hasPath"
  focusEdge?: string
}) {
  const { graph, positions } = useMemo(() => examplePreset(), [])
  const { trace } = useMemo(
    () => (algo === "dsu" ? kruskalDsu(graph) : kruskalHasPath(graph)),
    [algo, graph],
  )
  const player = usePlayer(trace.frames.length, trace)

  useEffect(() => {
    if (!focusEdge) return
    const i = seekForEdge(trace, focusEdge, algo === "hasPath")
    if (i >= 0) player.dispatch({ type: "seek", index: i })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trace, focusEdge, algo])

  const frame = trace.frames[Math.min(player.index, trace.frames.length - 1)]

  return (
    <MiniPlayerShell player={player} frameCount={trace.frames.length} caption={frame.caption}>
      <GraphCanvas graph={graph} positions={positions} trace={trace} frame={frame} showBfs={algo === "hasPath"} />
    </MiniPlayerShell>
  )
}

/** Вбудоване порівняння наївної та DSU на одному кроці-ребрі (синхронно). */
export function CompareStepsWidget({ focusEdge }: { focusEdge?: string }) {
  const { graph, positions } = useMemo(() => examplePreset(), [])
  const dsu = useMemo(() => kruskalDsu(graph), [graph])
  const naive = useMemo(() => kruskalHasPath(graph), [graph])
  const dsuDec = useMemo(() => decisionFrameIndices(dsu.trace), [dsu])
  const naiveDec = useMemo(() => decisionFrameIndices(naive.trace), [naive])
  const steps = Math.max(1, Math.min(dsuDec.length, naiveDec.length))
  const player = usePlayer(steps, graph)

  useEffect(() => {
    if (!focusEdge) return
    const k = dsuDec.findIndex(
      (fi) => dsu.trace.frames[fi].consideredEdgeId === focusEdge,
    )
    if (k >= 0) player.dispatch({ type: "seek", index: k })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusEdge, dsuDec, dsu])

  const k = Math.min(player.index, steps - 1)
  const dsuFrame = dsu.trace.frames[dsuDec[k]]
  const naiveFrame = naive.trace.frames[naiveDec[k]]
  const caption = `Наївна: ${naiveFrame.caption} · DSU: ${dsuFrame.caption}`

  return (
    <MiniPlayerShell player={player} frameCount={steps} caption={caption}>
      <span className="flex flex-col gap-3 sm:flex-row">
        <span className="block flex-1">
          <span className="mb-1 block text-center text-sm font-medium">
            Наївна — BFS у лісі
          </span>
          <GraphCanvas graph={graph} positions={positions} trace={naive.trace} frame={naiveFrame} showBfs height={230} />
        </span>
        <span className="block flex-1">
          <span className="mb-1 block text-center text-sm font-medium">
            DSU — компоненти
          </span>
          <GraphCanvas graph={graph} positions={positions} trace={dsu.trace} frame={dsuFrame} height={230} />
        </span>
      </span>
    </MiniPlayerShell>
  )
}
