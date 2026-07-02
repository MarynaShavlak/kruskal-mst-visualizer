// Двійкове дерево пошуку (ДДП / BST) — друга ДЕРЕВНА структура на платформі (після
// обходу дерева). Дерево з ПРАВИЛОМ упорядкування: у лівому піддереві будь-якого вузла
// всі ключі МЕНШІ за його ключ, у правому — БІЛЬШІ (ліве й праве піддерева теж ДДП).
// Це правило робить вставку/пошук/видалення логарифмічними на збалансованому дереві
// (і лінійними — на виродженому). Порт class Node + insert/search/delete із конспекту
// edu.goit «Двійкове дерево пошуку». Фреймворк-незалежне ядро, без React.
//
// Модель — СКРИПТ операцій над спільним деревом (як hash-table): послідовність
// insert/search/delete, застосованих до дерева, що починається порожнім. Ключі — набір
// (унікальні): повторний insert наявного ключа нічого не змінює.
//
// Рівні (як hashTable/radix): bstSteps — інструментований прогін (журнал подій зі
// знімками для візуалізації), runBst — тонка обгортка (фінальний стан + результат
// кожної операції), похідна від журналу (без дублювання складної логіки видалення).
//
// Знімок дерева — тип BinaryTree з treeTraversal (спільне представлення й розкладка
// layoutTree). Вузли несуть СТАБІЛЬНІ id (лічильник, не перевикористовується), тож
// кадри посилаються на вузол за id навіть під час видалення (де значення тимчасово
// дублюється при заміні на наступник).

import { treeHeight, type BinaryTree, type BtNode } from "@/lib/treeTraversal"

/** Вид операції над деревом. */
export type BstOpKind = "insert" | "search" | "delete"

/** Одна операція скрипта. */
export interface BstOp {
  readonly kind: BstOpKind
  readonly key: number
}

/** Наслідок операції (для вердикту в UI). */
export type BstOpResult = "inserted" | "exists" | "found" | "missing" | "deleted"

/** Класифікація вузла, що видаляється, за кількістю дітей. */
export type DeleteCase = "leaf" | "one-child" | "two-children"

// ---------------------------------------------------------------------------
// Внутрішнє представлення (вказівникове дерево зі стабільними id)
// ---------------------------------------------------------------------------

interface Nd {
  id: number
  val: number
  left: Nd | null
  right: Nd | null
}

/** Глибокий знімок вказівникового дерева у BinaryTree (стабільні id + глибина). */
function snapshot(root: Nd | null): BinaryTree {
  if (root === null) return { nodes: [], root: null }
  const nodes: BtNode[] = []
  const walk = (nd: Nd, parent: number | null, depth: number): number => {
    const node = {
      id: nd.id,
      value: nd.val,
      left: null as number | null,
      right: null as number | null,
      parent,
      depth,
    }
    nodes.push(node)
    if (nd.left) node.left = walk(nd.left, nd.id, depth + 1)
    if (nd.right) node.right = walk(nd.right, nd.id, depth + 1)
    return nd.id
  }
  walk(root, null, 0)
  return { nodes, root: root.id }
}

// ---------------------------------------------------------------------------
// Інструментований прогін: журнал подій зі знімками
// ---------------------------------------------------------------------------

/** Куди веде порівняння ключа з поточним вузлом. */
export type BstDecision = "left" | "right" | "equal"

/** Тип події журналу bstSteps. */
export type BstEventKind =
  | "init"
  | "op_start"
  | "compare" // порівнюємо ключ із вузлом; decision left/right/equal
  | "insert" // ставимо новий вузол
  | "exists" // ключ уже є (повторна вставка)
  | "found" // пошук знайшов
  | "not_found" // пошук/видалення не знайшли
  | "succ_scan" // шукаємо наступник (мінімум правого піддерева) — крок ліворуч
  | "replace" // копіюємо значення наступника у вузол
  | "unlink" // від'єднуємо вузол (лист / один нащадок)
  | "op_done"
  | "done"

