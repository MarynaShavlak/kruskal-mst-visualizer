// Чисті хелпери відмальовки сортування злиттям (без React). Тестуються окремо.
// Кольорова мова: 🔵 ліва половина · 🟧 права половина · 🟢 злитий результат ·
// 🟡 поточна голова (яку беремо) · ⬜ спожитий/базовий елемент.

import type { MergeMicroStep } from "@/lib/mergeSort"

/** Роль елемента половини в зірковій панелі злиття. */
export type HalfRole = "spent" | "head" | "pending"

/** Одна комірка половини: значення + роль. */
export interface HalfCell {
  readonly value: number
  readonly role: HalfRole
}

/** Розкладений стан злиття для зіркової панелі (дві половини + результат + курсори). */
export interface MergeView {
  readonly left: readonly HalfCell[]
  readonly right: readonly HalfCell[]
  /** Результат: значення + чи це щойно додана (підсвічена) комірка. */
  readonly merged: readonly { readonly value: number; readonly head: boolean }[]
  /** Індекс курсора (голови) лівої/правої половини; -1 якщо вичерпано. */
  readonly leftCursor: number
  readonly rightCursor: number
}

/**
 * Розкладає крок злиття у стан зіркової панелі. `step === null` — стартовий стан
 * (курсори на 0, результат порожній). Спирається на `headLeft`/`headRight` (індекси
 * голів, що порівнювалися ДО руху вказівника) — як у Python `draw_merge_state`:
 * комірки до голови спожиті, сама голова (якщо її беруть цього кроку) — 🟡.
 */
export function mergeStateView(
  left: readonly number[],
  right: readonly number[],
  step: MergeMicroStep | null,
): MergeView {
  if (step === null) {
    return {
      left: left.map((value, k) => ({ value, role: k === 0 ? "head" : "pending" })),
      right: right.map((value, k) => ({ value, role: k === 0 ? "head" : "pending" })),
      merged: [],
      leftCursor: left.length > 0 ? 0 : -1,
      rightCursor: right.length > 0 ? 0 : -1,
    }
  }
  const hl = step.headLeft
  const hr = step.headRight
  const leftCell = (value: number, k: number): HalfCell => {
    if (k < hl) return { value, role: "spent" }
    if (k === hl && step.took === "left") return { value, role: "head" }
    return { value, role: "pending" }
  }
  const rightCell = (value: number, k: number): HalfCell => {
    if (k < hr) return { value, role: "spent" }
    if (k === hr && step.took === "right") return { value, role: "head" }
    return { value, role: "pending" }
  }
  return {
    left: left.map(leftCell),
    right: right.map(rightCell),
    merged: step.merged.map((value, k) => ({
      value,
      head: k === step.merged.length - 1,
    })),
    leftCursor: step.leftIndex < left.length ? step.leftIndex : -1,
    rightCursor: step.rightIndex < right.length ? step.rightIndex : -1,
  }
}

/** Роль комірки внутрішнього вузла дерева: ліва половина (< mid) чи права. */
export function halfRole(index: number, mid: number): "left" | "right" {
  return index < mid ? "left" : "right"
}

/**
 * Висота стовпчика у відсотках від найбільшого значення (для барного вигляду
 * масиву). Найменша видима висота — `minPct`.
 */
export function barHeightPct(value: number, max: number, minPct = 8): number {
  if (max <= 0) return minPct
  return Math.max(minPct, Math.round((value / max) * 100))
}
