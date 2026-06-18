// Пресети редактора порозрядного сортування: головний приклад із README,
// рівнорозрядний (чисті 2 проходи), дублікати (стабільність), межовий (велике d —
// обмеження radix) та випадковий. Чисто (без React). Повертають копії.

import {
  RADIX_INTRO,
  RADIX_EQUAL,
  RADIX_DUPLICATES,
  RADIX_BIG,
} from "@/lib/exampleRadixSort"
import { randomArray } from "@/lib/randomArray"
import type { RadixSortDoc } from "@/store/radix-sort-store"

/** Головний приклад `[3,89,67,254,9,21,185,4,62]`. */
export function radixIntroPreset(): RadixSortDoc {
  return { values: [...RADIX_INTRO] }
}

/** Рівнорозрядний `[42,17,93,28,55,31,86,64]` — чисті 2 проходи. */
export function radixEqualPreset(): RadixSortDoc {
  return { values: [...RADIX_EQUAL] }
}

/** Дублікати `[52,12,52,31,12,41]` — стабільність. */
export function radixDuplicatesPreset(): RadixSortDoc {
  return { values: [...RADIX_DUPLICATES] }
}

/** Межовий `[4,7,1000000,23,9]` — велике d (7 проходів). */
export function radixBigPreset(): RadixSortDoc {
  return { values: [...RADIX_BIG] }
}

/** Випадковий масив: `count` цілих [1..99], детерміновано за seed. */
export function radixRandomPreset(seed: number, count = 8): RadixSortDoc {
  return { values: randomArray({ count, seed }) }
}
