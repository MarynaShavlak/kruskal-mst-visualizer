import { lazy } from "react"
import { AlignHorizontalDistributeCenter } from "lucide-react"
import type { Algorithm } from "@/algorithms/types"

// Розділ «Сортування Шелла» (Shell Sort) — узагальнення сортування вставками:
// порівнюємо й зсуваємо елементи, віддалені на крок gap (а не сусідні). Готові
// навчальна вкладка, редактор масиву чисел і плеєр зі стовпчиками + підсвіткою
// підпослідовностей; перемикач послідовності проміжків (n//2 / Кнут / Ciura).
// Бенчмарку немає (лише в kruskal).
const LearnView = lazy(() =>
  import("@/algorithms/shell-sort/learn/LearnView").then((m) => ({
    default: m.LearnView,
  })),
)
const EditorView = lazy(() =>
  import("@/algorithms/shell-sort/editor/EditorView").then((m) => ({
    default: m.EditorView,
  })),
)
const PlaybackView = lazy(() =>
  import("@/algorithms/shell-sort/playback/PlaybackView").then((m) => ({
    default: m.PlaybackView,
  })),
)

export const shellSort: Algorithm = {
  id: "shell-sort",
  name: { ua: "Сортування Шелла", en: "Shell Sort" },
  shortName: { ua: "Шелла", en: "Shell Sort" },
  tagline: {
    ua: "Вставки, але «через крок»: порівнюємо й зсуваємо елементи, віддалені на gap. Великий gap прибирає безлад здалеку, далі gap зменшується до 1. Підпослідовності, послідовності проміжків (n//2 / Кнут / Ciura) і нестабільність.",
    en: "Insertion sort «with a step»: compare and shift elements gap apart. A large gap clears far-away disorder, then gap shrinks to 1. Subsequences, gap sequences (n//2 / Knuth / Ciura) and instability.",
  },
  category: {
    ua: "Сортування · субквадратичне",
    en: "Sorting · sub-quadratic",
  },
  status: "ready",
  icon: AlignHorizontalDistributeCenter,
  defaultTab: "learn",
  tabs: [
    { key: "learn", View: LearnView },
    { key: "editor", View: EditorView },
    { key: "playback", View: PlaybackView },
  ],
}
