// Пресети редактора рюкзака: два еталонні інстанси з README (класичний W=50 та
// малий W=4) + випадковий. Чисто (без React). Клонуємо предмети, щоб стор не
// тримав посилання на незмінні константи еталона.

import { KNAPSACK_CLASSIC, KNAPSACK_SMALL } from "@/lib/exampleKnapsack"
import { randomKnapsack } from "@/lib/randomKnapsack"
import type { KnapsackInstance } from "@/lib/knapsack"
import type { KnapsackDoc } from "@/store/knapsack-store"

const clone = (instance: KnapsackInstance): KnapsackDoc => ({
  items: instance.items.map((it) => ({ ...it })),
  capacity: instance.capacity,
})

/** Класичний еталон (W=50): {П1,П2,П3}, оптимум 220 — і контрприклад жадібного. */
export function knapsackClassicPreset(): KnapsackDoc {
  return clone(KNAPSACK_CLASSIC)
}

/** Малий еталон (W=4): зручний для покрокового заповнення таблиці 4×5. */
export function knapsackSmallPreset(): KnapsackDoc {
  return clone(KNAPSACK_SMALL)
}

/** Випадковий інстанс: `count` предметів, місткість ≈ половина суми ваг. */
export function knapsackRandomPreset(seed: number, count = 5): KnapsackDoc {
  return clone(randomKnapsack({ count, seed }))
}
