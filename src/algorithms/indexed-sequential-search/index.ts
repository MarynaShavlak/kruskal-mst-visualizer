import { BookMarked } from "lucide-react"
import { createAlgorithm } from "@/algorithms/create-algorithm"

export const indexedSequentialSearch = createAlgorithm({
  id: "indexed-sequential-search",
  name: { ua: "Індексно-послідовний пошук", en: "Indexed Sequential Search" },
  shortName: { ua: "Індексно-послідовний", en: "Indexed Sequential" },
  tagline: {
    ua: "Гібрид двійкового й лінійного пошуку: двійковим пошуком по розрідженій ІНДЕКСНІЙ таблиці звужуємо область до БЛОКУ, а тоді ПОСЛІДОВНО скануємо лише його. O(log n + m); оптимум кроку ≈ √n. Передумова — масив відсортований.",
    en: "A hybrid of binary and linear search: binary-search a sparse INDEX table to narrow down to a BLOCK, then scan only that block SEQUENTIALLY. O(log n + m); the optimal step ≈ √n. Precondition — the array must be sorted.",
  },
  family: "search",
  complexity: { typical: "O(√n)", worst: "O(√n)" },
  category: {
    ua: "Пошук · гібрид (індекс + блок)",
    en: "Search · hybrid (index + block)",
  },
  icon: BookMarked,
  views: {
    learn: () => import("@/algorithms/indexed-sequential-search/learn/LearnView"),
    editor: () => import("@/algorithms/indexed-sequential-search/editor/EditorView"),
    playback: () => import("@/algorithms/indexed-sequential-search/playback/PlaybackView"),
  },
})
