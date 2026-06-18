import { lazy } from "react"
import { Search } from "lucide-react"
import type { Algorithm } from "@/algorithms/types"

// Розділ «Лінійний пошук» (Linear Search) — ПЕРШИЙ у серії алгоритм ПОШУКУ (після
// сортувань). Щоб знайти x у масиві, послідовно перевіряємо кожен елемент зліва
// направо й порівнюємо з x; на першому збігу повертаємо індекс, інакше -1. Масив
// НЕ змінюється і не потребує впорядкованості. «Ціна» — кількість ПЕРЕВІРОК.
// Готові навчальна вкладка, редактор (масив + ціль) і плеєр із рядом комірок +
// курсором-бігунцем (2 режими: перший збіг / усі входження). Бенчмарку немає.
const LearnView = lazy(() =>
  import("@/algorithms/linear-search/learn/LearnView").then((m) => ({
    default: m.LearnView,
  })),
)
const EditorView = lazy(() =>
  import("@/algorithms/linear-search/editor/EditorView").then((m) => ({
    default: m.EditorView,
  })),
)
const PlaybackView = lazy(() =>
  import("@/algorithms/linear-search/playback/PlaybackView").then((m) => ({
    default: m.PlaybackView,
  })),
)

export const linearSearch: Algorithm = {
  id: "linear-search",
  name: { ua: "Лінійний пошук", en: "Linear Search" },
  shortName: { ua: "Лінійний пошук", en: "Linear Search" },
  tagline: {
    ua: "Перший алгоритм ПОШУКУ серії: послідовно перевіряємо кожен елемент зліва направо, доки не знайдемо x (повертаємо індекс) або не дійдемо до кінця (-1). Масив не змінюється і не потребує впорядкованості. «Ціна» — кількість перевірок: O(1) у найкращому, O(n) у гіршому.",
    en: "The series' first SEARCH algorithm: check each element left to right until x is found (return its index) or the end is reached (-1). The array is never modified and needs no ordering. The cost is the number of checks: O(1) best case, O(n) worst.",
  },
  category: {
    ua: "Пошук · послідовний",
    en: "Search · sequential",
  },
  status: "ready",
  icon: Search,
  defaultTab: "learn",
  tabs: [
    { key: "learn", View: LearnView },
    { key: "editor", View: EditorView },
    { key: "playback", View: PlaybackView },
  ],
}
