// Чисті хелпери підсвітки для плеєра хеш-таблиці: роль КОМІРКИ (порожня / домашня /
// колізія / заповнена) і роль ЗАПИСУ в ланцюзі (спокій / сканується / вже перевірено
// / щойно сів / знайдено). Панелі беруть усе з кадру — нічого не рахують. Vitest-covered.

import type { HtFrame } from "@/lib/hashTableTrace"

/** Роль комірки таблиці на поточному кадрі. */
export type HtCellRole = "empty" | "filled" | "home" | "collision"

/** Роль запису (пари) в ланцюзі комірки. */
export type HtEntryRole = "idle" | "scanning" | "probed" | "landed" | "found"

/** Комірка активна (домашня) для поточної операції? */
function isHome(index: number, frame: HtFrame): boolean {
  return frame.homeIndex === index && frame.op != null
}

/** Роль комірки: домашня/колізія підсвічуються, решта — порожня чи заповнена. */
export function cellRole(index: number, frame: HtFrame): HtCellRole {
  if (isHome(index, frame) && frame.phase === "collision") return "collision"
  if (isHome(index, frame)) return "home"
  const chain = frame.buckets[index]
  return chain && chain.length > 0 ? "filled" : "empty"
}

/** Роль запису в ланцюзі: підсвічуємо лише в домашній комірці поточної операції. */
export function entryRole(
  cellIndex: number,
  entryIndex: number,
  frame: HtFrame,
): HtEntryRole {
  if (frame.homeIndex !== cellIndex || frame.op == null) return "idle"
  const { phase, scanPos, landedChainPos } = frame
  if (phase === "compare") {
    if (entryIndex === scanPos) return "scanning"
    if (scanPos != null && entryIndex < scanPos) return "probed"
    return "idle"
  }
  if (phase === "found" && entryIndex === landedChainPos) return "found"
  if ((phase === "insert" || phase === "update") && entryIndex === landedChainPos) {
    return "landed"
  }
  return "idle"
}
