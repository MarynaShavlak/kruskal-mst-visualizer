// Чисті хелпери для відмальовки дерева рекурсії / розбиття швидкого сортування
// (без React). Тестуються окремо.

/** Роль елемента в поділі навколо опорного — задає його колір у легенді README. */
export type PartRole = "pivot" | "less" | "equal" | "greater"

/**
 * Класифікує елемент підмасиву щодо опорного:
 *  - сам опорний (за індексом) → `pivot` (фіолетовий);
 *  - `< pivot` → `less` (синій, піде в left);
 *  - `== pivot` (але не сам опорний) → `equal` (бузковий, middle);
 *  - `> pivot` → `greater` (помаранчевий, right).
 */
export function partRole(value: number, pivot: number, isPivot: boolean): PartRole {
  if (isPivot) return "pivot"
  if (value < pivot) return "less"
  if (value === pivot) return "equal"
  return "greater"
}

/**
 * Висота стовпчика у відсотках від найбільшого значення (для барного вигляду
 * масиву). Найменша видима висота — `minPct`.
 */
export function barHeightPct(value: number, max: number, minPct = 8): number {
  if (max <= 0) return minPct
  return Math.max(minPct, Math.round((value / max) * 100))
}
