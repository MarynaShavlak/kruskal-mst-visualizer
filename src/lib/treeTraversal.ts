// Двійкове (бінарне) дерево + три класичні обходи в глибину — перша ДЕРЕВНА
// структура на платформі. Кожен вузол має не більше двох дітей (left/right); обхід —
// це відвідування КОЖНОГО вузла рівно один раз у певному порядку через рекурсію.
// Порт ідеї class Node + preorder/inorder/postorder із конспекту edu.goit
// «Дерева. Реалізація. Обхід дерева». Фреймворк-незалежне ядро, без React.
//
// ТРИ порядки (різниться лише МОМЕНТ, коли відвідуємо корінь відносно піддерев):
//   preorder  (прямий):    КОРІНЬ → ліве → праве
//   inorder   (центровий): ліве → КОРІНЬ → праве   (на BST дає ВІДСОРТОВАНУ послідовність)
//   postorder (зворотний): ліве → праве → КОРІНЬ   (діти раніше за батька — суми, видалення)
//
// Дерево задається РІВНЕВОЮ серіалізацією (як у LeetCode): значення зверху-вниз,
// зліва-направо; `null` — порожньо (немає дитини). Порожній вузол дітей не породжує,
// тож серіалізація компактна й описує довільні (несиметричні) дерева.
//
// Рівні (як radixSort/hashTable): buildTree/traverse* — базова структура й результат;
// treeTraversalSteps — інструментований журнал подій зі знімками для візуалізацій.

/** Порядок обходу дерева. */
export type TraversalOrder = "preorder" | "inorder" | "postorder"

/** Усі три порядки — для перемикача й ітерацій у тестах. */
export const TRAVERSAL_ORDERS: readonly TraversalOrder[] = [
  "preorder",
  "inorder",
  "postorder",
]

/** Бік дитини відносно батька (для нарації базового випадку «порожньо»). */
export type ChildSide = "left" | "right"

/**
 * Вузол дерева з ідентичністю. `id` — стабільний (= позиція у `nodes`, у порядку
 * створення при рівневому обході), тож кадри trace й підсвітка посилаються на вузол
 * за `id`, а не за значенням (значення можуть повторюватися).
 */
export interface BtNode {
  readonly id: number
  readonly value: number
  readonly left: number | null
  readonly right: number | null
  readonly parent: number | null
  /** Глибина: корінь = 0. */
  readonly depth: number
}

/** Побудоване дерево: вузли, індексовані за `id`, і корінь (або null для порожнього). */
export interface BinaryTree {
  readonly nodes: readonly BtNode[]
  readonly root: number | null
}

// ---------------------------------------------------------------------------
// Побудова дерева з рівневої серіалізації
// ---------------------------------------------------------------------------

interface MutNode {
  id: number
  value: number
  left: number | null
  right: number | null
  parent: number | null
  depth: number
}

/**
 * Будує дерево з рівневого списку (BFS-серіалізація): `levels[0]` — корінь, далі
 * значення читаються по черзі як ліва/права дитина вузлів у порядку черги; `null`
 * означає «дитини немає» (і такий порожній вузол дітей не породжує). Порожній список
 * або `null` на місці кореня → порожнє дерево.
 */
export function buildTree(levels: readonly (number | null)[]): BinaryTree {
  if (levels.length === 0 || levels[0] == null) {
    return { nodes: [], root: null }
  }
  const nodes: MutNode[] = [
    { id: 0, value: levels[0], left: null, right: null, parent: null, depth: 0 },
  ]
  const queue: number[] = [0]
  let idx = 1

  while (queue.length > 0 && idx < levels.length) {
    const parentId = queue.shift() as number
    const parent = nodes[parentId]

    // Ліва дитина.
    if (idx < levels.length) {
      const v = levels[idx]
      idx += 1
      if (v != null) {
        const childId = nodes.length
        nodes.push({
          id: childId,
          value: v,
          left: null,
          right: null,
          parent: parentId,
          depth: parent.depth + 1,
        })
        parent.left = childId
        queue.push(childId)
      }
    }

    // Права дитина.
    if (idx < levels.length) {
      const v = levels[idx]
      idx += 1
      if (v != null) {
        const childId = nodes.length
        nodes.push({
          id: childId,
          value: v,
          left: null,
          right: null,
          parent: parentId,
          depth: parent.depth + 1,
        })
        parent.right = childId
        queue.push(childId)
      }
    }
  }

  return { nodes: nodes.map((n) => ({ ...n })), root: 0 }
}

