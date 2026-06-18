import { lazy } from "react"
import { Split } from "lucide-react"
import type { Algorithm } from "@/algorithms/types"

// Розділ «Швидке сортування» (Quick Sort) — перший НЕ-квадратичний алгоритм серії.
// Готові навчальна вкладка, редактор масиву чисел і плеєр із деревом рекурсії
// (перемикач стратегії опорного: середина / перший / останній / медіана-3).
// Бенчмарку немає (лише в kruskal).
const LearnView = lazy(() =>
  import("@/algorithms/quick-sort/learn/LearnView").then((m) => ({
    default: m.LearnView,
  })),
)
const EditorView = lazy(() =>
  import("@/algorithms/quick-sort/editor/EditorView").then((m) => ({
    default: m.EditorView,
  })),
)
const PlaybackView = lazy(() =>
  import("@/algorithms/quick-sort/playback/PlaybackView").then((m) => ({
    default: m.PlaybackView,
  })),
)

export const quickSort: Algorithm = {
  id: "quick-sort",
  name: { ua: "Швидке сортування", en: "Quick Sort" },
  shortName: { ua: "Швидке", en: "Quick Sort" },
  tagline: {
    ua: "«Розділяй і володарюй»: обираємо опорний, ділимо масив на менші/рівні/більші й рекурсивно сортуємо. Дерево рекурсії, вибір опорного (O(n·log n) проти O(n²)), тристоронній поділ і стабільність.",
    en: "Divide and conquer: pick a pivot, split into smaller/equal/greater and recurse. The recursion tree, pivot choice (O(n·log n) vs O(n²)), three-way partition and stability.",
  },
  category: {
    ua: "Сортування · O(n·log n)",
    en: "Sorting · O(n·log n)",
  },
  status: "ready",
  icon: Split,
  defaultTab: "learn",
  tabs: [
    { key: "learn", View: LearnView },
    { key: "editor", View: EditorView },
    { key: "playback", View: PlaybackView },
  ],
}
