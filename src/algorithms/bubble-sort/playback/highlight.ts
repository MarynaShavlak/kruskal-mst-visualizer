// Чисті хелпери для панелі стовпчиків плеєра бульбашкового сортування (без React).
// Тестуються окремо.

/** Роль стовпчика на кадрі — задає його колір у легенді README. */
export type BarRole = "comparing" | "swapped" | "sorted" | "idle"

/**
 * Класифікує стовпчик за індексом:
 *  - пара, що порівнюється зараз: `swapped` (червоний, щойно обміняли) або
 *    `comparing` (бурштиновий);
 *  - елемент у відсортованому «хвості» (index ≥ sortedFrom): `sorted` (зелений);
 *  - решта: `idle` (сіро-синій).
 * Пара під час проходу ніколи не перетинається з хвостом, тож пріоритет пари
 * безпечний.
 */
export function barRole(
  index: number,
  pair: readonly [number, number] | null,
  swapped: boolean,
  sortedFrom: number,
): BarRole {
  if (pair && (index === pair[0] || index === pair[1])) {
    return swapped ? "swapped" : "comparing"
  }
  if (index >= sortedFrom) return "sorted"
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
