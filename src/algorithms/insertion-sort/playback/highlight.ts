// Чисті хелпери для панелі стовпчиків плеєра сортування вставками (без React).
// Тестуються окремо.

/** Роль стовпчика на кадрі — задає його колір у легенді README. */
export type BarRole = "prefix" | "compare" | "shift" | "hole" | "idle"

/**
 * Класифікує стовпчик за індексом (пріоритет згори вниз):
 *  - «дірка» (вільна позиція під key): `hole` (пунктир);
 *  - елемент, який щойно зсунули праворуч: `shift` (червоний);
 *  - елемент, який зараз порівнюють/перевіряють: `compare` (бурштиновий);
 *  - елемент відсортованого префікса (index < prefixLen): `prefix` (зелений);
 *  - решта — несортований суфікс: `idle` (сіро-синій).
 */
export function barRole(
  index: number,
  prefixLen: number,
  hole: number | null,
  compareAt: number | null,
  shiftAt: number | null,
): BarRole {
  if (hole !== null && index === hole) return "hole"
  if (shiftAt !== null && index === shiftAt) return "shift"
  if (compareAt !== null && index === compareAt) return "compare"
  if (index < prefixLen) return "prefix"
  return "idle"
}

/**
 * Висота стовпчика у відсотках від найбільшого значення. Найменша видима висота —
 * `minPct` (щоб нульові/малі значення лишалися помітними).
 */
export function barHeightPct(value: number, max: number, minPct = 8): number {
  if (max <= 0) return minPct
  return Math.max(minPct, Math.round((value / max) * 100))
}
