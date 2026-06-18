// Пресети редактора сортування вставками: головний приклад із README та два
// «межові» інстанси (вже відсортований — найкращий випадок; зворотний — гірший),
// плюс випадковий. Чисто (без React). Повертають копії, щоб стор не тримав
// посилання на незмінні константи еталона.

import {
  INSERTION_INTRO,
  INSERTION_BEST,
  INSERTION_WORST,
} from "@/lib/exampleInsertionSort"
import { randomArray } from "@/lib/randomArray"
import type { InsertionSortDoc } from "@/store/insertion-sort-store"

/** Головний приклад `[5, 2, 4, 6, 1, 3]` — на ньому README веде увесь розбір. */
export function insertionIntroPreset(): InsertionSortDoc {
  return { values: [...INSERTION_INTRO] }
}

/** Найкращий випадок — уже відсортований `[1..6]` (лінійна: 0 зсувів). */
export function insertionBestPreset(): InsertionSortDoc {
  return { values: [...INSERTION_BEST] }
}

/** Гірший випадок — зворотний `[6..1]` (максимум зсувів). */
export function insertionWorstPreset(): InsertionSortDoc {
  return { values: [...INSERTION_WORST] }
}

/** Випадковий масив: `count` цілих [1..99], детерміновано за seed. */
export function insertionRandomPreset(seed: number, count = 8): InsertionSortDoc {
  return { values: randomArray({ count, seed }) }
}
