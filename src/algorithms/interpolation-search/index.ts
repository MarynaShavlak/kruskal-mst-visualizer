import { lazy } from "react"
import { TrendingUp } from "lucide-react"
import type { Algorithm } from "@/algorithms/types"

// Розділ «Інтерполяційний пошук» (Interpolation Search) — «розумна» проба у
// ВІДСОРТОВАНОМУ масиві. Каркас той самий, що в двійкового (вікно [low, high],
// відкидаємо половину), але замість СЕРЕДИНИ обчислюємо пробу ФОРМУЛОЮ ЛІНІЙНОЇ
// ІНТЕРПОЛЯЦІЇ — «вгадуємо» позицію за значенням ключа (проєкція на «пряму-модель»).
// На РІВНОМІРНИХ даних — O(log log n) (часто 1–2 проби незалежно від n), на скупчених
// деградує до O(n) — гірше за двійковий. Готові навчальна вкладка, редактор (масив +
// ціль + контраст із двійковим) і плеєр (вікно + пряма-модель; 2 режими ітеративний/
// рекурсивний). Бенчмарку немає (лише в kruskal).
const LearnView = lazy(() =>
  import("@/algorithms/interpolation-search/learn/LearnView").then((m) => ({
    default: m.LearnView,
  })),
)
const EditorView = lazy(() =>
  import("@/algorithms/interpolation-search/editor/EditorView").then((m) => ({
    default: m.EditorView,
  })),
)
const PlaybackView = lazy(() =>
  import("@/algorithms/interpolation-search/playback/PlaybackView").then((m) => ({
    default: m.PlaybackView,
  })),
)

export const interpolationSearch: Algorithm = {
  id: "interpolation-search",
  name: { ua: "Інтерполяційний пошук", en: "Interpolation Search" },
  shortName: { ua: "Інтерполяційний пошук", en: "Interpolation Search" },
  tagline: {
    ua: "Розумна проба: замість середини вікна обчислюємо позицію ФОРМУЛОЮ ІНТЕРПОЛЯЦІЇ — «вгадуємо» за значенням ключа, як шукають слово у словнику. На РІВНОМІРНИХ даних O(log log n) (часто 1–2 проби незалежно від n); на скупчених деградує до O(n). Передумова — масив відсортований.",
    en: "A smart probe: instead of the window's middle, compute the position by the INTERPOLATION FORMULA — guess it from the key's value, the way you look up a word in a dictionary. On UNIFORM data O(log log n) (often 1–2 probes regardless of n); on clustered data it degrades to O(n). Precondition — the array must be sorted.",
  },
  category: {
    ua: "Пошук · інтерполяція",
    en: "Search · interpolation",
  },
  status: "ready",
  icon: TrendingUp,
  defaultTab: "learn",
  tabs: [
    { key: "learn", View: LearnView },
    { key: "editor", View: EditorView },
    { key: "playback", View: PlaybackView },
  ],
}
