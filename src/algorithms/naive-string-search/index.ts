import { lazy } from "react"
import { TextSearch } from "lucide-react"
import type { Algorithm } from "@/algorithms/types"

// Розділ «Наївний пошук у рядках» (Naive String Search) — ПЕРШИЙ алгоритм рядкового
// пошуку серії й базовий орієнтир. Ковзаємо шаблоном уздовж тексту, порівнюючи символи
// зліва направо; на першій розбіжності — зсув на 1 і початок спочатку. Жодної
// передобробки. «Ціна» — порівняння символів: найкращий ≈ N-M+1, найгірший (N-M+1)·M.
// «Марна робота» (повторне звіряння префікса) — місток до KMP. Готові навчальна вкладка,
// редактор (текст + шаблон) і плеєр (стрічка «текст / шаблон»; 2 режими перший збіг / усі
// входження).
const LearnView = lazy(() =>
  import("@/algorithms/naive-string-search/learn/LearnView").then((m) => ({
    default: m.LearnView,
  })),
)
const EditorView = lazy(() =>
  import("@/algorithms/naive-string-search/editor/EditorView").then((m) => ({
    default: m.EditorView,
  })),
)
const PlaybackView = lazy(() =>
  import("@/algorithms/naive-string-search/playback/PlaybackView").then((m) => ({
    default: m.PlaybackView,
  })),
)

export const naiveStringSearch: Algorithm = {
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
  status: "ready",
  icon: TextSearch,
  defaultTab: "learn",
  tabs: [
    { key: "learn", View: LearnView },
    { key: "editor", View: EditorView },
    { key: "playback", View: PlaybackView },
  ],
}
