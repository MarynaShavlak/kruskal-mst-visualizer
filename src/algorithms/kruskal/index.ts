import { lazy } from "react"
import { Waypoints } from "lucide-react"
import type { Algorithm } from "@/algorithms/types"

// Важкі екрани вантажимо лінією окремими чанками
// (React Flow / Shiki / react-markdown+KaTeX / Recharts+Worker).
const LearnView = lazy(() =>
  import("@/algorithms/kruskal/learn/LearnView").then((m) => ({
    default: m.LearnView,
  })),
)
const EditorView = lazy(() =>
  import("@/algorithms/kruskal/editor/EditorView").then((m) => ({
    default: m.EditorView,
  })),
)
const PlaybackView = lazy(() =>
  import("@/algorithms/kruskal/playback/PlaybackView").then((m) => ({
    default: m.PlaybackView,
  })),
)
const BenchmarkView = lazy(() =>
  import("@/algorithms/kruskal/benchmark/BenchmarkView").then((m) => ({
    default: m.BenchmarkView,
  })),
)

export const kruskal: Algorithm = {
  id: "kruskal",
  name: { ua: "Алгоритм Краскала", en: "Kruskal's Algorithm" },
  shortName: { ua: "Краскал (МОД)", en: "Kruskal (MST)" },
  tagline: {
    ua: "Мінімальне остовне дерево: жадібно додаємо найлегші ребра, відсікаючи цикли через Union-Find.",
    en: "Minimum spanning tree: greedily add the lightest edges, cutting cycles via Union-Find.",
  },
  category: { ua: "Графи · Остовні дерева", en: "Graphs · Spanning trees" },
  status: "ready",
  icon: Waypoints,
  defaultTab: "learn",
  tabs: [
    { key: "learn", View: LearnView },
    { key: "editor", View: EditorView },
    { key: "playback", View: PlaybackView },
    { key: "benchmark", View: BenchmarkView },
  ],
}
