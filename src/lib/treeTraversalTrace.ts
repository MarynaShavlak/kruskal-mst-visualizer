// Модель trace для обходу дерева. Дерево проганяється ОДИН раз (через
// treeTraversalSteps) і пишемо список незмінних кадрів (BtFrame) — по одному на КОЖНУ
// подію журналу (виклик / відвідування / база / повернення). UI лише рухає курсор.
// Кожен кадр несе стек рекурсії, відвіданий досі результат, поточний вузол, активні
// підсвітки коду й нарацію. Порядок (preorder/inorder/postorder) міняє лише лістинг і
// момент відвідування — структура кадрів однакова.
//
// Кадр розширює лише FrameNarration: дерево статичне (панель бере його з дока окремо),
// тож кадр несе тільки динамічний стан обходу, а не знімок структури.

import {
  buildTree,
  countLeaves,
  nodeCount,
  traverse,
  treeHeight,
  treeTraversalSteps,
  type BinaryTree,
  type BtEvent,
  type BtEventKind,
  type ChildSide,
  type TraversalOrder,
} from "@/lib/treeTraversal"
import { formatArray } from "@/lib/arrayUtils"
import { identityTranslate, type Translate } from "@/lib/translate"
import type { FrameNarration } from "@/lib/traceFrame"

/** Лістинг прямого (preorder) обходу для панелі підсвітки (1-based рядки). */
export const BT_PREORDER_CODE: readonly string[] = [
  "def preorder(node):",
  "    if node is None:        # база: порожньо → назад",
  "        return",
  "    visit(node.val)         # 1) КОРІНЬ",
  "    preorder(node.left)     # 2) ліве піддерево",
  "    preorder(node.right)    # 3) праве піддерево",
]

/** Лістинг центрового (inorder) обходу. */
export const BT_INORDER_CODE: readonly string[] = [
  "def inorder(node):",
  "    if node is None:        # база: порожньо → назад",
  "        return",
  "    inorder(node.left)      # 1) ліве піддерево",
  "    visit(node.val)         # 2) КОРІНЬ",
  "    inorder(node.right)     # 3) праве піддерево",
]

/** Лістинг зворотного (postorder) обходу. */
export const BT_POSTORDER_CODE: readonly string[] = [
  "def postorder(node):",
  "    if node is None:        # база: порожньо → назад",
  "        return",
  "    postorder(node.left)    # 1) ліве піддерево",
  "    postorder(node.right)   # 2) праве піддерево",
  "    visit(node.val)         # 3) КОРІНЬ",
]

/** Лістинг за порядком обходу. */
export function codeFor(order: TraversalOrder): readonly string[] {
  switch (order) {
    case "inorder":
      return BT_INORDER_CODE
    case "postorder":
      return BT_POSTORDER_CODE
    default:
      return BT_PREORDER_CODE
  }
}

export interface BtFrame extends FrameNarration {
  /** Індекс кадру в trace (0-based). */
  readonly i: number
  readonly order: TraversalOrder
  readonly kind: BtEventKind
  /** Вузол, якого стосується подія (null для `base`). */
  readonly nodeId: number | null
  /** Для `base`: батько й бік марної спроби. */
  readonly parentId: number | null
  readonly side: ChildSide | null
  /** Стек рекурсії (id, від кореня до поточного вузла). */
  readonly stack: readonly number[]
  /** Відвідані вузли (id) у порядку відвідування. */
  readonly visited: readonly number[]
  /** Результат-послідовність значень на цей момент. */
  readonly output: readonly number[]
  /** Вузол, відвіданий САМЕ цим кадром (для підсвітки-пульсу), або null. */
  readonly justVisited: number | null
  readonly calls: number
  readonly visits: number
}

/** Підсумок обходу для картки результату. */
export interface BtResult {
  readonly order: TraversalOrder
  readonly output: readonly number[]
  readonly visitedOrder: readonly number[]
  readonly nodes: number
  readonly leaves: number
  readonly height: number
  readonly calls: number
}

export interface BtTrace {
  readonly code: readonly string[]
  readonly frames: readonly BtFrame[]
  readonly result: BtResult
}

