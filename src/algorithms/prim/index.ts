import { lazy } from "react"
import { Sprout } from "lucide-react"
import type { Algorithm } from "@/algorithms/types"

// Розділ Прима будується по фазах. Готові редактор і плеєр; навчання — далі.
const EditorView = lazy(() =>
  import("@/algorithms/prim/editor/EditorView").then((m) => ({
    default: m.EditorView,
  })),
)
const PlaybackView = lazy(() =>
  import("@/algorithms/prim/playback/PlaybackView").then((m) => ({
    default: m.PlaybackView,
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
  defaultTab: "playback",
  tabs: [
    { key: "editor", View: EditorView },
    { key: "playback", View: PlaybackView },
  ],
  planned: [
    {
      ua: "Навчання — властивість розрізу, ліниве видалення, Прим проти Краскала",
      en: "Learn — the cut property, lazy deletion, Prim vs Kruskal",
    },
  ],
}
