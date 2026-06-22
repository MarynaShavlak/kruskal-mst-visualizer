import { TextSearch } from "lucide-react"
import { createAlgorithm } from "@/algorithms/create-algorithm"

export const naiveStringSearch = createAlgorithm({
  id: "naive-string-search",
  name: { ua: "Наївний пошук у рядках", en: "Naive String Search" },
  shortName: { ua: "Наївний (рядки)", en: "Naive (strings)" },
  tagline: {
    ua: "Перший алгоритм пошуку В РЯДКАХ: ковзаємо шаблоном уздовж тексту й порівнюємо символи зліва направо; на першій розбіжності — зсув на 1 і початок спочатку. Без передобробки. «Ціна» — порівняння символів: найкращий ≈ N−M+1, найгірший (N−M+1)·M. «Марна робота» (повторне звіряння префікса) — місток до KMP.",
    en: "The first STRING-matching algorithm: slide the pattern along the text and compare characters left-to-right; on the first mismatch, shift by one and restart. No preprocessing. The cost is character comparisons: best ≈ N−M+1, worst (N−M+1)·M. The “wasted work” (re-comparing the prefix) is the bridge to KMP.",
  },
  category: {
    ua: "Пошук у рядку · наївний",
    en: "String search · naive",
  },
  icon: TextSearch,
  views: {
    learn: () => import("@/algorithms/naive-string-search/learn/LearnView"),
    editor: () => import("@/algorithms/naive-string-search/editor/EditorView"),
    playback: () => import("@/algorithms/naive-string-search/playback/PlaybackView"),
  },
})
