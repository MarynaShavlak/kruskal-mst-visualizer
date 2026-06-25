// Trace для двох «контрастних» підходів до рюкзака — жадібного й повного перебору
// — поряд із ДП (knapsackTrace.ts) для режиму порівняння в плеєрі. Кожен білдер
// проганяє алгоритм один раз і пише незмінні кадри; UI рухає курсор по них.
//
// Жадібний — навчальний контрприклад: на класичному інстансі дає 160 проти
// оптимуму 220. Перебір — точний, але платить 2ⁿ підмножинами. Обидва білдери
// дослівно повторюють порядок дій knapsack/core.py (greedy_steps / brute_force).

import {
  greedySteps,
  knapsackDp,
  type GreedyStep,
  type KnapsackInstance,
} from "@/lib/knapsack"
import { createFrameList } from "@/lib/frameList"
import { identityTranslate, type Translate } from "@/lib/translate"

// ---------------------------------------------------------------------------
// Жадібний метод
// ---------------------------------------------------------------------------

/** Лістинг коду жадібного методу для панелі підсвітки (1-based). */
export const GREEDY_CODE: readonly string[] = [
  "items.sort(key=lambda it: it.value/it.weight,  # за питомою цінністю",
  "           reverse=True)                        # від найціннішого",
  "total = 0",
  "for it in items:                                # перебір у порядку ratio",
  "    if capacity >= it.weight:                   # вміщається?",
  "        capacity -= it.weight                   # кладемо",
  "        total += it.value",
  "return total            # для 0/1 НЕ гарантує оптимум (контрприклад)",
]

export type GreedySub =
  | { readonly kind: "init" }
  | { readonly kind: "item"; readonly step: number; readonly taken: boolean }
  | { readonly kind: "done" }

export interface GreedyFrame {
  readonly i: number
  readonly sub: GreedySub
  /** Індекс кроку в порядку спадання ratio (у result.steps), або null. */
  readonly step: number | null
  /** Вільне місце після цього кадру. */
  readonly free: number
  /** Накопичена вартість після цього кадру. */
  readonly total: number
  /** Узяті предмети (вихідні індекси) на момент кадру, за зростанням. */
  readonly taken: readonly number[]
  readonly lines: readonly number[]
  readonly contextLines: readonly number[]
  readonly caption: string
}

export interface GreedyResult {
  readonly itemNames: readonly string[]
  readonly weights: readonly number[]
  readonly values: readonly number[]
  readonly capacity: number
  /** Журнал жадібного (у порядку спадання питомої цінності). */
  readonly steps: readonly GreedyStep[]
  /** Вартість, яку дав жадібний. */
  readonly greedyValue: number
  /** Точний оптимум (ДП) — для порівняння в нотатці контрприкладу. */
  readonly optimal: number
  /** Узяті предмети (вихідні індекси, за зростанням). */
  readonly chosen: readonly number[]
}

export interface GreedyRun {
  readonly code: readonly string[]
  readonly frames: readonly GreedyFrame[]
  readonly result: GreedyResult
}

/** Проганяє жадібний метод і збирає trace + порівняння з оптимумом. */
export function buildGreedyTrace(
  instance: KnapsackInstance,
  t: Translate = identityTranslate,
): GreedyRun {
  const itemNames = instance.items.map((it) => it.name)
  const weights = instance.items.map((it) => it.weight)
  const values = instance.items.map((it) => it.value)
  const W = instance.capacity
  const steps = weights.length > 0 ? greedySteps(weights, values, W) : []
  const optimal = knapsackDp(weights, values, W)
  const num = (x: number): string => (Number.isInteger(x) ? String(x) : x.toFixed(2))

  const { frames, push } = createFrameList<GreedyFrame>()
  const item = (idx: number): string => itemNames[idx] ?? `#${idx}`

  push({
    sub: { kind: "init" },
    step: null,
    free: W,
    total: 0,
    taken: [],
    lines: [1, 2, 3],
    contextLines: [],
    caption: t("play.nKnGreedyInit", { w: W }),
  })

  const taken: number[] = []
  steps.forEach((s, idx) => {
    if (s.taken) taken.push(s.index)
    const takenSorted = [...taken].sort((a, b) => a - b)
    push({
      sub: { kind: "item", step: idx, taken: s.taken },
      step: idx,
      free: s.freeAfter,
      total: s.totalAfter,
      taken: takenSorted,
      lines: s.taken ? [4, 5, 6, 7] : [4, 5],
      contextLines: [4],
      caption: s.taken
        ? t("play.nKnGreedyTake", {
            name: item(s.index),
            ratio: num(s.ratio),
            wt: s.weight,
            free: s.freeBefore,
            val: s.value,
            total: s.totalAfter,
          })
        : t("play.nKnGreedySkip", {
            name: item(s.index),
            ratio: num(s.ratio),
            wt: s.weight,
            free: s.freeBefore,
          }),
    })
  })

  const greedyValue = steps.length > 0 ? steps[steps.length - 1].totalAfter : 0
  const gap = optimal - greedyValue
  push({
    sub: { kind: "done" },
    step: null,
    free: steps.length > 0 ? steps[steps.length - 1].freeAfter : W,
    total: greedyValue,
    taken: [...taken].sort((a, b) => a - b),
    lines: [8],
    contextLines: [],
    caption: t("play.nKnGreedyDone", {
      total: greedyValue,
      optimal,
      gapNote: gap > 0 ? t("play.nKnGreedyGap", { gap }) : "",
    }),
  })

  const result: GreedyResult = {
    itemNames,
    weights,
    values,
    capacity: W,
    steps,
    greedyValue,
    optimal,
    chosen: [...taken].sort((a, b) => a - b),
  }
  return { code: GREEDY_CODE, frames, result }
}

