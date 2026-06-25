// Стан графа (Zustand) для алгоритму Дейкстри: окремий інстанс спільної пошукової
// фабрики з еталонним ЗВАЖЕНИМ графом A–E як пресетом-прикладом.

import { createGraphSearchStore } from "@/store/graph-search-store"
import { dijkstraExamplePreset } from "@/store/graph-search-presets"

export const useDijkstraGraphStore = createGraphSearchStore(dijkstraExamplePreset)
