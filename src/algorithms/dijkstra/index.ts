import { Navigation } from "lucide-react"
import { createAlgorithm } from "@/algorithms/create-algorithm"

export const dijkstra = createAlgorithm({
  id: "dijkstra",
  name: { ua: "Алгоритм Дейкстри", en: "Dijkstra's Algorithm" },
  shortName: { ua: "Дейкстра", en: "Dijkstra" },
  tagline: {
    ua: "Найкоротші шляхи від однієї вершини до всіх інших у графі з невід'ємними вагами: жадібно обираємо найближчу вершину й послаблюємо сусідів.",
    en: "Shortest paths from one vertex to all others in a graph with non-negative weights: greedily pick the nearest vertex and relax its neighbours.",
  },
  family: "graphs",
  complexity: { typical: "O(V²)", worst: "O(V²)" },
  complexityClass: "quadratic",
  category: { ua: "Графи · Найкоротші шляхи", en: "Graphs · Shortest paths" },
  icon: Navigation,
  views: {
    learn: () => import("@/algorithms/dijkstra/learn/LearnView"),
    editor: () => import("@/algorithms/dijkstra/editor/EditorView"),
    playback: () => import("@/algorithms/dijkstra/playback/PlaybackView"),
  },
})
