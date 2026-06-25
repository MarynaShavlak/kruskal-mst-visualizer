// Алгоритм Дейкстри — найкоротші шляхи від однієї вершини до всіх інших у графі з
// НЕВІД'ЄМНИМИ вагами. Фреймворк-незалежне ядро над неорієнтованим зваженим графом
// (lib/graph). Реалізація проста (як у README): на кожному кроці лінійно обираємо
// непройдену вершину з найменшою відстанню, потім «послаблюємо» (relax) її сусідів.
// Складність O(V²) (вибір мінімуму лінійний) — наочно, без купи.
//
// Інваріанти/детермінізм: за рівних відстаней мінімум обираємо за меншим іменем
// вершини; сусідів обходимо в лексикографічному порядку. Недосяжні вершини мають
// відстань Infinity. Результат на еталоні (A-B5, A-C10, B-D3, C-D2, D-E4) від A:
// {A:0, B:5, C:10, D:8, E:12}.
//
// Trace будується тим самим прогоном: ініціалізація → по обраній вершині крок
// select (обрали мінімум) → relax (оновили сусідів) → завершення.

import { type Graph, type Vertex } from "@/lib/graph"
import { createFrameList } from "@/lib/frameList"
import { identityTranslate, type Translate } from "@/lib/translate"

/** Сусід зі зваженого ребра: куди, вага, id ребра (для підсвітки). */
export interface WeightedNeighbor {
  readonly to: Vertex
  readonly weight: number
  readonly id: string
}

/** Сусіди вершини зі зваженими ребрами, у лексикографічному порядку. */
export function weightedNeighbors(graph: Graph, v: Vertex): WeightedNeighbor[] {
  const res: WeightedNeighbor[] = []
  for (const e of graph.edges) {
    if (e.u === v) res.push({ to: e.v, weight: e.weight, id: e.id })
    else if (e.v === v) res.push({ to: e.u, weight: e.weight, id: e.id })
  }
  return res.sort((a, b) => (a.to < b.to ? -1 : a.to > b.to ? 1 : 0))
}

/** Стартова вершина: задана (якщо є у графі) або лексикографічно найменша. */
export function startVertex(graph: Graph, start?: Vertex): Vertex {
  if (start && graph.vertices.includes(start)) return start
  return [...graph.vertices].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))[0] ?? ""
}

export interface DijkstraResult {
  readonly start: Vertex
  /** Найкоротші відстані від старту (Infinity — недосяжна). */
  readonly distances: Record<Vertex, number>
  /** Попередник на найкоротшому шляху (для відновлення маршруту). */
  readonly prev: Record<Vertex, Vertex | null>
  /** Вершини у порядку остаточного опрацювання (вилучення з непройдених). */
  readonly order: readonly Vertex[]
  readonly reachedCount: number
  readonly vertexCount: number
  /** Скільки разів виконано relax (спроба оновити сусіда). */
  readonly relaxations: number
}

const emptyResult = (): DijkstraResult => ({
  start: "",
  distances: {},
  prev: {},
  order: [],
  reachedCount: 0,
  vertexCount: 0,
  relaxations: 0,
})

/** Прогін Дейкстри без trace — для тестів і панелей. */
export function dijkstra(graph: Graph, start?: Vertex): DijkstraResult {
  const n = graph.vertices.length
  if (n === 0) return emptyResult()
  const s = startVertex(graph, start)

  const distances: Record<Vertex, number> = {}
  const prev: Record<Vertex, Vertex | null> = {}
  for (const v of graph.vertices) {
    distances[v] = Infinity
    prev[v] = null
  }
  distances[s] = 0

  const unvisited = new Set<Vertex>(graph.vertices)
  const order: Vertex[] = []
  let relaxations = 0

  while (unvisited.size > 0) {
    // Лінійний вибір непройденої вершини з найменшою відстанню (tie → менше ім'я).
    let cur: Vertex | null = null
    let best = Infinity
    for (const v of unvisited) {
      const d = distances[v]
      if (d < best || (d === best && (cur === null || v < cur))) {
        cur = v
        best = d
      }
    }
    if (cur === null || distances[cur] === Infinity) break

    unvisited.delete(cur)
    order.push(cur)
    for (const { to, weight } of weightedNeighbors(graph, cur)) {
      relaxations++
      const alt = distances[cur] + weight
      if (alt < distances[to]) {
        distances[to] = alt
        prev[to] = cur
      }
    }
  }

  return {
    start: s,
    distances,
    prev,
    order,
    reachedCount: order.length,
    vertexCount: n,
    relaxations,
  }
}

