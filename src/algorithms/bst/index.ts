import { Binary } from "lucide-react"
import { createAlgorithm } from "@/algorithms/create-algorithm"

export const binarySearchTree = createAlgorithm({
  id: "bst",
  name: { ua: "Двійкове дерево пошуку", en: "Binary Search Tree" },
  shortName: { ua: "Дерево пошуку (BST)", en: "Search Tree (BST)" },
  tagline: {
    ua: "СТРУКТУРА ДАНИХ із ПРАВИЛОМ порядку: у лівому піддереві кожного вузла ключі МЕНШІ, у правому — БІЛЬШІ. Це правило робить вставку/пошук/видалення логарифмічними O(log n) на збалансованому дереві (і виродженими O(n) на впорядкованому вході). Видалення має три випадки: лист, один нащадок, два нащадки (заміна на наступник).",
    en: "A DATA STRUCTURE with an ORDER rule: in every node's left subtree the keys are SMALLER, in the right they are LARGER. This rule makes insert/search/delete logarithmic O(log n) on a balanced tree (and degenerate O(n) on sorted input). Deletion has three cases: leaf, one child, two children (replace with the successor).",
  },
  family: "trees",
  complexity: { typical: "O(log n)", worst: "O(n)" },
  complexityClass: "logarithmic",
  category: {
    ua: "Дерева · упорядкована структура",
    en: "Trees · ordered structure",
  },
  icon: Binary,
  views: {
    learn: () => import("@/algorithms/bst/learn/LearnView"),
    editor: () => import("@/algorithms/bst/editor/EditorView"),
    playback: () => import("@/algorithms/bst/playback/PlaybackView"),
  },
})