/** Один запис журналу: незмінний знімок дерева + активні поля + лічильники. */
export interface BstEvent {
  readonly kind: BstEventKind
  readonly tree: BinaryTree
  readonly opIndex: number | null
  readonly op: BstOp | null
  /** id вузла у фокусі цього кадру (порівнюємо / ставимо / видаляємо), або null. */
  readonly activeId: number | null
  /** id вузлів на пройденому шляху (порівняні), для тьмяної підсвітки. */
  readonly pathIds: readonly number[]
  /** Рішення порівняння (для compare), або null. */
  readonly decision: BstDecision | null
  /** id вузла-результату (знайдений / вставлений / ціль видалення), або null. */
  readonly resultId: number | null
  /** id наступника (для видалення вузла з двома дітьми), або null. */
  readonly successorId: number | null
  /** Класифікація видалення (leaf / one-child / two-children), або null. */
  readonly deleteCase: DeleteCase | null
  readonly opResult: BstOpResult | null
  /** Порівнянь ключів сумарно (монотонно). */
  readonly comparisons: number
}

/** Результат інструментованого прогону: журнал + фінальний стан і лічильники. */
export interface BstStepsResult {
  readonly events: readonly BstEvent[]
  readonly tree: BinaryTree
  readonly perOp: readonly BstPerOp[]
  readonly comparisons: number
}

/** Результат однієї операції в прогоні. */
export interface BstPerOp {
  readonly op: BstOp
  readonly result: BstOpResult
}

/**
 * Інструментований прогін скрипта операцій над ДДП. Після кожної значущої події кладе
 * у журнал незмінний знімок дерева, активні поля й монотонний лічильник порівнянь.
 * Саме цей журнал `buildBinarySearchTreeTrace` перетворює на кадри плеєра.
 */
export function bstSteps(ops: readonly BstOp[]): BstStepsResult {
  let root: Nd | null = null
  let nextId = 0
  const events: BstEvent[] = []
  const perOp: BstPerOp[] = []
  let comparisons = 0

  const newNode = (val: number): Nd => ({ id: nextId++, val, left: null, right: null })

  const push = (
    kind: BstEventKind,
    opIndex: number | null,
    op: BstOp | null,
    fields: Partial<Omit<BstEvent, "kind" | "tree" | "opIndex" | "op" | "comparisons">> = {},
  ): void => {
    events.push({
      kind,
      tree: snapshot(root),
      opIndex,
      op,
      activeId: fields.activeId ?? null,
      pathIds: fields.pathIds ? [...fields.pathIds] : [],
      decision: fields.decision ?? null,
      resultId: fields.resultId ?? null,
      successorId: fields.successorId ?? null,
      deleteCase: fields.deleteCase ?? null,
      opResult: fields.opResult ?? null,
      comparisons,
    })
  }

  const decisionFor = (key: number, val: number): BstDecision =>
    key === val ? "equal" : key < val ? "left" : "right"

  push("init", null, null)

  ops.forEach((op, opIndex) => {
    push("op_start", opIndex, op)
    const path: number[] = []

    if (op.kind === "insert") {
      if (root === null) {
        root = newNode(op.key)
        push("insert", opIndex, op, { activeId: root.id, resultId: root.id, opResult: "inserted" })
        push("op_done", opIndex, op, { opResult: "inserted" })
        perOp.push({ op, result: "inserted" })
        return
      }
      let cur: Nd = root
      for (;;) {
        comparisons += 1
        const dec = decisionFor(op.key, cur.val)
        path.push(cur.id)
        push("compare", opIndex, op, { activeId: cur.id, pathIds: path, decision: dec })
        if (dec === "equal") {
          push("exists", opIndex, op, { activeId: cur.id, pathIds: path, resultId: cur.id, opResult: "exists" })
          push("op_done", opIndex, op, { opResult: "exists" })
          perOp.push({ op, result: "exists" })
          return
        }
        if (dec === "left") {
          if (cur.left === null) {
            const node = newNode(op.key)
            cur.left = node
            push("insert", opIndex, op, { activeId: node.id, pathIds: path, resultId: node.id, opResult: "inserted" })
            break
          }
          cur = cur.left
        } else {
          if (cur.right === null) {
            const node = newNode(op.key)
            cur.right = node
            push("insert", opIndex, op, { activeId: node.id, pathIds: path, resultId: node.id, opResult: "inserted" })
            break
          }
          cur = cur.right
        }
      }
      push("op_done", opIndex, op, { opResult: "inserted" })
      perOp.push({ op, result: "inserted" })
      return
    }

    if (op.kind === "search") {
      let cur = root
      while (cur !== null) {
        comparisons += 1
        const dec = decisionFor(op.key, cur.val)
        path.push(cur.id)
        push("compare", opIndex, op, { activeId: cur.id, pathIds: path, decision: dec })
        if (dec === "equal") {
          push("found", opIndex, op, { activeId: cur.id, pathIds: path, resultId: cur.id, opResult: "found" })
          push("op_done", opIndex, op, { opResult: "found" })
          perOp.push({ op, result: "found" })
          return
        }
        cur = dec === "left" ? cur.left : cur.right
      }
      push("not_found", opIndex, op, { pathIds: path, opResult: "missing" })
      push("op_done", opIndex, op, { opResult: "missing" })
      perOp.push({ op, result: "missing" })
      return
    }

    // delete
    let parent: Nd | null = null
    let cur = root
    while (cur !== null) {
      comparisons += 1
      const dec = decisionFor(op.key, cur.val)
      path.push(cur.id)
      push("compare", opIndex, op, { activeId: cur.id, pathIds: path, decision: dec })
      if (dec === "equal") break
      parent = cur
      cur = dec === "left" ? cur.left : cur.right
    }
    if (cur === null) {
      push("not_found", opIndex, op, { pathIds: path, opResult: "missing" })
      push("op_done", opIndex, op, { opResult: "missing" })
      perOp.push({ op, result: "missing" })
      return
    }

    // cur — вузол на видалення; parent — його батько (null, якщо це корінь).
    const target = cur
    const relink = (child: Nd | null): void => {
      if (parent === null) root = child
      else if (parent.left === target) parent.left = child
      else parent.right = child
    }

    if (target.left !== null && target.right !== null) {
      // Два нащадки: наступник = мінімум правого піддерева.
      let succParent = target
      let succ = target.right
      while (succ.left !== null) {
        push("succ_scan", opIndex, op, { activeId: succ.id, pathIds: path, resultId: target.id, successorId: succ.id, deleteCase: "two-children" })
        succParent = succ
        succ = succ.left
      }
      push("succ_scan", opIndex, op, { activeId: succ.id, pathIds: path, resultId: target.id, successorId: succ.id, deleteCase: "two-children" })
      // Копіюємо значення наступника у вузол, що видаляємо (тимчасово два однакові val).
      target.val = succ.val
      push("replace", opIndex, op, { activeId: target.id, pathIds: path, resultId: target.id, successorId: succ.id, deleteCase: "two-children" })
      // Від'єднуємо наступник (він має щонайбільше правого нащадка).
      if (succParent.left === succ) succParent.left = succ.right
      else succParent.right = succ.right
      push("unlink", opIndex, op, { activeId: succ.id, pathIds: path, resultId: target.id, deleteCase: "two-children", opResult: "deleted" })
    } else {
      const child = target.left ?? target.right
      const kase: DeleteCase = child === null ? "leaf" : "one-child"
      relink(child)
      push("unlink", opIndex, op, { activeId: target.id, pathIds: path, resultId: child?.id ?? null, deleteCase: kase, opResult: "deleted" })
    }
    push("op_done", opIndex, op, { opResult: "deleted" })
    perOp.push({ op, result: "deleted" })
  })

  push("done", null, null)

  return { events, tree: snapshot(root), perOp, comparisons }
}