/** Відновлює найкоротший шлях start→target за `prev` (порожній, якщо недосяжна). */
export function shortestPath(
  result: DijkstraResult,
  target: Vertex,
): Vertex[] {
  if (!(target in result.distances) || result.distances[target] === Infinity) {
    return []
  }
  const path: Vertex[] = []
  let at: Vertex | null = target
  while (at !== null) {
    path.unshift(at)
    at = result.prev[at] ?? null
  }
  return path
}

// --- TRACE ------------------------------------------------------------------

/** Лістинг коду для панелі підсвітки (1-based індекси рядків). */
export const DIJKSTRA_CODE: readonly string[] = [
  "def dijkstra(graph, start):",
  "    dist = {v: inf for v in graph}     # усі — нескінченність",
  "    dist[start] = 0                    # старт — 0",
  "    unvisited = set(graph)",
  "    while unvisited:",
  "        u = min(unvisited, key=dist)   # непройдена з найменшою dist",
  "        if dist[u] == inf: break       # решта недосяжна",
  "        for v, w in graph[u].items():  # послаблюємо сусідів",
  "            if dist[u] + w < dist[v]:",
  "                dist[v] = dist[u] + w  #   ← коротший шлях!",
  "        unvisited.remove(u)            # u остаточно опрацьовано",
  "    return dist",
]

export type DijkstraSub = "init" | "select" | "relax" | "done"

export interface DijkstraFrame {
  readonly i: number
  readonly sub: DijkstraSub
  /** 0 — ініціалізація, далі по обраній вершині. */
  readonly step: number
  readonly start: Vertex
  /** Відстані ПІСЛЯ події (копія; Infinity — ∞). */
  readonly distances: Record<Vertex, number>
  /** Остаточно опрацьовані вершини ПІСЛЯ події. */
  readonly visited: readonly Vertex[]
  /** Вершина, обрана цього кроку (select/relax), інакше null. */
  readonly current: Vertex | null
  /** Вершини, чию відстань покращено цього relax. */
  readonly updated: readonly Vertex[]
  /** Ребра, розглянуті цього relax (для червоної підсвітки). */
  readonly consideredEdgeIds: readonly string[]
  /** Усі ребра, що вже розглядалися (накопичувально). */
  readonly exploredEdgeIds: readonly string[]
  /** Ребра дерева найкоротших шляхів (за prev) ПІСЛЯ події. */
  readonly treeEdgeIds: readonly string[]
  readonly lines: readonly number[]
  readonly contextLines: readonly number[]
  readonly caption: string
}

export interface DijkstraTrace {
  readonly code: readonly string[]
  readonly frames: readonly DijkstraFrame[]
  readonly result: DijkstraResult
}

export interface DijkstraRun {
  readonly result: DijkstraResult
  readonly trace: DijkstraTrace
}

/** Ребра дерева найкоротших шляхів за поточним `prev` (нормалізовані id). */
function treeEdges(graph: Graph, prev: Record<Vertex, Vertex | null>): string[] {
  const byId = new Map(graph.edges.map((e) => [e.id, true]))
  const ids: string[] = []
  for (const v of graph.vertices) {
    const p = prev[v]
    if (p === null || p === undefined) continue
    const a = v < p ? v : p
    const b = v < p ? p : v
    const id = `${a}|${b}`
    if (byId.has(id)) ids.push(id)
  }
  return ids
}

const fmtDist = (d: number): string => (d === Infinity ? "∞" : String(d))

