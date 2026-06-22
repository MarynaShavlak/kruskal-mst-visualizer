// Модель trace для бульбашкового сортування — аналог knapsackTrace.ts. Алгоритм
// проганяється ОДИН раз (через bubbleSortSteps) і пишемо список незмінних кадрів
// (BsFrame); UI лише рухає курсор по них (scrubbing, крок назад). Кожен кадр несе
// знімок масиву, активну пару (j, j+1), лічильники, межу відсортованого «хвоста»
// та підсвічені рядки коду. Порядок кадрів дослівно повторює журнал подій:
// init → (compare* → pass-end [→ early-stop])* → done.

import {
  bubbleSortSteps,
  maxComparisons,
  type BubbleEvent,
} from "@/lib/bubbleSort"
import { identityTranslate, type Translate } from "@/lib/translate"
import type { SortFrameBase } from "@/lib/traceFrame"

/** Лістинг наївної версії для панелі підсвітки (1-based рядки). */
export const NAIVE_CODE: readonly string[] = [
  "def bubble_sort(lst):",
  "    n = len(lst)",
  "    for i in range(0, n - 1):              # проходи: їх n-1",
  "        for j in range(0, n - i - 1):      # сусідні пари (межа коротшає)",
  "            if lst[j] > lst[j + 1]:        # лівий більший за правий?",
  "                lst[j], lst[j + 1] = lst[j + 1], lst[j]   # обмін",
  "    return lst",
]

/** Лістинг оптимізованої версії (прапорець swapped + рання зупинка). */
export const OPTIMIZED_CODE: readonly string[] = [
  "def bubble_sort_optimized(lst):",
  "    n = len(lst)",
  "    for i in range(0, n - 1):",
  "        swapped = False                    # обмінів у цьому проході ще нема",
  "        for j in range(0, n - i - 1):",
  "            if lst[j] > lst[j + 1]:",
  "                lst[j], lst[j + 1] = lst[j + 1], lst[j]",
  "                swapped = True             # цей прохід щось змінив",
  "        if not swapped:                    # за прохід без обмінів →",
  "            break                          # масив уже відсортовано",
  "    return lst",
]

/** Фаза кадру для бейджа в нарації. */
export type BsPhase = "scan" | "pass" | "done"

/** Підкрок кадру. Дискримінант — `kind` (дзеркалить BubbleEvent). */
export type BsSub =
  | { readonly kind: "init" }
  | {
      readonly kind: "compare"
      readonly j: number
      readonly left: number
      readonly right: number
      readonly swapped: boolean
    }
  | { readonly kind: "pass-end"; readonly locked: number; readonly swappedInPass: boolean }
  | { readonly kind: "early-stop" }
  | { readonly kind: "done" }

export interface BsFrame extends SortFrameBase {
  readonly sub: BsSub
  readonly phase: BsPhase
  /** Знімок масиву на цьому кадрі. */
  readonly array: readonly number[]
  /** Номер проходу (зовнішній цикл) або null. */
  readonly pass: number | null
  /** Активна пара [j, j+1] під час порівняння, інакше null. */
  readonly pair: readonly [number, number] | null
  /** Чи щойно обміняли активну пару. */
  readonly swapped: boolean
  /** Індекс, з якого «хвіст» уже відсортовано (зелений). */
  readonly sortedFrom: number
  readonly comparisons: number
  readonly swaps: number
}

export interface BsResult {
  readonly input: readonly number[]
  readonly sorted: readonly number[]
  readonly comparisons: number
  readonly swaps: number
  readonly passes: number
  readonly optimized: boolean
  readonly size: number
  /** Порівнянь у наївній версії: n(n−1)/2 — для порівняння «ціни». */
  readonly maxComparisons: number
}

export interface BsTrace {
  readonly code: readonly string[]
  readonly frames: readonly BsFrame[]
  readonly result: BsResult
  readonly optimized: boolean
}

const fmtArray = (a: readonly number[]): string => `[${a.join(", ")}]`

