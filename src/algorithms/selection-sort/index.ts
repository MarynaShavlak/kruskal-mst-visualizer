import { lazy } from "react"
import { ArrowDown01 } from "lucide-react"
import type { Algorithm } from "@/algorithms/types"

// Розділ «Сортування прямим вибором» (Selection Sort). Готові навчальна вкладка,
// редактор масиву чисел і плеєр із двома режимами (стандартний — обмін /
// стабільний — зсув блоку). Бенчмарку немає (лише в kruskal).
const LearnView = lazy(() =>
  import("@/algorithms/selection-sort/learn/LearnView").then((m) => ({
    default: m.LearnView,
  })),
)
const EditorView = lazy(() =>
  import("@/algorithms/selection-sort/editor/EditorView").then((m) => ({
    default: m.EditorView,
  })),
)
const PlaybackView = lazy(() =>
  import("@/algorithms/selection-sort/playback/PlaybackView").then((m) => ({
    default: m.PlaybackView,
  })),
)

export const selectionSort: Algorithm = {
  id: "selection-sort",
  name: { ua: "Сортування прямим вибором", en: "Selection Sort" },
  shortName: { ua: "Вибір", en: "Selection Sort" },
  tagline: {
    ua: "На кожному проході скануємо весь несортований суфікс, знаходимо мінімум і одним обміном ставимо його на межу префікса. Наочно про НЕадаптивність, мінімум обмінів і «пастку» зі стабільністю.",
    en: "Each pass scans the whole unsorted suffix, finds the minimum and puts it on the prefix boundary with a single swap. A clear lens on non-adaptivity, minimal swaps and the stability trap.",
  },
  category: {
    ua: "Сортування · O(n²)",
    en: "Sorting · O(n²)",
  },
  status: "ready",
  icon: ArrowDown01,
  defaultTab: "learn",
  tabs: [
    { key: "learn", View: LearnView },
    { key: "editor", View: EditorView },
    { key: "playback", View: PlaybackView },
  ],
}
