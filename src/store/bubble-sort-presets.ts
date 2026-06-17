// Пресети редактора бульбашкового сортування: головний приклад із README та два
// «межові» інстанси (вже відсортований — найкращий випадок; зворотний — гірший),
// плюс випадковий. Чисто (без React). Повертають копії, щоб стор не тримав
// посилання на незмінні константи еталона.

import {
  BUBBLE_INTRO,
  BUBBLE_BEST,
  BUBBLE_WORST,
} from "@/lib/exampleBubbleSort"
import { randomArray } from "@/lib/randomArray"
import type { BubbleSortDoc } from "@/store/bubble-sort-store"

/** Головний приклад `[5, 1, 4, 2, 8, 3]` — на ньому README веде увесь розбір. */
export function bubbleIntroPreset(): BubbleSortDoc {
  return { values: [...BUBBLE_INTRO] }
}

/** Найкращий випадок — уже відсортований `[1..6]` (оптимізована: один прохід). */
export function bubbleBestPreset(): BubbleSortDoc {
  return { values: [...BUBBLE_BEST] }
}

/** Гірший випадок — зворотний `[6..1]` (максимум обмінів). */
export function bubbleWorstPreset(): BubbleSortDoc {
  return { values: [...BUBBLE_WORST] }
}

/** Випадковий масив: `count` цілих [1..99], детерміновано за seed. */
export function bubbleRandomPreset(seed: number, count = 8): BubbleSortDoc {
  return { values: randomArray({ count, seed }) }
}
