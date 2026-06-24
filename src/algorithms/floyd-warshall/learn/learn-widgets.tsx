import { Fragment, useMemo, useState, type ReactNode } from "react"
import { Minus, Pause, Play, Plus, StepBack, StepForward } from "lucide-react"
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
import { cellFormula, cellRole } from "@/algorithms/floyd-warshall/playback/highlight"
import { usePlayer, type Player } from "@/algorithms/shared/playback/use-player"
import {
  abcdefPreset,
  pqrsPreset,
  xyzPreset,
} from "@/store/directed-presets"
import type { XY } from "@/store/directed-graph-store"
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
  large = false,
}: {
  order: readonly Vertex[]
  frame: FwFrame
  /** Великі комірки (≈3×) — для інтерактивного sweep. */
  large?: boolean
}) {
  const n = order.length
  const m = frame.matrix
  const headPivot =
    "bg-indigo-500/20 font-semibold text-indigo-700 dark:text-indigo-300"
  const headPlain = "bg-muted/60 font-semibold text-muted-foreground"
  const pad = large ? "px-3 py-2" : "px-1 py-0.5"
  const colMin = large ? "4.8rem" : "1.6rem"

  return (
    <span
      className={cn(
        "grid w-max gap-px text-center tabular-nums",
        large ? "text-lg" : "text-xs",
      )}
      style={{ gridTemplateColumns: `auto repeat(${n}, minmax(${colMin}, 1fr))` }}
    >
      <span className={cn(pad, headPlain)}>·</span>
      {order.map((v, c) => (
        <span key={`c-${v}`} className={cn(pad, c === frame.k ? headPivot : headPlain)}>
          {v}
        </span>
      ))}
      {order.map((vi, r) => (
        <Fragment key={`r-${vi}`}>
          <span className={cn(pad, r === frame.k ? headPivot : headPlain)}>
            {vi}
          </span>
          {m[r].map((val, c) => {
            const role = cellRole(frame, r, c)
            const empty = val === INF
            return (
              <span
                key={c}
                className={cn(
                  "border border-border/40",
                  pad,
                  role.summand
                    ? "bg-sky-400/40"
                    : role.improved
                      ? "bg-emerald-400/35"
                      : role.pivot
                        ? "bg-indigo-500/10"
                        : undefined,
                  role.target && "ring-2 ring-inset ring-amber-500 font-semibold",
                  r === c &&
                    !role.improved &&
                    !role.target &&
                    "text-muted-foreground",
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
      <span className="mb-2 block min-h-[3em] text-xs text-muted-foreground">
        {frame.caption}
      </span>
      <span className="block overflow-auto">
        <MiniMatrix order={result.order} frame={frame} large />
      </span>
    </span>
  )
}

function SweepSwatch({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={cn("inline-block size-3 rounded-sm border", className)} />
      {children}
    </span>
  )
}

/**
 * Інтерактивний sweep двох внутрішніх циклів за фіксованого `k`: крок за кроком
 * перебираємо всі пари (i, j), з підписами й формулою кожної клітинки. Жива
 * заміна gif `sweep_*_k_*` — той самий зміст, але з контролерами.
 */
export function FwSweepWidget({ preset, k }: { preset: PresetId; k: number }) {
  const { graph } = useMemo(() => presetFor(preset), [preset])
  const { trace, result } = useMemo(() => buildFloydWarshallTrace(graph), [graph])
  const n = result.order.length
  const ki = Math.min(Math.max(k, 0), n - 1)
  const frames = useMemo(
    () => trace.frames.filter((f) => f.k === ki),
    [trace, ki],
  )
  const player = usePlayer(frames.length, frames)
  const frame = frames[Math.min(player.index, frames.length - 1)]
  const formula = cellFormula(frame, result.order)
  const kl = result.order[ki]

  return (
    <span className="not-prose my-4 block rounded-lg border bg-card p-3">
      <span className="mb-2 block text-xs text-muted-foreground">
        Два внутрішні цикли за фіксованого <b>k = {kl}</b>: по черзі перебираємо
        всі пари (i, j).
      </span>
      <MiniControls player={player} count={frames.length} />
      <span className="mb-2 block min-h-[3em] text-xs text-muted-foreground">
        {frame.caption}
      </span>
      <span className="block overflow-auto">
        <MiniMatrix order={result.order} frame={frame} large />
      </span>
      {formula && (
        <span className="mt-2 block font-mono text-lg leading-snug">
          <span className="block text-muted-foreground">
            {formula.target} = min( {formula.target}, {formula.termIK} +{" "}
            {formula.termKJ} )
          </span>
          <span className="block">
            = min( {formula.curr}, {formula.viaText} ) ={" "}
            <b
              className={
                formula.improved
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-foreground"
              }
            >
              {formula.result}
            </b>
          </span>
        </span>
      )}
      <span className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[22px] text-muted-foreground">
        <SweepSwatch className="ring-2 ring-inset ring-amber-500">
          поточна (i, j)
        </SweepSwatch>
        <SweepSwatch className="bg-sky-400/40">
          доданки D[i][{kl}], D[{kl}][j]
        </SweepSwatch>
        <SweepSwatch className="bg-emerald-400/35">покращено</SweepSwatch>
        <SweepSwatch className="bg-indigo-500/10">
          рядок/стовпець {kl}
        </SweepSwatch>
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
        <MiniMatrix order={result.order} frame={frame} large />
      </span>
    </span>
  )
}

/**
 * Велика матриця D з ПОКЛІТИННИМИ формулами для кроку `k` (як на оригінальному
 * рисунку README): кожна клітинка показує
 *   D[i][j] = min( D[i][j], D[i][k] + D[k][j] ) = min( стара, via ) = результат.
 * Рядок і стовпець k на цьому кроці незмінні (підсвічені); покращення — зелене.
 */
export function FwMatrixDerivation({
  preset,
  k,
}: {
  preset: PresetId
  k: number
}) {
  const { graph } = useMemo(() => presetFor(preset), [preset])
  const { trace, result } = useMemo(() => buildFloydWarshallTrace(graph), [graph])
  const steps = useMemo(() => kStepFrames(trace), [trace]) // [init, k0, k1, …]
  const order = result.order
  const n = order.length
  const ki = Math.min(Math.max(k, 0), n - 1)
  const before = steps[ki].matrix // D до кроку k (== після k−1)
  const kl = order[ki]
  const fmt = (x: number): string => (x === INF ? "∞" : String(x))
  const headPivot =
    "bg-indigo-500/20 font-semibold text-indigo-700 dark:text-indigo-300"
  const headPlain = "bg-muted/60 font-semibold text-muted-foreground"
  // Стилізований тултіп-картка (тема застосунку), спливає при наведенні.
  const tipCls =
    "pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 hidden w-max max-w-[16rem] -translate-x-1/2 whitespace-normal rounded-md border bg-popover px-2.5 py-1.5 text-left text-sm font-normal leading-snug text-popover-foreground shadow-lg group-hover:block"

  return (
    <span className="not-prose my-4 block rounded-lg border bg-card p-3">
      <span className="mb-2 block text-base text-muted-foreground">
        Крок <b>k = {kl}</b>. Для кожної клітинки:{" "}
        <span className="font-mono">
          D[i][j] = min( D[i][j], D[i][{kl}] + D[{kl}][j] )
        </span>
        . Рядок і стовпець <b>{kl}</b> на цьому кроці незмінні. У клітинці —
        результат; наведіть на неї, щоб побачити повну формулу.
      </span>
      <span className="mb-3 flex flex-col gap-1 text-xl text-indigo-700 dark:text-indigo-300">
        <span className="block">
          🟦 Стовпець <b>{kl}</b> містить{" "}
          <span className="font-mono">D[i][{kl}]</span> — відстань <b>до {kl}</b>.
        </span>
        <span className="block">
          🟦 Рядок <b>{kl}</b> містить{" "}
          <span className="font-mono">D[{kl}][j]</span> — відстань <b>від {kl}</b>.
        </span>
      </span>
      <span className="block">
        <span
          className="grid w-max gap-px text-center tabular-nums"
          style={{ gridTemplateColumns: `auto repeat(${n}, minmax(3.5rem, 1fr))` }}
        >
          <span className={cn("px-1 py-1 text-xs", headPlain)}>i\j</span>
          {order.map((v, c) => (
            <span key={`c-${v}`} className={cn("px-1 py-1", c === ki ? headPivot : headPlain)}>
              {v}
            </span>
          ))}
          {order.map((vi, i) => (
            <Fragment key={`r-${vi}`}>
              <span className={cn("px-2 py-1", i === ki ? headPivot : headPlain)}>
                {vi}
              </span>
              {order.map((vj, j) => {
                const old = before[i][j]
                const a = before[i][ki]
                const b = before[ki][j]
                const via = a === INF || b === INF ? INF : a + b
                const res = Math.min(old, via)
                const improved = via < old
                const pivot = i === ki || j === ki
                const cellCls = improved
                  ? "border-emerald-500 bg-emerald-400/30"
                  : pivot
                    ? "border-indigo-400 bg-indigo-500/20"
                    : "border-border/40"
                const resColor = improved
                  ? "text-emerald-600 dark:text-emerald-400"
                  : res < 0
                    ? "text-destructive"
                    : "text-foreground"

                // Діагональ і рядок k — нерухомі: значення + коротка тултіп-картка.
                if (i === j || i === ki) {
                  return (
                    <span
                      key={j}
                      className={cn(
                        "group relative flex items-center justify-center border px-1 py-2 text-[28px] font-semibold leading-none",
                        cellCls,
                        i === j && "text-muted-foreground",
                        res < 0 && "text-destructive",
                      )}
                    >
                      {fmt(res)}
                      <span className={tipCls}>
                        <span className="font-mono">
                          D[{vi}][{vj}] = {fmt(res)}
                        </span>{" "}
                        <span className="text-muted-foreground">
                          ({i === j ? "діагональ" : `рядок ${kl} незмінний`})
                        </span>
                      </span>
                    </span>
                  )
                }

                // Клітинка з формулою: у клітинці лише результат, формула — у тултіп-картці.
                return (
                  <span
                    key={j}
                    className={cn(
                      "group relative flex cursor-help items-center justify-center border px-1 py-2 text-[28px] leading-none",
                      cellCls,
                    )}
                  >
                    <b className={resColor}>{fmt(res)}</b>
                    <span className={tipCls}>
                      <span className="block font-mono text-muted-foreground">
                        D[{vi}][{vj}] = min( D[{vi}][{vj}], D[{vi}][{kl}]+D[{kl}][{vj}] )
                      </span>
                      <span className="block font-mono">
                        = min( {fmt(old)}, {fmt(via)} ) ={" "}
                        <b className={resColor}>{fmt(res)}</b>
                      </span>
                    </span>
                  </span>
                )
              })}
            </Fragment>
          ))}
        </span>
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
                fontSize={12}
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

/** Посилання на відео-версію анімації (з оригінального проєкту, з контролерами). */
export function VideoLink({ url, label }: { url: string; label?: string }) {
  return (
    <span className="not-prose my-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-center text-sm">
      <span className="text-muted-foreground">
        🎞️ Та сама анімація як відео з контролерами (play / пауза / перемотка):
      </span>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="font-medium text-primary underline"
      >
        ▶️ {label ?? "дивитися відео"}
      </a>
    </span>
  )
}

/** Інтерактив: вага шляху по циклу X→Y→Z→X (−3 за обхід) прямує до −∞. */
export function NegCycleWeightWidget() {
  const [laps, setLaps] = useState(2)
  const weight = laps * -3

  return (
    <span className="not-prose my-4 block rounded-lg border bg-card p-3">
      <span className="mb-2 block text-xs text-muted-foreground">
        Кожен обхід циклу X → Y → Z → X додає до шляху вагу −3 (три ребра по −1).
        Що більше обходів — то «коротша» відстань; справжнього мінімуму немає —
        вага прямує до −∞. Тому Флойд–Воршал не визначений на від'ємних циклах.
      </span>
      <span className="mb-2 flex items-center justify-center gap-3">
        <Button
          size="icon-sm"
          variant="outline"
          onClick={() => setLaps((n) => Math.max(0, n - 1))}
          disabled={laps <= 0}
          title="Менше обходів"
        >
          <Minus />
        </Button>
        <span className="text-sm tabular-nums">
          обходів: <b>{laps}</b>
        </span>
        <Button
          size="icon-sm"
          variant="outline"
          onClick={() => setLaps((n) => Math.min(30, n + 1))}
          title="Більше обходів"
        >
          <Plus />
        </Button>
      </span>
      <span className="block text-center text-sm">
        вага = {laps} × (−3) ={" "}
        <b className="tabular-nums text-destructive">{weight}</b>
        {laps >= 6 && <span className="text-muted-foreground"> → −∞</span>}
      </span>
    </span>
  )
}
