// Generic-ядро стору графа (Zustand). graph-store (неорієнтований, Краскал) і
// directed-graph-store (орієнтований, Флойд) ділять однаковий набір мутацій —
// тут спільне ядро, параметризоване graph-моделлю та валідацією ваги. Пресетні
// лоадери лишаються у конкретних сторах (вони store-специфічні: приклад,
// випадковий, від'ємне ребро/цикл тощо).

import { nextVertexName } from "@/lib/graph"

export interface XY {
  readonly x: number
  readonly y: number
}

/** Мінімум, який ядро знає про граф: список вершин (для канонічних імен). */
export interface GraphLike {
  readonly vertices: readonly string[]
}

/** Документ редактора: граф + позиції вершин. */
export interface GraphStoreDoc<G extends GraphLike> {
  readonly graph: G
  readonly positions: Record<string, XY>
}

/** Іммутабельні операції над graph-моделлю + валідація ваги ребра. */
export interface GraphOps<G extends GraphLike> {
  emptyGraph: () => G
  addVertex: (g: G, v: string) => G
  addEdge: (g: G, a: string, b: string, weight: number) => G
  hasEdge: (g: G, a: string, b: string) => boolean
  removeVertex: (g: G, v: string) => G
  removeEdge: (g: G, id: string) => G
  setEdgeWeight: (g: G, id: string, weight: number) => G
  /** Краскал: ціле > 0; Флойд: будь-яке ціле (зокрема 0/від'ємне). */
  isValidWeight: (weight: number) => boolean
}

/** Спільне ядро стору графа: стан + мутації, незалежні від напряму/валідації. */
export interface GraphCore<G extends GraphLike> {
  readonly graph: G
  readonly positions: Record<string, XY>
  /** Додає вершину з канонічним ім'ям у позиції (x, y); повертає ім'я. */
  addVertexAt: (x: number, y: number) => string
  /** Додає ребро; повертає false на петлю/дубль/невалідну вагу. */
  connect: (a: string, b: string, weight: number) => boolean
  setEdgeWeight: (id: string, weight: number) => void
  removeVertex: (v: string) => void
  removeEdge: (id: string) => void
  moveVertex: (v: string, x: number, y: number) => void
  clear: () => void
  loadDoc: (doc: GraphStoreDoc<G>) => void
  toDoc: () => GraphStoreDoc<G>
}

/** Вузький тип set/get над ядром — сумісний із Zustand-овим set/get повного стору. */
type CoreSet<G extends GraphLike> = (
  partial:
    | Partial<GraphCore<G>>
    | ((state: GraphCore<G>) => Partial<GraphCore<G>>),
) => void

/**
 * Будує спільне ядро стору. Викликається всередині
 * `create<S>()((set, get) => ({ ...graphCore(ops, initial, set, get), ...лоадери }))`,
 * де `S` — повний стан конкретного стору (ядро + його пресетні лоадери).
 */
export function graphCore<G extends GraphLike>(
  ops: GraphOps<G>,
  initial: GraphStoreDoc<G>,
  set: CoreSet<G>,
  get: () => GraphCore<G>,
): GraphCore<G> {
  return {
    graph: initial.graph,
    positions: initial.positions,

    addVertexAt: (x, y) => {
      const name = nextVertexName(get().graph.vertices)
      set((s) => ({
        graph: ops.addVertex(s.graph, name),
        positions: { ...s.positions, [name]: { x, y } },
      }))
      return name
    },

    connect: (a, b, weight) => {
      const g = get().graph
      if (a === b || ops.hasEdge(g, a, b) || !ops.isValidWeight(weight)) {
        return false
      }
      set({ graph: ops.addEdge(g, a, b, weight) })
      return true
    },

    setEdgeWeight: (id, weight) => {
      if (!ops.isValidWeight(weight)) return
      set((s) => ({ graph: ops.setEdgeWeight(s.graph, id, weight) }))
    },

    removeVertex: (v) =>
      set((s) => ({
        graph: ops.removeVertex(s.graph, v),
        positions: Object.fromEntries(
          Object.entries(s.positions).filter(([k]) => k !== v),
        ),
      })),

    removeEdge: (id) => set((s) => ({ graph: ops.removeEdge(s.graph, id) })),

    moveVertex: (v, x, y) =>
      set((s) => ({ positions: { ...s.positions, [v]: { x, y } } })),

    clear: () => set({ graph: ops.emptyGraph(), positions: {} }),

    loadDoc: (doc) => set({ graph: doc.graph, positions: { ...doc.positions } }),

    toDoc: () => ({ graph: get().graph, positions: get().positions }),
  }
}
