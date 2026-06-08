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
  name: "Алгоритм Флойда–Воршала",
  shortName: "Флойд–Воршал",
  tagline:
    "Найкоротші шляхи між усіма парами вершин: динамічне програмування на матриці відстаней.",
  category: "Графи · Найкоротші шляхи",
  status: "ready",
  icon: Grid3x3,
  defaultTab: "learn",
  tabs: [
    { key: "learn", label: "Навчання", View: LearnView },
    { key: "editor", label: "Редактор", View: EditorView },
    { key: "playback", label: "Алгоритм", View: PlaybackView },
  ],
  planned: [
    "Бенчмарк — кубічна складність проти повторних запусків Дейкстри",
  ],
}
