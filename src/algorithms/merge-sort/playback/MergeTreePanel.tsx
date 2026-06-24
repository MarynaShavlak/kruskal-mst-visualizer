import { Panel } from "@/algorithms/shared/playback/Panel"
import { halfRole } from "@/algorithms/merge-sort/playback/highlight"
import type { MsTree, MsTreeNode } from "@/lib/mergeSortTrace"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

// — Геометрія дерева ----------------------------------------------------------
const BOX_H = 26
const COL = 50
const ROW = 58
const MARGIN_L = 12
const MARGIN_T = 10

const MINI = {
  left: "bg-sky-500/70 text-white",
  right: "bg-orange-400/80 text-white",
  sorted: "bg-emerald-500/75 text-white",
} as const

function MiniCell({
  value,
  tone,
  big = false,
}: {
  value: number
  tone: keyof typeof MINI
  big?: boolean
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-sm px-0.5 font-semibold leading-none tabular-nums",
        big ? "h-5 min-w-5 text-[11px]" : "h-4 min-w-4 text-[9px]",
        MINI[tone],
      )}
    >
      {value}
    </span>
  )
}

/** Комірки одного вузла: зелені (базовий/злитий) або поділені навпіл (🔵/🟧). */
function NodeCells({ node, merged, big }: { node: MsTreeNode; merged: boolean; big: boolean }) {
  // Базовий випадок або вже злитий вузол → відсортований зелений підмасив.
  if (node.isBase || merged) {
    const cells = merged ? node.result ?? node.array : node.array
    return (
      <span className="inline-flex gap-0.5">
        {cells.map((v, i) => (
          <MiniCell key={i} value={v} tone="sorted" big={big} />
        ))}
      </span>
    )
  }
  // Ще не злитий внутрішній вузол → поділ навпіл (видно, де mid).
  const mid = node.mid ?? Math.floor(node.array.length / 2)
  return (
    <span className="inline-flex gap-0.5">
      {node.array.map((v, i) => (
        <MiniCell key={i} value={v} tone={halfRole(i, mid)} big={big} />
      ))}
    </span>
  )
}

export interface MergeTreeProps {
  readonly tree: MsTree
  /** Відкриті вузли — id ≤ revealedMax (дерево «росте» вниз у pre-order). */
  readonly revealedMax: number
  /** id поточного вузла (кільце-підсвітка) або null. */
  readonly currentId: number | null
  /** id вузлів, чий результат злиття вже показано (зелений). */
  readonly mergedIds: readonly number[]
  /** Множник геометрії дерева (1 — плеєр; >1 — більший образ у навчанні). */
  readonly scale?: number
}

/**
 * Дерево рекурсії сортування злиттям (SVG-ребра + HTML-вузли). Поділ навпіл униз
 * (🔵 left / 🟧 right ребра й половини), злиття вгору (вузол зеленіє, коли його
 * результат готовий). Вузли з id > revealedMax приховані. Спільне для плеєра й
 * навчальних віджетів.
 */
export function MergeTree({ tree, revealedMax, currentId, mergedIds, scale = 1 }: MergeTreeProps) {
  const { nodes, leafCount, maxDepth } = tree
  const mergedSet = new Set(mergedIds)
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const big = scale > 1
  const col = COL * scale
  const row = ROW * scale
  const boxH = BOX_H * scale
  const marginL = MARGIN_L * scale
  const marginT = MARGIN_T * scale
  const cx = (n: MsTreeNode) => marginL + (n.x + 0.5) * col
  const top = (n: MsTreeNode) => marginT + n.depth * row
  const width = marginL * 2 + Math.max(1, leafCount) * col
  const height = marginT * 2 + maxDepth * row + boxH + 8 * scale

  interface Edge {
    x1: number; y1: number; x2: number; y2: number; branch: "left" | "right"
  }
  const edges: Edge[] = []
  for (const n of nodes) {
    if (n.id > revealedMax) continue
    n.children.forEach((cid, ci) => {
      if (cid > revealedMax) return
      const c = byId.get(cid)
      if (!c) return
      edges.push({
        x1: cx(n), y1: top(n) + boxH,
        x2: cx(c), y2: top(c),
        branch: ci === 0 ? "left" : "right",
      })
    })
  }

  return (
    <div className="relative mx-auto" style={{ width, height }}>
      <svg className="absolute inset-0" width={width} height={height}>
        {edges.map((e, k) => (
          <line
            key={k}
            x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
            className={e.branch === "left" ? "stroke-sky-500/70" : "stroke-orange-400/80"}
            strokeWidth={1.75 * scale}
          />
        ))}
      </svg>
      {nodes.map((n) =>
        n.id > revealedMax ? null : (
          <div
            key={n.id}
            className={cn(
              "absolute flex -translate-x-1/2 items-center rounded-md border bg-card px-1 py-1 shadow-sm",
              n.id === currentId
                ? "border-primary ring-2 ring-primary/40"
                : "border-border/60",
            )}
            style={{ left: cx(n), top: top(n) }}
          >
            <NodeCells node={n} merged={mergedSet.has(n.id)} big={big} />
          </div>
        ),
      )}
    </div>
  )
}

/** Панель дерева рекурсії: MergeTree у рамці зі скролом + легенда. */
export function MergeTreePanel({
  tree,
  revealedMax,
  currentId,
  mergedIds,
  className,
}: MergeTreeProps & { className?: string }) {
  const t = useT()
  return (
    <Panel
      title={t("play.msTreeTitle")}
      className={className}
      bodyClassName="flex flex-col gap-2 p-3"
    >
      <div className="min-h-0 flex-1 overflow-auto">
        <MergeTree tree={tree} revealedMax={revealedMax} currentId={currentId} mergedIds={mergedIds} />
      </div>
      <TreeLegend />
    </Panel>
  )
}

function TreeLegend() {
  const t = useT()
  const items: { tone: keyof typeof MINI; label: string }[] = [
    { tone: "left", label: t("learn.msLegendLeft") },
    { tone: "right", label: t("learn.msLegendRight") },
    { tone: "sorted", label: t("learn.msLegendSorted") },
  ]
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
      {items.map((it) => (
        <span key={it.tone} className="inline-flex items-center gap-1">
          <span className={cn("inline-block size-2.5 rounded-sm", MINI[it.tone])} />
          {it.label}
        </span>
      ))}
    </div>
  )
}
