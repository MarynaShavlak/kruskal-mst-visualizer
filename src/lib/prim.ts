// Алгоритм Прима (мінімальне остовне дерево) — фреймворк-незалежне ядро.
// Працює з тим самим неорієнтованим зваженим графом, що й Краскал (lib/graph),
// але будує МОД інакше: дерево росте з однієї вершини, щокроку приєднуючи
// найдешевше ребро через розріз «дерево ↔ решта». Кандидати тримаємо в черзі з
// пріоритетами (двійкова купа); застарілі ребра відсіює «ліниве видалення».
//
// Дві реалізації, що ОБОВ'ЯЗКОВО дають той самий результат (як Kruskal DSU vs
// has-path): primMstLazy (лінива черга, основна — її ж інструментує primTrace)
// і primMstEager (бонусна eager-версія: для кожної вершини поза деревом лише
// найкраще відоме ребро, черга без дублікатів).

import type { Edge, Graph, Vertex } from "@/lib/graph"

/**
 * Елемент черги з пріоритетами: ребро-кандидат `(вага, звідки, куди)`, де
 * `from` — кінець уже в дереві, `to` — вершина-кандидат поза деревом.
 * `id` — нормалізований id ребра ("u|v") для підсвітки на панелі графа.
 */
export interface PrimQueueEdge {
  readonly id: string
  readonly from: Vertex
  readonly to: Vertex
  readonly weight: number
}

/**
 * Лексикографічне порівняння `(вага, звідки, куди)` — як кортежі в Python heapq.
 * Спершу вага, за рівності — імена вершин; «нічия» вирішується за алфавітом, тож
 * порядок зняття з черги повністю детермінований.
 */
export function compareQueueEdge(a: PrimQueueEdge, b: PrimQueueEdge): number {
  if (a.weight !== b.weight) return a.weight - b.weight
  if (a.from !== b.from) return a.from < b.from ? -1 : 1
  if (a.to !== b.to) return a.to < b.to ? -1 : 1
  return 0
}

/** Двійкова min-купа з інжектованим компаратором (аналог heapq). */
export class MinHeap<T> {
  private readonly items: T[] = []
  private readonly cmp: (a: T, b: T) => number

  constructor(cmp: (a: T, b: T) => number) {
    this.cmp = cmp
  }

  get size(): number {
    return this.items.length
  }

  peek(): T | undefined {
    return this.items[0]
  }

  push(x: T): void {
    const a = this.items
    a.push(x)
    let i = a.length - 1
    while (i > 0) {
      const p = (i - 1) >> 1
      if (this.cmp(a[i], a[p]) >= 0) break
      ;[a[i], a[p]] = [a[p], a[i]]
      i = p
    }
  }

  pop(): T | undefined {
    const a = this.items
    if (a.length === 0) return undefined
    const top = a[0]
    const last = a.pop() as T
    if (a.length > 0) {
      a[0] = last
      let i = 0
      const n = a.length
      for (;;) {
        const l = 2 * i + 1
        const r = l + 1
        let m = i
        if (l < n && this.cmp(a[l], a[m]) < 0) m = l
        if (r < n && this.cmp(a[r], a[m]) < 0) m = r
        if (m === i) break
        ;[a[i], a[m]] = [a[m], a[i]]
        i = m
      }
    }
    return top
  }

  /** Знімок вмісту, відсортований за пріоритетом (для панелі черги). */
  toSorted(): T[] {
    return [...this.items].sort(this.cmp)
  }
}

/** Інцидентні до `v` ребра у порядку списку ребер графа; `other` — другий кінець. */
export function incidentEdges(
  g: Graph,
  v: Vertex,
): Array<{ readonly edge: Edge; readonly other: Vertex }> {
  const res: Array<{ edge: Edge; other: Vertex }> = []
  for (const edge of g.edges) {
    if (edge.u === v) res.push({ edge, other: edge.v })
    else if (edge.v === v) res.push({ edge, other: edge.u })
  }
  return res
}

/** Результат прогону Прима. */
export interface PrimRunResult {
  /** Стартова вершина. */
  readonly start: Vertex
  /** Прийняті ребра у порядку додавання (нормалізовані id). */
  readonly mstEdgeIds: readonly string[]
  readonly totalWeight: number
  /** Вершини у порядку приєднання до дерева (старт — перша). */
  readonly order: readonly Vertex[]
  /** Чи вийшло остовне дерево (охоплено всі вершини). */
  readonly isSpanning: boolean
  /** Скільки ребер знято з черги (вкл. застарілі). */
  readonly poppedCount: number
  /** Скільки знятих ребер виявились застарілими (ліниве видалення). */
  readonly staleCount: number
}

