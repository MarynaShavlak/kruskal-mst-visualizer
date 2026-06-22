import { lazy } from "react"
import { TableProperties } from "lucide-react"
import type { Algorithm } from "@/algorithms/types"

// Розділ «Кнут-Морріс-Пратт (KMP)» — ДРУГИЙ алгоритм рядкового пошуку серії після наївного.
// Лінійний O(n+m): ФАЗА 1 будує таблицю lps (longest-prefix-suffix) із самого шаблону;
// ФАЗА 2 шукає, а на розбіжності СТРИБАЄ індекс шаблону j на lps[j-1] замість перечитування
// тексту — індекс тексту i НІКОЛИ не зменшується (визначальний інваріант; контраст із
// «марною роботою» наївного). Готові навчальна вкладка, редактор (текст + шаблон + прев'ю
// lps + контраст ціни KMP/наївний) і плеєр (дві фази: таблиця lps → стрічка пошуку).
const LearnView = lazy(() =>
  import("@/algorithms/kmp-string-search/learn/LearnView").then((m) => ({
    default: m.LearnView,
  })),
)
const EditorView = lazy(() =>
  import("@/algorithms/kmp-string-search/editor/EditorView").then((m) => ({
    default: m.EditorView,
  })),
)
const PlaybackView = lazy(() =>
  import("@/algorithms/kmp-string-search/playback/PlaybackView").then((m) => ({
    default: m.PlaybackView,
  })),
)

export const kmpStringSearch: Algorithm = {
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
  status: "ready",
  icon: TableProperties,
  defaultTab: "learn",
  tabs: [
    { key: "learn", View: LearnView },
    { key: "editor", View: EditorView },
    { key: "playback", View: PlaybackView },
  ],
}
