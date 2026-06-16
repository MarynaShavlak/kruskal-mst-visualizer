// Стан графа (Zustand) для Прима: неорієнтований, ваги — додатні цілі. Окремий
// інстанс стору (як graph-store у Краскала чи directed-graph-store у Флойда), щоб
// редагування в розділі Прима не зачіпало граф Краскала. Спільне ядро мутацій —
// у create-graph-store; graph-модель і пресети ті самі (lib/graph + presets).
// Пресет «приклад» — еталонний граф A–G (граф 2 з README алгоритму Прима).

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
export type PrimGraphDoc = GraphStoreDoc<Graph>

interface PrimGraphState extends GraphCore<Graph> {
  loadExample: () => void
  loadRandom: (seed: number) => void
}

export const usePrimGraphStore = create<PrimGraphState>()((set, get) => ({
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
