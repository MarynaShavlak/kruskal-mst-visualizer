// Пресети редактора лінійного пошуку: головний приклад із README, дублікати
// (перший збіг vs усі входження), відсортований (місток до двійкового) та
// випадковий. Чисто (без React). Повертають копії. На відміну від сортувань,
// документ несе ще й ціль пошуку `target`.

import {
  LS_MAIN,
  LS_DUPLICATES,
  LS_SORTED,
} from "@/lib/exampleLinearSearch"
import { randomArray } from "@/lib/randomArray"
import type { LinearSearchDoc } from "@/store/linear-search-store"

/** Головний приклад `([5,3,8,1,4], шукаємо 8)` — збіг на індексі 2. */
export function lsMainPreset(): LinearSearchDoc {
  return { values: [...LS_MAIN.values], target: LS_MAIN.target }
}

/** Дублікати `([4,8,3,8,1,8], шукаємо 8)` — перший збіг 1; усі входження [1,3,5]. */
export function lsDuplicatesPreset(): LinearSearchDoc {
  return { values: [...LS_DUPLICATES.values], target: LS_DUPLICATES.target }
}

/** Відсортований `([1,3,5,7,9,11], шукаємо 7)` — місток до двійкового пошуку. */
export function lsSortedPreset(): LinearSearchDoc {
  return { values: [...LS_SORTED.values], target: LS_SORTED.target }
}

/**
 * Випадковий масив: `count` цілих [1..99], детерміновано за seed. Ціль — один із
 * елементів масиву (зазвичай знайдеться), теж детерміновано за seed.
 */
export function lsRandomPreset(seed: number, count = 7): LinearSearchDoc {
  const values = randomArray({ count, seed })
  const target = values.length > 0 ? values[seed % values.length] : 0
  return { values, target }
}
