import { Search } from "lucide-react"
import { createAlgorithm } from "@/algorithms/create-algorithm"

export const linearSearch = createAlgorithm({
  id: "linear-search",
  name: { ua: "Лінійний пошук", en: "Linear Search" },
  shortName: { ua: "Лінійний пошук", en: "Linear Search" },
  tagline: {
    ua: "Перший алгоритм ПОШУКУ серії: послідовно перевіряємо кожен елемент зліва направо, доки не знайдемо x (повертаємо індекс) або не дійдемо до кінця (-1). Масив не змінюється і не потребує впорядкованості. «Ціна» — кількість перевірок: O(1) у найкращому, O(n) у гіршому.",
    en: "The series' first SEARCH algorithm: check each element left to right until x is found (return its index) or the end is reached (-1). The array is never modified and needs no ordering. The cost is the number of checks: O(1) best case, O(n) worst.",
  },
  family: "search",
  complexity: { typical: "O(n)", worst: "O(n)" },
  complexityClass: "linear",
  category: {
    ua: "Пошук · послідовний",
    en: "Search · sequential",
  },
  icon: Search,
  views: {
    learn: () => import("@/algorithms/linear-search/learn/LearnView"),
    editor: () => import("@/algorithms/linear-search/editor/EditorView"),
    playback: () => import("@/algorithms/linear-search/playback/PlaybackView"),
  },
})
