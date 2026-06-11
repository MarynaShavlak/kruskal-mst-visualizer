import { lazy } from "react"
import { Grid3x3 } from "lucide-react"
import type { Algorithm } from "@/algorithms/types"

// Розділ Флойда–Воршала будується по фазах. Готові навчання, редактор і плеєр;
// бенчмарк додається наступною фазою.
const LearnView = lazy(() =>
  import("@/algorithms/floyd-warshall/learn/LearnView").then((m) => ({
    default: m.LearnView,
  })),
)
const EditorView = lazy(() =>
  import("@/algorithms/floyd-warshall/editor/EditorView").then((m) => ({
    default: m.EditorView,
  })),
)
const PlaybackView = lazy(() =>
  import("@/algorithms/floyd-warshall/playback/PlaybackView").then((m) => ({
    default: m.PlaybackView,
  })),
)

export const floydWarshall: Algorithm = {
  id: "floyd-warshall",
  name: { ua: "Алгоритм Флойда–Воршала", en: "Floyd–Warshall Algorithm" },
  shortName: { ua: "Флойд–Воршал", en: "Floyd–Warshall" },
  tagline: {
    ua: "Найкоротші шляхи між усіма парами вершин: динамічне програмування на матриці відстаней.",
    en: "Shortest paths between all pairs of vertices: dynamic programming on a distance matrix.",
  },
  category: { ua: "Графи · Найкоротші шляхи", en: "Graphs · Shortest paths" },
  status: "ready",
  icon: Grid3x3,
  defaultTab: "learn",
  tabs: [
    { key: "learn", View: LearnView },
    { key: "editor", View: EditorView },
    { key: "playback", View: PlaybackView },
  ],
  planned: [
    {
      ua: "Бенчмарк — кубічна складність проти повторних запусків Дейкстри",
      en: "Benchmark — cubic complexity vs repeated Dijkstra runs",
    },
  ],
}
