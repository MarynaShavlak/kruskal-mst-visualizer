// Модель trace для Прима — аналог floydWarshallTrace.ts / heldKarpTrace.ts.
// Лінива версія алгоритму проганяється ОДИН раз і пише список незмінних кадрів
// (PrimFrame); UI лише рухає курсор по них (scrubbing, крок назад). Формат
// ДВОРІВНЕВИЙ, як вимагає платформа: зовнішній крок — зняте з черги ребро;
// підкадри — "pop" (heappop + перевірка `if v not in visited`), далі "accept"
// (зелена гілка: вершина приєднується, нові ребра в чергу) або "skip" (червона
// гілка: ребро застаріле → ліниве видалення).
//
// Порядок кадрів дослівно повторює README: ініціалізація → по знятому з черги
// ребру → завершення. Результат (ребра/вага) збігається з primMstLazy на тому ж
// графі. Знімки черги (queue) відсортовані за пріоритетом зняття — для панелі
// «черга з пріоритетами».

import type { Graph, Vertex } from "@/lib/graph"
import {
  MinHeap,
  compareQueueEdge,
  incidentEdges,
  type PrimQueueEdge,
} from "@/lib/prim"
import { createFrameList } from "@/lib/frameList"
import { identityTranslate, type Translate } from "@/lib/translate"

/** Лістинг коду для панелі підсвітки (рядок = елемент, 1-based індекси). */
export const PRIM_CODE: readonly string[] = [
  "def prim_mst(graph):",
  "    mst = []                                # прийняті ребра МОД",
  "    visited = {graph.nodes[0]}              # старт: дерево з однієї вершини",
  "    edges = []                              # черга з пріоритетами (heap)",
  "    for u, v, w in graph.edges(visited):    # ребра старт-вершини → у чергу",
  "        heappush(edges, (w, u, v))",
  "    while visited != set(graph.nodes):      # доки в дереві не всі вершини",
  "        weight, u, v = heappop(edges)       # найдешевше ребро з черги",
  "        if v not in visited:                # вершина ще зовні?",
  "            visited.add(v)                  #   ← приймаємо: росте дерево",
  "            mst.append((u, v, weight))",
  "            for _, x, w in graph.edges(v):  #   нові кандидати у чергу",
  "                if x not in visited:",
  "                    heappush(edges, (w, v, x))",
  "        # інакше ребро застаріле → ліниве видалення (мовчки пропускаємо)",
  "    return mst",
]

/** Підкрок кадру. Дискримінант — `kind`; решта стану лежить на рівні кадру. */
export type PrimSub =
  | { readonly kind: "init" }
  | { readonly kind: "pop" }
  | { readonly kind: "accept" }
  | { readonly kind: "skip" }
  | { readonly kind: "done" }

export interface PrimFrame {
  readonly i: number
  readonly sub: PrimSub
  /** Номер кроку як у README: 0 — ініціалізація, далі по знятому ребру. */
  readonly step: number
  readonly start: Vertex
  /** Вершини дерева ПІСЛЯ події (копія). */
  readonly visited: readonly Vertex[]
  /** Прийняті ребра (id) у порядку додавання, ПІСЛЯ події (копія). */
  readonly mstEdgeIds: readonly string[]
  /** Вміст черги ПІСЛЯ події, відсортований за пріоритетом зняття. */
  readonly queue: readonly PrimQueueEdge[]
  /** Ребро, зняте з черги цього кроку (pop/accept/skip), інакше null. */
  readonly popped: PrimQueueEdge | null
  /** Ребра, щойно додані в чергу (accept), інакше порожньо. */
  readonly pushed: readonly PrimQueueEdge[]
  /** Вершина, щойно приєднана до дерева (accept/init), для «помаранчевого кільця». */
  readonly addedVertex: Vertex | null
  readonly total: number
  /** Підсвічені рядки коду (1-based у PRIM_CODE). */
  readonly lines: readonly number[]
  /** Рядки-контекст (охопні цикли) — тьмяна підсвітка. */
  readonly contextLines: readonly number[]
  /** Нарація. */
  readonly caption: string
}

export interface PrimResult {
  readonly start: Vertex
  /** Прийняті ребра у порядку додавання (нормалізовані id). */
  readonly mstEdgeIds: readonly string[]
  readonly totalWeight: number
  /** Чи вийшло остовне дерево (охоплено всі вершини). */
  readonly isSpanning: boolean
  /** Вершини у порядку приєднання (старт — перша). */
  readonly order: readonly Vertex[]
  /** Скільки ребер знято з черги (вкл. застарілі). */
  readonly poppedCount: number
  /** Скільки знятих ребер виявились застарілими. */
  readonly staleCount: number
  /** Кількість вершин графа (для «{k}/{n}»). */
  readonly vertexCount: number
}

export interface PrimTrace {
  readonly code: readonly string[]
  readonly frames: readonly PrimFrame[]
  readonly result: PrimResult
}

export interface PrimRun {
  readonly result: PrimResult
  readonly trace: PrimTrace
}

/**
 * Проганяє ліниву версію Прима й збирає trace для плеєра. Результат
 * (mstEdgeIds/totalWeight) збігається з `primMstLazy` на тому самому графі.
 */