/** Кількість вузлів дерева. */
export function nodeCount(tree: BinaryTree): number {
  return tree.nodes.length
}

/** Кількість листків (вузлів без дітей). */
export function countLeaves(tree: BinaryTree): number {
  return tree.nodes.filter((n) => n.left === null && n.right === null).length
}

/**
 * Висота дерева — число РЕБЕР найдовшого шляху корінь→лист (порожнє дерево → -1,
 * один вузол → 0). Саме так висоту означено в конспекті.
 */
export function treeHeight(tree: BinaryTree): number {
  if (tree.root === null) return -1
  const byId = new Map(tree.nodes.map((n) => [n.id, n]))
  const heightOf = (id: number | null): number => {
    if (id === null) return -1
    const n = byId.get(id)
    if (!n) return -1
    return 1 + Math.max(heightOf(n.left), heightOf(n.right))
  }
  return heightOf(tree.root)
}

// ---------------------------------------------------------------------------
// Базові обходи (еталонний результат — послідовність значень)
// ---------------------------------------------------------------------------

function traverseValues(tree: BinaryTree, order: TraversalOrder): number[] {
  // Індексуємо за id через Map — знімки можуть мати НЕщільні id (BST зі стабільними id).
  const byId = new Map(tree.nodes.map((n) => [n.id, n]))
  const out: number[] = []
  const walk = (id: number | null): void => {
    if (id === null) return
    const n = byId.get(id)
    if (!n) return
    if (order === "preorder") out.push(n.value)
    walk(n.left)
    if (order === "inorder") out.push(n.value)
    walk(n.right)
    if (order === "postorder") out.push(n.value)
  }
  walk(tree.root)
  return out
}

/** Прямий (preorder) обхід: корінь → ліве → праве. */
export function preorder(tree: BinaryTree): number[] {
  return traverseValues(tree, "preorder")
}

/** Центровий (inorder) обхід: ліве → корінь → праве. */
export function inorder(tree: BinaryTree): number[] {
  return traverseValues(tree, "inorder")
}

/** Зворотний (postorder) обхід: ліве → праве → корінь. */
export function postorder(tree: BinaryTree): number[] {
  return traverseValues(tree, "postorder")
}

/** Обхід у заданому порядку (диспетчер). */
export function traverse(tree: BinaryTree, order: TraversalOrder): number[] {
  return traverseValues(tree, order)
}

// ---------------------------------------------------------------------------
// Розкладка для SVG (чиста, спільна для редактора/плеєра/навчання)
// ---------------------------------------------------------------------------

/** Вузол із координатами сітки: `x` — колонка (за inorder-порядком), `y` — глибина. */
export interface BtLayoutNode extends BtNode {
  /** Колонка в сітці (0-based; призначається за inorder — гарантує відсутність накладань). */
  readonly gridX: number
  /** Рядок у сітці (= глибина). */
  readonly gridY: number
}

/** Результат розкладки: вузли з координатами + розміри сітки. */
export interface BtLayout {
  readonly nodes: readonly BtLayoutNode[]
  /** Кількість колонок (= кількість вузлів). */
  readonly cols: number
  /** Кількість рядків (= висота + 1). */
  readonly rows: number
}

/**
 * Розкладка дерева для малювання: колонка вузла = його позиція в ЦЕНТРОВОМУ (inorder)
 * обході (тому ліве піддерево цілком ліворуч, праве — праворуч, без накладань), рядок =
 * глибина. Порожнє дерево → порожня розкладка.
 */
export function layoutTree(tree: BinaryTree): BtLayout {
  if (tree.root === null) return { nodes: [], cols: 0, rows: 0 }
  // Індексуємо за `id` через Map (а не масив-за-позицією): id можуть бути НЕщільними
  // — двійкове дерево пошуку тримає стабільні id вузлів попри видалення.
  const byId = new Map(tree.nodes.map((n) => [n.id, n]))
  const gridX = new Map<number, number>()
  let col = 0
  const assign = (id: number | null): void => {
    if (id === null) return
    const n = byId.get(id)
    if (!n) return
    assign(n.left)
    gridX.set(id, col)
    col += 1
    assign(n.right)
  }
  assign(tree.root)

  let maxDepth = 0
  for (const n of tree.nodes) maxDepth = Math.max(maxDepth, n.depth)

  const nodes = tree.nodes.map((n) => ({ ...n, gridX: gridX.get(n.id) ?? 0, gridY: n.depth }))
  return { nodes, cols: tree.nodes.length, rows: maxDepth + 1 }
}

