import { Sprout } from "lucide-react"
import { createAlgorithm } from "@/algorithms/create-algorithm"

export const prim = createAlgorithm({
  id: "prim",
  name: { ua: "Алгоритм Прима", en: "Prim's Algorithm" },
  shortName: { ua: "Прим (МОД)", en: "Prim (MST)" },
  tagline: {
    ua: "Мінімальне остовне дерево: дерево росте з однієї вершини, щокроку приєднуючи найдешевше ребро через розріз (черга з пріоритетами).",
    en: "Minimum spanning tree: the tree grows from one vertex, each step attaching the cheapest edge across the cut (a priority queue).",
  },
  family: "graphs",
  category: { ua: "Графи · Остовні дерева", en: "Graphs · Spanning trees" },
  icon: Sprout,
  views: {
    learn: () => import("@/algorithms/prim/learn/LearnView"),
    editor: () => import("@/algorithms/prim/editor/EditorView"),
    playback: () => import("@/algorithms/prim/playback/PlaybackView"),
  },
})
