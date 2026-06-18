// Пресети редактора швидкого сортування: головний приклад із README, вже
// відсортований масив (для контрасту стратегій опорного), масив з дублікатами та
// випадковий. Чисто (без React). Повертають копії, щоб стор не тримав посилання
// на незмінні константи еталона.

import {
  QUICK_INTRO,
  QUICK_SORTED,
  QUICK_DUPLICATES,
} from "@/lib/exampleQuickSort"
import { randomArray } from "@/lib/randomArray"
import type { QuickSortDoc } from "@/store/quick-sort-store"

/** Головний приклад `[3, 5, 2, 4, 6, 1, 7]` — збалансоване дерево (опорний-середина). */
export function quickIntroPreset(): QuickSortDoc {
  return { values: [...QUICK_INTRO] }
}

/** Уже відсортований `[1..7]` — контраст стратегій: середина балансує, перший вироджує. */
export function quickSortedPreset(): QuickSortDoc {
  return { values: [...QUICK_SORTED] }
}

/** Багато дублікатів `[4,2,4,4,1,4,3]` — усі рівні опорному осідають у middle одразу. */
export function quickDuplicatesPreset(): QuickSortDoc {
  return { values: [...QUICK_DUPLICATES] }
}

/** Випадковий масив: `count` цілих [1..99], детерміновано за seed. */
export function quickRandomPreset(seed: number, count = 8): QuickSortDoc {
  return { values: randomArray({ count, seed }) }
}
