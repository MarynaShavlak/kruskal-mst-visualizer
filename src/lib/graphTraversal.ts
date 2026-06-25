// Обхід графа: пошук у ширину (BFS) і в глибину (DFS) — спільне фреймворк-незалежне
// ядро для двох алгоритмів. Працює з тим самим неорієнтованим графом (lib/graph);
// ваги ребер для обходу НЕ враховуються (обхід іде за суміжністю). Сусіди беруться
// у лексикографічному порядку — щоб результат був детермінованим і відтворюваним.
//
// Обидві стратегії — один цикл над «фронтиром»: BFS бере з ПОЧАТКУ (черга, FIFO),
// DFS — з КІНЦЯ (стек, LIFO; сусіди кладуться у зворотному порядку, щоб менша
// вершина оброблялась першою). Вершину позначаємо відвіданою при ЗНЯТТІ з фронтиру
// (а не при додаванні) — як у README: дублікати у фронтирі можливі, повторне зняття
// просто пропускаємо. Це дає еталонні порядки A B C D E F (BFS) і A B D E F C (DFS).
//
// Trace будується тим самим прогоном: кожна ітерація — крок «зняли вершину» з
// підкадрами pop → (visit | skip), плюс ініціалізація та завершення.

import { edgeId, type Graph, type Vertex } from "@/lib/graph"
import { createFrameList } from "@/lib/frameList"
import { identityTranslate, type Translate } from "@/lib/translate"

export type TraversalStrategy = "bfs" | "dfs"

/** Сусіди вершини у лексикографічному порядку (детермінізм обходу). */
export function sortedNeighbors(graph: Graph, v: Vertex): Vertex[] {
  const res: Vertex[] = []
  for (const e of graph.edges) {
    if (e.u === v) res.push(e.v)
    else if (e.v === v) res.push(e.u)
  }
  return res.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
}

/** Стартова вершина: задана (якщо є у графі) або лексикографічно найменша. */
export function startVertex(graph: Graph, start?: Vertex): Vertex {
  if (start && graph.vertices.includes(start)) return start
  return [...graph.vertices].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))[0] ?? ""
}

/** Елемент фронтиру: вершина + хто її туди поклав (для ребра-«відкриття»). */
interface FrontierItem {
  readonly v: Vertex
  readonly parent: Vertex | null
}

export interface TraversalResult {
  readonly strategy: TraversalStrategy
  readonly start: Vertex
  /** Вершини у порядку відвідування. */
  readonly order: readonly Vertex[]
  /** Ребра дерева обходу (відкриття), нормалізовані id. */
  readonly treeEdgeIds: readonly string[]
  readonly visitedCount: number
  readonly vertexCount: number
  /** Чи досягнуто всіх вершин (зв'язний граф з цього старту). */
  readonly isConnected: boolean
  /** Скільки разів знято елемент із фронтиру (вкл. повторні → пропуск). */
  readonly poppedCount: number
}

const emptyResult = (strategy: TraversalStrategy): TraversalResult => ({
  strategy,
  start: "",
  order: [],
  treeEdgeIds: [],
  visitedCount: 0,
  vertexCount: 0,
  isConnected: true,
  poppedCount: 0,
})

/** Прогін обходу без trace — для тестів і панелей. */
export function traverse(
  graph: Graph,
  strategy: TraversalStrategy,
  start?: Vertex,
): TraversalResult {
  const n = graph.vertices.length
  if (n === 0) return emptyResult(strategy)
  const s = startVertex(graph, start)

  const visited = new Set<Vertex>()
  const order: Vertex[] = []
  const tree: string[] = []
  const frontier: FrontierItem[] = [{ v: s, parent: null }]
  let popped = 0

  while (frontier.length > 0) {
    const item = strategy === "bfs" ? frontier.shift() : frontier.pop()
    if (!item) break
    popped++
    if (visited.has(item.v)) continue
    visited.add(item.v)
    order.push(item.v)
    if (item.parent !== null) tree.push(edgeId(item.parent, item.v))
    const fresh = sortedNeighbors(graph, item.v).filter((x) => !visited.has(x))
    const toPush = strategy === "bfs" ? fresh : [...fresh].reverse()
    for (const x of toPush) frontier.push({ v: x, parent: item.v })
  }

  return {
    strategy,
    start: s,
    order,
    treeEdgeIds: tree,
    visitedCount: visited.size,
    vertexCount: n,
    isConnected: visited.size === n,
    poppedCount: popped,
  }
}

