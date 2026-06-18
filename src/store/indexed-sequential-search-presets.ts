// Пресети редактора індексно-послідовного пошуку: головний приклад із README, збіг
// у самому індексі (best-case фаза 1), відсутній елемент і випадковий. УСІ масиви
// ВІДСОРТОВАНІ — передумова методу. Документ несе ще й крок індексу `step` та ціль
// `target`. Чисто (без React); повертають копії.

import {
  IXS_MAIN,
  IXS_IN_INDEX,
  IXS_RIGHT_ABSENT,
} from "@/lib/exampleIndexedSequentialSearch"
import { optimalStep } from "@/lib/indexedSequentialSearch"
import { randomArray } from "@/lib/randomArray"
import type { IndexedSequentialSearchDoc } from "@/store/indexed-sequential-search-store"

/** Головний приклад `([1,3,…,25], крок 4, шукаємо 15)` — позиція 7, 2 зондування + 4 = 6. */
export function issIntroPreset(): IndexedSequentialSearchDoc {
  return { values: [...IXS_MAIN.values], target: IXS_MAIN.target, step: IXS_MAIN.step }
}

/** Збіг у самому індексі `([1,3,…,25], крок 4, шукаємо 9)` — відповідь ще на фазі 1. */
export function issInIndexPreset(): IndexedSequentialSearchDoc {
  return { values: [...IXS_IN_INDEX.values], target: IXS_IN_INDEX.target, step: IXS_IN_INDEX.step }
}

/** Відсутній правіше `([1,3,…,25], крок 4, шукаємо 27)` — скан хвоста → -1. */
export function issAbsentPreset(): IndexedSequentialSearchDoc {
  return { values: [...IXS_RIGHT_ABSENT.values], target: IXS_RIGHT_ABSENT.target, step: IXS_RIGHT_ABSENT.step }
}

/**
 * Випадковий ВІДСОРТОВАНИЙ масив: `count` цілих [1..99], детерміновано за seed; крок
 * — оптимальний ≈ √count; ціль — один із елементів (зазвичай знайдеться).
 */
export function issRandomPreset(seed: number, count = 16): IndexedSequentialSearchDoc {
  const values = [...randomArray({ count, seed })].sort((a, b) => a - b)
  const target = values.length > 0 ? values[seed % values.length] : 0
  return { values, target, step: optimalStep(values.length) }
}
