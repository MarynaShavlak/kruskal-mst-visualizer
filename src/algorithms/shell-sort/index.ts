import { AlignHorizontalDistributeCenter } from "lucide-react"
import { createAlgorithm } from "@/algorithms/create-algorithm"

export const shellSort = createAlgorithm({
  id: "shell-sort",
  name: { ua: "Сортування Шелла", en: "Shell Sort" },
  shortName: { ua: "Шелла", en: "Shell Sort" },
  tagline: {
    ua: "Вставки, але «через крок»: порівнюємо й зсуваємо елементи, віддалені на gap. Великий gap прибирає безлад здалеку, далі gap зменшується до 1. Підпослідовності, послідовності проміжків (n//2 / Кнут / Ciura) і нестабільність.",
    en: "Insertion sort «with a step»: compare and shift elements gap apart. A large gap clears far-away disorder, then gap shrinks to 1. Subsequences, gap sequences (n//2 / Knuth / Ciura) and instability.",
  },
  family: "sorting",
  complexity: { typical: "O(n√n)", worst: "O(n²)" },
  category: {
    ua: "Сортування · субквадратичне",
    en: "Sorting · sub-quadratic",
  },
  icon: AlignHorizontalDistributeCenter,
  views: {
    learn: () => import("@/algorithms/shell-sort/learn/LearnView"),
    editor: () => import("@/algorithms/shell-sort/editor/EditorView"),
    playback: () => import("@/algorithms/shell-sort/playback/PlaybackView"),
  },
})
