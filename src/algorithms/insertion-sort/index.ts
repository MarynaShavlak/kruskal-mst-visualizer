import { lazy } from "react"
import { ArrowDownNarrowWide } from "lucide-react"
import type { Algorithm } from "@/algorithms/types"

// Розділ «Сортування вставками» (Insertion Sort). Готові навчальна вкладка,
// редактор масиву чисел і плеєр із двома режимами (лінійний пошук місця /
// бінарна вставка). Бенчмарку немає (лише в kruskal).
const LearnView = lazy(() =>
  import("@/algorithms/insertion-sort/learn/LearnView").then((m) => ({
    default: m.LearnView,
  })),
)
const EditorView = lazy(() =>
  import("@/algorithms/insertion-sort/editor/EditorView").then((m) => ({
    default: m.EditorView,
  })),
)
const PlaybackView = lazy(() =>
  import("@/algorithms/insertion-sort/playback/PlaybackView").then((m) => ({
    default: m.PlaybackView,
  })),
)

export const insertionSort: Algorithm = {
  id: "insertion-sort",
  name: { ua: "Сортування вставками", en: "Insertion Sort" },
  shortName: { ua: "Вставки", en: "Insertion Sort" },
  tagline: {
    ua: "Як розкладання карт у руці: беремо ключ і зсуваємо більші елементи префікса праворуч. Наочно про префікс, інваріант, стабільність, адаптивність без прапорця й бінарну вставку.",
    en: "Like sorting cards in your hand: take a key and shift bigger prefix elements right. A clear lens on the prefix, the invariant, stability, flag-free adaptivity and binary insertion.",
  },
  category: {
    ua: "Сортування · O(n²)",
    en: "Sorting · O(n²)",
  },
  status: "ready",
  icon: ArrowDownNarrowWide,
  defaultTab: "learn",
  tabs: [
    { key: "learn", View: LearnView },
    { key: "editor", View: EditorView },
    { key: "playback", View: PlaybackView },
  ],
}