const empty = (start: Vertex): PrimRunResult => ({
  start,
  mstEdgeIds: [],
  totalWeight: 0,
  order: start ? [start] : [],
  isSpanning: true,
  poppedCount: 0,
  staleCount: 0,
})

/**
 * Базова (лінива) реалізація Прима. Кандидати — у черзі з пріоритетами; знявши
 * ребро, перевіряємо `to`: якщо вершина ще зовні — приймаємо, інакше ребро
 * застаріле (ліниве видалення). На незв'язному графі НЕ «вибухає», а коректно
 * зупиняється, коли черга порожніє: повертає дерево компоненти старту і
 * `isSpanning=false`.
 */
export function primMstLazy(graph: Graph, start?: Vertex): PrimRunResult {
  const n = graph.vertices.length
  if (n === 0) return empty("")
  const s = start ?? graph.vertices[0]

  const visited = new Set<Vertex>([s])
  const order: Vertex[] = [s]
  const mst: string[] = []
  let total = 0
  let popped = 0
  let stale = 0

  const heap = new MinHeap<PrimQueueEdge>(compareQueueEdge)
  for (const { edge, other } of incidentEdges(graph, s)) {
    if (!visited.has(other)) {
      heap.push({ id: edge.id, from: s, to: other, weight: edge.weight })
    }
  }

  while (visited.size < n && heap.size > 0) {
    const q = heap.pop() as PrimQueueEdge
    popped++
    if (visited.has(q.to)) {
      stale++
      continue
    }
    visited.add(q.to)
    order.push(q.to)
    mst.push(q.id)
    total += q.weight
    for (const { edge, other } of incidentEdges(graph, q.to)) {
      if (!visited.has(other)) {
        heap.push({ id: edge.id, from: q.to, to: other, weight: edge.weight })
      }
    }
  }

  return {
    start: s,
    mstEdgeIds: mst,
    totalWeight: total,
    order,
    isSpanning: visited.size === n,
    poppedCount: popped,
    staleCount: stale,
  }
}

/**
 * Eager-версія: для кожної вершини поза деревом тримаємо лише НАЙКРАЩЕ відоме
 * ребро `best[v] = (вага, u)` і оновлюємо його, коли знаходимо дешевше
 * (decrease-key). Черга без дублікатів і застарілих ребер, пам'ять O(V).
 * Будує те саме МОД, що й лінива версія (тести це перевіряють).
 */
export function primMstEager(graph: Graph, start?: Vertex): PrimRunResult {
  const n = graph.vertices.length
  if (n === 0) return empty("")
  const s = start ?? graph.vertices[0]

  const visited = new Set<Vertex>([s])
  const order: Vertex[] = [s]
  const mst: string[] = []
  let total = 0

  // best[v] = найдешевше відоме ребро, що з'єднує v із деревом.
  const best = new Map<Vertex, { from: Vertex; id: string; weight: number }>()
  const relax = (v: Vertex): void => {
    for (const { edge, other } of incidentEdges(graph, v)) {
      if (visited.has(other)) continue
      const cur = best.get(other)
      if (!cur || edge.weight < cur.weight) {
        best.set(other, { from: v, id: edge.id, weight: edge.weight })
      }
    }
  }
  relax(s)

  while (best.size > 0) {
    // Детермінований вибір: найменша вага, за рівності — менша вершина.
    let pick: Vertex | null = null
    let pickW = Infinity
    for (const [v, b] of best) {
      if (b.weight < pickW || (b.weight === pickW && (pick === null || v < pick))) {
        pick = v
        pickW = b.weight
      }
    }
    const v = pick as Vertex
    const b = best.get(v) as { from: Vertex; id: string; weight: number }
    best.delete(v)
    visited.add(v)
    order.push(v)
    mst.push(b.id)
    total += b.weight
    relax(v)
  }

  return {
    start: s,
    mstEdgeIds: mst,
    totalWeight: total,
    order,
    isSpanning: visited.size === n,
    poppedCount: mst.length,
    staleCount: 0,
  }
}
