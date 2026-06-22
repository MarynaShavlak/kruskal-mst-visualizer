import { lazy } from "react"
import { Hash } from "lucide-react"
import type { Algorithm } from "@/algorithms/types"

// Розділ «Пошук Рабіна-Карпа» (Rabin-Karp, ковзний хеш) — рядковий пошук, що порівнює НЕ
// символи, а ЧИСЛА. Поліноміальний хеш перетворює кожне вікно завдовжки M на число; хеш
// вікна порівнюємо з хешем шаблону, і лише на збігу хешів звіряємо символи (щоб відсіяти
// КОЛІЗІЇ). Ковзний хеш оновлюється за O(1) на зсув. Середнє O(n+m), найгірший O(n·m).
// base=256, modulus=101. Готові навчальна вкладка, редактор (текст + шаблон) і плеєр
// (фаза 1 — побудова хешу; фаза 2 — ковзне вікно зі стрічкою; 2 режими rolling/перерахунок).
const LearnView = lazy(() =>
  import("@/algorithms/rabin-karp-string-search/learn/LearnView").then((m) => ({
    default: m.LearnView,
  })),
)
const EditorView = lazy(() =>
  import("@/algorithms/rabin-karp-string-search/editor/EditorView").then((m) => ({
    default: m.EditorView,
  })),
)
const PlaybackView = lazy(() =>
  import("@/algorithms/rabin-karp-string-search/playback/PlaybackView").then((m) => ({
    default: m.PlaybackView,
  })),
)

export const rabinKarpStringSearch: Algorithm = {
  id: "rabin-karp-string-search",
  name: { ua: "Пошук Рабіна–Карпа", en: "Rabin–Karp Search" },
  shortName: { ua: "Рабіна–Карпа", en: "Rabin–Karp" },
  tagline: {
    ua: "Рядковий пошук, що порівнює НЕ символи, а ЧИСЛА: поліноміальний хеш перетворює кожне вікно завдовжки M на число; хеш вікна звіряємо з хешем шаблону, і лише на збігу хешів перевіряємо символи (щоб відсіяти КОЛІЗІЇ — різні рядки з однаковим хешем). Ковзний хеш (rolling hash) оновлює хеш за O(1) на зсув. Середнє O(n+m); найгірший O(n·m) при поганому модулі. base=256, modulus=101.",
    en: "A string search that compares NUMBERS, not characters: a polynomial hash turns each length-M window into a number; compare the window hash to the pattern hash, and only on a HASH MATCH verify characters (to rule out COLLISIONS — different strings with the same hash). The rolling hash updates in O(1) per shift. Average O(n+m); worst O(n·m) with a bad modulus. base=256, modulus=101.",
  },
  category: {
    ua: "Пошук у рядку · Рабіна–Карпа",
    en: "String search · Rabin–Karp",
  },
  status: "ready",
  icon: Hash,
  defaultTab: "learn",
  tabs: [
    { key: "learn", View: LearnView },
    { key: "editor", View: EditorView },
    { key: "playback", View: PlaybackView },
  ],
}
