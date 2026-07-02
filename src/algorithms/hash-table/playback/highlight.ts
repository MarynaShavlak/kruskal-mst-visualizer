// Чисті хелпери підсвітки для плеєра хеш-таблиці: роль КОМІРКИ і роль ЗАПИСУ.
// Працює для обох стратегій: ланцюжки (chain-скан) і лінійне зондування (курсор
// probeIndex крокує, probeTrail — кластер). Панелі беруть усе з кадру. Vitest-covered.

import type { HtFrame } from "@/lib/hashTableTrace"

/** Роль комірки таблиці на поточному кадрі. */
export type HtCellRole = "empty" | "filled" | "home" | "collision" | "probe" | "cluster"

/** Роль запису (пари) в ланцюзі/комірці. */
export type HtEntryRole = "idle" | "scanning" | "probed" | "landed" | "found"

/** Комірка активна (домашня) для поточної операції? */
function isHome(index: number, frame: HtFrame): boolean {
  return frame.homeIndex === index && frame.op != null
}

/** Роль комірки: домашня/колізія/зонд/кластер підсвічуються, решта — порожня/заповнена. */
export function cellRole(index: number, frame: HtFrame): HtCellRole {
  if (isHome(index, frame) && frame.phase === "collision") return "collision"
  if (isHome(index, frame)) return "home"
  if (frame.probeIndex === index && frame.op != null) return "probe"
  if (frame.probeTrail.includes(index)) return "cluster"
  const chain = frame.buckets[index]
  return chain && chain.length > 0 ? "filled" : "empty"
}

/** Роль запису в ланцюзі/комірці: підсвічуємо активне порівняння й термінал. */
export function entryRole(
  cellIndex: number,
  entryIndex: number,
  frame: HtFrame,
): HtEntryRole {
  if (frame.op == null) return "idle"

  if (frame.strategy === "linear") {
    // Одна пара на комірку — орієнтуємось на курсор-зонд і термінальну комірку.
    if (frame.phase === "compare" && frame.probeIndex === cellIndex) return "scanning"
    if (frame.phase === "found" && frame.landedIndex === cellIndex) return "found"
    if (
      (frame.phase === "insert" || frame.phase === "update") &&
      frame.landedIndex === cellIndex
    ) {
      return "landed"
    }
    return "idle"
  }

  // Ланцюжки: підсвічуємо лише в домашній комірці за позицією скану.
  if (frame.homeIndex !== cellIndex) return "idle"
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
