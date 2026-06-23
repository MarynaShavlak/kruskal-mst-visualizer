import { FastForward } from "lucide-react"
import { createAlgorithm } from "@/algorithms/create-algorithm"

export const boyerMooreStringSearch = createAlgorithm({
  id: "boyer-moore-string-search",
  name: { ua: "Боєра-Мура (рядки)", en: "Boyer–Moore (strings)" },
  shortName: { ua: "Боєра-Мура", en: "Boyer–Moore" },
  tagline: {
    ua: "Рядковий пошук, що змінює НАПРЯМ і КРОК: суфікс шаблону звіряємо СПРАВА НАЛІВО, а на розбіжності ПЕРЕСТРИБУЄМО вперед за таблицею поганого символу — часто пропускаючи цілі шматки тексту (сублінійно у найкращому). Тут — лише правило поганого символу (добрий суфікс — на потім). Найгірший — O(n·m) (CAAAA в AAAA…).",
    en: "A string search that changes DIRECTION and STEP: compare the pattern suffix RIGHT-TO-LEFT and, on a mismatch, LEAP forward using a precomputed bad-character table — often skipping whole chunks of text (sublinear at best). Only the bad-character rule here (good-suffix is left for later). Worst case O(n·m) (CAAAA in AAAA…).",
  },
  family: "string-search",
  complexity: "O(n/m)",
  category: {
    ua: "Пошук у рядку · Боєра–Мура",
    en: "String search · Boyer–Moore",
  },
  icon: FastForward,
  views: {
    learn: () => import("@/algorithms/boyer-moore-string-search/learn/LearnView"),
    editor: () => import("@/algorithms/boyer-moore-string-search/editor/EditorView"),
    playback: () => import("@/algorithms/boyer-moore-string-search/playback/PlaybackView"),
  },
})
