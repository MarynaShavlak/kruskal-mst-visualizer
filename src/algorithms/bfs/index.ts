import { Network } from "lucide-react"
import { createAlgorithm } from "@/algorithms/create-algorithm"

export const bfs = createAlgorithm({
  id: "bfs",
  name: { ua: "Пошук у ширину", en: "Breadth-First Search" },
  shortName: { ua: "BFS (обхід)", en: "BFS (traversal)" },
  tagline: {
    ua: "Обхід графа рівнями: спершу всі сусіди старту, потім сусіди сусідів — через чергу (FIFO). Знаходить найкоротший шлях у незваженому графі.",
    en: "Level-by-level graph traversal: first all neighbours of the start, then their neighbours — via a queue (FIFO). Finds the shortest path in an unweighted graph.",
  },
  family: "graphs",
  complexity: { typical: "O(V+E)", worst: "O(V+E)" },
  complexityClass: "linear",
  category: { ua: "Графи · Обхід", en: "Graphs · Traversal" },
  icon: Network,
  views: {
    learn: () => import("@/algorithms/bfs/learn/LearnView"),
    editor: () => import("@/algorithms/bfs/editor/EditorView"),
    playback: () => import("@/algorithms/bfs/playback/PlaybackView"),
  },
})
