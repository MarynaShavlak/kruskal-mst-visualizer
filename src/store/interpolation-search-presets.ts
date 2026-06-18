// Пресети редактора інтерполяційного пошуку: демо 1 (ідеальний здогад за 1 пробу),
// демо 2 (з коригуванням за 2 проби), скупчені дані (деградація — метод програє
// двійковому) та випадковий рівномірний масив. УСІ масиви ВІДСОРТОВАНІ — передумова
// методу. Чисто (без React). Повертають копії. Документ несе ще й ціль пошуку `target`.

import {
  IP_DEMO1,
  IP_DEMO2,
  IP_CLUSTERED,
} from "@/lib/exampleInterpolationSearch"
import { randomArray } from "@/lib/randomArray"
import type { InterpolationSearchDoc } from "@/store/interpolation-search-store"

/** Демо 1 `([1,3,5,…,19], шукаємо 15)` — індекс 7 за ОДНУ пробу (ідеальний здогад). */
export function ipDemo1Preset(): InterpolationSearchDoc {
  return { values: [...IP_DEMO1.values], target: IP_DEMO1.target }
}

/** Демо 2 `([1,3,5,7,9,11,14,16,…,30], шукаємо 25)` — індекс 11 за ДВІ проби. */
export function ipDemo2Preset(): InterpolationSearchDoc {
  return { values: [...IP_DEMO2.values], target: IP_DEMO2.target }
}

/** Скупчені `([1,2,…,9,1000], шукаємо 9)` — 9 проб (деградація до O(n)). */
export function ipClusteredPreset(): InterpolationSearchDoc {
  return { values: [...IP_CLUSTERED.values], target: IP_CLUSTERED.target }
}

/**
 * Випадковий ВІДСОРТОВАНИЙ масив `count` цілих [1..99], детерміновано за seed.
 * Ціль — один із елементів масиву (зазвичай знайдеться), теж детерміновано.
 */
export function ipRandomPreset(seed: number, count = 12): InterpolationSearchDoc {
  const values = [...randomArray({ count, seed })].sort((a, b) => a - b)
  const target = values.length > 0 ? values[seed % values.length] : 0
  return { values, target }
}
