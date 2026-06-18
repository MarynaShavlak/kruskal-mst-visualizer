import { lazy } from "react"
import { Boxes } from "lucide-react"
import type { Algorithm } from "@/algorithms/types"

// Розділ «Порозрядне сортування» (Radix Sort) — ПЕРШИЙ у серії алгоритм, який НЕ
// порівнює елементи між собою: розкладає числа по 10 кошиках (0–9) за цифрою
// поточного розряду й збирає назад, від молодшого розряду до старшого (LSD). На
// кожному розряді — стабільне сортування підрахунком (лінчпін). Готові навчальна
// вкладка, редактор масиву чисел і плеєр із кошиками + фішками-числами (підсвічена
// цифра розряду). Бенчмарку немає (лише в kruskal).
const LearnView = lazy(() =>
  import("@/algorithms/radix-sort/learn/LearnView").then((m) => ({
    default: m.LearnView,
  })),
)
const EditorView = lazy(() =>
  import("@/algorithms/radix-sort/editor/EditorView").then((m) => ({
    default: m.EditorView,
  })),
)
const PlaybackView = lazy(() =>
  import("@/algorithms/radix-sort/playback/PlaybackView").then((m) => ({
    default: m.PlaybackView,
  })),
)

export const radixSort: Algorithm = {
  id: "radix-sort",
  name: { ua: "Порозрядне сортування", en: "Radix Sort" },
  shortName: { ua: "Порозрядне", en: "Radix Sort" },
  tagline: {
    ua: "Перше непорівняльне сортування: не «що більше?», а самі ЦИФРИ. Розкладаємо числа по 10 кошиках (0–9) за цифрою розряду й збираємо — від одиниць до старших (LSD). Стабільне сортування підрахунком — лінчпін. Лінійний час O(d·(n+k)).",
    en: "The first non-comparison sort: not «which is larger?» but the DIGITS themselves. Distribute numbers into 10 buckets (0–9) by the current digit and gather — from units up (LSD). Stable counting sort is the linchpin. Linear time O(d·(n+k)).",
  },
  category: {
    ua: "Сортування · непорівняльне",
    en: "Sorting · non-comparison",
  },
  status: "ready",
  icon: Boxes,
  defaultTab: "learn",
  tabs: [
    { key: "learn", View: LearnView },
    { key: "editor", View: EditorView },
    { key: "playback", View: PlaybackView },
  ],
}
