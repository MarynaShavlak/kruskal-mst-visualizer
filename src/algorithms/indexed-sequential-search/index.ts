import { lazy } from "react"
import { BookMarked } from "lucide-react"
import type { Algorithm } from "@/algorithms/types"

// Розділ «Індексно-послідовний пошук» (Indexed Sequential Search) — ТРЕТІЙ і
// завершальний алгоритм ПОШУКУ серії, ГІБРИД двійкового й лінійного. Дві фази на
// двох рівнях даних: 1) ДВІЙКОВИЙ пошук по розрідженій ІНДЕКСНІЙ таблиці → блок;
// 2) ПОСЛІДОВНИЙ скан лише цього блоку. Складність O(log n + m); оптимум кроку ≈ √n
// (місток до Jump Search). ПЕРЕДУМОВА — масив відсортований. Готові навчальна вкладка,
// редактор (масив + ціль + крок + перевірка відсортованості) і плеєр із дворівневою
// схемою (2 режими фази 1: двійковий/лінійний індекс). Бенчмарку немає (лише в kruskal).
const LearnView = lazy(() =>
  import("@/algorithms/indexed-sequential-search/learn/LearnView").then((m) => ({
    default: m.LearnView,
  })),
)
const EditorView = lazy(() =>
  import("@/algorithms/indexed-sequential-search/editor/EditorView").then((m) => ({
    default: m.EditorView,
  })),
)
const PlaybackView = lazy(() =>
  import("@/algorithms/indexed-sequential-search/playback/PlaybackView").then((m) => ({
    default: m.PlaybackView,
  })),
)

export const indexedSequentialSearch: Algorithm = {
  id: "indexed-sequential-search",
  name: { ua: "Індексно-послідовний пошук", en: "Indexed Sequential Search" },
  shortName: { ua: "Індексно-послідовний", en: "Indexed Sequential" },
  tagline: {
    ua: "Гібрид двійкового й лінійного пошуку: двійковим пошуком по розрідженій ІНДЕКСНІЙ таблиці звужуємо область до БЛОКУ, а тоді ПОСЛІДОВНО скануємо лише його. O(log n + m); оптимум кроку ≈ √n. Передумова — масив відсортований.",
    en: "A hybrid of binary and linear search: binary-search a sparse INDEX table to narrow down to a BLOCK, then scan only that block SEQUENTIALLY. O(log n + m); the optimal step ≈ √n. Precondition — the array must be sorted.",
  },
  category: {
    ua: "Пошук · гібрид (індекс + блок)",
    en: "Search · hybrid (index + block)",
  },
  status: "ready",
  icon: BookMarked,
  defaultTab: "learn",
  tabs: [
    { key: "learn", View: LearnView },
    { key: "editor", View: EditorView },
    { key: "playback", View: PlaybackView },
  ],
}
