import { Panel } from "@/algorithms/shared/playback/Panel"
import { partRole, type PartRole } from "@/algorithms/quick-sort/playback/highlight"
import type { QsTree, QsTreeNode } from "@/lib/quickSortTrace"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

const CHIP_CLASS: Record<PartRole, string> = {
  pivot: "bg-violet-500/85 text-white ring-1 ring-violet-300",
  less: "bg-sky-500/70 text-white",
  equal: "bg-fuchsia-400/70 text-white",
  greater: "bg-orange-400/80 text-white",
}

/**
 * Масив як кольорові «фішки». `mode`:
 *  - `partition` — фарбуємо за роллю щодо опорного (🟣 опорний · 🔵 < · 🟪 == · 🟧 >);
 *  - `sorted` — усі зелені (повернутий/відсортований підмасив);
 *  - порожній масив → сіре `∅`.
 */
export function ArrayChips({
  array,
  pivot,
  pivotIndex,
  mode = "partition",
  size = "sm",
}: {
  array: readonly number[]
  pivot?: number | null
  pivotIndex?: number | null
  mode?: "partition" | "sorted"
  size?: "sm" | "xs"
}) {
  const pad = size === "xs" ? "px-1 text-[10px]" : "px-1.5 text-[11px]"
  if (array.length === 0) {
    return (
      <span className={cn("rounded text-muted-foreground", pad)}>∅</span>
    )
  }
  return (
    <span className="inline-flex gap-0.5">
      {array.map((v, i) => {
        const cls =
          mode === "sorted"
            ? "bg-emerald-500/75 text-white"
            : pivot != null
              ? CHIP_CLASS[partRole(v, pivot, i === pivotIndex)]
              : "bg-slate-400/60 text-foreground"
        return (
          <span
            key={i}
            className={cn("rounded font-medium tabular-nums leading-tight", pad, cls)}
          >
            {v}
          </span>
        )
      })}
    </span>
  )
}

// — Геометрія дерева ----------------------------------------------------------
const BOX_H = 30
const COL = 104
const ROW = 70
const MARGIN_L = 16
const MARGIN_T = 12

export interface QuickTreeProps {
  readonly tree: QsTree
  /** Відкриті вузли — id ≤ revealedMax (дерево «росте» в pre-order). */
  readonly revealedMax: number
  /** id поточного вузла (кільце-підсвітка) або null. */
  readonly currentId: number | null
}

/**
 * Дерево рекурсії швидкого сортування (SVG-ребра + HTML-вузли). Кожен вузол —
 * підмасив із кольоровим поділом навколо опорного; сині ребра ведуть до гілки
 * `left`, помаранчеві — до `right`. Вузли з id > revealedMax приховані (дерево
 * росте в порядку обходу). Спільний для плеєра й навчальних віджетів.
 */
export function QuickTree({ tree, revealedMax, currentId }: QuickTreeProps) {
  const { nodes, leafCount, maxDepth } = tree
  const cx = (n: QsTreeNode) => MARGIN_L + (n.x + 0.5) * COL
  const top = (n: QsTreeNode) => MARGIN_T + n.depth * ROW
  const width = MARGIN_L * 2 + Math.max(1, leafCount) * COL
  const height = MARGIN_T * 2 + maxDepth * ROW + BOX_H + 24

  interface Edge {
    x1: number; y1: number; x2: number; y2: number; branch: "left" | "right"
  }
  const edges: Edge[] = []
  for (const n of nodes) {
    if (n.id > revealedMax) continue
    for (const cid of n.children) {
      if (cid > revealedMax) continue
      const c = nodes[cid]
      edges.push({
        x1: cx(n), y1: top(n) + BOX_H,
        x2: cx(c), y2: top(c),
        branch: c.branch === "left" ? "left" : "right",
      })
    }
  }

  return (
    <div className="relative mx-auto" style={{ width, height }}>
      <svg className="absolute inset-0" width={width} height={height}>
        {edges.map((e, k) => (
          <line
            key={k}
            x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
            className={e.branch === "left" ? "stroke-sky-500/70" : "stroke-orange-400/80"}
            strokeWidth={1.75}
          />
        ))}
      </svg>
      {nodes.map((n) =>
        n.id > revealedMax ? null : (
          <div
            key={n.id}
            className={cn(
              "absolute flex -translate-x-1/2 items-center rounded-md border bg-card px-1.5 py-1 shadow-sm",
              n.id === currentId
                ? "border-primary ring-2 ring-primary/40"
                : "border-border/60",
            )}
            style={{ left: cx(n), top: top(n) }}
          >
            <ArrayChips
              array={n.array}
              pivot={n.pivot}
              pivotIndex={n.pivotIndex}
              mode={n.isBase ? "sorted" : "partition"}
              size="xs"
            />
          </div>
        ),
      )}
    </div>
  )
}

/** Панель дерева рекурсії: QuickTree у рамці зі скролом + легенда. */
export function QuickTreePanel({
  tree,
  revealedMax,
  currentId,
  className,
}: QuickTreeProps & { className?: string }) {
  const t = useT()
  return (
    <Panel
      title={t("play.qsTreeTitle")}
      className={className}
      bodyClassName="flex flex-col gap-2 p-3"
    >
      <div className="min-h-0 flex-1 overflow-auto">
        <QuickTree tree={tree} revealedMax={revealedMax} currentId={currentId} />
      </div>
      <TreeLegend />
    </Panel>
  )
}

function TreeLegend() {
  const t = useT()
  const items: { role: PartRole; label: string }[] = [
    { role: "pivot", label: t("learn.qsLegendPivot") },
    { role: "less", label: t("learn.qsLegendLess") },
    { role: "equal", label: t("learn.qsLegendEqual") },
    { role: "greater", label: t("learn.qsLegendGreater") },
  ]
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
      {items.map((it) => (
        <span key={it.role} className="inline-flex items-center gap-1">
          <span className={cn("inline-block size-2.5 rounded-sm", CHIP_CLASS[it.role])} />
          {it.label}
        </span>
      ))}
      <span className="inline-flex items-center gap-1">
        <span className="inline-block size-2.5 rounded-sm bg-emerald-500/75" />
        {t("learn.qsLegendSorted")}
      </span>
    </div>
  )
}
