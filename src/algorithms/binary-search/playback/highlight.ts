// Чисті хелпери відмальовки двійкового пошуку (без React). Тестуються окремо.
// Сигнатурний образ — ВІКНО [low..high], що звужується вдвічі. Кольорова мова:
// 🟦 активне вікно (де ще може бути x) · 🌸 mid (поточна проба) · 🟥 половина, яку
// відкидаємо ЦЬОГО кроку (✗) · 🟢 знайдений збіг (✓) · 🩶 поза вікном (відкинуто).

/** Роль комірки для кольору. */
export type CellRole = "active" | "mid" | "discarding" | "found" | "out"

/** Стан кадру, потрібний для класифікації комірки. */
export interface CellState {
  /** Активне вікно `[low..high]` (🟦). */
  readonly low: number
  readonly high: number
  /** Проба (середина) або null. */
  readonly mid: number | null
  /** Фаза «проба»: курсор на mid і питаємо arr[mid] ? x (🌸). */
  readonly probing: boolean
  /** Половина, яку відкидаємо ЦЬОГО кроку (🟥), або null. */
  readonly discardLo: number | null
  readonly discardHi: number | null
  /** Знайдений індекс або -1 (🟢). */
  readonly result: number
  /** На фінальному / знайденому кадрі підсвічуємо результат зеленим. */
  readonly resolved: boolean
}

/**
 * Класифікує комірку за індексом. Пріоритет: знайдений результат (зелений ✓) →
 * половина, яку відкидаємо зараз (червона ✗) → mid-проба (рожевий, у фазі «проба») →
 * активне вікно (блакитний) → поза вікном (тьмяний).
 */
export function cellRole(idx: number, s: CellState): CellRole {
  if (s.resolved && s.result >= 0 && idx === s.result) return "found"
  if (s.discardLo != null && s.discardHi != null && idx >= s.discardLo && idx <= s.discardHi) {
    return "discarding"
  }
  if (s.probing && idx === s.mid) return "mid"
  if (idx >= s.low && idx <= s.high) return "active"
  return "out"
}
