import { lazy } from "react"
import { ArrowDownUp } from "lucide-react"
import type { Algorithm } from "@/algorithms/types"

// Розділ «Бульбашкове сортування» (Bubble Sort). Готові навчальна вкладка,
// редактор масиву чисел і плеєр із двома режимами (наївний / оптимізований із
// прапорцем swapped). Бенчмарку немає (лише в kruskal).
const LearnView = lazy(() =>
  import("@/algorithms/bubble-sort/learn/LearnView").then((m) => ({
    default: m.LearnView,
  })),
)
const EditorView = lazy(() =>
  import("@/algorithms/bubble-sort/editor/EditorView").then((m) => ({
    default: m.EditorView,
  })),
)
const PlaybackView = lazy(() =>
  import("@/algorithms/bubble-sort/playback/PlaybackView").then((m) => ({
    default: m.PlaybackView,
  })),
)

export const bubbleSort: Algorithm = {
  id: "bubble-sort",
  name: { ua: "Бульбашкове сортування", en: "Bubble Sort" },
  shortName: { ua: "Бульбашка", en: "Bubble Sort" },
  tagline: {
    ua: "Найпростіший метод упорядкування: порівнюй сусідів і міняй місцями. Наочно про інваріант проходу, стабільність, ранню зупинку й чому O(n²) непрактичний.",
    en: "The simplest sorting method: compare neighbours and swap. A clear lens on the pass invariant, stability, early exit and why O(n²) is impractical.",
  },
  category: {
    ua: "Сортування · O(n²)",
    en: "Sorting · O(n²)",
  },
  status: "ready",
  icon: ArrowDownUp,
  defaultTab: "learn",
  tabs: [
    { key: "learn", View: LearnView },
    { key: "editor", View: EditorView },
    { key: "playback", View: PlaybackView },
  ],
}
