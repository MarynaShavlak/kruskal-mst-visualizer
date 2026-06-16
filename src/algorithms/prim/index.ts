import { lazy } from "react"
import { Sprout } from "lucide-react"
import type { Algorithm } from "@/algorithms/types"

// Важкі екрани вантажимо лінією окремими чанками (React Flow / Shiki / markdown).
const LearnView = lazy(() =>
  import("@/algorithms/prim/learn/LearnView").then((m) => ({
    default: m.LearnView,
  })),
)
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
  defaultTab: "learn",
  tabs: [
    { key: "learn", View: LearnView },
    { key: "editor", View: EditorView },
    { key: "playback", View: PlaybackView },
  ],
}
