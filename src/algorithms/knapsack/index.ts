import { Backpack } from "lucide-react"
import { createAlgorithm } from "@/algorithms/create-algorithm"

export const knapsack = createAlgorithm({
  id: "knapsack",
  name: { ua: "Задача про рюкзак", en: "Knapsack Problem" },
  shortName: { ua: "Рюкзак (0/1)", en: "Knapsack (0/1)" },
  tagline: {
    ua: "Максимальна цінність за обмеженої місткості: динамічне програмування (таблиця K[i][w]) проти повного перебору 2ⁿ і жадібного, що не дає оптимуму для 0/1.",
    en: "Maximum value under a capacity limit: dynamic programming (table K[i][w]) vs brute-force 2ⁿ and greedy, which misses the optimum for 0/1.",
  },
  family: "dp",
  complexity: { typical: "O(n·W)", worst: "O(n·W)" },
  category: {
    ua: "Динамічне програмування · Рюкзак",
    en: "Dynamic programming · Knapsack",
  },
  icon: Backpack,
  views: {
    learn: () => import("@/algorithms/knapsack/learn/LearnView"),
    editor: () => import("@/algorithms/knapsack/editor/EditorView"),
    playback: () => import("@/algorithms/knapsack/playback/PlaybackView"),
  },
})
