import { lazy } from "react"
import { FastForward } from "lucide-react"
import type { Algorithm } from "@/algorithms/types"

// Розділ «Боєра-Мура (таблиця поганого символу)» — рядковий пошук, що змінює сам НАПРЯМ
// і КРОК: порівнюємо суфікс шаблону СПРАВА НАЛІВО й на розбіжності ПЕРЕСТРИБУЄМО вперед
// за передобробленою таблицею поганого символу — часто пропускаючи цілі шматки тексту
// (сублінійно у найкращому випадку). Реалізовано ЛИШЕ компоненту поганого символу
// (добрий суфікс — на потім). Найгірший — O(n·m) (CAAAA в AAAA…). Готові навчальна
// вкладка, редактор (текст + шаблон) і плеєр (фаза таблиці зсувів + фаза пошуку зі
// стрічкою «текст / шаблон» і великими стрибками).
const LearnView = lazy(() =>
  import("@/algorithms/boyer-moore-string-search/learn/LearnView").then((m) => ({
    default: m.LearnView,
  })),
)
const EditorView = lazy(() =>
  import("@/algorithms/boyer-moore-string-search/editor/EditorView").then((m) => ({
    default: m.EditorView,
  })),
)
const PlaybackView = lazy(() =>
  import("@/algorithms/boyer-moore-string-search/playback/PlaybackView").then((m) => ({
    default: m.PlaybackView,
  })),
)

export const boyerMooreStringSearch: Algorithm = {
  id: "boyer-moore-string-search",
  name: { ua: "Боєра-Мура (рядки)", en: "Boyer–Moore (strings)" },
  shortName: { ua: "Боєра-Мура", en: "Boyer–Moore" },
  tagline: {
    ua: "Рядковий пошук, що змінює НАПРЯМ і КРОК: суфікс шаблону звіряємо СПРАВА НАЛІВО, а на розбіжності ПЕРЕСТРИБУЄМО вперед за таблицею поганого символу — часто пропускаючи цілі шматки тексту (сублінійно у найкращому). Тут — лише правило поганого символу (добрий суфікс — на потім). Найгірший — O(n·m) (CAAAA в AAAA…).",
    en: "A string search that changes DIRECTION and STEP: compare the pattern suffix RIGHT-TO-LEFT and, on a mismatch, LEAP forward using a precomputed bad-character table — often skipping whole chunks of text (sublinear at best). Only the bad-character rule here (good-suffix is left for later). Worst case O(n·m) (CAAAA in AAAA…).",
  },
  category: {
    ua: "Пошук у рядку · Боєра–Мура",
    en: "String search · Boyer–Moore",
  },
  status: "ready",
  icon: FastForward,
  defaultTab: "learn",
  tabs: [
    { key: "learn", View: LearnView },
    { key: "editor", View: EditorView },
    { key: "playback", View: PlaybackView },
  ],
}
