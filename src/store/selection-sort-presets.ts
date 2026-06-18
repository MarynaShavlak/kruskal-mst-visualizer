// Пресети редактора сортування прямим вибором: головний приклад із README та два
// «межові» інстанси (вже відсортований — найкращий випадок за обмінами; зворотний
// — гірший), плюс випадковий. Чисто (без React). Повертають копії, щоб стор не
// тримав посилання на незмінні константи еталона.

import {
  SELECTION_INTRO,
  SELECTION_BEST,
  SELECTION_WORST,
} from "@/lib/exampleSelectionSort"
import { randomArray } from "@/lib/randomArray"
import type { SelectionSortDoc } from "@/store/selection-sort-store"

/** Головний приклад `[5, 3, 8, 4, 2, 7]` — на ньому README веде увесь розбір. */
export function selectionIntroPreset(): SelectionSortDoc {
  return { values: [...SELECTION_INTRO] }
}

/** Найкращий випадок — уже відсортований `[1..6]` (0 обмінів, але 15 порівнянь). */
export function selectionBestPreset(): SelectionSortDoc {
  return { values: [...SELECTION_BEST] }
}

/** Гірший випадок (за обмінами) — зворотний `[6..1]`. */
export function selectionWorstPreset(): SelectionSortDoc {
  return { values: [...SELECTION_WORST] }
}

/** Випадковий масив: `count` цілих [1..99], детерміновано за seed. */
export function selectionRandomPreset(seed: number, count = 8): SelectionSortDoc {
  return { values: randomArray({ count, seed }) }
}
