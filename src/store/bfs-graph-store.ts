// Стан графа (Zustand) для BFS: окремий інстанс спільної пошукової фабрики з
// еталонним графом обходу як пресетом-прикладом.

import { createGraphSearchStore } from "@/store/graph-search-store"
import { traversalExamplePreset } from "@/store/graph-search-presets"

export const useBfsGraphStore = createGraphSearchStore(traversalExamplePreset)
