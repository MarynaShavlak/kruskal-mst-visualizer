import { HeapTree } from "@/algorithms/heap-sort/playback/HeapTreePanel"
import type { HeapNodeState } from "@/algorithms/heap-sort/playback/highlight"
import { isMaxHeap } from "@/lib/heapSort"
import type { QuizSpec } from "@/algorithms/shared/learn/quiz-types"

// Декларативний MCQ-чекпойнт пірамідального сортування: «де КОРЕКТНА max-купа?».
// Коректність кожного варіанта ОБЧИСЛЮЄТЬСЯ предикатом `isMaxHeap(arr)` (а не
// хардкодиться), а `explain` дає АДРЕСНЕ пояснення саме цього дерева. `label` —
// живе дерево-купа; `payload` — сирий масив для предиката.

/** Нейтральний (без підсвітки) стан вузлів для дерева-варіанта. */
function neutral(n: number): HeapNodeState {
  return {
    heapSize: n,
    siftNode: null,
    compareChild: null,
    swapA: null,
    swapB: null,
    isExtract: false,
    sortedAll: false,
  }
}

/** Варіант квіза: тег, дерево й сирий масив. */
type Option = { id: string; arr: number[] }

const OPTIONS: readonly Option[] = [
  { id: "A", arr: [10, 8, 6, 4, 5, 1, 2] },
  { id: "B", arr: [10, 5, 6, 4, 8, 2, 1] },
  { id: "C", arr: [6, 9, 8, 2, 3] },
]

const EXPLAIN: Record<string, { ua: string; en: string }> = {
  A: {
    ua: "Коректна max-купа: 10 ≥ 8,6; 8 ≥ 4,5; 6 ≥ 1,2 — кожен батько ≥ своїх дітей.",
    en: "A valid max-heap: 10 ≥ 8,6; 8 ≥ 4,5; 6 ≥ 1,2 — every parent ≥ its children.",
  },
  B: {
    ua: "Порушено: вузол 5 (індекс 1) має дитину 8 (індекс 4), а 5 < 8 — батько менший за дитину.",
    en: "Violated: node 5 (index 1) has child 8 (index 4), and 5 < 8 — the parent is smaller than its child.",
  },
  C: {
    ua: "Порушено просто в корені: 6 < 9 — корінь max-купи мусить бути найбільшим, а тут це не так.",
    en: "Violated right at the root: 6 < 9 — the root of a max-heap must be the largest, but here it is not.",
  },
}

/** Спека MCQ-чекпойнта max-купи для спільного `QuizFigure`. */
export const MAX_HEAP_QUIZ: QuizSpec<readonly number[]> = {
  prompt: {
    ua: "Натисни на дерево: де КОРЕКТНА max-купа (кожен батько ≥ дітей)?",
    en: "Click a tree: which is a VALID max-heap (every parent ≥ its children)?",
  },
  correctPredicate: isMaxHeap,
  options: OPTIONS.map((o) => ({
    id: o.id,
    payload: o.arr,
    explain: EXPLAIN[o.id],
    label: <HeapTree array={o.arr} state={neutral(o.arr.length)} scale={0.82} />,
  })),
}
