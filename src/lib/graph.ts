// Неорієнтований зважений граф. Фреймворк-незалежний, JSON-серіалізовний.
// Ребро нормалізується як "A|B" (відсортовані кінці), без петель і дублів;
// ваги — додатні цілі. Усі мутації — іммутабельні (повертають новий граф).

export type Vertex = string

export interface Edge {
  /** Нормалізований id "u|v", де u <= v. */
  readonly id: string
  readonly u: Vertex
  readonly v: Vertex
  /** Додатна ціла вага. */
  readonly weight: number
}

export interface Graph {
  readonly vertices: readonly Vertex[]
  readonly edges: readonly Edge[]
}

/** Нормалізований id ребра: відсортовані кінці через "|". */
export function edgeId(a: Vertex, b: Vertex): string {
  return a <= b ? `${a}|${b}` : `${b}|${a}`
}

/** Порожній граф. */
export function emptyGraph(): Graph {
  return { vertices: [], edges: [] }
}

/** Чи є вершина у графі. */
export function hasVertex(g: Graph, v: Vertex): boolean {
  return g.vertices.includes(v)
}

/** Чи є ребро між a і b (симетрично). */
export function hasEdge(g: Graph, a: Vertex, b: Vertex): boolean {
  const id = edgeId(a, b)
  return g.edges.some((e) => e.id === id)
}

/** Додає вершину. Повертає той самий граф, якщо вже присутня. */
export function addVertex(g: Graph, v: Vertex): Graph {
  assertVertexName(v)
  if (hasVertex(g, v)) return g
  return { vertices: [...g.vertices, v], edges: g.edges }
}

/**
 * Додає ребро з валідацією: без петель, без дублів, вага — додатне ціле.
 * Відсутні кінці додаються як вершини. Кидає помилку на невалідний вхід.
 */
export function addEdge(g: Graph, a: Vertex, b: Vertex, weight: number): Graph {
  assertVertexName(a)
  assertVertexName(b)
  if (a === b) {
    throw new Error(`Петля заборонена: ${a}`)
  }
  if (!Number.isInteger(weight) || weight <= 0) {
    throw new Error(`Вага має бути додатним цілим, отримано: ${weight}`)
  }
  if (hasEdge(g, a, b)) {
    throw new Error(`Дубль ребра: ${edgeId(a, b)}`)
  }
  const [u, v] = a <= b ? [a, b] : [b, a]
  const edge: Edge = { id: edgeId(a, b), u, v, weight }
  const withVerts = addVertex(addVertex(g, a), b)
  return { vertices: withVerts.vertices, edges: [...withVerts.edges, edge] }
}

/** Будує граф зі списку ребер [a, b, weight]. Зручно для тестів і пресетів. */
export function buildGraph(
  edges: ReadonlyArray<readonly [Vertex, Vertex, number]>,
  extraVertices: readonly Vertex[] = [],
): Graph {
  let g = emptyGraph()
  for (const v of extraVertices) g = addVertex(g, v)
  for (const [a, b, w] of edges) g = addEdge(g, a, b, w)
  return g
}

/**
 * Ребра, відсортовані для Краскала: за вагою зростанням, потім за id.
 * Детермінований tie-break робить результат відтворюваним.
 */
export function sortedEdges(g: Graph): Edge[] {
  return [...g.edges].sort(
    (x, y) => x.weight - y.weight || (x.id < y.id ? -1 : x.id > y.id ? 1 : 0),
  )
}

/** Сума ваг переліку ребер за їх id. */
export function totalWeight(g: Graph, edgeIds: readonly string[]): number {
  const byId = new Map(g.edges.map((e) => [e.id, e]))
  let sum = 0
  for (const id of edgeIds) {
    const e = byId.get(id)
    if (!e) throw new Error(`Невідоме ребро: ${id}`)
    sum += e.weight
  }
  return sum
}

/** Сусіди вершини незалежно від напряму запису ребра. */
export function neighbors(g: Graph, v: Vertex): Vertex[] {
  const res: Vertex[] = []
  for (const e of g.edges) {
    if (e.u === v) res.push(e.v)
    else if (e.v === v) res.push(e.u)
  }
  return res
}

/** Канонічне ім'я вершини за індексом: A..Z, далі V27, V28, … */
export function vertexName(i: number): Vertex {
  return i < 26 ? String.fromCharCode(65 + i) : `V${i + 1}`
}

/** Перше вільне канонічне ім'я, якого ще немає серед `existing`. */
export function nextVertexName(existing: readonly Vertex[]): Vertex {
  const set = new Set(existing)
  for (let i = 0; ; i++) {
    const name = vertexName(i)
    if (!set.has(name)) return name
  }
}

/** Видаляє вершину разом з усіма інцидентними ребрами. */
export function removeVertex(g: Graph, v: Vertex): Graph {
  return {
    vertices: g.vertices.filter((x) => x !== v),
    edges: g.edges.filter((e) => e.u !== v && e.v !== v),
  }
}

/** Видаляє ребро за нормалізованим id. */
export function removeEdge(g: Graph, id: string): Graph {
  return { vertices: g.vertices, edges: g.edges.filter((e) => e.id !== id) }
}

/** Оновлює вагу наявного ребра (додатне ціле). Кидає помилку, якщо ребра немає. */
export function setEdgeWeight(g: Graph, id: string, weight: number): Graph {
  if (!Number.isInteger(weight) || weight <= 0) {
    throw new Error(`Вага має бути додатним цілим, отримано: ${weight}`)
  }
  let found = false
  const edges = g.edges.map((e) => {
    if (e.id !== id) return e
    found = true
    return { ...e, weight }
  })
  if (!found) throw new Error(`Невідоме ребро: ${id}`)
  return { vertices: g.vertices, edges }
}

function assertVertexName(v: Vertex): void {
  if (typeof v !== "string" || v.length === 0) {
    throw new Error(
      `Назва вершини має бути непорожнім рядком, отримано: ${JSON.stringify(v)}`,
    )
  }
}
