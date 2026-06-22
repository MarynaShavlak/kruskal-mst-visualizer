import { Hash } from "lucide-react"
import { createAlgorithm } from "@/algorithms/create-algorithm"

export const rabinKarpStringSearch = createAlgorithm({
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
  icon: Hash,
  views: {
    learn: () => import("@/algorithms/rabin-karp-string-search/learn/LearnView"),
    editor: () => import("@/algorithms/rabin-karp-string-search/editor/EditorView"),
    playback: () => import("@/algorithms/rabin-karp-string-search/playback/PlaybackView"),
  },
})
