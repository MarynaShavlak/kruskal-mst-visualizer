import { ListTree } from "lucide-react"
import { createAlgorithm } from "@/algorithms/create-algorithm"

export const treeTraversal = createAlgorithm({
  id: "tree-traversal",
  name: { ua: "Обхід дерева", en: "Tree Traversal" },
  shortName: { ua: "Обхід дерева", en: "Tree Traversal" },
  tagline: {
    ua: "СТРУКТУРА ДАНИХ дерево — ієрархія вузлів (корінь, діти, листя). Обхід відвідує КОЖЕН вузол рівно один раз рекурсією; три класичні порядки для двійкового дерева — прямий (корінь→ліве→праве), центровий (ліве→корінь→праве, на дереві пошуку дає відсортовано) і зворотний (ліве→праве→корінь). Ціна — O(n).",
    en: "A tree DATA STRUCTURE — a hierarchy of nodes (root, children, leaves). A traversal visits EVERY node exactly once via recursion; the three classic orders for a binary tree are pre-order (root→left→right), in-order (left→root→right, which on a search tree yields sorted output) and post-order (left→right→root). Cost is O(n).",
  },
  family: "trees",
  complexity: { typical: "O(n)", worst: "O(n)" },
  complexityClass: "linear",
  category: {
    ua: "Дерева · обхід у глибину",
    en: "Trees · depth-first traversal",
  },
  icon: ListTree,
  views: {
    learn: () => import("@/algorithms/tree-traversal/learn/LearnView"),
    editor: () => import("@/algorithms/tree-traversal/editor/EditorView"),
    playback: () => import("@/algorithms/tree-traversal/playback/PlaybackView"),
  },
})