// ---------------------------------------------------------------------------
// Базовий прогін (фінальний стан + результат кожної операції) — похідний від журналу
// ---------------------------------------------------------------------------

/** Підсумок прогону: фінальне дерево + вердикти операцій + лічильники. */
export interface BstRunResult {
  readonly tree: BinaryTree
  readonly perOp: readonly BstPerOp[]
  readonly comparisons: number
  /** Кількість вузлів у фінальному дереві. */
  readonly size: number
  /** Висота фінального дерева (порожнє = -1). */
  readonly height: number
}

/**
 * Проганяє скрипт і повертає фінальний стан + результат кожної операції. Тонка обгортка
 * над `bstSteps` (без дублювання логіки), плюс похідні size/height.
 */
export function runBst(ops: readonly BstOp[]): BstRunResult {
  const { tree, perOp, comparisons } = bstSteps(ops)
  return {
    tree,
    perOp,
    comparisons,
    size: tree.nodes.length,
    height: treeHeight(tree),
  }
}

/** Чи задовольняє дерево-знімок інваріант ДДП (ліворуч менше, праворуч більше)? */
export function isValidBst(tree: BinaryTree): boolean {
  const byId = new Map(tree.nodes.map((n) => [n.id, n]))
  const check = (id: number | null, lo: number, hi: number): boolean => {
    if (id === null) return true
    const n = byId.get(id)
    if (!n) return true
    if (n.value <= lo || n.value >= hi) return false
    return check(n.left, lo, n.value) && check(n.right, n.value, hi)
  }
  return check(tree.root, -Infinity, Infinity)
}
