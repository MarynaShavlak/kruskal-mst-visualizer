import { Hash } from "lucide-react"
import { createAlgorithm } from "@/algorithms/create-algorithm"

export const hashTable = createAlgorithm({
  id: "hash-table",
  name: { ua: "Хеш-таблиця", en: "Hash Table" },
  shortName: { ua: "Хеш-таблиця", en: "Hash Table" },
  tagline: {
    ua: "СТРУКТУРА ДАНИХ для доступу за ключем: хеш-функція перетворює ключ на індекс комірки (hash(ключ) % m), тож вставка/пошук/видалення — у середньому O(1), без сортування. Колізії (два ключі в одну комірку) розв'язуємо ланцюжками. Кульмінація історії пошуку.",
    en: "A DATA STRUCTURE for key access: a hash function turns a key into a cell index (hash(key) % m), so insert/search/delete are O(1) on average, with no sorting. Collisions (two keys in one cell) are resolved by chaining. The climax of the search story.",
  },
  family: "hashing",
  complexity: { typical: "O(1)", worst: "O(n)" },
  complexityClass: "constant",
  category: {
    ua: "Хешування · пряма адресація",
    en: "Hashing · direct addressing",
  },
  icon: Hash,
  views: {
    learn: () => import("@/algorithms/hash-table/learn/LearnView"),
    editor: () => import("@/algorithms/hash-table/editor/EditorView"),
    playback: () => import("@/algorithms/hash-table/playback/PlaybackView"),
  },
})
