import { Panel } from "@/algorithms/shared/playback/Panel"
import { LegendRow } from "@/algorithms/shared/playback/LegendRow"
import { depthOf } from "@/lib/heapSort"
import { heapNodeRole, type HeapNodeRole, type HeapNodeState } from "@/algorithms/heap-sort/playback/highlight"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

// Сигнатурний образ Heap Sort: масив, прочитаний як ПОВНЕ ДВІЙКОВЕ ДЕРЕВО (дитина
// вузла i — на 2i+1 / 2i+2). Видно властивість купи (батько «сильніший» за дітей),
// просіювання вузла вниз і те, як відсортована зона «наростає» з кінця масиву.

// — Геометрія дерева ----------------------------------------------------------
const NODE = 34
const ROW = 66
const SLOT = 46
const MARGIN_X = 18
const MARGIN_Y = 10

/** Класи вузла за роллю (фон + текст + рамка). */
const NODE_CLASS: Record<HeapNodeRole, string> = {
  heap: "bg-slate-200 text-slate-700 border-slate-400/60 dark:bg-slate-700 dark:text-slate-100",
  root: "bg-indigo-500/20 text-indigo-700 border-indigo-500/60 dark:text-indigo-200",
  sift: "bg-sky-500/20 text-sky-800 border-sky-500 ring-2 ring-sky-400/50 dark:text-sky-100",
  compare: "bg-amber-400 text-amber-950 border-amber-500",
  swap: "bg-rose-500 text-white border-rose-600",
  extract: "bg-violet-500 text-white border-violet-600",
  sorted: "bg-emerald-500/80 text-white border-emerald-600/60",
}

export interface HeapTreeProps {
  readonly array: readonly number[]
  readonly state: HeapNodeState
  /** Множник геометрії (1 — плеєр; >1 — більший образ у навчанні). */
  readonly scale?: number
}

/** Дерево-купа (SVG-ребра + HTML-вузли). Спільне для плеєра й навчальних віджетів. */
export function HeapTree({ array, state, scale = 1 }: HeapTreeProps) {
  const n = array.length
  const node = NODE * scale
  const row = ROW * scale
  const slot = SLOT * scale
  const marginX = MARGIN_X * scale
  const marginY = MARGIN_Y * scale

  const maxDepth = n > 0 ? depthOf(n - 1) : 0
  const leaves = 2 ** maxDepth
  const innerW = leaves * slot
  const width = innerW + marginX * 2
  const height = marginY * 2 + maxDepth * row + node

  const cx = (i: number): number => {
    const d = depthOf(i)
    const p = i - (2 ** d - 1)
    return marginX + ((p + 0.5) / 2 ** d) * innerW
  }
  const cy = (i: number): number => marginY + depthOf(i) * row + node / 2

  const role = (i: number): HeapNodeRole => heapNodeRole(i, state)

  interface Edge {
    x1: number; y1: number; x2: number; y2: number; dim: boolean
  }
  const edges: Edge[] = []
  for (let i = 0; i < n; i++) {
    for (const c of [2 * i + 1, 2 * i + 2]) {
      if (c >= n) continue
      const dim = role(i) === "sorted" || role(c) === "sorted"
      edges.push({ x1: cx(i), y1: cy(i), x2: cx(c), y2: cy(c), dim })
    }
  }

  return (
    <div className="relative mx-auto" style={{ width, height }}>
      <svg className="absolute inset-0" width={width} height={height}>
        {edges.map((e, k) => (
          <line
            key={k}
            x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
            className={e.dim ? "stroke-border/50" : "stroke-muted-foreground/60"}
            strokeWidth={1.75 * scale}
          />
        ))}
      </svg>
      {array.map((v, i) => (
        <div
          key={i}
          className={cn(
            "absolute flex -translate-x-1/2 flex-col items-center justify-center rounded-full border font-semibold tabular-nums shadow-sm transition-colors",
            NODE_CLASS[role(i)],
          )}
          style={{
            left: cx(i),
            top: marginY + depthOf(i) * row,
            width: node,
            height: node,
            fontSize: 12.5 * scale,
          }}
          title={`a[${i}] = ${v}`}
        >
          {v}
        </div>
      ))}
    </div>
  )
}

/** Панель дерева-купи: HeapTree у рамці зі скролом + легенда. */
export function HeapTreePanel({
  array,
  state,
  className,
}: HeapTreeProps & { className?: string }) {
  const t = useT()
  return (
    <Panel
      title={t("play.hpTreeTitle")}
      className={className}
      bodyClassName="flex flex-col gap-2 p-3"
    >
      <div className="min-h-0 flex-1 overflow-auto">
        <HeapTree array={array} state={state} />
      </div>
      <TreeLegend />
    </Panel>
  )
}

function TreeLegend() {
  const t = useT()
  const entries: { role: HeapNodeRole; label: string }[] = [
    { role: "sift", label: t("learn.hpLegendSift") },
    { role: "compare", label: t("learn.hpLegendCompare") },
    { role: "swap", label: t("learn.hpLegendSwap") },
    { role: "extract", label: t("learn.hpLegendExtract") },
    { role: "sorted", label: t("learn.hpLegendSorted") },
    { role: "heap", label: t("learn.hpLegendHeap") },
  ]
  return (
    <LegendRow
      entries={entries.map((e) => ({ label: e.label, cls: NODE_CLASS[e.role] }))}
      border={false}
    />
  )
}
