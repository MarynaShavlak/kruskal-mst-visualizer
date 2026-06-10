// Чисті похідні для панелей плеєра Хелда–Карпа — аналог floyd-warshall/playback/
// highlight.ts. Жодного React: лише відображення «кадр trace → що підсвітити».
// Покрите юніт-тестами проти еталонного інстансу A–E.

import type { HkFrame, HkResult } from "@/lib/heldKarpTrace"
import type { ReadonlyMatrix } from "@/lib/tsp"

/** Індекси міст у підмножині (бітмасці), за зростанням. */
export function subsetMembers(mask: number, n: number): number[] {
  const out: number[] = []
  for (let i = 0; i < n; i++) if (mask & (1 << i)) out.push(i)
  return out
}

/** Уніфікований формат відстані/вартості (дві цифри). */
export function fmt(x: number): string {
  return x.toFixed(2)
}

/**
 * Послідовність індексів міст, яку треба з'єднати лініями на карті для цього
 * кадру. Замкнений цикл уже містить старт у кінці (path[last] === path[0]) — тоді
 * лінії самі утворюють петлю; для проміжних комірок це відкритий шлях start…j.
 *  - done → оптимальний тур; closing-candidate → тур-кандидат (реконструюємо з
 *    готових комірок); кадр кандидата → шлях блоку + поточний кінець; cell-open/
 *    commit → шлях обраного кандидата; інакше (init/level-open/closing-open) — null.
 */
export function framePath(
  frame: HkFrame,
  result: HkResult,
): readonly number[] | null {
  const { sub } = frame
  if (sub.kind === "done") return result.path
  if (sub.kind === "closing-candidate") {
    const cell = result.cells.find(
      (c) => c.subset === frame.subset && c.end === sub.end,
    )
    if (cell) return [...cell.path, result.start]
    return frame.bestTour ? frame.bestTour.path : null
  }
  if (frame.activeCandidate !== null && frame.end !== null) {
    const c = frame.candidates[frame.activeCandidate]
    if (c) return [...c.blockPath, frame.end]
  }
  if (
    (sub.kind === "cell-open" || sub.kind === "cell-commit") &&
    frame.end !== null
  ) {
    const chosen = frame.candidates.find((c) => c.chosen)
    if (chosen) return [...chosen.blockPath, frame.end]
  }
  return null
}

/**
 * Єдине ребро, що «додається» на цьому кадрі (для підсвітки в матриці й на карті),
 * як невпорядкована пара [from, to], або null.
 *  - база: start→j; кандидат: k→j; commit: bestK→j; замикання: j→start.
 */
export function activeEdge(
  frame: HkFrame,
  start: number,
): readonly [number, number] | null {
  const { sub } = frame
  if (sub.kind === "base") return [start, sub.end]
  if (sub.kind === "candidate" && frame.end !== null) {
    const c = frame.candidates[sub.index]
    if (c) return [c.k, frame.end]
  }
  if (sub.kind === "cell-commit") return [sub.bestK, sub.end]
  if (sub.kind === "closing-candidate") return [sub.end, start]
  return null
}

/** Один кандидат фази замикання: кінець j, готовий блок, ребро назад, разом. */
export interface ClosingCandidate {
  readonly j: number
  readonly blockCost: number
  readonly edge: number
  readonly total: number
}

/**
 * Усі кандидати замикання (по одному на кожен кінець j ≠ start): беремо готову
 * комірку dp[(усі міста, j)] і додаємо ребро j→start. Чисто похідне від result.
 */
export function closingCandidates(result: HkResult): ClosingCandidate[] {
  const n = result.names.length
  const full = (1 << n) - 1
  const dist: ReadonlyMatrix = result.dist
  const out: ClosingCandidate[] = []
  for (let j = 0; j < n; j++) {
    if (j === result.start) continue
    const cell = result.cells.find((c) => c.subset === full && c.end === j)
    if (!cell) continue
    const edge = dist[j][result.start]
    out.push({ j, blockCost: cell.cost, edge, total: cell.cost + edge })
  }
  return out
}

/**
 * Для кожної готової комірки dp (у порядку обчислення) — індекс кадру, на якому
 * її зафіксовано. Комірки фіксуються на підкадрах "base" і "cell-commit" у тому ж
 * порядку, що й у result.cells, тож скан кадрів дає відповідність 1-до-1.
 * Використовується таблицею dp для переходу «клік по комірці → кадр обчислення».
 */
export function cellCommitFrames(frames: readonly HkFrame[]): number[] {
  const out: number[] = []
  for (const f of frames) {
    if (f.sub.kind === "base" || f.sub.kind === "cell-commit") out.push(f.i)
  }
  return out
}
