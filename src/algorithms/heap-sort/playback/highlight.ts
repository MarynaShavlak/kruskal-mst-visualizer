// Чисті хелпери відмальовки пірамідального сортування (без React). Тестуються окремо.
// Кольорова мова (спільна для дерева-купи й масиву): 🟢 відсортований (вилучений з
// купи) · 🟣 extract-обмін кореня з останнім · 🔴 пара обміну під час просіювання ·
// 🟡 дитина, яку порівнюємо · 🔵 поточний вузол просіювання (кільце) · ⬜ решта купи.

/** Роль вузла/комірки для кольору. */
export type HeapNodeRole =
  | "sorted"
  | "extract"
  | "swap"
  | "compare"
  | "sift"
  | "root"
  | "heap"

/** Стан кадру, потрібний для класифікації вузла. */
export interface HeapNodeState {
  /** Елементи [0..heapSize) — у купі, [heapSize..n) — відсортовані. */
  readonly heapSize: number
  readonly siftNode: number | null
  readonly compareChild: number | null
  readonly swapA: number | null
  readonly swapB: number | null
  /** Чи пара swapA/swapB — це extract-обмін (корінь ↔ останній). */
  readonly isExtract: boolean
  readonly sortedAll: boolean
}

/**
 * Класифікує вузол за індексом. Пріоритет: фінал → пара extract (показуємо ДО межі
 * купи, бо щойно покладений елемент стоїть саме на новій межі) → пара обміну →
 * дитина порівняння → поточний вузол просіювання → корінь → відсортована зона →
 * решта купи.
 */
export function heapNodeRole(idx: number, s: HeapNodeState): HeapNodeRole {
  if (s.sortedAll) return "sorted"
  if (s.isExtract && (idx === s.swapA || idx === s.swapB)) return "extract"
  if (idx >= s.heapSize) return "sorted"
  if (!s.isExtract && (idx === s.swapA || idx === s.swapB)) return "swap"
  if (idx === s.compareChild) return "compare"
  if (idx === s.siftNode) return "sift"
  if (idx === 0) return "root"
  return "heap"
}

/** Висота стовпчика у відсотках від найбільшого значення (мінімум `minPct`%). */
export function barHeightPct(value: number, max: number, minPct = 8): number {
  if (max <= 0) return minPct
  return Math.max(minPct, Math.round((value / max) * 100))
}
