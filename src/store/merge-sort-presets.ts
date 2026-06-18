// Пресети редактора сортування злиттям: головний приклад із README (8 елементів —
// степінь двійки, ідеально збалансоване дерево), вже відсортований і зворотний
// масиви (показують неадаптивність — однакова O(n·log n)), масив з дублікатами
// (стабільність) та випадковий. Чисто (без React). Повертають копії.

import {
  MERGE_INTRO,
  MERGE_SORTED,
  MERGE_REVERSED,
  MERGE_DUPLICATES,
} from "@/lib/exampleMergeSort"
import { randomArray } from "@/lib/randomArray"
import type { MergeSortDoc } from "@/store/merge-sort-store"

/** Головний приклад `[8,4,6,2,7,1,5,3]` — степінь двійки, збалансоване дерево. */
export function mergeIntroPreset(): MergeSortDoc {
  return { values: [...MERGE_INTRO] }
}

/** Уже відсортований `[1..8]` — merge sort усе одно робить всі поділи/злиття. */
export function mergeSortedPreset(): MergeSortDoc {
  return { values: [...MERGE_SORTED] }
}

/** Зворотний `[8..1]` — дерево так само збалансоване, без деградації. */
export function mergeReversedPreset(): MergeSortDoc {
  return { values: [...MERGE_REVERSED] }
}

/** Дублікати `[3,1,3,2,1,3]` — стабільність (рівні ключі зберігають порядок). */
export function mergeDuplicatesPreset(): MergeSortDoc {
  return { values: [...MERGE_DUPLICATES] }
}

/** Випадковий масив: `count` цілих [1..99], детерміновано за seed. */
export function mergeRandomPreset(seed: number, count = 8): MergeSortDoc {
  return { values: randomArray({ count, seed }) }
}
