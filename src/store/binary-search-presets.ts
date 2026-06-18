// Пресети редактора двійкового пошуку: головний приклад із README, дублікати
// (межі lower/upper), відсутній елемент (повний спуск до -1) та випадковий.
// УСІ масиви ВІДСОРТОВАНІ — передумова двійкового пошуку. Чисто (без React).
// Повертають копії. Документ несе ще й ціль пошуку `target`.

import {
  BS_INTRO,
  BS_DUPLICATES,
  BS_ABSENT,
} from "@/lib/exampleBinarySearch"
import { randomArray } from "@/lib/randomArray"
import type { BinarySearchDoc } from "@/store/binary-search-store"

/** Головний приклад `([1,3,5,8,10,12,15,18,20,22,24], шукаємо 15)` — індекс 6, 3 кроки. */
export function bsIntroPreset(): BinarySearchDoc {
  return { values: [...BS_INTRO.values], target: BS_INTRO.target }
}

/** Дублікати `([1,2,2,2,3,4], шукаємо 2)` — межі lower_bound/upper_bound. */
export function bsDuplicatesPreset(): BinarySearchDoc {
  return { values: [...BS_DUPLICATES.values], target: BS_DUPLICATES.target }
}

/** Відсутній `([1,3,5,8,10,12,15,18,20,22,24], шукаємо 11)` — повний спуск до -1. */
export function bsAbsentPreset(): BinarySearchDoc {
  return { values: [...BS_ABSENT.values], target: BS_ABSENT.target }
}

/**
 * Випадковий ВІДСОРТОВАНИЙ масив: `count` цілих [1..99], детерміновано за seed.
 * Ціль — один із елементів масиву (зазвичай знайдеться), теж детерміновано.
 */
export function bsRandomPreset(seed: number, count = 11): BinarySearchDoc {
  const values = [...randomArray({ count, seed })].sort((a, b) => a - b)
  const target = values.length > 0 ? values[seed % values.length] : 0
  return { values, target }
}
