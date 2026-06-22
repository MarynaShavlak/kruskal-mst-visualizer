import { TableProperties } from "lucide-react"
import { createAlgorithm } from "@/algorithms/create-algorithm"

export const kmpStringSearch = createAlgorithm({
  id: "kmp-string-search",
  name: { ua: "Кнут-Морріс-Пратт (KMP)", en: "Knuth–Morris–Pratt (KMP)" },
  shortName: { ua: "KMP (рядки)", en: "KMP (strings)" },
  tagline: {
    ua: "Лінійний пошук у рядках O(n+m). ФАЗА 1 будує таблицю lps (longest-prefix-suffix) із самого шаблону; ФАЗА 2 шукає, а на розбіжності СТРИБАЄ індекс шаблону j на lps[j−1] замість перечитування тексту — індекс тексту i НІКОЛИ не зменшується (контраст із «марною роботою» наївного методу).",
    en: "Linear-time string search O(n+m). PHASE 1 builds the lps (longest-prefix-suffix) table from the pattern itself; PHASE 2 searches, and on a mismatch JUMPS the pattern index j to lps[j−1] instead of re-reading the text — the text index i NEVER decreases (the contrast with the naive method’s “wasted work”).",
  },
  category: {
    ua: "Пошук у рядку · KMP",
    en: "String search · KMP",
  },
  icon: TableProperties,
  views: {
    learn: () => import("@/algorithms/kmp-string-search/learn/LearnView"),
    editor: () => import("@/algorithms/kmp-string-search/editor/EditorView"),
    playback: () => import("@/algorithms/kmp-string-search/playback/PlaybackView"),
  },
})