/** Рядки коду для (порядок, тип події). */
function linesFor(
  order: TraversalOrder,
  kind: BtEventKind,
): { lines: number[]; contextLines: number[] } {
  // Рядок, на якому в цьому порядку стоїть `visit(node.val)`.
  const visitLine = order === "preorder" ? 4 : order === "inorder" ? 5 : 6
  switch (kind) {
    case "enter":
      // Заходимо у справжній вузол: перевірка «if node is None» — хибна, йдемо далі.
      return { lines: [2], contextLines: [1] }
    case "visit":
      return { lines: [visitLine], contextLines: [] }
    case "base":
      // Виклик для порожньої дитини: перевірка істинна → повертаємось одразу.
      return { lines: [2, 3], contextLines: [] }
    case "leave":
      return { lines: [], contextLines: [1] }
    default:
      return { lines: [], contextLines: [] }
  }
}

/** Ключ нарації події (наповнюється в messages.ts). */
function captionKey(kind: BtEventKind): string {
  return `play.nBt${kind.charAt(0).toUpperCase()}${kind.slice(1)}`
}

/** Локалізована назва порядку обходу (для нарації). */
function orderNameVar(order: TraversalOrder, t: Translate): string {
  return t(`play.btName_${order}`)
}

/** Перетворює одну подію журналу на кадр (рядки коду + нарація). */
function frameFor(
  ev: BtEvent,
  tree: BinaryTree,
  t: Translate,
): Omit<BtFrame, "i"> {
  const { lines, contextLines } = linesFor(ev.order, ev.kind)
  const node = ev.nodeId !== null ? tree.nodes[ev.nodeId] : null
  const parent = ev.parentId !== null ? tree.nodes[ev.parentId] : null
  const sideLabel =
    ev.side === "left"
      ? t("play.btSideLeft")
      : ev.side === "right"
        ? t("play.btSideRight")
        : ""

  const vars: Record<string, string | number> = {
    value: node?.value ?? 0,
    depth: node?.depth ?? 0,
    parent: parent?.value ?? 0,
    side: sideLabel,
    count: ev.visits,
    stackDepth: ev.stack.length,
    calls: ev.calls,
    nodes: tree.nodes.length,
    order: orderNameVar(ev.order, t),
    sequence: formatArray(ev.output),
  }

  return {
    order: ev.order,
    kind: ev.kind,
    nodeId: ev.nodeId,
    parentId: ev.parentId,
    side: ev.side,
    stack: ev.stack,
    visited: ev.visited,
    output: ev.output,
    justVisited: ev.kind === "visit" ? ev.nodeId : null,
    calls: ev.calls,
    visits: ev.visits,
    lines,
    contextLines,
    caption: t(captionKey(ev.kind), vars),
  }
}

/**
 * Проганяє обхід дерева й збирає trace для плеєра/віджетів: по кадру на кожну подію
 * журналу + підсумок. Дефолт — прямий (preorder) обхід. Дерево задається рівневим
 * списком (BFS-серіалізація з `null` для порожніх дітей).
 */
export function buildTreeTraversalTrace(
  levels: readonly (number | null)[],
  order: TraversalOrder = "preorder",
  t: Translate = identityTranslate,
): BtTrace {
  const tree = buildTree(levels)
  const { events } = treeTraversalSteps(tree, order)
  const frames: BtFrame[] = events.map((ev, i) => ({ i, ...frameFor(ev, tree, t) }))

  const result: BtResult = {
    order,
    output: traverse(tree, order),
    visitedOrder: [],
    nodes: nodeCount(tree),
    leaves: countLeaves(tree),
    height: treeHeight(tree),
    calls: events.filter((e) => e.kind === "enter" || e.kind === "base").length,
  }
  // visitedOrder = послідовність id відвіданих вузлів (для звірки з output).
  const visitedOrder = events
    .filter((e) => e.kind === "visit")
    .map((e) => e.nodeId as number)
  return { code: codeFor(order), frames, result: { ...result, visitedOrder } }
}
