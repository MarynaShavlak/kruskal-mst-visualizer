import { Grid3x3 } from "lucide-react"
import { createAlgorithm } from "@/algorithms/create-algorithm"

export const floydWarshall = createAlgorithm({
  id: "floyd-warshall",
  name: { ua: "Алгоритм Флойда–Воршала", en: "Floyd–Warshall Algorithm" },
  shortName: { ua: "Флойд–Воршал", en: "Floyd–Warshall" },
  tagline: {
    ua: "Найкоротші шляхи між усіма парами вершин: динамічне програмування на матриці відстаней.",
    en: "Shortest paths between all pairs of vertices: dynamic programming on a distance matrix.",
  },
  family: "graphs",
  category: { ua: "Графи · Найкоротші шляхи", en: "Graphs · Shortest paths" },
  icon: Grid3x3,
  views: {
    learn: () => import("@/algorithms/floyd-warshall/learn/LearnView"),
    editor: () => import("@/algorithms/floyd-warshall/editor/EditorView"),
    playback: () => import("@/algorithms/floyd-warshall/playback/PlaybackView"),
  },
  planned: [
    {
      ua: "Бенчмарк — кубічна складність проти повторних запусків Дейкстри",
      en: "Benchmark — cubic complexity vs repeated Dijkstra runs",
    },
  ],
})
