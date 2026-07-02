// Сигнатурний візуал розділу — SVG двійкового дерева. Спільний для прев'ю редактора
// (нейтральні вузли) і плеєра (розфарбовані за станом обходу). Пуристично презентаційний:
// приймає дерево + необов'язкові множини «на стеку / відвідані / поточний» і малює
// ребра (активний ланцюг рекурсії підсвічено) та вузли. Розкладка — з layoutTree
// (колонка = позиція в центровому обході → без накладань, рядок = глибина).

import { layoutTree, type BinaryTree } from "@/lib/treeTraversal"
import {
  TREE_ROLE_FILL,
  type TreeNodeRole,
} from "@/algorithms/tree-traversal/tree-roles"
import { cn } from "@/lib/utils"

const CELL_W = 46
const CELL_H = 66
const RADIUS = 16

export function TreeSvg({
  tree,
  stack = [],
  visited = [],
  current = null,
  className,
  scale = 1,
}: {
  tree: BinaryTree
  /** id вузлів на стеку рекурсії (обведення + активний ланцюг ребер). */
  stack?: readonly number[]
  /** id відвіданих вузлів (у виводі) — заливка «done». */
  visited?: readonly number[]
  /** id вузла, відвіданого САМЕ зараз (пульс «current»). */
  current?: number | null
  className?: string
  /** Множник розміру (навчальні віджети роблять дерево крупнішим за плеєр). */
  scale?: number
}) {
  const layout = layoutTree(tree)
  if (layout.nodes.length === 0) return null

  const w = layout.cols * CELL_W
  const h = layout.rows * CELL_H
  const cx = (gridX: number) => gridX * CELL_W + CELL_W / 2
  const cy = (gridY: number) => gridY * CELL_H + CELL_H / 2

  const stackSet = new Set(stack)
  const visitedSet = new Set(visited)
  // Ребра активного ланцюга рекурсії: обидва кінці на стеку.
  const isChainEdge = (childId: number, parentId: number) =>
    stackSet.has(childId) && stackSet.has(parentId)

  const roleOf = (id: number): TreeNodeRole => {
    if (id === current) return "current"
    if (visitedSet.has(id)) return "done"
    if (stackSet.has(id)) return "stack"
    return "pending"
  }

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
        const active = isChainEdge(n.id, p.id)
        return (
          <line
            key={`e${n.id}`}
            x1={cx(p.gridX)}
            y1={cy(p.gridY)}
            x2={cx(n.gridX)}
            y2={cy(n.gridY)}
            className={cn(
              active
                ? "stroke-sky-500"
                : "stroke-slate-300 dark:stroke-slate-600",
            )}
            strokeWidth={active ? 2.5 : 1.5}
          />
        )
      })}

      {/* Вузли. */}
      {layout.nodes.map((n) => {
        const role = roleOf(n.id)
        const onStack = stackSet.has(n.id) && role !== "stack"
        return (
          <g key={`n${n.id}`}>
            <circle
              cx={cx(n.gridX)}
              cy={cy(n.gridY)}
              r={RADIUS}
              className={cn(
                TREE_ROLE_FILL[role],
                // Обведення: вузол на стеку, але вже пофарбований інакше (visited/current).
                onStack ? "stroke-sky-500" : "stroke-slate-400 dark:stroke-slate-500",
              )}
              strokeWidth={onStack ? 3 : 1}
            />
            <text
              x={cx(n.gridX)}
              y={cy(n.gridY)}
              textAnchor="middle"
              dominantBaseline="central"
              className={cn(
                "fill-current text-[13px] font-semibold tabular-nums",
                role === "pending"
                  ? "text-slate-700 dark:text-slate-200"
                  : "text-white",
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
