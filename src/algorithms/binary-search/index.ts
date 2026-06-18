import { lazy } from "react"
import { SearchCheck } from "lucide-react"
import type { Algorithm } from "@/algorithms/types"

// Розділ «Двійковий (бінарний) пошук» (Binary Search) — ДРУГИЙ алгоритм ПОШУКУ
// серії, «винагорода за сортування». Тримаємо вікно [low, high]; дивимось у його
// середину mid і відкидаємо половину, у якій шуканого точно немає; повторюємо, доки
// не знайдемо або вікно не спорожніє. ПЕРЕДУМОВА — масив відсортований; за це O(log n)
// замість O(n). Готові навчальна вкладка, редактор (масив + ціль + перевірка
// відсортованості) і плеєр із вікном, що звужується вдвічі (2 режими: ітеративний/
// рекурсивний). Бенчмарку немає (лише в kruskal).
const LearnView = lazy(() =>
  import("@/algorithms/binary-search/learn/LearnView").then((m) => ({
    default: m.LearnView,
  })),
)
const EditorView = lazy(() =>
  import("@/algorithms/binary-search/editor/EditorView").then((m) => ({
    default: m.EditorView,
  })),
)
const PlaybackView = lazy(() =>
  import("@/algorithms/binary-search/playback/PlaybackView").then((m) => ({
    default: m.PlaybackView,
  })),
)

export const binarySearch: Algorithm = {
  id: "binary-search",
  name: { ua: "Двійковий пошук", en: "Binary Search" },
  shortName: { ua: "Двійковий пошук", en: "Binary Search" },
  tagline: {
    ua: "Винагорода за сортування: на ВІДСОРТОВАНОМУ масиві дивимось у середину вікна [low..high] і відкидаємо половину, у якій шуканого точно немає. Щокроку вікно звужується вдвічі → O(log n) замість O(n). Передумова — масив відсортований.",
    en: "The reward for sorting: on a SORTED array look at the middle of the window [low..high] and drop the half that can't contain the target. The window halves each step → O(log n) instead of O(n). Precondition — the array must be sorted.",
  },
  category: {
    ua: "Пошук · поділ навпіл",
    en: "Search · halving",
  },
  status: "ready",
  icon: SearchCheck,
  defaultTab: "learn",
  tabs: [
    { key: "learn", View: LearnView },
    { key: "editor", View: EditorView },
    { key: "playback", View: PlaybackView },
  ],
}