// --- TRACE ------------------------------------------------------------------

/** Лістинги коду для панелі підсвітки (1-based індекси рядків). */
export const BFS_CODE: readonly string[] = [
  "def bfs(graph, start):",
  "    visited = set()",
  "    queue = deque([start])             # фронтир — черга (FIFO)",
  "    while queue:",
  "        v = queue.popleft()            # знімаємо з ПОЧАТКУ",
  "        if v not in visited:           # ще не відвідана?",
  "            visit(v)                   #   ← відвідуємо",
  "            visited.add(v)",
  "            for x in neighbors(v):     #   сусідів — у кінець черги",
  "                if x not in visited:",
  "                    queue.append(x)",
]

export const DFS_CODE: readonly string[] = [
  "def dfs(graph, start):",
  "    visited = set()",
  "    stack = [start]                    # фронтир — стек (LIFO)",
  "    while stack:",
  "        v = stack.pop()                # знімаємо з КІНЦЯ",
  "        if v not in visited:           # ще не відвідана?",
  "            visit(v)                   #   ← відвідуємо",
  "            visited.add(v)",
  "            for x in reversed(neighbors(v)):  # сусідів — у стек",
  "                if x not in visited:",
  "                    stack.append(x)",
]

export type TraversalSub = "init" | "pop" | "visit" | "skip" | "done"

export interface TraversalFrame {
  readonly i: number
  readonly sub: TraversalSub
  readonly strategy: TraversalStrategy
  /** 0 — ініціалізація, далі по знятій з фронтиру вершині. */
  readonly step: number
  readonly start: Vertex
  /** Відвідані вершини ПІСЛЯ події (копія). */
  readonly visited: readonly Vertex[]
  /** Порядок відвідування ПІСЛЯ події (копія). */
  readonly order: readonly Vertex[]
  /** Вміст фронтиру ПІСЛЯ події; для BFS «наступний» — індекс 0, для DFS — останній. */
  readonly frontier: readonly Vertex[]
  /** Вершина, знята цього кроку (pop/visit/skip), інакше null. */
  readonly current: Vertex | null
  /** Сусіди, щойно додані у фронтир (visit), інакше порожньо. */
  readonly pushed: readonly Vertex[]
  /** Ребра дерева обходу ПІСЛЯ події (копія). */
  readonly treeEdgeIds: readonly string[]
  /** Ребро-«відкриття» поточної вершини (visit), інакше null. */
  readonly currentEdgeId: string | null
  readonly lines: readonly number[]
  readonly contextLines: readonly number[]
  readonly caption: string
}

export interface TraversalTrace {
  readonly code: readonly string[]
  readonly frames: readonly TraversalFrame[]
  readonly result: TraversalResult
}

export interface TraversalRun {
  readonly result: TraversalResult
  readonly trace: TraversalTrace
}

