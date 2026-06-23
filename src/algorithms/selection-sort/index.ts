import { ArrowDown01 } from "lucide-react"
import { createAlgorithm } from "@/algorithms/create-algorithm"

export const selectionSort = createAlgorithm({
  id: "selection-sort",
  name: { ua: "Сортування прямим вибором", en: "Selection Sort" },
  shortName: { ua: "Вибір", en: "Selection Sort" },
  tagline: {
    ua: "На кожному проході скануємо весь несортований суфікс, знаходимо мінімум і одним обміном ставимо його на межу префікса. Наочно про НЕадаптивність, мінімум обмінів і «пастку» зі стабільністю.",
    en: "Each pass scans the whole unsorted suffix, finds the minimum and puts it on the prefix boundary with a single swap. A clear lens on non-adaptivity, minimal swaps and the stability trap.",
  },
  family: "sorting",
  category: {
    ua: "Сортування · O(n²)",
    en: "Sorting · O(n²)",
  },
  icon: ArrowDown01,
  views: {
    learn: () => import("@/algorithms/selection-sort/learn/LearnView"),
    editor: () => import("@/algorithms/selection-sort/editor/EditorView"),
    playback: () => import("@/algorithms/selection-sort/playback/PlaybackView"),
  },
})
