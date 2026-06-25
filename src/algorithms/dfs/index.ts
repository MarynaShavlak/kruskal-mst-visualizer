import { GitFork } from "lucide-react"
import { createAlgorithm } from "@/algorithms/create-algorithm"

export const dfs = createAlgorithm({
  id: "dfs",
  name: { ua: "Пошук у глибину", en: "Depth-First Search" },
  shortName: { ua: "DFS (обхід)", en: "DFS (traversal)" },
  tagline: {
    ua: "Обхід графа «вглиб»: занурюємось однією гілкою до кінця, потім повертаємось назад — через стек (LIFO) або рекурсію. Основа перевірки циклів і зв'язності.",
    en: "Depth-first graph traversal: dive down one branch to the end, then backtrack — via a stack (LIFO) or recursion. The basis for cycle and connectivity checks.",
  },
  family: "graphs",
  complexity: { typical: "O(V+E)", worst: "O(V+E)" },
  complexityClass: "linear",
  category: { ua: "Графи · Обхід", en: "Graphs · Traversal" },
  icon: GitFork,
  views: {
    learn: () => import("@/algorithms/dfs/learn/LearnView"),
    editor: () => import("@/algorithms/dfs/editor/EditorView"),
    playback: () => import("@/algorithms/dfs/playback/PlaybackView"),
  },
})