/** Проганяє обхід і збирає trace для плеєра. Порядок збігається з `traverse`. */
export function buildTraversalTrace(
  graph: Graph,
  strategy: TraversalStrategy,
  start?: Vertex,
  t: Translate = identityTranslate,
): TraversalRun {
  const code = strategy === "bfs" ? BFS_CODE : DFS_CODE
  const n = graph.vertices.length
  const { frames, push } = createFrameList<TraversalFrame>()
  const fmtOrder = (arr: readonly Vertex[]): string =>
    arr.length > 0 ? arr.join(" → ") : "—"
  const fmtList = (arr: readonly Vertex[]): string =>
    arr.length > 0 ? arr.join(", ") : "—"

  if (n === 0) {
    push({
      sub: "done",
      strategy,
      step: 0,
      start: "",
      visited: [],
      order: [],
      frontier: [],
      current: null,
      pushed: [],
      treeEdgeIds: [],
      currentEdgeId: null,
      lines: [],
      contextLines: [],
      caption: t("play.nTravEmpty"),
    })
    return {
      result: emptyResult(strategy),
      trace: { code, frames, result: emptyResult(strategy) },
    }
  }

  const s = startVertex(graph, start)
  const visited = new Set<Vertex>()
  const order: Vertex[] = []
  const tree: string[] = []
  const frontier: FrontierItem[] = [{ v: s, parent: null }]
  let popped = 0
  let step = 0

  push({
    sub: "init",
    strategy,
    step: 0,
    start: s,
    visited: [],
    order: [],
    frontier: frontier.map((f) => f.v),
    current: null,
    pushed: [],
    treeEdgeIds: [],
    currentEdgeId: null,
    lines: [2, 3],
    contextLines: [],
    caption: t("play.nTravInit", { start: s }),
  })

  while (frontier.length > 0) {
    const item = strategy === "bfs" ? frontier.shift() : frontier.pop()
    if (!item) break
    popped++
    step++

    push({
      sub: "pop",
      strategy,
      step,
      start: s,
      visited: [...visited],
      order: [...order],
      frontier: frontier.map((f) => f.v),
      current: item.v,
      pushed: [],
      treeEdgeIds: [...tree],
      currentEdgeId: null,
      lines: [5],
      contextLines: [4],
      caption: t("play.nTravPop", { v: item.v }),
    })

    if (visited.has(item.v)) {
      push({
        sub: "skip",
        strategy,
        step,
        start: s,
        visited: [...visited],
        order: [...order],
        frontier: frontier.map((f) => f.v),
        current: item.v,
        pushed: [],
        treeEdgeIds: [...tree],
        currentEdgeId: null,
        lines: [6],
        contextLines: [4],
        caption: t("play.nTravSkip", { v: item.v }),
      })
      continue
    }

    visited.add(item.v)
    order.push(item.v)
    const currentEdgeId = item.parent !== null ? edgeId(item.parent, item.v) : null
    if (currentEdgeId) tree.push(currentEdgeId)
    const fresh = sortedNeighbors(graph, item.v).filter((x) => !visited.has(x))
    const toPush = strategy === "bfs" ? fresh : [...fresh].reverse()
    for (const x of toPush) frontier.push({ v: x, parent: item.v })

    push({
      sub: "visit",
      strategy,
      step,
      start: s,
      visited: [...visited],
      order: [...order],
      frontier: frontier.map((f) => f.v),
      current: item.v,
      pushed: [...fresh],
      treeEdgeIds: [...tree],
      currentEdgeId,
      lines: fresh.length > 0 ? [7, 8, 9, 10, 11] : [7, 8],
      contextLines: [4, 6],
      caption:
        fresh.length > 0
          ? t("play.nTravVisit", {
              v: item.v,
              order: fmtOrder(order),
              pushed: fmtList(fresh),
            })
          : t("play.nTravVisitNoPush", { v: item.v, order: fmtOrder(order) }),
    })
  }

  const isConnected = visited.size === n
  push({
    sub: "done",
    strategy,
    step,
    start: s,
    visited: [...visited],
    order: [...order],
    frontier: [],
    current: null,
    pushed: [],
    treeEdgeIds: [...tree],
    currentEdgeId: null,
    lines: [],
    contextLines: [],
    caption: isConnected
      ? t("play.nTravDone", { order: fmtOrder(order), k: visited.size, n })
      : t("play.nTravDoneDisc", { k: visited.size, n }),
  })

  const result: TraversalResult = {
    strategy,
    start: s,
    order: [...order],
    treeEdgeIds: [...tree],
    visitedCount: visited.size,
    vertexCount: n,
    isConnected,
    poppedCount: popped,
  }
  return { result, trace: { code, frames, result } }
}
