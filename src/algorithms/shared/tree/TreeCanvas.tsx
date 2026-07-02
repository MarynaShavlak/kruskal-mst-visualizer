// Спільний низькорівневий рендерер SVG двійкового дерева для РОДИНИ дерев (обхід дерева
// + дерево пошуку). Пуристично презентаційний: приймає BinaryTree + функції-мапери
// (заливка / обведення / світлий текст / активне ребро) і малює ребра під вузлами.
// Розкладка — спільний layoutTree (колонка = позиція в центровому обході → без
// накладань, рядок = глибина; id можуть бути НЕщільними — BST зі стабільними id).
// Топіко-специфічні кольори інжектяться маперами (TreeSvg обходу / BstTreeView).

import { layoutTree, type BinaryTree } from "@/lib/treeTraversal"
import { cn } from "@/lib/utils"

const CELL_W = 46
const CELL_H = 66
const RADIUS = 16

export interface TreeCanvasProps {
  readonly tree: BinaryTree
  /** Клас заливки кола вузла (tailwind fill-*). */
  readonly fillClass: (id: number) => string
  /** Клас обведення (tailwind stroke-*) або null → стандартне тьмяне обведення. */
  readonly ringClass?: (id: number) => string | null
  /** Чи світлий текст (білий на кольоровій заливці) для цього вузла. */
  readonly lightText?: (id: number) => boolean
  /** Чи підсвічене ребро батько→дитина (активний шлях). */
  readonly edgeActive?: (childId: number, parentId: number) => boolean
  /** Множник розміру (навчальні віджети роблять дерево крупнішим за плеєр). */
  readonly scale?: number
  readonly className?: string
}

export function TreeCanvas({
  tree,
  fillClass,
  ringClass,
  lightText,
  edgeActive,
  scale = 1,
  className,
}: TreeCanvasProps) {
  const layout = layoutTree(tree)
  if (layout.nodes.length === 0) return null

  const w = layout.cols * CELL_W
  const h = layout.rows * CELL_H
  const cx = (gridX: number) => gridX * CELL_W + CELL_W / 2
  const cy = (gridY: number) => gridY * CELL_H + CELL_H / 2

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={cn("h-auto w-full max-w-full", className)}
      style={{ maxWidth: w * scale }}
      role="img"
    >
      {/* Ребра — під вузлами. */}
      {layout.nodes.map((n) => {
        if (n.parent === null) return null
        const p = layout.nodes.find((m) => m.id === n.parent)
        if (!p) return null
        const active = edgeActive?.(n.id, p.id) ?? false
        return (
          <line
            key={`e${n.id}`}
            x1={cx(p.gridX)}
            y1={cy(p.gridY)}
            x2={cx(n.gridX)}
            y2={cy(n.gridY)}
            className={
              active ? "stroke-sky-500" : "stroke-slate-300 dark:stroke-slate-600"
            }
            strokeWidth={active ? 2.5 : 1.5}
          />
        )
      })}

      {/* Вузли. */}
      {layout.nodes.map((n) => {
        const ring = ringClass?.(n.id) ?? null
        return (
          <g key={`n${n.id}`}>
            <circle
              cx={cx(n.gridX)}
              cy={cy(n.gridY)}
              r={RADIUS}
              className={cn(
                fillClass(n.id),
                ring ?? "stroke-slate-400 dark:stroke-slate-500",
              )}
              strokeWidth={ring ? 3 : 1}
            />
            <text
              x={cx(n.gridX)}
              y={cy(n.gridY)}
              textAnchor="middle"
              dominantBaseline="central"
              className={cn(
                "fill-current text-[13px] font-semibold tabular-nums",
                lightText?.(n.id) ?? false
                  ? "text-white"
                  : "text-slate-700 dark:text-slate-200",
              )}
            >
              {n.value}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