// ---------------------------------------------------------------------------
// Повний перебір підмножин
// ---------------------------------------------------------------------------

/** Лістинг коду повного перебору для панелі підсвітки (1-based). */
export const BRUTE_CODE: readonly string[] = [
  "best = 0",
  "for r in range(n + 1):                  # підмножини всіх розмірів",
  "    for combo in combinations(range(n), r):",
  "        w = sum(wt[i] for i in combo)   # сумарна вага",
  "        v = sum(val[i] for i in combo)  # сумарна вартість",
  "        if w <= W and v > best:         # влазить і краще?",
  "            best = v                     # новий лідер",
  "return best                              # перевірено 2ⁿ підмножин",
]

/** Одна підмножина у порядку перебору. */
export interface BruteSubset {
  readonly combo: readonly number[]
  readonly weight: number
  readonly value: number
  readonly fits: boolean
  /** Чи стала ця підмножина новим лідером на момент свого розгляду. */
  readonly improved: boolean
}

export type BruteSub =
  | { readonly kind: "init" }
  | { readonly kind: "subset"; readonly index: number }
  | { readonly kind: "done" }

export interface BruteFrame {
  readonly i: number
  readonly sub: BruteSub
  /** Індекс підмножини в result.subsets, або null. */
  readonly index: number | null
  /** Найкраща вартість на момент кадру. */
  readonly bestValue: number
  /** Індекс лідера в result.subsets, або null. */
  readonly bestIndex: number | null
  readonly lines: readonly number[]
  readonly contextLines: readonly number[]
  readonly caption: string
}

export interface BruteResult {
  readonly itemNames: readonly string[]
  readonly weights: readonly number[]
  readonly values: readonly number[]
  readonly capacity: number
  /** Усі 2ⁿ підмножин у порядку перебору. */
  readonly subsets: readonly BruteSubset[]
  readonly bestValue: number
  readonly bestCombo: readonly number[]
  /** Індекс переможця в `subsets`. */
  readonly bestIndex: number
}

export interface BruteRun {
  readonly code: readonly string[]
  readonly frames: readonly BruteFrame[]
  readonly result: BruteResult
}

/** Усі r-елементні підмножини індексів 0..n−1 у лексикографічному порядку. */
function* combinations(n: number, r: number): Generator<number[]> {
  if (r < 0 || r > n) return
  const idx = Array.from({ length: r }, (_, i) => i)
  for (;;) {
    yield idx.slice()
    let i = r - 1
    while (i >= 0 && idx[i] === n - r + i) i--
    if (i < 0) return
    idx[i]++
    for (let j = i + 1; j < r; j++) idx[j] = idx[j - 1] + 1
  }
}

/** Проганяє повний перебір підмножин і збирає trace (по кадру на підмножину). */
export function buildBruteTrace(
  instance: KnapsackInstance,
  t: Translate = identityTranslate,
): BruteRun {
  const itemNames = instance.items.map((it) => it.name)
  const weights = instance.items.map((it) => it.weight)
  const values = instance.items.map((it) => it.value)
  const W = instance.capacity
  const n = weights.length

  const subsets: BruteSubset[] = []
  let bestValue = 0
  let bestCombo: readonly number[] = []
  let bestIndex = -1

  for (let r = 0; r <= n; r++) {
    for (const combo of combinations(n, r)) {
      let weight = 0
      let value = 0
      for (const idx of combo) {
        weight += weights[idx]
        value += values[idx]
      }
      const fits = weight <= W
      const improved = fits && value > bestValue
      if (improved) {
        bestValue = value
        bestCombo = combo
        bestIndex = subsets.length
      }
      subsets.push({ combo, weight, value, fits, improved })
    }
  }

  const setLabel = (combo: readonly number[]): string =>
    combo.length === 0 ? "∅" : `{${combo.map((idx) => itemNames[idx] ?? `#${idx}`).join(", ")}}`

  const { frames, push } = createFrameList<BruteFrame>()

  push({
    sub: { kind: "init" },
    index: null,
    bestValue: 0,
    bestIndex: null,
    lines: [1, 2, 3],
    contextLines: [],
    caption: t("play.nKnBruteInit", { count: subsets.length }),
  })

  let runningBest = 0
  let runningBestIdx: number | null = null
  subsets.forEach((s, idx) => {
    if (s.improved) {
      runningBest = s.value
      runningBestIdx = idx
    }
    const verdict = !s.fits
      ? t("play.nKnBruteNofit")
      : s.improved
        ? t("play.nKnBruteLeader", { v: s.value })
        : t("play.nKnBruteWorse")
    push({
      sub: { kind: "subset", index: idx },
      index: idx,
      bestValue: runningBest,
      bestIndex: runningBestIdx,
      lines: s.improved ? [6, 7] : [4, 5, 6],
      contextLines: [2, 3],
      caption: t("play.nKnBruteSubset", {
        set: setLabel(s.combo),
        w: s.weight,
        v: s.value,
        verdict,
      }),
    })
  })

  push({
    sub: { kind: "done" },
    index: null,
    bestValue,
    bestIndex: bestIndex >= 0 ? bestIndex : null,
    lines: [8],
    contextLines: [],
    caption: t("play.nKnBruteDone", {
      count: subsets.length,
      set: setLabel(bestCombo),
      best: bestValue,
    }),
  })

  const result: BruteResult = {
    itemNames,
    weights,
    values,
    capacity: W,
    subsets,
    bestValue,
    bestCombo,
    bestIndex,
  }
  return { code: BRUTE_CODE, frames, result }
}
