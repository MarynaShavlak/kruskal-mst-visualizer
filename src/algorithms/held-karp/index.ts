import { lazy } from "react"
import { Route } from "lucide-react"
import type { Algorithm } from "@/algorithms/types"

// Розділ Хелда–Карпа (задача комівояжера) будується по фазах. Готовий редактор;
// навчання та плеєр додаються наступними фазами (тоді ж зʼявляться їхні вкладки).
const EditorView = lazy(() =>
  import("@/algorithms/held-karp/editor/EditorView").then((m) => ({
    default: m.EditorView,
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
  tabs: [{ key: "editor", label: "Редактор", View: EditorView }],
}
