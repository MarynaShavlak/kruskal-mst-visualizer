import { lazy } from "react"
import { Backpack } from "lucide-react"
import type { Algorithm } from "@/algorithms/types"

// Розділ «Задача про рюкзак» (0/1). Готові навчальна вкладка, редактор предметів
// і плеєр із трьома підходами (ДП, жадібний, повний перебір).
const LearnView = lazy(() =>
  import("@/algorithms/knapsack/learn/LearnView").then((m) => ({
    default: m.LearnView,
  })),
)
const EditorView = lazy(() =>
  import("@/algorithms/knapsack/editor/EditorView").then((m) => ({
    default: m.EditorView,
  })),
)
const PlaybackView = lazy(() =>
  import("@/algorithms/knapsack/playback/PlaybackView").then((m) => ({
    default: m.PlaybackView,
  })),
)

export const knapsack: Algorithm = {
  id: "knapsack",
  name: { ua: "Задача про рюкзак", en: "Knapsack Problem" },
  shortName: { ua: "Рюкзак (0/1)", en: "Knapsack (0/1)" },
  tagline: {
    ua: "Максимальна цінність за обмеженої місткості: динамічне програмування (таблиця K[i][w]) проти повного перебору 2ⁿ і жадібного, що не дає оптимуму для 0/1.",
    en: "Maximum value under a capacity limit: dynamic programming (table K[i][w]) vs brute-force 2ⁿ and greedy, which misses the optimum for 0/1.",
  },
  category: {
    ua: "Динамічне програмування · Рюкзак",
    en: "Dynamic programming · Knapsack",
  },
  status: "ready",
  icon: Backpack,
  defaultTab: "learn",
  tabs: [
    { key: "learn", View: LearnView },
    { key: "editor", View: EditorView },
    { key: "playback", View: PlaybackView },
  ],
}
