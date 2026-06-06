// Стан графа (Zustand). Редактор пише, плеєр читатиме.
// Граф — модель з lib/graph; позиції вершин — UI-доповнення для редактора.

import { create } from "zustand"
import {
  addEdge as addEdgeFn,
  addVertex,
  emptyGraph,
  hasEdge,
  nextVertexName,
  removeEdge as removeEdgeFn,
  removeVertex as removeVertexFn,
  setEdgeWeight as setEdgeWeightFn,
  type Graph,
  type Vertex,
} from "@/lib/graph"
import { examplePreset, randomPreset } from "@/store/presets"

export interface XY {
  readonly x: number
  readonly y: number
}

/** Документ редактора: граф + позиції вершин. */
export interface GraphDoc {
  readonly graph: Graph
  readonly positions: Record<Vertex, XY>
}

interface GraphState {
  readonly graph: Graph
  readonly positions: Record<Vertex, XY>
  /** Додає вершину з канонічним ім'ям у позиції (x, y); повертає ім'я. */
  addVertexAt: (x: number, y: number) => Vertex
  /** Додає ребро; повертає false на петлю/дубль/невалідну вагу. */
  connect: (u: Vertex, v: Vertex, weight: number) => boolean
  setEdgeWeight: (id: string, weight: number) => void
  removeVertex: (v: Vertex) => void
  removeEdge: (id: string) => void
  moveVertex: (v: Vertex, x: number, y: number) => void
  clear: () => void
  loadDoc: (doc: GraphDoc) => void
  loadExample: () => void
  loadRandom: (seed: number) => void
  toDoc: () => GraphDoc
}

export const useGraphStore = create<GraphState>()((set, get) => {
  const init = examplePreset()
  return {
    graph: init.graph,
    positions: init.positions,

    addVertexAt: (x, y) => {
      const name = nextVertexName(get().graph.vertices)
      set((s) => ({
        graph: addVertex(s.graph, name),
        positions: { ...s.positions, [name]: { x, y } },
      }))
      return name
    },

    connect: (u, v, weight) => {
      const g = get().graph
      if (u === v || hasEdge(g, u, v) || !Number.isInteger(weight) || weight <= 0) {
        return false
      }
      set({ graph: addEdgeFn(g, u, v, weight) })
      return true
    },

    setEdgeWeight: (id, weight) => {
      if (!Number.isInteger(weight) || weight <= 0) return
      set((s) => ({ graph: setEdgeWeightFn(s.graph, id, weight) }))
    },

    removeVertex: (v) =>
      set((s) => ({
        graph: removeVertexFn(s.graph, v),
        positions: Object.fromEntries(
          Object.entries(s.positions).filter(([k]) => k !== v),
        ),
      })),

    removeEdge: (id) => set((s) => ({ graph: removeEdgeFn(s.graph, id) })),

    moveVertex: (v, x, y) =>
      set((s) => ({ positions: { ...s.positions, [v]: { x, y } } })),

    clear: () => set({ graph: emptyGraph(), positions: {} }),

    loadDoc: (doc) => set({ graph: doc.graph, positions: { ...doc.positions } }),

    loadExample: () => {
      const d = examplePreset()
      set({ graph: d.graph, positions: d.positions })
    },

    loadRandom: (seed) => {
      const d = randomPreset(seed)
      set({ graph: d.graph, positions: d.positions })
    },

    toDoc: () => ({ graph: get().graph, positions: get().positions }),
  }
})
