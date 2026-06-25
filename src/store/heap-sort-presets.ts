// Пресети редактора пірамідального сортування: головний приклад із конспекту, вже
// відсортований (НЕадаптивність), зворотний, дублікати (нестабільність) і випадковий.
// Чисто (без React). Повертають копії.

import {
  HEAP_INTRO,
  HEAP_SORTED,
  HEAP_REVERSED,
  HEAP_DUPLICATES,
} from "@/lib/exampleHeapSort"
import { randomArray } from "@/lib/randomArray"
import type { HeapSortDoc } from "@/store/heap-sort-store"

/** Головний приклад `[12,11,13,5,6,7]`. */
export function heapIntroPreset(): HeapSortDoc {
  return { values: [...HEAP_INTRO] }
}

/** Уже відсортований `[1..6]` — НЕадаптивність (купу все одно треба перебудувати). */
export function heapSortedPreset(): HeapSortDoc {
  return { values: [...HEAP_SORTED] }
}

/** Зворотний `[6..1]` — майже готова max-купа. */
export function heapReversedPreset(): HeapSortDoc {
  return { values: [...HEAP_REVERSED] }
}

/** Дублікати `[4,2,4,1,2,4]` — нестабільність. */
export function heapDuplicatesPreset(): HeapSortDoc {
  return { values: [...HEAP_DUPLICATES] }
}

/** Випадковий масив: `count` цілих [1..99], детерміновано за seed. */
export function heapRandomPreset(seed: number, count = 10): HeapSortDoc {
  return { values: randomArray({ count, seed }) }
}
