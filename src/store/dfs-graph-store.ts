// Стан графа (Zustand) для DFS: окремий інстанс спільної пошукової фабрики з
// еталонним графом обходу як пресетом-прикладом.

import { createGraphSearchStore } from "@/store/graph-search-store"
import { traversalExamplePreset } from "@/store/graph-search-presets"

export const useDfsGraphStore = createGraphSearchStore(traversalExamplePreset)