// ---------------------------------------------------------------------------
// Інструментований прогін: журнал подій зі знімками (для trace/візуалізацій)
// ---------------------------------------------------------------------------

/**
 * Тип події журналу обходу.
 * `enter` — виклик traverse(node) для СПРАВЖНЬОГО вузла (кладемо на стек рекурсії);
 * `visit` — відвідали вузол (print → у результат) у момент, що залежить від порядку;
 * `base`  — виклик traverse(None) для порожньої дитини (умова «if node is None» істинна →
 *           одразу назад); саме він зупиняє рекурсію;
 * `leave` — вузол оброблено, знімаємо зі стека (функція повертається).
 */
export type BtEventKind = "init" | "enter" | "visit" | "base" | "leave" | "done"

/** Один запис журналу: незмінний знімок стека/результату + активні поля + лічильники. */
export interface BtEvent {
  readonly kind: BtEventKind
  readonly order: TraversalOrder
  /** Вузол, якого стосується подія (для `base` — null: дитини немає). */
  readonly nodeId: number | null
  /** Для `base`: батько й бік, куди марно спробували піти. */
  readonly parentId: number | null
  readonly side: ChildSide | null
  /** Стек рекурсії (id справжніх вузлів, від кореня до поточного) на цей момент. */
  readonly stack: readonly number[]
  /** Відвідані вузли (id) у порядку відвідування — на цей момент. */
  readonly visited: readonly number[]
  /** Результат-послідовність значень на цей момент. */
  readonly output: readonly number[]
  /** Скільки викликів функції зроблено (enter + base) — «ціна» рекурсії. */
  readonly calls: number
  /** Скільки вузлів відвідано (= довжина output). */
  readonly visits: number
}

/** Результат інструментованого прогону: журнал подій + фінальний результат. */
export interface BtStepsResult {
  readonly events: readonly BtEvent[]
  readonly order: TraversalOrder
  readonly output: readonly number[]
  readonly visitedOrder: readonly number[]
  readonly calls: number
}

/**
 * Проганяє рекурсивний обхід дерева, кладучи в журнал незмінний знімок після кожної
 * значущої події (виклик/відвідування/база/повернення). Саме цей журнал
 * `buildTreeTraversalTrace` перетворює на кадри плеєра.
 */
export function treeTraversalSteps(
  tree: BinaryTree,
  order: TraversalOrder,
): BtStepsResult {
  const events: BtEvent[] = []
  const stack: number[] = []
  const visited: number[] = []
  const output: number[] = []
  let calls = 0

  const push = (
    kind: BtEventKind,
    fields: {
      nodeId?: number | null
      parentId?: number | null
      side?: ChildSide | null
    } = {},
  ): void => {
    events.push({
      kind,
      order,
      nodeId: fields.nodeId ?? null,
      parentId: fields.parentId ?? null,
      side: fields.side ?? null,
      stack: [...stack],
      visited: [...visited],
      output: [...output],
      calls,
      visits: output.length,
    })
  }

  push("init")

  const walk = (id: number | null, parentId: number | null, side: ChildSide | null): void => {
    calls += 1
    if (id === null) {
      push("base", { nodeId: null, parentId, side })
      return
    }
    const n = tree.nodes[id]
    stack.push(id)
    push("enter", { nodeId: id })

    const visitHere = (): void => {
      visited.push(id)
      output.push(n.value)
      push("visit", { nodeId: id })
    }

    if (order === "preorder") visitHere()
    walk(n.left, id, "left")
    if (order === "inorder") visitHere()
    walk(n.right, id, "right")
    if (order === "postorder") visitHere()

    push("leave", { nodeId: id })
    stack.pop()
  }

  walk(tree.root, null, null)
  push("done")

  return { events, order, output: [...output], visitedOrder: [...visited], calls }
}
