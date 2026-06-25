// Спільна фабрика стору графа для алгоритмів обходу/пошуку шляху (BFS, DFS, Дейкстра).
// Усі троє працюють із тим самим неорієнтованим зваженим графом (lib/graph) і
// відрізняються лише пресетом-прикладом, тож ділять одне ядро (create-graph-store)
// й один набір мутацій. Кожен алгоритм має ОКРЕМИЙ інстанс стору (як Прим/Краскал),
// щоб редагування в одному розділі не зачіпало граф іншого.

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
import { randomPreset } from "@/store/presets"
import {
  graphCore,
  type GraphCore,
  type GraphStoreDoc,
} from "@/store/create-graph-store"

export type { XY } from "@/store/create-graph-store"
export type GraphSearchDoc = GraphStoreDoc<Graph>

/** Стан стору графа пошуку: ядро мутацій + завантажувачі пресетів. */
export interface GraphSearchStore extends GraphCore<Graph> {
  loadExample: () => void
  loadRandom: (seed: number) => void
}

/** Будує zustand-стор пошукового графа з переданим пресетом-прикладом. */
export function createGraphSearchStore(
  example: () => GraphStoreDoc<Graph>,
) {
  return create<GraphSearchStore>()((set, get) => ({
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
      example(),
      set,
      get,
    ),

    loadExample: () => {
      const d = example()
      set({ graph: d.graph, positions: d.positions })
    },

    loadRandom: (seed) => {
      const d = randomPreset(seed)
      set({ graph: d.graph, positions: d.positions })
    },
  }))
}
