// Чисті хелпери відмальовки стрічки фази ПОШУКУ Рабіна-Карпа (без React). Тестуються
// окремо. Кольорова мова: 🟦 вікно (хеші ще порівнюємо, символи НЕ звіряємо) · 🟢 збіглося
// (на verify) · 🔴 розбіжність (на колізії — хеші рівні, а символи різні: унікальна
// перлина) · 🩶 поза вікном. На більшості вікон символи лишаються 🟦 — бо Рабін-Карп
// порівнює ХЕШІ, а не символи; посимвольно дивимось лише на збігу хешів.

import type { CharRole } from "@/algorithms/shared/playback/StringStrip"

/** Стан кадру фази 2, потрібний для класифікації символів стрічки. */
export interface RkCellState {
  /** Зсув вікна (pattern[0] під text[offset]); -1 → немає активного вікна. */
  readonly offset: number
  /** Довжина шаблону (= довжина вікна). */
  readonly patternLen: number
  /** Вердикт вікна: slide (хеші різні) / collision (хеші рівні, символи різні) / match. */
  readonly verdict: "slide" | "collision" | "match" | null
  /** На verify — скільки символів збіглося (зелений префікс). */
  readonly matched: number
  /** Позиція розбіжності в шаблоні (червона) на колізії, або null. */
  readonly mismatchJ: number | null
}

/**
 * Роль символу шаблону на позиції `j`. Поки лише порівнюємо хеші (verdict slide) —
 * увесь шаблон 🟦 (символи ще не звіряли). На verify (collision/match) — зелений збіглий
 * префікс + червона розбіжність (на колізії).
 */
export function patternRole(j: number, s: RkCellState): CharRole {
  if (s.verdict === "match") return "match"
  if (s.verdict === "collision") {
    if (j < s.matched) return "match"
    if (s.mismatchJ != null && j === s.mismatchJ) return "mismatch"
    return "window"
  }
  return "window"
}

/**
 * Роль символу тексту на індексі `idx`. Поза вікном `[offset, offset+M)` — тьмяний;
 * усередині — та сама логіка, що для шаблону.
 */
export function textRole(idx: number, s: RkCellState): CharRole {
  if (s.offset < 0) return "idle"
  const j = idx - s.offset
  if (j < 0 || j >= s.patternLen) return "idle"
  return patternRole(j, s)
}

/** Індекс тексту під курсором ▼ (поточна розбіжність на колізії) або null. */
export function pointerIndex(s: RkCellState): number | null {
  if (s.offset < 0 || s.verdict !== "collision" || s.mismatchJ == null) return null
  return s.offset + s.mismatchJ
}

/** Хеші рівні? (для бейджа «window_hash = pattern_hash» — кандидат / колізія). */
export function hashesEqual(windowHash: number, patternHash: number): boolean {
  return windowHash === patternHash
}
