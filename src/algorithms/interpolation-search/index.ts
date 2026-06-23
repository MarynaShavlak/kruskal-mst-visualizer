import { TrendingUp } from "lucide-react"
import { createAlgorithm } from "@/algorithms/create-algorithm"

export const interpolationSearch = createAlgorithm({
  id: "interpolation-search",
  name: { ua: "Інтерполяційний пошук", en: "Interpolation Search" },
  shortName: { ua: "Інтерполяційний пошук", en: "Interpolation Search" },
  tagline: {
    ua: "Розумна проба: замість середини вікна обчислюємо позицію ФОРМУЛОЮ ІНТЕРПОЛЯЦІЇ — «вгадуємо» за значенням ключа, як шукають слово у словнику. На РІВНОМІРНИХ даних O(log log n) (часто 1–2 проби незалежно від n); на скупчених деградує до O(n). Передумова — масив відсортований.",
    en: "A smart probe: instead of the window's middle, compute the position by the INTERPOLATION FORMULA — guess it from the key's value, the way you look up a word in a dictionary. On UNIFORM data O(log log n) (often 1–2 probes regardless of n); on clustered data it degrades to O(n). Precondition — the array must be sorted.",
  },
  family: "search",
  category: {
    ua: "Пошук · інтерполяція",
    en: "Search · interpolation",
  },
  icon: TrendingUp,
  views: {
    learn: () => import("@/algorithms/interpolation-search/learn/LearnView"),
    editor: () => import("@/algorithms/interpolation-search/editor/EditorView"),
    playback: () => import("@/algorithms/interpolation-search/playback/PlaybackView"),
  },
})
