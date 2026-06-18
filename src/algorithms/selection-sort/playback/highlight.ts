// Чисті хелпери для панелі стовпчиків плеєра сортування прямим вибором (без
// React). Тестуються окремо.

/** Роль стовпчика на кадрі — задає його колір у легенді README. */
export type BarRole = "prefix" | "min" | "swap" | "placed" | "hole" | "idle"

export interface BarRoleInput {
  /** Межа відсортованого префікса (зелена). */
  readonly sortedTo: number
  /** Індекс «біжучого мінімуму» (бурштиновий) або null. */
  readonly minIdx: number | null
  /** Індекс елемента, що став на місце (синій) або null. */
  readonly placedAt: number | null
  /** Індекс елемента пари обміну / щойно зсунутого (червоний) або null. */
  readonly swapAt: number | null
  /** Індекс «дірки» (пунктир, стабільна версія) або null. */
  readonly hole: number | null
}

/**
 * Класифікує стовпчик за індексом (пріоритет згори вниз):
 *  - «дірка» (вільна позиція, стабільна версія): `hole` (пунктир);
 *  - елемент, що щойно став на місце: `placed` (синій);
 *  - елемент пари обміну / щойно зсунутий: `swap` (червоний);
 *  - поточний кандидат-мінімум: `min` (бурштиновий);
 *  - елемент відсортованого префікса (index < sortedTo): `prefix` (зелений);
 *  - решта — несортований суфікс: `idle` (сіро-синій).
 */
export function barRole(index: number, input: BarRoleInput): BarRole {
  const { sortedTo, minIdx, placedAt, swapAt, hole } = input
  if (hole !== null && index === hole) return "hole"
  if (placedAt !== null && index === placedAt) return "placed"
  if (swapAt !== null && index === swapAt) return "swap"
  if (minIdx !== null && index === minIdx) return "min"
  if (index < sortedTo) return "prefix"
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
