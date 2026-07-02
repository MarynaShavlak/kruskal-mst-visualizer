// SVG-дерево ДДП, розфарбоване за станом ПОТОЧНОГО кадру: шлях порівнянь (🔵), вузол
// під порівнянням (🟡), результат знайдено/вставлено (🟢), вузол на видалення (🔴) і
// наступник (🟣). Тонка обгортка над спільним TreeCanvas — обчислює роль кожного вузла
// з полів кадру. Використовується і плеєром, і навчальними віджетами.

import { TreeCanvas } from "@/algorithms/shared/tree/TreeCanvas"
import { BST_ROLE_FILL, type BstNodeRole } from "@/algorithms/bst/bst-roles"
import type { BstFrame } from "@/lib/binarySearchTreeTrace"

/** Види подій, де вузол-результат підсвічуємо зеленим (вцілів / знайдено / вставлено). */
const RESULT_KINDS = new Set(["insert", "found", "exists", "replace", "unlink"])

export function BstTreeView({
  frame,
  scale = 1,
  className,
}: {
  frame: BstFrame
  scale?: number
  className?: string
}) {
  const pathSet = new Set(frame.pathIds)

  const roleOf = (id: number): BstNodeRole => {
    if (frame.kind === "unlink" && id === frame.activeId) return "remove"
    if (id === frame.successorId) return "successor"
    if (id === frame.resultId && RESULT_KINDS.has(frame.kind)) return "result"
    if (id === frame.activeId) return "active"
    if (pathSet.has(id)) return "path"
    return "idle"
  }

  return (
    <TreeCanvas
      tree={frame.tree}
      scale={scale}
      className={className}
      fillClass={(id) => BST_ROLE_FILL[roleOf(id)]}
      lightText={(id) => roleOf(id) !== "idle"}
      edgeActive={(childId, parentId) => pathSet.has(childId) && pathSet.has(parentId)}
    />
  )
}
