// Чисті хелпери відмальовки фази ПОШУКУ Боєра-Мура (без React). Тестуються окремо.
// Сигнатура методу — сканування СПРАВА НАЛІВО: збіжний СУФІКС шаблону росте вліво
// (🟢 match), поточний поганий символ кінця вікна — 🔴 (mismatch), решта вікна ще не
// звірена (🟦 window), пропущені стрибком символи тексту — 🩶 (skipped), решта — тьмяна
// (idle). Курсор ▼ стоїть на поточній позиції `j` у тексті (offset + j) — підкреслює, що
// йдемо ВІД кінця шаблону до початку.

import type { CharRole } from "@/algorithms/shared/playback/StringStrip"

/** Стан кадру пошуку, потрібний для класифікації символів стрічки. */
export interface BmCellState {
  /** Зсув вікна (pattern[0] під text[offset]); -1 → немає активного вікна. */
  readonly offset: number
  /** Поточна позиція в шаблоні (справа наліво) або null. */
  readonly j: number | null
  /** Скільки символів СУФІКСА збіглося (зелений суфікс справа). */
  readonly matchedSuffix: number
  /** Цей кадр — поточне порівняння-розбіжність (поганий символ на j). */
  readonly mismatch: boolean
  /** Цей кадр — повний збіг (увесь шаблон). */
  readonly full: boolean
  /** Довжина шаблону (межа вікна). */
  readonly patternLen: number
  /** Індекси тексту, перестрибнуті стрибком без порівняння. */
  readonly skipped: ReadonlySet<number>
}

/** Роль символу шаблону на позиції `j`: збіжний суфікс / поганий символ / ще не звірено. */
export function patternRole(j: number, s: BmCellState): CharRole {
  const m = s.patternLen
  if (s.full) return "match"
  // Суфікс [m - matchedSuffix .. m-1] уже збігся (зелений), росте вліво.
  if (j >= m - s.matchedSuffix) return "match"
  if (s.mismatch && s.j != null && j === s.j) return "mismatch"
  return "window"
}

/**
 * Роль символу тексту на індексі `idx`. Пропущені стрибком — 🩶 skipped. Усередині вікна
 * `[offset, offset+M)` — та сама логіка, що для шаблону (суфікс / поганий символ / вікно).
 * Поза вікном і не пропущені — тьмяні (idle).
 */
export function textRole(idx: number, s: BmCellState): CharRole {
  if (s.skipped.has(idx)) return "skipped"
  if (s.offset < 0) return "idle"
  const j = idx - s.offset
  if (j < 0 || j >= s.patternLen) return "idle"
  return patternRole(j, s)
}

/** Індекс тексту під курсором ▼ (поточна позиція j) або null. */
export function pointerIndex(s: BmCellState): number | null {
  if (s.offset < 0 || s.j == null || s.j < 0) return null
  return s.offset + s.j
}
