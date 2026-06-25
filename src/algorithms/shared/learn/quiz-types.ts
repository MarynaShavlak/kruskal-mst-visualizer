import type { ReactNode } from "react"

/** Двомовний рядок без походу в messages (навчальний контент квізів). */
export type BilingualText = { ua: string; en: string }

/**
 * Один варіант відповіді квіза. Коректність визначається АБО прапорцем
 * `correct`, АБО предикатом `QuizSpec.correctPredicate(payload)` — обчисленим із
 * сирого `payload` (напр. масиву для `isMaxHeap`). `label` — довільне
 * ReactNode-дерево (текст, дерево-купа, SVG); внутрішні підписи — двомовні через
 * `BilingualText`. `explain` — адресне пояснення САМЕ цього варіанта (чому він
 * правильний/хибний).
 */
export type QuizOption<P = unknown> = {
  /** Стабільний ключ варіанта (для React-key і тестів). */
  id: string
  /** Видимий підпис: готовий ReactNode або двомовний рядок. */
  label: ReactNode | BilingualText
  /** Явний прапорець коректності (альтернатива до correctPredicate). */
  correct?: boolean
  /** Адресне пояснення варіанта двома мовами. */
  explain: BilingualText
  /** Сирі дані варіанта для обчислення коректності предикатом. */
  payload?: P
}

/**
 * Декларативна специфікація MCQ-чекпойнта Learn. Рендериться спільним
 * `QuizFigure`. Коректність варіанта = `option.correct` якщо задано, інакше
 * `correctPredicate(option.payload)`. Рівно один варіант мусить бути коректним.
 */
export type QuizSpec<P = unknown> = {
  /** Питання двома мовами. */
  prompt: BilingualText
  /** Варіанти відповіді. */
  options: readonly QuizOption<P>[]
  /** Обчислення коректності з payload (коли немає явного `correct`). */
  correctPredicate?: (payload: P) => boolean
}

/** Чи коректний варіант: явний прапорець має пріоритет над предикатом. */
export function isOptionCorrect<P>(
  option: QuizOption<P>,
  predicate?: (payload: P) => boolean,
): boolean {
  if (option.correct !== undefined) return option.correct
  if (predicate && option.payload !== undefined) return predicate(option.payload)
  return false
}
