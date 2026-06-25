import { Pyramid } from "lucide-react"
import { createAlgorithm } from "@/algorithms/create-algorithm"

export const heapSort = createAlgorithm({
  id: "heap-sort",
  name: { ua: "Пірамідальне сортування", en: "Heap Sort" },
  shortName: { ua: "Пірамідальне", en: "Heap Sort" },
  tagline: {
    ua: "Сортування через КУПУ: масив читаємо як двійкове дерево (дитина вузла i — на 2i+1/2i+2). Будуємо max-купу, далі корінь-максимум міняємо з кінцем, відкидаємо й відновлюємо купу. Гарантовано O(n·log n) у будь-якому випадку.",
    en: "Sorting via a HEAP: read the array as a binary tree (children of i at 2i+1/2i+2). Build a max-heap, swap the max root to the end, drop it and restore the heap. Guaranteed O(n·log n) in every case.",
  },
  family: "sorting",
  complexity: { typical: "O(n·log n)", worst: "O(n·log n)" },
  complexityClass: "linearithmic",
  category: {
    ua: "Сортування · лінійно-логарифмічне",
    en: "Sorting · linearithmic",
  },
  icon: Pyramid,
  views: {
    learn: () => import("@/algorithms/heap-sort/learn/LearnView"),
    editor: () => import("@/algorithms/heap-sort/editor/EditorView"),
    playback: () => import("@/algorithms/heap-sort/playback/PlaybackView"),
  },
})
