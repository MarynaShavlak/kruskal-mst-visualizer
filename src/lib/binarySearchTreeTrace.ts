// Модель trace для двійкового дерева пошуку. Скрипт операцій проганяється ОДИН раз
// (через bstSteps) і пишемо список незмінних кадрів (BstFrame) — по одному на КОЖНУ
// подію журналу (порівняння / вставка / знайдено / успадкування-заміна / від'єднання…).
// UI лише рухає курсор. Кожен кадр несе знімок дерева, шлях порівнянь, поточний вузол,
// активні підсвітки коду й нарацію. Лістинг коду перемикається за ВИДОМ операції
// (insert/search/delete) — показуємо саме те, що зараз виконуємо.
//
// Кадр розширює лише FrameNarration: у BST немає одного масиву-входу+результату, як у
// пошуку — тут послідовність операцій над спільним деревом (як хеш-таблиця).

import {
  bstSteps,
  type BstDecision,
  type BstEvent,
  type BstEventKind,
  type BstOp,
  type BstOpKind,
  type BstOpResult,
  type DeleteCase,
} from "@/lib/binarySearchTree"
import { treeHeight, type BinaryTree } from "@/lib/treeTraversal"
import { identityTranslate, type Translate } from "@/lib/translate"
import type { FrameNarration } from "@/lib/traceFrame"

/** Лістинг вставки в ДДП (1-based рядки). */
export const BST_INSERT_CODE: readonly string[] = [
  "def insert(root, key):",
  "    if root is None:",
  "        return Node(key)        # порожнє місце → новий вузол",
  "    if key < root.val:",
  "        root.left = insert(root.left, key)    # менше → ліворуч",
  "    elif key > root.val:",
  "        root.right = insert(root.right, key)  # більше → праворуч",
  "    # key == root.val → уже є, пропускаємо",
  "    return root",
]

/** Лістинг пошуку в ДДП. */
export const BST_SEARCH_CODE: readonly string[] = [
  "def search(root, key):",
  "    if root is None:",
  "        return None             # порожньо → немає ключа",
  "    if key == root.val:",
  "        return root             # знайдено",
  "    if key < root.val:",
  "        return search(root.left, key)   # менше → ліворуч",
  "    return search(root.right, key)      # більше → праворуч",
]

/** Лістинг видалення з ДДП (три випадки + наступник). */
export const BST_DELETE_CODE: readonly string[] = [
  "def delete(root, key):",
  "    if root is None:",
  "        return None",
  "    if key < root.val:",
  "        root.left = delete(root.left, key)    # менше → ліворуч",
  "    elif key > root.val:",
  "        root.right = delete(root.right, key)  # більше → праворуч",
  "    else:                                     # знайшли вузол",
  "        if root.left is None:",
  "            return root.right   # немає лівого → правий на місце",
  "        if root.right is None:",
  "            return root.left    # немає правого → лівий на місце",
  "        succ = min_value(root.right)   # наступник = мінімум правого",
  "        root.val = succ.val            # копіюємо значення",
  "        root.right = delete(root.right, succ.val)  # прибираємо наступник",
  "    return root",
]

/** Лістинг за видом операції. */
export function codeFor(opKind: BstOpKind | null): readonly string[] {
  switch (opKind) {
    case "search":
      return BST_SEARCH_CODE
    case "delete":
      return BST_DELETE_CODE
    default:
      return BST_INSERT_CODE
  }
}

export interface BstFrame extends FrameNarration {
  readonly i: number
  readonly kind: BstEventKind
  readonly opKind: BstOpKind | null
  readonly tree: BinaryTree
  readonly activeId: number | null
  readonly pathIds: readonly number[]
  readonly decision: BstDecision | null
  readonly resultId: number | null
  readonly successorId: number | null
  readonly deleteCase: DeleteCase | null
  readonly opResult: BstOpResult | null
  readonly op: BstOp | null
  readonly opIndex: number | null
  readonly comparisons: number
  /** Кількість вузлів у знімку. */
  readonly size: number
  /** Висота дерева у знімку. */
  readonly height: number
}

/** Підсумок прогону для картки результату. */
export interface BstResult {
  readonly ops: readonly BstOp[]
  readonly tree: BinaryTree
  readonly perOp: readonly { readonly op: BstOp; readonly result: BstOpResult }[]
  readonly comparisons: number
  readonly size: number
  readonly height: number
}

export interface BstTrace {
  readonly code: readonly string[]
  readonly frames: readonly BstFrame[]
  readonly result: BstResult
}

