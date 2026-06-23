import { Route } from "lucide-react"
import { createAlgorithm } from "@/algorithms/create-algorithm"

export const heldKarp = createAlgorithm({
  id: "held-karp",
  name: { ua: "Алгоритм Хелда–Карпа", en: "Held–Karp Algorithm" },
  shortName: { ua: "Хелда–Карпа (TSP)", en: "Held–Karp (TSP)" },
  tagline: {
    ua: "Найкоротший замкнений маршрут комівояжера: динамічне програмування за підмножинами (бітова маска) замість перебору всіх (n−1)! турів.",
    en: "Shortest closed salesman route: dynamic programming over subsets (bitmask) instead of enumerating all (n−1)! tours.",
  },
  family: "dp",
  complexity: { typical: "O(n²·2ⁿ)", worst: "O(n²·2ⁿ)" },
  category: {
    ua: "Динамічне програмування · Комівояжер",
    en: "Dynamic programming · TSP",
  },
  icon: Route,
  views: {
    learn: () => import("@/algorithms/held-karp/learn/LearnView"),
    editor: () => import("@/algorithms/held-karp/editor/EditorView"),
    playback: () => import("@/algorithms/held-karp/playback/PlaybackView"),
  },
})
