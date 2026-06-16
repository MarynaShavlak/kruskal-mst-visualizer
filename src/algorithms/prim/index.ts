import { lazy } from "react"
import { Sprout } from "lucide-react"
import type { Algorithm } from "@/algorithms/types"

// Розділ Прима будується по фазах. Готовий редактор; плеєр і навчання — далі.
const EditorView = lazy(() =>
  import("@/algorithms/prim/editor/EditorView").then((m) => ({
    default: m.EditorView,
  })),
)

export const prim: Algorithm = {
  id: "prim",
  name: { ua: "Алгоритм Прима", en: "Prim's Algorithm" },
  shortName: { ua: "Прим (МОД)", en: "Prim (MST)" },
  tagline: {
    ua: "Мінімальне остовне дерево: дерево росте з однієї вершини, щокроку приєднуючи найдешевше ребро через розріз (черга з пріоритетами).",
    en: "Minimum spanning tree: the tree grows from one vertex, each step attaching the cheapest edge across the cut (a priority queue).",
  },
  category: { ua: "Графи · Остовні дерева", en: "Graphs · Spanning trees" },
  status: "ready",
  icon: Sprout,
  defaultTab: "editor",
  tabs: [{ key: "editor", View: EditorView }],
  planned: [
    {
      ua: "Плеєр — черга з пріоритетами та «ліниве видалення» крок за кроком",
      en: "Player — priority queue and lazy deletion, step by step",
    },
    {
      ua: "Навчання — властивість розрізу, Прим проти Краскала",
      en: "Learn — the cut property, Prim vs Kruskal",
    },
  ],
}