export function buildPrimTrace(
  graph: Graph,
  start?: Vertex,
  t: Translate = identityTranslate,
): PrimRun {
  const n = graph.vertices.length
  const { frames, push } = createFrameList<PrimFrame>()

  const fmtEdge = (e: PrimQueueEdge): string => `(${e.weight}, ${e.from}, ${e.to})`
  const fmtList = (arr: readonly PrimQueueEdge[]): string =>
    arr.length > 0 ? arr.map(fmtEdge).join(", ") : "—"
  const label = (e: PrimQueueEdge): string => `${e.from}–${e.to}`

  if (n === 0) {
    push({
      sub: { kind: "done" },
      step: 0,
      start: "",
      visited: [],
      mstEdgeIds: [],
      queue: [],
      popped: null,
      pushed: [],
      addedVertex: null,
      total: 0,
      lines: [],
      contextLines: [],
      caption: t("play.nPrimEmpty"),
    })
    const result: PrimResult = {
      start: "",
      mstEdgeIds: [],
      totalWeight: 0,
      isSpanning: true,
      order: [],
      poppedCount: 0,
      staleCount: 0,
      vertexCount: 0,
    }
    return { result, trace: { code: PRIM_CODE, frames, result } }
  }

  const s = start ?? graph.vertices[0]
  const visited = new Set<Vertex>([s])
  const order: Vertex[] = [s]
  const mst: string[] = []
  let total = 0
  let popped = 0
  let stale = 0
  const need = n - 1
  const heap = new MinHeap<PrimQueueEdge>(compareQueueEdge)

  // --- ІНІЦІАЛІЗАЦІЯ: старт + ребра старт-вершини в чергу --------------------
  const initPushed: PrimQueueEdge[] = []
  for (const { edge, other } of incidentEdges(graph, s)) {
    if (!visited.has(other)) {
      const qe: PrimQueueEdge = { id: edge.id, from: s, to: other, weight: edge.weight }
      heap.push(qe)
      initPushed.push(qe)
    }
  }
  push({
    sub: { kind: "init" },
    step: 0,
    start: s,
    visited: [...visited],
    mstEdgeIds: [],
    queue: heap.toSorted(),
    popped: null,
    pushed: [...initPushed],
    addedVertex: s,
    total: 0,
    lines: [3, 4, 5, 6],
    contextLines: [],
    caption: t("play.nPrimInit", { start: s, pushed: fmtList(initPushed) }),
  })

  // --- ОСНОВНИЙ ЦИКЛ ---------------------------------------------------------
  let step = 0
  while (visited.size < n && heap.size > 0) {
    const e = heap.pop() as PrimQueueEdge
    popped++
    step++
    const queueAfterPop = heap.toSorted()

    push({
      sub: { kind: "pop" },
      step,
      start: s,
      visited: [...visited],
      mstEdgeIds: [...mst],
      queue: queueAfterPop,
      popped: e,
      pushed: [],
      addedVertex: null,
      total,
      lines: [8, 9],
      contextLines: [7],
      caption: t("play.nPrimPop", { edge: fmtEdge(e), to: e.to }),
    })

    if (visited.has(e.to)) {
      stale++
      push({
        sub: { kind: "skip" },
        step,
        start: s,
        visited: [...visited],
        mstEdgeIds: [...mst],
        queue: queueAfterPop,
        popped: e,
        pushed: [],
        addedVertex: null,
        total,
        lines: [15],
        contextLines: [7, 9],
        caption: t("play.nPrimSkip", { edge: fmtEdge(e), to: e.to }),
      })
      continue
    }

    visited.add(e.to)
    order.push(e.to)
    mst.push(e.id)
    total += e.weight
    const pushedNow: PrimQueueEdge[] = []
    for (const { edge, other } of incidentEdges(graph, e.to)) {
      if (!visited.has(other)) {
        const qe: PrimQueueEdge = { id: edge.id, from: e.to, to: other, weight: edge.weight }
        heap.push(qe)
        pushedNow.push(qe)
      }
    }
    push({
      sub: { kind: "accept" },
      step,
      start: s,
      visited: [...visited],
      mstEdgeIds: [...mst],
      queue: heap.toSorted(),
      popped: e,
      pushed: pushedNow,
      addedVertex: e.to,
      total,
      lines: pushedNow.length > 0 ? [10, 11, 12, 13, 14] : [10, 11],
      contextLines: [7],
      caption:
        pushedNow.length > 0
          ? t("play.nPrimAccept", {
              edge: label(e),
              w: e.weight,
              to: e.to,
              count: mst.length,
              need,
              total,
              pushed: fmtList(pushedNow),
            })
          : t("play.nPrimAcceptNoPush", {
              edge: label(e),
              w: e.weight,
              to: e.to,
              count: mst.length,
              need,
              total,
            }),
    })
  }

  const isSpanning = visited.size === n
  push({
    sub: { kind: "done" },
    step,
    start: s,
    visited: [...visited],
    mstEdgeIds: [...mst],
    queue: heap.toSorted(),
    popped: null,
    pushed: [],
    addedVertex: null,
    total,
    lines: isSpanning ? [16] : [],
    contextLines: [],
    caption: isSpanning
      ? t("play.nPrimDone", { n, need, total })
      : t("play.nPrimDoneDisc", { reached: visited.size, n, total }),
  })

  const result: PrimResult = {
    start: s,
    mstEdgeIds: [...mst],
    totalWeight: total,
    isSpanning,
    order: [...order],
    poppedCount: popped,
    staleCount: stale,
    vertexCount: n,
  }
  return { result, trace: { code: PRIM_CODE, frames, result } }
}