/**
 * Проганяє бульбашку на масиві й збирає trace для плеєра. Результат
 * (sorted/comparisons/swaps/passes) збігається з чистим bubbleSort(Optimized).
 */
export function buildBubbleSortTrace(
  input: readonly number[],
  optimized = false,
  t: Translate = identityTranslate,
): BsTrace {
  const { sorted, events } = bubbleSortSteps(input, optimized)
  const code = optimized ? OPTIMIZED_CODE : NAIVE_CODE
  const n = input.length

  const frames: BsFrame[] = []
  const push = (f: Omit<BsFrame, "i">): void => {
    frames.push({ i: frames.length, ...f })
  }

  for (const ev of events) {
    push(frameFor(ev, optimized, n, t))
  }

  const last = events[events.length - 1]
  const passes = events.filter((e) => e.kind === "pass-end").length
  const result: BsResult = {
    input,
    sorted,
    comparisons: last.comparisons,
    swaps: last.swaps,
    passes,
    optimized,
    size: n,
    maxComparisons: maxComparisons(n),
  }
  return { code, frames, result, optimized }
}

/** Перетворює одну подію журналу на кадр (рядки коду + нарація). */
function frameFor(
  ev: BubbleEvent,
  optimized: boolean,
  n: number,
  t: Translate,
): Omit<BsFrame, "i"> {
  const common = {
    array: ev.array,
    pass: ev.i,
    sortedFrom: ev.sortedFrom,
    comparisons: ev.comparisons,
    swaps: ev.swaps,
  }

  switch (ev.kind) {
    case "init":
      return {
        ...common,
        sub: { kind: "init" },
        phase: "scan",
        pair: null,
        swapped: false,
        lines: [2],
        contextLines: [],
        caption: t("play.nBsInit", {
          arr: fmtArray(ev.array),
          n,
          passes: Math.max(0, n - 1),
        }),
      }

    case "compare": {
      const bound = n - (ev.i ?? 0) - 1
      const lines = ev.swapped
        ? optimized
          ? [6, 7, 8]
          : [5, 6]
        : optimized
          ? [6]
          : [5]
      return {
        ...common,
        sub: { kind: "compare", j: ev.j ?? 0, left: ev.left, right: ev.right, swapped: ev.swapped },
        phase: "scan",
        pair: [ev.j ?? 0, (ev.j ?? 0) + 1],
        swapped: ev.swapped,
        lines,
        contextLines: optimized ? [3, 5] : [3, 4],
        caption: t(ev.swapped ? "play.nBsCompareSwap" : "play.nBsCompareKeep", {
          i: ev.i ?? 0,
          j: ev.j ?? 0,
          left: ev.left,
          right: ev.right,
          bound,
          comparisons: ev.comparisons,
          swaps: ev.swaps,
        }),
      }
    }

    case "pass-end":
      return {
        ...common,
        sub: { kind: "pass-end", locked: ev.locked, swappedInPass: ev.swappedInPass },
        phase: "pass",
        pair: null,
        swapped: false,
        lines: optimized ? [9] : [3],
        contextLines: optimized ? [3] : [],
        caption: t("play.nBsPassEnd", {
          i: ev.i ?? 0,
          locked: ev.locked,
          value: ev.array[ev.locked] ?? 0,
        }),
      }

    case "early-stop":
      return {
        ...common,
        sub: { kind: "early-stop" },
        phase: "pass",
        pair: null,
        swapped: false,
        lines: [9, 10],
        contextLines: [],
        caption: t("play.nBsEarlyStop", { i: ev.i ?? 0 }),
      }

    case "final":
      return {
        ...common,
        sub: { kind: "done" },
        phase: "done",
        pair: null,
        swapped: false,
        lines: optimized ? [11] : [7],
        contextLines: [],
        caption: t("play.nBsDone", {
          arr: fmtArray(ev.array),
          comparisons: ev.comparisons,
          swaps: ev.swaps,
          passes: ev.passes,
        }),
      }
  }
}
