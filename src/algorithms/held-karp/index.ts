import { lazy } from "react"
import { Route } from "lucide-react"
import type { Algorithm } from "@/algorithms/types"

// Розділ Хелда–Карпа (задача комівояжера) будується по фазах. Готові редактор і
// плеєр; навчальна вкладка додається наступною фазою (тоді ж зʼявиться).
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
  defaultTab: "editor",
  tabs: [
    { key: "editor", label: "Редактор", View: EditorView },
    { key: "playback", label: "Алгоритм", View: PlaybackView },
  ],
  planned: ["Навчальна вкладка — розбір ДП на бітмасках із живими фігурами"],
}
