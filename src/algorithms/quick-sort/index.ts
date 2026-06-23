import { Split } from "lucide-react"
import { createAlgorithm } from "@/algorithms/create-algorithm"

export const quickSort = createAlgorithm({
  id: "quick-sort",
  name: { ua: "Швидке сортування", en: "Quick Sort" },
  shortName: { ua: "Швидке", en: "Quick Sort" },
  tagline: {
    ua: "«Розділяй і володарюй»: обираємо опорний, ділимо масив на менші/рівні/більші й рекурсивно сортуємо. Дерево рекурсії, вибір опорного (O(n·log n) проти O(n²)), тристоронній поділ і стабільність.",
    en: "Divide and conquer: pick a pivot, split into smaller/equal/greater and recurse. The recursion tree, pivot choice (O(n·log n) vs O(n²)), three-way partition and stability.",
  },
  family: "sorting",
  category: {
    ua: "Сортування · O(n·log n)",
    en: "Sorting · O(n·log n)",
  },
  icon: Split,
  views: {
    learn: () => import("@/algorithms/quick-sort/learn/LearnView"),
    editor: () => import("@/algorithms/quick-sort/editor/EditorView"),
    playback: () => import("@/algorithms/quick-sort/playback/PlaybackView"),
  },
})
