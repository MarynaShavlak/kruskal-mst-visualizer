import { SearchCheck } from "lucide-react"
import { createAlgorithm } from "@/algorithms/create-algorithm"

export const binarySearch = createAlgorithm({
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
  icon: SearchCheck,
  views: {
    learn: () => import("@/algorithms/binary-search/learn/LearnView"),
    editor: () => import("@/algorithms/binary-search/editor/EditorView"),
    playback: () => import("@/algorithms/binary-search/playback/PlaybackView"),
  },
})
