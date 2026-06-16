// Живі віджети навчальної вкладки Прима — заміна статичним фігурам README.
// Усе будується з реального trace (buildPrimTrace) / primMstLazy на демо-графах,
// тож «картинки» завжди узгоджені з алгоритмом. Покрокові й код-віджети
// перевикористовують панелі плеєра (GraphView/QueuePanel/CodePanel) і спільний
// MiniPlayerShell; концептуальні фігури малює легкий MiniGraph.

import { useMemo, useState, type ReactNode } from "react"
import type { Edge, Graph, Vertex } from "@/lib/graph"
import { primMstLazy } from "@/lib/prim"
import { buildPrimTrace, type PrimFrame, type PrimTrace } from "@/lib/primTrace"
import type { Translate } from "@/lib/translate"
import type { MessageKey } from "@/i18n/messages"
import { cn } from "@/lib/utils"
import { GraphView } from "@/algorithms/prim/playback/GraphView"
import { QueuePanel } from "@/algorithms/prim/playback/QueuePanel"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { MiniPlayerShell } from "@/algorithms/shared/learn/MiniPlayerShell"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { useT } from "@/i18n/use-t"
import { useLangStore } from "@/store/lang-store"
import { demoGraph, type DemoGraph, type XY } from "@/algorithms/prim/learn/learn-data"

// — Палітра (узгоджена з плеєром) ------------------------------------------
const C_TREE = "#16a34a"
const C_CAND = "#2563eb"
const C_CUT = "#d97706"
const C_DISCARD = "#ef4444"
const C_DIM = "#cbd5e1"
const C_NODE = "#64748b"
const C_SIDE_A = "#2563eb"
const C_SIDE_B = "#ea580c"

interface EdgeStyle {
  stroke: string
  width: number
  dash?: string
  opacity?: number
}

/** Обгортка фігури в потоці markdown (як у Хелда–Карпа/Краскала). */
function FigureBox({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "not-prose my-4 block rounded-lg border bg-card p-3",
        className,
      )}
    >
      {children}
    </span>
  )
}

