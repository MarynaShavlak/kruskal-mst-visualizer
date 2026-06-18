// Чисті хелпери відмальовки сортування Шелла (без React). Тестуються окремо.
// Кольорова мова: 🟢 відсортований/вставлений · 🔴 щойно gap-зсунутий · 🟡 елемент,
// що порівнюється (arr[j-gap]) · ⋯ «дірка» · ⬜ решта; поточна підпослідовність
// (крок gap) підсвічена окремо (ring на індексі).

/** Роль стовпчика для кольору. */
export type ShellBarRole = "sorted" | "shift" | "compare" | "insert" | "hole" | "idle"

/** Стан кадру, потрібний для класифікації стовпчика. */
export interface ShellBarState {
  readonly hole: number | null
  readonly compareAt: number | null
  readonly shiftAt: number | null
  readonly insertAt: number | null
  readonly sortedAll: boolean
}

/**
 * Класифікує стовпчик за індексом. Пріоритет: «дірка» → весь масив відсортовано →
 * щойно зсунутий → той, що порівнюється → щойно вставлений → решта.
 */
export function shellBarRole(idx: number, s: ShellBarState): ShellBarRole {
  if (idx === s.hole) return "hole"
  if (s.sortedAll) return "sorted"
  if (idx === s.shiftAt) return "shift"
  if (idx === s.compareAt) return "compare"
  if (idx === s.insertAt) return "insert"
  return "idle"
}

/**
 * Чи належить індекс ПОТОЧНІЙ підпослідовності (крок gap, залишок residue = i%gap)?
 * Використовується для підсвітки «через крок» (видно, які елементи сортуються разом).
 */
export function inCurrentGroup(idx: number, gap: number | null, residue: number): boolean {
  if (gap == null || gap <= 0 || residue < 0) return false
  return idx % gap === residue
}

/**
 * Висота стовпчика у відсотках від найбільшого значення. Найменша видима — `minPct`.
 */
export function barHeightPct(value: number, max: number, minPct = 8): number {
  if (max <= 0) return minPct
  return Math.max(minPct, Math.round((value / max) * 100))
}
