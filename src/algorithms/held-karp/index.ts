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
  name: { ua: "Алгоритм Хелда–Карпа", en: "Held–Karp Algorithm" },
  shortName: { ua: "Хелда–Карпа (TSP)", en: "Held–Karp (TSP)" },
  tagline: {
    ua: "Найкоротший замкнений маршрут комівояжера: динамічне програмування за підмножинами (бітова маска) замість перебору всіх (n−1)! турів.",
    en: "Shortest closed salesman route: dynamic programming over subsets (bitmask) instead of enumerating all (n−1)! tours.",
  },
  category: {
    ua: "Динамічне програмування · Комівояжер",
    en: "Dynamic programming · TSP",
  },
  status: "ready",
  icon: Route,
  defaultTab: "learn",
  tabs: [
    { key: "learn", View: LearnView },
    { key: "editor", View: EditorView },
    { key: "playback", View: PlaybackView },
  ],
}