/** Легкий SVG-граф для концептуальних фігур (стилі ребер/вершин — пропсами). */
function MiniGraph({
  graph,
  positions,
  edgeStyle,
  vertexFill,
  vertexRing,
  onVertexClick,
  showWeights = true,
  className,
}: {
  graph: Graph
  positions: Record<Vertex, XY>
  edgeStyle: (e: Edge) => EdgeStyle
  vertexFill: (v: Vertex) => string
  vertexRing?: (v: Vertex) => { stroke: string; width?: number; dash?: string } | null
  onVertexClick?: (v: Vertex) => void
  showWeights?: boolean
  className?: string
}) {
  const xs = graph.vertices.map((v) => positions[v].x)
  const ys = graph.vertices.map((v) => positions[v].y)
  const pad = 30
  const minX = Math.min(...xs) - pad
  const maxX = Math.max(...xs) + pad
  const minY = Math.min(...ys) - pad
  const maxY = Math.max(...ys) + pad
  const viewBox = `${minX} ${minY} ${maxX - minX} ${maxY - minY}`

  return (
    <svg
      viewBox={viewBox}
      className={cn("mx-auto block aspect-[4/3] w-full max-w-[440px]", className)}
      preserveAspectRatio="xMidYMid meet"
    >
      {graph.edges.map((e) => {
        const a = positions[e.u]
        const b = positions[e.v]
        const s = edgeStyle(e)
        const mx = (a.x + b.x) / 2
        const my = (a.y + b.y) / 2
        return (
          <g key={e.id}>
            <line
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={s.stroke}
              strokeWidth={s.width}
              strokeDasharray={s.dash}
              strokeLinecap="round"
              opacity={s.opacity ?? 1}
            />
            {showWeights && (
              <>
                <rect
                  x={mx - 11}
                  y={my - 9}
                  width={22}
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
                  fontSize={12}
                  fontWeight={600}
                  style={{ fill: "var(--foreground)" }}
                >
                  {e.weight}
                </text>
              </>
            )}
          </g>
        )
      })}
      {graph.vertices.map((v) => {
        const p = positions[v]
        const ring = vertexRing?.(v)
        return (
          <g
            key={v}
            onClick={onVertexClick ? () => onVertexClick(v) : undefined}
            style={{ cursor: onVertexClick ? "pointer" : undefined }}
          >
            {ring && (
              <circle
                cx={p.x}
                cy={p.y}
                r={21}
                fill="none"
                stroke={ring.stroke}
                strokeWidth={ring.width ?? 2.5}
                strokeDasharray={ring.dash}
              />
            )}
            <circle cx={p.x} cy={p.y} r={16} fill={vertexFill(v)} stroke="#ffffff" strokeWidth={2} />
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
  )
}

/** Двомовний текст без походу в messages (внутрішні підписи віджетів). */
function useL(): (ua: string, en: string) => string {
  const lang = useLangStore((s) => s.lang)
  return (ua, en) => (lang === "ua" ? ua : en)
}

const NEUTRAL: EdgeStyle = { stroke: "#94a3b8", width: 2, opacity: 0.9 }

/** Граф як є (інтуїція / вхідний граф). */
export function PrimGraphFigure({ which }: { which: DemoGraph }) {
  const { graph, positions } = demoGraph(which)
  return (
    <FigureBox>
      <MiniGraph
        graph={graph}
        positions={positions}
        edgeStyle={() => NEUTRAL}
        vertexFill={() => C_NODE}
      />
    </FigureBox>
  )
}

/** Підсумкова МОД: прийняті ребра зелені, відкинуті — тьмяний пунктир. */
export function PrimMstFigure({ which }: { which: DemoGraph }) {
  const { graph, positions } = demoGraph(which)
  const mst = useMemo(
    () => new Set(primMstLazy(graph).mstEdgeIds),
    [graph],
  )
  return (
    <FigureBox>
      <MiniGraph
        graph={graph}
        positions={positions}
        edgeStyle={(e) =>
          mst.has(e.id)
            ? { stroke: C_TREE, width: 4 }
            : { stroke: C_DISCARD, width: 1.5, dash: "4 4", opacity: 0.4 }
        }
        vertexFill={() => C_TREE}
      />
    </FigureBox>
  )
}

/** Три плани прокладання кабелю для графа A–F: усі траси / дерево / МОД. */
export function CablePlansFigure() {
  const { graph, positions } = demoGraph("AF")
  const L = useL()
  const TREE = new Set(["A|B", "B|C", "C|D", "C|F", "D|E"]) // дерево, не найдешевше (15)
  const MST = new Set(["A|B", "B|C", "C|F", "E|F", "D|E"]) // МОД (11)
  const plans: { caption: string; style: (e: Edge) => EdgeStyle }[] = [
    {
      caption: L("усі 6 трас: 18 — цикли, зайві витрати", "all 6 routes: 18 — cycles, wasted cost"),
      style: () => NEUTRAL,
    },
    {
      caption: L("дерево, але не найдешевше: 15", "a tree, but not the cheapest: 15"),
      style: (e) =>
        TREE.has(e.id)
          ? { stroke: C_CUT, width: 3 }
          : { stroke: C_DIM, width: 1.5, dash: "4 4", opacity: 0.4 },
    },
    {
      caption: L("мінімальне остовне дерево: 11 ✓", "minimum spanning tree: 11 ✓"),
      style: (e) =>
        MST.has(e.id)
          ? { stroke: C_TREE, width: 4 }
          : { stroke: C_DIM, width: 1.5, dash: "4 4", opacity: 0.35 },
    },
  ]
  return (
    <FigureBox>
      <span className="grid gap-3 sm:grid-cols-3">
        {plans.map((p) => (
          <span key={p.caption} className="block">
            <MiniGraph
              graph={graph}
              positions={positions}
              edgeStyle={p.style}
              vertexFill={() => C_NODE}
              showWeights={false}
              className="max-w-[220px]"
            />
            <span className="mt-1 block text-center text-xs text-muted-foreground">
              {p.caption}
            </span>
          </span>
        ))}
      </span>
    </FigureBox>
  )
}

/** Властивість розрізу (інтерактивно): клік по вершині перекидає її через розріз. */
export function CutPropertyFigure() {
  const { graph, positions } = demoGraph("AF")
  const L = useL()
  // Стартовий розріз із README: дерево {A, B, C} проти решти.
  const [side, setSide] = useState<Record<Vertex, "S" | "T">>(() => {
    const inS = new Set(["A", "B", "C"])
    return Object.fromEntries(
      graph.vertices.map((v) => [v, inS.has(v) ? "S" : "T"]),
    ) as Record<Vertex, "S" | "T">
  })

  const crossing = graph.edges.filter((e) => side[e.u] !== side[e.v])
  const minCross =
    crossing.length > 0
      ? crossing.reduce((m, e) => (e.weight < m.weight ? e : m))
      : null

  return (
    <FigureBox>
      <span className="mb-2 block text-xs text-muted-foreground">
        {L(
          "Клікни по вершинах, щоб перекидати їх між сторонами розрізу. Сині пунктирні — ребра через розріз; зелене — найдешевше з них (саме його взяв би Прим).",
          "Click vertices to move them across the cut. Blue dashed — edges crossing the cut; green — the cheapest of them (the one Prim would take).",
        )}
      </span>
      <MiniGraph
        graph={graph}
        positions={positions}
        vertexFill={(v) => (side[v] === "S" ? C_SIDE_A : C_SIDE_B)}
        edgeStyle={(e) => {
          if (minCross && e.id === minCross.id) return { stroke: C_TREE, width: 4 }
          if (side[e.u] !== side[e.v]) return { stroke: C_CAND, width: 2.5, dash: "5 4" }
          return { stroke: C_DIM, width: 1.5, opacity: 0.7 }
        }}
        onVertexClick={(v) =>
          setSide((s) => ({ ...s, [v]: s[v] === "S" ? "T" : "S" }))
        }
      />
      <span className="mt-2 block text-sm">
        {minCross ? (
          <>
            {L("Найдешевше ребро через розріз: ", "Cheapest edge across the cut: ")}
            <b>
              {minCross.u}–{minCross.v} ({minCross.weight})
            </b>
            {L(" — воно належить якомусь МОД.", " — it belongs to some MST.")}
          </>
        ) : (
          L(
            "Перенесіть вершини так, щоб обидві сторони були непорожні.",
            "Move vertices so both sides are non-empty.",
          )
        )}
      </span>
    </FigureBox>
  )
}

/** Кадр trace для заданого кроку README (0 — ініціалізація, далі — розв'язка). */
function frameForStep(trace: PrimTrace, step: number): PrimFrame {
  if (step <= 0) return trace.frames[0]
  for (let i = trace.frames.length - 1; i >= 0; i--) {
    const f = trace.frames[i]
    if (f.step === step && (f.sub.kind === "accept" || f.sub.kind === "skip")) {
      return f
    }
  }
  return trace.frames[trace.frames.length - 1]
}

function useTrace(which: DemoGraph): { graph: Graph; positions: Record<Vertex, XY>; trace: PrimTrace } {
  const { graph, positions } = demoGraph(which)
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)
  const trace = useMemo(
    () => buildPrimTrace(graph, undefined, tr).trace,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [graph, lang],
  )
  return { graph, positions, trace }
}

/** Знімок одного кроку: граф (дерево, що росте) + черга з пріоритетами. */
export function PrimStepFigure({ which, step }: { which: DemoGraph; step: number }) {
  const { graph, positions, trace } = useTrace(which)
  const frame = frameForStep(trace, step)
  return (
    <FigureBox>
      <span className="mb-2 block text-xs text-muted-foreground">{frame.caption}</span>
      <span className="grid gap-3 md:grid-cols-2">
        <GraphView graph={graph} positions={positions} frame={frame} className="h-[280px]" />
        <QueuePanel frame={frame} className="h-[280px]" />
      </span>
    </FigureBox>
  )
}

/** Еволюція дерева: мінікадр на кожне прийняте ребро. */
export function PrimEvolutionStrip({ which }: { which: DemoGraph }) {
  const { graph, positions, trace } = useTrace(which)
  const accepts = trace.frames.filter((f) => f.sub.kind === "accept")
  return (
    <FigureBox>
      <span className="flex flex-wrap items-start justify-center gap-3">
        {accepts.map((f) => {
          const mst = new Set(f.mstEdgeIds)
          const visited = new Set(f.visited)
          const added = f.popped
          return (
            <span key={f.i} className="block">
              <MiniGraph
                graph={graph}
                positions={positions}
                showWeights={false}
                className="max-w-[150px]"
                edgeStyle={(e) =>
                  mst.has(e.id)
                    ? { stroke: C_TREE, width: 3 }
                    : { stroke: C_DIM, width: 1, opacity: 0.4 }
                }
                vertexFill={(v) => (visited.has(v) ? C_TREE : C_DIM)}
              />
              {added && (
                <span className="mt-1 block text-center text-xs text-muted-foreground tabular-nums">
                  +{added.from}–{added.to} ({added.weight})
                </span>
              )}
            </span>
          )
        })}
      </span>
    </FigureBox>
  )
}

/** Мінімальний остовний ліс незв'язного графа: відкинуто найважче ребро циклу. */
export function PrimMsfFigure() {
  const { graph, positions } = demoGraph("ISLANDS")
  const discarded = new Set(["M|O"]) // найважче ребро циклу {M, N, O}
  return (
    <FigureBox>
      <MiniGraph
        graph={graph}
        positions={positions}
        edgeStyle={(e) =>
          discarded.has(e.id)
            ? { stroke: C_DISCARD, width: 1.5, dash: "4 4", opacity: 0.4 }
            : { stroke: C_TREE, width: 4 }
        }
        vertexFill={() => C_TREE}
      />
    </FigureBox>
  )
}

/** Покрокове виконання коду: інтерактивний міні-плеєр «код ↔ граф ↔ черга». */
export function PrimWalkthrough({ which }: { which: DemoGraph }) {
  const { graph, positions, trace } = useTrace(which)
  const t = useT()
  const player = usePlayer(trace.frames.length, trace)
  const frame = trace.frames[Math.min(player.index, trace.frames.length - 1)]
  return (
    <MiniPlayerShell player={player} frameCount={trace.frames.length} caption={frame.caption}>
      <span className="grid gap-3 lg:grid-cols-3">
        <CodePanel
          code={trace.code}
          title={t("play.primCode")}
          activeLines={frame.lines}
          contextLines={frame.contextLines}
          className="h-[300px]"
        />
        <GraphView graph={graph} positions={positions} frame={frame} className="h-[300px]" />
        <QueuePanel frame={frame} className="h-[300px]" />
      </span>
    </MiniPlayerShell>
  )
}
