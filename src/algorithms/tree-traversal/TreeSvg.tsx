// Сигнатурний візуал обходу: SVG дерева з підсвіткою станів обходу. Тонка обгортка над
// спільним TreeCanvas — обчислює роль кожного вузла (ще не дійшли / на стеку рекурсії /
// відвідуємо / у виводі) і передає мапери кольору. Розкладку/малювання робить TreeCanvas.

import { TreeCanvas } from "@/algorithms/shared/tree/TreeCanvas"
import { TREE_ROLE_FILL, type TreeNodeRole } from "@/algorithms/tree-traversal/tree-roles"
import type { BinaryTree } from "@/lib/treeTraversal"

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
  const stackSet = new Set(stack)
  const visitedSet = new Set(visited)

  const roleOf = (id: number): TreeNodeRole => {
    if (id === current) return "current"
    if (visitedSet.has(id)) return "done"
    if (stackSet.has(id)) return "stack"
    return "pending"
  }

  return (
    <TreeCanvas
      tree={tree}
      className={className}
      scale={scale}
      fillClass={(id) => TREE_ROLE_FILL[roleOf(id)]}
      ringClass={(id) =>
        // Обведення: вузол на стеку, але вже пофарбований інакше (visited/current).
        stackSet.has(id) && roleOf(id) !== "stack" ? "stroke-sky-500" : null
      }
      lightText={(id) => roleOf(id) !== "pending"}
      edgeActive={(childId, parentId) => stackSet.has(childId) && stackSet.has(parentId)}
    />
  )
}
