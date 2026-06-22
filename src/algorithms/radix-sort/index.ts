import { Boxes } from "lucide-react"
import { createAlgorithm } from "@/algorithms/create-algorithm"

export const radixSort = createAlgorithm({
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
  icon: Boxes,
  views: {
    learn: () => import("@/algorithms/radix-sort/learn/LearnView"),
    editor: () => import("@/algorithms/radix-sort/editor/EditorView"),
    playback: () => import("@/algorithms/radix-sort/playback/PlaybackView"),
  },
})
