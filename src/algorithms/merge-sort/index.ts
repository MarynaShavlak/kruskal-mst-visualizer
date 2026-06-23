import { GitMerge } from "lucide-react"
import { createAlgorithm } from "@/algorithms/create-algorithm"

export const mergeSort = createAlgorithm({
  id: "merge-sort",
  name: { ua: "Сортування злиттям", en: "Merge Sort" },
  shortName: { ua: "Злиттям", en: "Merge Sort" },
  tagline: {
    ua: "«Розділяй і володарюй»: ділимо масив навпіл, рекурсивно сортуємо половини й зливаємо їх двома вказівниками. Дерево рекурсії завжди збалансоване → гарантований O(n·log n), стабільне; низхідна проти вихідної (bottom-up) — місток до TimSort.",
    en: "Divide and conquer: split the array in half, sort the halves recursively and merge them with two pointers. The recursion tree is always balanced → guaranteed O(n·log n), stable; top-down vs bottom-up — a bridge to TimSort.",
  },
  family: "sorting",
  complexity: "O(n log n)",
  category: {
    ua: "Сортування · O(n·log n)",
    en: "Sorting · O(n·log n)",
  },
  icon: GitMerge,
  views: {
    learn: () => import("@/algorithms/merge-sort/learn/LearnView"),
    editor: () => import("@/algorithms/merge-sort/editor/EditorView"),
    playback: () => import("@/algorithms/merge-sort/playback/PlaybackView"),
  },
})
