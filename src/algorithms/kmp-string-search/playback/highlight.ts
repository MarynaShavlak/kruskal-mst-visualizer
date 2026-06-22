// Чисті хелпери відмальовки фази ПОШУКУ KMP (без React). Тестуються окремо. Кольорова мова
// стрічки «текст / шаблон»: 🟢 збіглий префікс (j символів, що вже звірені) · 🌸 поточне
// порівняння text[i] ↔ pattern[j] (active/mismatch) · 🟦 решта вікна шаблону · 🩶 поза вікном.
// Шаблон зсунутий так, що pattern[0] стоїть під text[i - j] (offset). На стрибку (shift)
// шаблон «перестрибує» вперед на lps[j-1], а курсор тексту i СТОЇТЬ — визначальний інваріант.

import type { CharRole } from "@/algorithms/shared/playback/StringStrip"

/** Стан кадру фази пошуку, потрібний для класифікації символів стрічки. */
export interface KmpCellState {
  /** Зсув шаблону: pattern[0] під text[offset] (offset = i - j); -1 → немає вирівнювання. */
  readonly offset: number
  /** Позиція в тексті (курсор поточного порівняння). */
  readonly i: number
  /** Позиція в шаблоні (= скільки символів уже звірено, зелений префікс). */
  readonly j: number
  /** Тип події: compare/advance_both/shift/advance_i/match_found/not_found/init. */
  readonly kind: string
  /** Результат порівняння (для compare): true=збіг, false=розбіжність. */
  readonly match: boolean | null
  /** Довжина шаблону (межа вікна). */
  readonly patternLen: number
}

/**
 * Роль символу шаблону на позиції `pj`. Зелений префікс — звірені `j` символів; поточна
 * позиція `j` під час compare — active (збіг) або mismatch (розбіжність); решта вікна —
 * у вікні (ще не звірено). Після match_found — усі match.
 */
export function patternRole(pj: number, s: KmpCellState): CharRole {
  if (s.kind === "match_found") return "match"
  if (pj < s.j) return "match"
  if (s.kind === "compare" && pj === s.j) {
    return s.match ? "active" : "mismatch"
  }
  return "window"
}

/**
 * Роль символу тексту на індексі `idx`. Поза вікном вирівнювання `[offset, offset+M)` —
 * тьмяний; усередині — та сама логіка, що для шаблону (зсув на offset). На init/без
 * вирівнювання — усе idle.
 */
export function textRole(idx: number, s: KmpCellState): CharRole {
  if (s.offset < 0 || s.kind === "init") return "idle"
  const pj = idx - s.offset
  if (pj < 0 || pj >= s.patternLen) return "idle"
  return patternRole(pj, s)
}

/** Індекс тексту під курсором ▼ (поточне порівняння text[i]) або null. */
export function pointerIndex(s: KmpCellState): number | null {
  if (s.kind === "init") return null
  if (s.kind === "compare") return s.i
  return null
}