/** Проганяє Дейкстру й збирає trace для плеєра. Відстані збігаються з `dijkstra`. */
export function buildDijkstraTrace(
  graph: Graph,
  start?: Vertex,
  t: Translate = identityTranslate,
): DijkstraRun {
  const n = graph.vertices.length
  const { frames, push } = createFrameList<DijkstraFrame>()

  if (n === 0) {
    push({
      sub: "done",
      step: 0,
      start: "",
      distances: {},
      visited: [],
      current: null,
      updated: [],
      consideredEdgeIds: [],
      exploredEdgeIds: [],
      treeEdgeIds: [],
      lines: [],
      contextLines: [],
      caption: t("play.nDijkEmpty"),
    })
    return { result: emptyResult(), trace: { code: DIJKSTRA_CODE, frames, result: emptyResult() } }
  }

  const s = startVertex(graph, start)
  const distances: Record<Vertex, number> = {}
  const prev: Record<Vertex, Vertex | null> = {}
  for (const v of graph.vertices) {
    distances[v] = Infinity
    prev[v] = null
  }
  distances[s] = 0

  const unvisited = new Set<Vertex>(graph.vertices)
  const visited: Vertex[] = []
  const explored = new Set<string>()
  let relaxations = 0
  let step = 0

  push({
    sub: "init",
    step: 0,
    start: s,
    distances: { ...distances },
    visited: [],
    current: null,
    updated: [],
    consideredEdgeIds: [],
    exploredEdgeIds: [],
    treeEdgeIds: [],
    lines: [2, 3, 4],
    contextLines: [],
    caption: t("play.nDijkInit", { start: s }),
  })

  while (unvisited.size > 0) {
    let cur: Vertex | null = null
    let best = Infinity
    for (const v of unvisited) {
      const d = distances[v]
      if (d < best || (d === best && (cur === null || v < cur))) {
        cur = v
        best = d
      }
    }
    if (cur === null || distances[cur] === Infinity) break
    step++

    push({
      sub: "select",
      step,
      start: s,
      distances: { ...distances },
      visited: [...visited],
      current: cur,
      updated: [],
      consideredEdgeIds: [],
      exploredEdgeIds: [...explored],
      treeEdgeIds: treeEdges(graph, prev),
      lines: [6, 7],
      contextLines: [5],
      caption: t("play.nDijkSelect", { v: cur, d: fmtDist(distances[cur]) }),
    })

    unvisited.delete(cur)
    visited.push(cur)
    const updated: Vertex[] = []
    const considered: string[] = []
    for (const { to, weight, id } of weightedNeighbors(graph, cur)) {
      relaxations++
      considered.push(id)
      explored.add(id)
      const alt = distances[cur] + weight
      if (alt < distances[to]) {
        distances[to] = alt
        prev[to] = cur
        updated.push(to)
      }
    }

    push({
      sub: "relax",
      step,
      start: s,
      distances: { ...distances },
      visited: [...visited],
      current: cur,
      updated,
      consideredEdgeIds: considered,
      exploredEdgeIds: [...explored],
      treeEdgeIds: treeEdges(graph, prev),
      lines: updated.length > 0 ? [8, 9, 10, 11] : [8, 9, 11],
      contextLines: [5],
      caption:
        updated.length > 0
          ? t("play.nDijkRelax", { v: cur, updated: updated.join(", ") })
          : t("play.nDijkRelaxNone", { v: cur }),
    })
  }

  const reachedCount = visited.length
  const isFull = reachedCount === n
  push({
    sub: "done",
    step,
    start: s,
    distances: { ...distances },
    visited: [...visited],
    current: null,
    updated: [],
    consideredEdgeIds: [],
    exploredEdgeIds: [...explored],
    treeEdgeIds: treeEdges(graph, prev),
    lines: [12],
    contextLines: [],
    caption: isFull
      ? t("play.nDijkDone", { start: s })
      : t("play.nDijkDoneDisc", { start: s, k: reachedCount, n }),
  })

  const result: DijkstraResult = {
    start: s,
    distances,
    prev,
    order: [...visited],
    reachedCount,
    vertexCount: n,
    relaxations,
  }
  return { result, trace: { code: DIJKSTRA_CODE, frames, result } }
}
