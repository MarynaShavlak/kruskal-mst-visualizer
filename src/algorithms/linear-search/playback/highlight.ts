// Чисті хелпери відмальовки лінійного пошуку (без React). Тестуються окремо.
// Сигнатурний образ — нерухомий ряд комірок із курсором-бігунцем (а не стовпчики
// чи кошики). Кольорова мова: 🌸 перевіряємо ЗАРАЗ (курсор ▼) · 🟢 знайдено (✓) ·
// 🩶 уже перевірили й відкинули (✗) · ⬜ ще не перевіряли.

/** Роль комірки для кольору. */
export type CellRole = "checking" | "match" | "rejected" | "pending"

/** Стан кадру, потрібний для класифікації комірки. */
export interface CellState {
  /** Індекс, який ЗАРАЗ розглядаємо (курсор), або null. */
  readonly cursor: number | null
  /** Фаза «інтрига»: курсор став і питає arr[i] == x? (рожевий). */
  readonly checking: boolean
  /** Індекси збігів (для «усі входження» — кілька; зелені). */
  readonly matches: readonly number[]
  /** Найбільший УЖЕ перевірений індекс включно; -1 якщо жоден. */
  readonly resolvedTo: number
}

/**
 * Класифікує комірку за індексом. Пріоритет: збіг (зелений ✓) → перевіряємо зараз
 * (рожевий, лише у фазі «інтрига») → уже перевірено й відкинуто (тьмяний ✗) →
 * ще не дійшли (нейтральний).
 */
export function cellRole(idx: number, s: CellState): CellRole {
  if (s.matches.includes(idx)) return "match"
  if (s.checking && idx === s.cursor) return "checking"
  if (idx <= s.resolvedTo) return "rejected"
  return "pending"
}
