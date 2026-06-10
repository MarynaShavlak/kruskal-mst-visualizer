// Стан графа (Zustand) для Краскала: неорієнтований, ваги — додатні цілі.
// Спільне ядро мутацій — у create-graph-store; тут лише graph-модель з lib/graph,
// валідація ваги та пресети. Редактор пише, плеєр читає.

import { create } from "zustand"
import {
  addEdge,
  addVertex,
  emptyGraph,
  hasEdge,
  removeEdge,
  removeVertex,
  setEdgeWeight,
  type Graph,
} from "@/lib/graph"
import { examplePreset, randomPreset } from "@/store/presets"
import {
  graphCore,
  type GraphCore,
  type GraphStoreDoc,
} from "@/store/create-graph-store"

export type { XY } from "@/store/create-graph-store"
/** Документ редактора: граф + позиції вершин. */
export type GraphDoc = GraphStoreDoc<Graph>

interface GraphState extends GraphCore<Graph> {
  loadExample: () => void
  loadRandom: (seed: number) => void
}

export const useGraphStore = create<GraphState>()((set, get) => ({
  ...graphCore<Graph>(
    {
      emptyGraph,
      addVertex,
      addEdge,
      hasEdge,
      removeVertex,
      removeEdge,
      setEdgeWeight,
      isValidWeight: (w) => Number.isInteger(w) && w > 0,
    },
    examplePreset(),
    set,
    get,
  ),

  loadExample: () => {
    const d = examplePreset()
    set({ graph: d.graph, positions: d.positions })
  },

  loadRandom: (seed) => {
    const d = randomPreset(seed)
    set({ graph: d.graph, positions: d.positions })
  },
}))
