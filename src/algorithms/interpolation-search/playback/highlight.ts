// Чисті хелпери відмальовки інтерполяційного пошуку (без React). Тестуються окремо.
// Сигнатурний образ — ВІКНО [low..high], що звужується НЕсиметрично (проба стрибає
// в інтерпольовану позицію, а не в середину). Кольорова мова — як у двійкового:
// 🟦 активне вікно (де ще може бути x) · 🌸 проба index (поточна проба за формулою) ·
// 🟥 частина, яку відкидаємо ЦЬОГО кроку (✗) · 🟢 знайдений збіг (✓) · 🩶 поза вікном.

/** Роль комірки для кольору. */
export type CellRole = "active" | "probe" | "discarding" | "found" | "out"

/** Стан кадру, потрібний для класифікації комірки. */
export interface CellState {
  /** Активне вікно `[low..high]` (🟦). */
  readonly low: number
  readonly high: number
  /** Проба (інтерпольований індекс) або null. */
  readonly index: number | null
  /** Фаза «проба»: курсор на index і питаємо arr[index] ? x (🌸). */
  readonly probing: boolean
  /** Частина, яку відкидаємо ЦЬОГО кроку (🟥), або null. */
  readonly discardLo: number | null
  readonly discardHi: number | null
  /** Знайдений індекс або -1 (🟢). */
  readonly result: number
  /** На фінальному / знайденому кадрі підсвічуємо результат зеленим. */
  readonly resolved: boolean
}

/**
 * Класифікує комірку за індексом. Пріоритет: знайдений результат (зелений ✓) →
 * частина, яку відкидаємо зараз (червона ✗) → проба index (рожевий, у фазі «проба») →
 * активне вікно (блакитний) → поза вікном (тьмяний).
 */
export function cellRole(idx: number, s: CellState): CellRole {
  if (s.resolved && s.result >= 0 && idx === s.result) return "found"
  if (s.discardLo != null && s.discardHi != null && idx >= s.discardLo && idx <= s.discardHi) {
    return "discarding"
  }
  if (s.probing && idx === s.index) return "probe"
  if (idx >= s.low && idx <= s.high) return "active"
  return "out"
}
