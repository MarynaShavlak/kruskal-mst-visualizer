// Чисті хелпери відмальовки наївного пошуку в рядках (без React). Тестуються окремо.
// Кольорова мова стрічки «текст / шаблон»: 🟢 збіглося (зелений префікс) · 🔴 розбіжність
// (червоний, перекреслений) · 🟦 у вікні вирівнювання, ще не порівняно · 🩶 поза вікном.
// Червона розбіжність + зелений префікс, що ПОВТОРНО матчиться у наступних вирівнюваннях,
// — і є «марна робота» (місток до KMP).

import type { CharRole } from "@/algorithms/shared/playback/StringStrip"

/** Стан кадру, потрібний для класифікації символів стрічки. */
export interface NssCellState {
  /** Зсув шаблону (pattern[0] під text[offset]); -1 → немає активного вирівнювання. */
  readonly offset: number
  /** Скільки символів збіглося (зелений префікс). */
  readonly matched: number
  /** Позиція розбіжності в шаблоні (червона) або null (повний збіг / init). */
  readonly mismatchJ: number | null
  /** Довжина шаблону (межа вікна). */
  readonly patternLen: number
}

/** Роль символу шаблону на позиції `j`: збіг / розбіжність / у вікні (ще не звірено). */
export function patternRole(j: number, s: NssCellState): CharRole {
  if (j < s.matched) return "match"
  if (s.mismatchJ != null && j === s.mismatchJ) return "mismatch"
  return "window"
}

/**
 * Роль символу тексту на індексі `idx`. Поза вікном вирівнювання `[offset, offset+M)` —
 * тьмяний; усередині — та сама логіка, що для шаблону (зелений префікс / червона
 * розбіжність / блакитне вікно).
 */
export function textRole(idx: number, s: NssCellState): CharRole {
  if (s.offset < 0) return "idle"
  const j = idx - s.offset
  if (j < 0 || j >= s.patternLen) return "idle"
  return patternRole(j, s)
}

/** Індекс тексту під курсором ▼ (поточна розбіжність) або null. */
export function pointerIndex(s: NssCellState): number | null {
  if (s.offset < 0 || s.mismatchJ == null) return null
  return s.offset + s.mismatchJ
}
