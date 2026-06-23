import { ArrowDownNarrowWide } from "lucide-react"
import { createAlgorithm } from "@/algorithms/create-algorithm"

export const insertionSort = createAlgorithm({
  id: "insertion-sort",
  name: { ua: "Сортування вставками", en: "Insertion Sort" },
  shortName: { ua: "Вставки", en: "Insertion Sort" },
  tagline: {
    ua: "Як розкладання карт у руці: беремо ключ і зсуваємо більші елементи префікса праворуч. Наочно про префікс, інваріант, стабільність, адаптивність без прапорця й бінарну вставку.",
    en: "Like sorting cards in your hand: take a key and shift bigger prefix elements right. A clear lens on the prefix, the invariant, stability, flag-free adaptivity and binary insertion.",
  },
  family: "sorting",
  category: {
    ua: "Сортування · O(n²)",
    en: "Sorting · O(n²)",
  },
  icon: ArrowDownNarrowWide,
  views: {
    learn: () => import("@/algorithms/insertion-sort/learn/LearnView"),
    editor: () => import("@/algorithms/insertion-sort/editor/EditorView"),
    playback: () => import("@/algorithms/insertion-sort/playback/PlaybackView"),
  },
})
