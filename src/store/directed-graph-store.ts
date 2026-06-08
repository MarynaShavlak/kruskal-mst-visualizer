// Стан орієнтованого графа (Zustand) для Флойда–Воршала. Редактор пише,
// плеєр читатиме. Граф — модель з lib/directedGraph; позиції вершин —
// UI-доповнення. На відміну від graph-store Краскала: напрямлені ребра,
// ваги — цілі (зокрема нульові й від'ємні).

import { create } from "zustand"
import {
  addDirectedEdge,
  addDirectedVertex,
  emptyDirectedGraph,
  hasDirectedEdge,
  removeDirectedEdge as removeDirectedEdgeFn,
  removeDirectedVertex as removeDirectedVertexFn,
  setDirectedEdgeWeight as setDirectedEdgeWeightFn,
  type DirectedGraph,
  type Vertex,
} from "@/lib/directedGraph"
import { nextVertexName } from "@/lib/graph"
import {
  abcdefPreset,
  pqrsPreset,
  randomDirectedPreset,
  xyzPreset,
} from "@/store/directed-presets"

export interface XY {
  readonly x: number
  readonly y: number
}

/** Документ редактора: орієнтований граф + позиції вершин. */
export interface DirectedGraphDoc {
  readonly graph: DirectedGraph
  readonly positions: Record<Vertex, XY>
}

interface DirectedGraphState {
  readonly graph: DirectedGraph
  readonly positions: Record<Vertex, XY>
  /** Додає вершину з канонічним ім'ям у позиції (x, y); повертає ім'я. */
  addVertexAt: (x: number, y: number) => Vertex
  /** Додає напрямлене ребро from→to; повертає false на петлю/дубль/невалідну вагу. */
  connect: (from: Vertex, to: Vertex, weight: number) => boolean
  setEdgeWeight: (id: string, weight: number) => void
  removeVertex: (v: Vertex) => void
  removeEdge: (id: string) => void
  moveVertex: (v: Vertex, x: number, y: number) => void
  clear: () => void
  loadDoc: (doc: DirectedGraphDoc) => void
  loadExample: () => void
  loadNegativeEdge: () => void
  loadNegativeCycle: () => void
  loadRandom: (seed: number) => void
  toDoc: () => DirectedGraphDoc
}

export const useDirectedGraphStore = create<DirectedGraphState>()((set, get) => {
  const init = abcdefPreset()
  return {
    graph: init.graph,
    positions: init.positions,

    addVertexAt: (x, y) => {
      const name = nextVertexName(get().graph.vertices)
      set((s) => ({
        graph: addDirectedVertex(s.graph, name),
        positions: { ...s.positions, [name]: { x, y } },
      }))
      return name
    },

    connect: (from, to, weight) => {
      const g = get().graph
      if (from === to || hasDirectedEdge(g, from, to) || !Number.isInteger(weight)) {
        return false
      }
      set({ graph: addDirectedEdge(g, from, to, weight) })
      return true
    },

    setEdgeWeight: (id, weight) => {
      if (!Number.isInteger(weight)) return
      set((s) => ({ graph: setDirectedEdgeWeightFn(s.graph, id, weight) }))
    },

    removeVertex: (v) =>
      set((s) => ({
        graph: removeDirectedVertexFn(s.graph, v),
        positions: Object.fromEntries(
          Object.entries(s.positions).filter(([k]) => k !== v),
        ),
      })),

    removeEdge: (id) => set((s) => ({ graph: removeDirectedEdgeFn(s.graph, id) })),

    moveVertex: (v, x, y) =>
      set((s) => ({ positions: { ...s.positions, [v]: { x, y } } })),

    clear: () => set({ graph: emptyDirectedGraph(), positions: {} }),

    loadDoc: (doc) => set({ graph: doc.graph, positions: { ...doc.positions } }),

    loadExample: () => {
      const d = abcdefPreset()
      set({ graph: d.graph, positions: d.positions })
    },

    loadNegativeEdge: () => {
      const d = pqrsPreset()
      set({ graph: d.graph, positions: d.positions })
    },

    loadNegativeCycle: () => {
      const d = xyzPreset()
      set({ graph: d.graph, positions: d.positions })
    },

    loadRandom: (seed) => {
      const d = randomDirectedPreset(seed)
      set({ graph: d.graph, positions: d.positions })
    },

    toDoc: () => ({ graph: get().graph, positions: get().positions }),
  }
})