/** Рядки коду для (вид операції, тип події, рішення, випадок видалення). */
function linesFor(
  opKind: BstOpKind | null,
  kind: BstEventKind,
  decision: BstDecision | null,
  deleteCase: DeleteCase | null,
): { lines: number[]; contextLines: number[] } {
  if (opKind === "insert") {
    switch (kind) {
      case "compare":
        return decision === "left"
          ? { lines: [4, 5], contextLines: [] }
          : decision === "right"
            ? { lines: [6, 7], contextLines: [] }
            : { lines: [8], contextLines: [] }
      case "insert":
        return { lines: [2, 3], contextLines: [] }
      case "exists":
        return { lines: [8], contextLines: [] }
      default:
        return { lines: [], contextLines: [] }
    }
  }
  if (opKind === "search") {
    switch (kind) {
      case "compare":
        return decision === "equal"
          ? { lines: [4, 5], contextLines: [] }
          : decision === "left"
            ? { lines: [6, 7], contextLines: [] }
            : { lines: [8], contextLines: [] }
      case "found":
        return { lines: [4, 5], contextLines: [] }
      case "not_found":
        return { lines: [2, 3], contextLines: [] }
      default:
        return { lines: [], contextLines: [] }
    }
  }
  if (opKind === "delete") {
    switch (kind) {
      case "compare":
        return decision === "left"
          ? { lines: [4, 5], contextLines: [] }
          : decision === "right"
            ? { lines: [6, 7], contextLines: [] }
            : { lines: [8], contextLines: [] }
      case "not_found":
        return { lines: [2, 3], contextLines: [] }
      case "succ_scan":
        return { lines: [13], contextLines: [8] }
      case "replace":
        return { lines: [14], contextLines: [] }
      case "unlink":
        return deleteCase === "two-children"
          ? { lines: [15], contextLines: [] }
          : { lines: [9, 10, 11, 12], contextLines: [] }
      default:
        return { lines: [], contextLines: [] }
    }
  }
  return { lines: [], contextLines: [] }
}

/** Ключ нарації події (наповнюється в messages.ts). */
function captionKey(kind: BstEventKind): string {
  const suffix = kind
    .split("_")
    .map((p, i) => (i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join("")
  return `play.nBst${suffix.charAt(0).toUpperCase()}${suffix.slice(1)}`
}

/** Значення вузла за id у знімку (для нарації). */
function valueOf(tree: BinaryTree, id: number | null): number | null {
  if (id === null) return null
  return tree.nodes.find((n) => n.id === id)?.value ?? null
}

/** Перетворює одну подію журналу на кадр (рядки коду + нарація). */
function frameFor(ev: BstEvent, t: Translate): Omit<BstFrame, "i"> {
  const opKind = ev.op?.kind ?? null
  const { lines, contextLines } = linesFor(opKind, ev.kind, ev.decision, ev.deleteCase)
  const nodeVal = valueOf(ev.tree, ev.activeId)
  const succVal = valueOf(ev.tree, ev.successorId)
  const height = treeHeight(ev.tree)

  const dir =
    ev.decision === "left"
      ? t("play.bstDir_left")
      : ev.decision === "right"
        ? t("play.bstDir_right")
        : ev.decision === "equal"
          ? t("play.bstDir_equal")
          : ""
  const opName = opKind ? t(`play.bstName_${opKind}`) : ""
  const caseLabel =
    ev.deleteCase === "leaf"
      ? t("play.bstCase_leaf")
      : ev.deleteCase === "one-child"
        ? t("play.bstCase_one")
        : ev.deleteCase === "two-children"
          ? t("play.bstCase_two")
          : ""

  const vars: Record<string, string | number> = {
    key: ev.op?.key ?? 0,
    node: nodeVal ?? 0,
    succ: succVal ?? 0,
    dir,
    op: opName,
    case: caseLabel,
    comparisons: ev.comparisons,
    size: ev.tree.nodes.length,
    height,
  }

  return {
    kind: ev.kind,
    opKind,
    tree: ev.tree,
    activeId: ev.activeId,
    pathIds: ev.pathIds,
    decision: ev.decision,
    resultId: ev.resultId,
    successorId: ev.successorId,
    deleteCase: ev.deleteCase,
    opResult: ev.opResult,
    op: ev.op,
    opIndex: ev.opIndex,
    comparisons: ev.comparisons,
    size: ev.tree.nodes.length,
    height,
    lines,
    contextLines,
    caption: t(captionKey(ev.kind), vars),
  }
}

/**
 * Проганяє скрипт операцій над ДДП і збирає trace для плеєра/віджетів: по кадру на
 * кожну подію журналу + підсумок. Лістинг коду в `code` — дефолтний (insert); плеєр
 * перемикає лістинг на кожному кадрі через `codeFor(frame.opKind)`.
 */
export function buildBinarySearchTreeTrace(
  ops: readonly BstOp[],
  t: Translate = identityTranslate,
): BstTrace {
  const { events, tree, perOp, comparisons } = bstSteps(ops)
  const frames: BstFrame[] = events.map((ev, i) => ({ i, ...frameFor(ev, t) }))
  const result: BstResult = {
    ops,
    tree,
    perOp,
    comparisons,
    size: tree.nodes.length,
    height: treeHeight(tree),
  }
  return { code: BST_INSERT_CODE, frames, result }
}
