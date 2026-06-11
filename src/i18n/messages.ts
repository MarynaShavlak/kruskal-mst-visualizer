// Словник UI-рядків (chrome) для t(). Ключі визначає `ua`; `en` типізовано як
// Record<MessageKey, string>, тож пропущений/зайвий ключ — помилка компіляції
// (парність UA/EN гарантована статично). Контент навчальних вкладок сюди НЕ
// входить — він у markdown UA/EN. Поповнюється по фазах i18n.

import type { Lang } from "@/store/lang-store"

const ua = {
  "app.title": "Алгоритми: інтерактивні розбори",
  "app.subtitle": "Платформа для вивчення алгоритмів",

  "common.loading": "Завантаження…",
  "common.ready": "Готово",
  "common.soon": "Незабаром",
  "common.soonShort": "скоро",

  "home.heading": "Оберіть алгоритм",
  "home.intro":
    "Інтерактивні розбори: теорія, редактор графа, покрокове програвання та бенчмарк. Нові алгоритми додаються поступово.",

  "switcher.aria": "Обрати алгоритм",
  "switcher.placeholder": "Оберіть алгоритм",
  "switcher.label": "Алгоритми",

  "comingSoon.badge": "У розробці — незабаром",
  "comingSoon.plannedTitle": "Що буде в цьому розділі:",

  "learn.heading": "Навчальний розбір",
  "toc.title": "Зміст",

  "tab.learn": "Навчання",
  "tab.editor": "Редактор",
  "tab.playback": "Алгоритм",
  "tab.benchmark": "Бенчмарк",
}

export type MessageKey = keyof typeof ua

const en: Record<MessageKey, string> = {
  "app.title": "Algorithms: interactive walkthroughs",
  "app.subtitle": "A platform for learning algorithms",

  "common.loading": "Loading…",
  "common.ready": "Ready",
  "common.soon": "Coming soon",
  "common.soonShort": "soon",

  "home.heading": "Choose an algorithm",
  "home.intro":
    "Interactive walkthroughs: theory, a graph editor, step-by-step playback and a benchmark. New algorithms are added gradually.",

  "switcher.aria": "Choose algorithm",
  "switcher.placeholder": "Choose an algorithm",
  "switcher.label": "Algorithms",

  "comingSoon.badge": "In progress — coming soon",
  "comingSoon.plannedTitle": "What this section will include:",

  "learn.heading": "Learning walkthrough",
  "toc.title": "Contents",

  "tab.learn": "Learn",
  "tab.editor": "Editor",
  "tab.playback": "Algorithm",
  "tab.benchmark": "Benchmark",
}

export const messages: Record<Lang, Record<MessageKey, string>> = { ua, en }
