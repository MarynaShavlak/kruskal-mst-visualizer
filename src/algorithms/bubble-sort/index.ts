import { ArrowDownUp } from "lucide-react"
import { createAlgorithm } from "@/algorithms/create-algorithm"
import { sortBenchmark } from "@/lib/benchmarks/sort-benchmark"

export const bubbleSort = createAlgorithm({
  id: "bubble-sort",
  name: { ua: "Бульбашкове сортування", en: "Bubble Sort" },
  shortName: { ua: "Бульбашка", en: "Bubble Sort" },
  tagline: {
    ua: "Найпростіший метод упорядкування: порівнюй сусідів і міняй місцями. Наочно про інваріант проходу, стабільність, ранню зупинку й чому O(n²) непрактичний.",
    en: "The simplest sorting method: compare neighbours and swap. A clear lens on the pass invariant, stability, early exit and why O(n²) is impractical.",
  },
  family: "sorting",
  complexity: { typical: "O(n²)", worst: "O(n²)" },
  complexityClass: "quadratic",
  category: {
    ua: "Сортування · O(n²)",
    en: "Sorting · O(n²)",
  },
  icon: ArrowDownUp,
  views: {
    learn: () => import("@/algorithms/bubble-sort/learn/LearnView"),
    editor: () => import("@/algorithms/bubble-sort/editor/EditorView"),
    playback: () => import("@/algorithms/bubble-sort/playback/PlaybackView"),
  },
  benchmark: sortBenchmark,
})
