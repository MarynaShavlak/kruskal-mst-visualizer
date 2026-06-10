// Стан орієнтованого графа (Zustand) для Флойда–Воршала. Спільне ядро мутацій —
// у create-graph-store; тут graph-модель з lib/directedGraph, валідація і пресети.
// На відміну від graph-store Краскала: напрямлені ребра, ваги — будь-які цілі
// (зокрема нульові й від'ємні). Редактор пише, плеєр читає.

import { create } from "zustand"
import {
  addDirectedEdge,
  addDirectedVertex,
  emptyDirectedGraph,
  hasDirectedEdge,
  removeDirectedEdge,
  removeDirectedVertex,
  setDirectedEdgeWeight,
  type DirectedGraph,
} from "@/lib/directedGraph"
import {
  abcdefPreset,
  pqrsPreset,
  randomDirectedPreset,
  xyzPreset,
} from "@/store/directed-presets"
import {
  graphCore,
  type GraphCore,
  type GraphStoreDoc,
} from "@/store/create-graph-store"

export type { XY } from "@/store/create-graph-store"
/** Документ редактора: орієнтований граф + позиції вершин. */
export type DirectedGraphDoc = GraphStoreDoc<DirectedGraph>

interface DirectedGraphState extends GraphCore<DirectedGraph> {
  loadExample: () => void
  loadNegativeEdge: () => void
  loadNegativeCycle: () => void
  loadRandom: (seed: number) => void
}

export const useDirectedGraphStore = create<DirectedGraphState>()(
  (set, get) => ({
    ...graphCore<DirectedGraph>(
      {
        emptyGraph: emptyDirectedGraph,
        addVertex: addDirectedVertex,
        addEdge: addDirectedEdge,
        hasEdge: hasDirectedEdge,
        removeVertex: removeDirectedVertex,
        removeEdge: removeDirectedEdge,
        setEdgeWeight: setDirectedEdgeWeight,
        isValidWeight: (w) => Number.isInteger(w),
      },
      abcdefPreset(),
      set,
      get,
    ),

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
  }),
)
