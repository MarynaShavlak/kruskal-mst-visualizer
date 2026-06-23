import { Waypoints } from "lucide-react"
import { createAlgorithm } from "@/algorithms/create-algorithm"

export const kruskal = createAlgorithm({
  id: "kruskal",
  name: { ua: "Алгоритм Краскала", en: "Kruskal's Algorithm" },
  shortName: { ua: "Краскал (МОД)", en: "Kruskal (MST)" },
  tagline: {
    ua: "Мінімальне остовне дерево: жадібно додаємо найлегші ребра, відсікаючи цикли через Union-Find.",
    en: "Minimum spanning tree: greedily add the lightest edges, cutting cycles via Union-Find.",
  },
  family: "graphs",
  complexity: { typical: "O(E log E)", worst: "O(E log E)" },
  complexityClass: "linearithmic",
  category: { ua: "Графи · Остовні дерева", en: "Graphs · Spanning trees" },
  icon: Waypoints,
  views: {
    learn: () => import("@/algorithms/kruskal/learn/LearnView"),
    editor: () => import("@/algorithms/kruskal/editor/EditorView"),
    playback: () => import("@/algorithms/kruskal/playback/PlaybackView"),
    benchmark: () => import("@/algorithms/kruskal/benchmark/BenchmarkView"),
  },
})
