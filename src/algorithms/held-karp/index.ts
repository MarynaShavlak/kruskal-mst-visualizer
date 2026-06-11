import { lazy } from "react"
import { Route } from "lucide-react"
import type { Algorithm } from "@/algorithms/types"

// Розділ Хелда–Карпа (задача комівояжера) будується по фазах. Готові навчальна
// вкладка, редактор і плеєр.
const LearnView = lazy(() =>
  import("@/algorithms/held-karp/learn/LearnView").then((m) => ({
    default: m.LearnView,
  })),
)
const EditorView = lazy(() =>
  import("@/algorithms/held-karp/editor/EditorView").then((m) => ({
    default: m.EditorView,
  })),
)
const PlaybackView = lazy(() =>
  import("@/algorithms/held-karp/playback/PlaybackView").then((m) => ({
    default: m.PlaybackView,
  })),
)

export const heldKarp: Algorithm = {
  id: "held-karp",
  name: "Алгоритм Хелда–Карпа",
  shortName: "Хелда–Карпа (TSP)",
  tagline:
    "Найкоротший замкнений маршрут комівояжера: динамічне програмування за підмножинами (бітова маска) замість перебору всіх (n−1)! турів.",
  category: "Динамічне програмування · Комівояжер",
  status: "ready",
  icon: Route,
  defaultTab: "learn",
  tabs: [
    { key: "learn", label: "Навчання", View: LearnView },
    { key: "editor", label: "Редактор", View: EditorView },
    { key: "playback", label: "Алгоритм", View: PlaybackView },
  ],
}
