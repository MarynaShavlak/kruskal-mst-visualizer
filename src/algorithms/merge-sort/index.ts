import { lazy } from "react"
import { GitMerge } from "lucide-react"
import type { Algorithm } from "@/algorithms/types"

// Розділ «Сортування злиттям» (Merge Sort) — другий НЕ-квадратичний алгоритм серії,
// гарантований O(n·log n) у всіх випадках (поділ строго навпіл → завжди збалансоване
// дерево). Готові навчальна вкладка, редактор масиву чисел і плеєр із деревом
// рекурсії + зірковою панеллю злиття (дві реалізації: низхідна / вихідна bottom-up).
// Бенчмарку немає (лише в kruskal).
const LearnView = lazy(() =>
  import("@/algorithms/merge-sort/learn/LearnView").then((m) => ({
    default: m.LearnView,
  })),
)
const EditorView = lazy(() =>
  import("@/algorithms/merge-sort/editor/EditorView").then((m) => ({
    default: m.EditorView,
  })),
)
const PlaybackView = lazy(() =>
  import("@/algorithms/merge-sort/playback/PlaybackView").then((m) => ({
    default: m.PlaybackView,
  })),
)

export const mergeSort: Algorithm = {
  id: "merge-sort",
  name: { ua: "Сортування злиттям", en: "Merge Sort" },
  shortName: { ua: "Злиттям", en: "Merge Sort" },
  tagline: {
    ua: "«Розділяй і володарюй»: ділимо масив навпіл, рекурсивно сортуємо половини й зливаємо їх двома вказівниками. Дерево рекурсії завжди збалансоване → гарантований O(n·log n), стабільне; низхідна проти вихідної (bottom-up) — місток до TimSort.",
    en: "Divide and conquer: split the array in half, sort the halves recursively and merge them with two pointers. The recursion tree is always balanced → guaranteed O(n·log n), stable; top-down vs bottom-up — a bridge to TimSort.",
  },
  category: {
    ua: "Сортування · O(n·log n)",
    en: "Sorting · O(n·log n)",
  },
  status: "ready",
  icon: GitMerge,
  defaultTab: "learn",
  tabs: [
    { key: "learn", View: LearnView },
    { key: "editor", View: EditorView },
    { key: "playback", View: PlaybackView },
  ],
}
