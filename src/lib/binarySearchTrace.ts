// Модель trace для двійкового пошуку. Алгоритм проганяється ОДИН раз на
// відсортованому масиві + цілі й пишемо список незмінних кадрів (BsFrame) — UI лише
// рухає курсор. Як у лінійному пошуку, плеєр розбиває кожен крок на ДВА кадри:
// «проба» (обчислили mid, порівнюємо arr[mid] з x?) і «розв'язок» (відкидаємо
// половину / збіг). init + (проба+розв'язок)×кроки + done — рівно як повне
// трасування README (8 кадрів на головному прикладі = step_00..07).
//
// Два режими — ІТЕРАТИВНИЙ (while-цикл) і РЕКУРСИВНИЙ («розділяй і володарюй» на
// піддіапазоні): еволюція вікна [low..high] ІДЕНТИЧНА (це й є теза — той самий
// результат), різниться лише лістинг коду + глибина рекурсії. Сигнатурний образ —
// ВІКНО [low..high], що звужується вдвічі: 🟦 активне вікно · 🌸 mid (проба) ·
// 🟥 половина, яку відкидаємо · 🟢 збіг · 🩶 поза вікном.

import { identityTranslate, type Translate } from "@/lib/translate"
import type { ArraySearchFrameBase } from "@/lib/traceFrame"

/** Ітеративний лістинг (база з конспекту) — його розбирає README рядок за рядком. */
export const ITERATIVE_CODE: readonly string[] = [
  "def binary_search(arr, x):       # масив МУСИТЬ бути відсортований",
  "    low, high = 0, len(arr) - 1  # межі вікна — весь масив",
  "    while low <= high:           # поки вікно не порожнє",
  "        mid = (high + low) // 2  # середина вікна",
  "        if arr[mid] < x:         # шукане праворуч →",
  "            low = mid + 1        #   відкидаємо ліву половину",
  "        elif arr[mid] > x:       # шукане ліворуч →",
  "            high = mid - 1       #   відкидаємо праву половину",
  "        else:                    # arr[mid] == x →",
  "            return mid           #   знайдено",
  "    return -1                    # вікно порожнє → елемента немає",
]

/** Рекурсивний лістинг — та сама логіка на піддіапазоні («розділяй і володарюй»). */
export const RECURSIVE_CODE: readonly string[] = [
  "def binary_search(arr, x, low, high):   # піддіапазон [low, high]",
  "    if low > high:                      # порожній діапазон →",
  "        return -1                       #   елемента немає",
  "    mid = (high + low) // 2             # середина",
  "    if arr[mid] < x:                    # шукане праворуч →",
  "        return binary_search(arr, x, mid + 1, high)   # рекурсія праворуч",
  "    elif arr[mid] > x:                  # шукане ліворуч →",
  "        return binary_search(arr, x, low, mid - 1)    # рекурсія ліворуч",
  "    else:                               # arr[mid] == x →",
  "        return mid                      #   знайдено",
]

interface LineMap {
  readonly init: readonly number[]
  readonly initCtx: readonly number[]
  readonly probe: readonly number[]
  readonly probeCtx: readonly number[]
  readonly discardRight: readonly number[]
  readonly discardLeft: readonly number[]
  readonly found: readonly number[]
  readonly doneFound: readonly number[]
  readonly doneAbsent: readonly number[]
}

const ITER_LINES: LineMap = {
  init: [2], initCtx: [],
  probe: [4, 5], probeCtx: [3],
  discardRight: [5, 6], discardLeft: [7, 8],
  found: [9, 10],
  doneFound: [10], doneAbsent: [11],
}

const REC_LINES: LineMap = {
  init: [1], initCtx: [],
  probe: [4, 5], probeCtx: [2],
  discardRight: [5, 6], discardLeft: [7, 8],
  found: [9, 10],
  doneFound: [10], doneAbsent: [2, 3],
}

/** Фаза кадру для бейджа в нарації. */
export type BsPhase = "init" | "probe" | "discard" | "found" | "done"

export interface BsFrame extends ArraySearchFrameBase {
  readonly phase: BsPhase
  /** Активне вікно `[low..high]` на цьому кадрі (🟦). */
  readonly low: number
  readonly high: number
  /** Проба (індекс середини) або null (init / done-відсутній). */
  readonly mid: number | null
  /** Значення `arr[mid]` або null. */
  readonly value: number | null
  /** Половина, яку відкидаємо ЦЬОГО кроку (🟥), або null. */
  readonly discardLo: number | null
  readonly discardHi: number | null
  /** Накопичена кількість кроків (порівнянь). */
  readonly steps: number
  /** Глибина рекурсії (рекурсивний режим; = номер кроку). */
  readonly depth: number
  readonly recursive: boolean
}

export interface BsResult {
  readonly input: readonly number[]
  readonly target: number
  readonly result: number
  readonly steps: number
  readonly size: number
  readonly recursive: boolean
  readonly found: boolean
}

export interface BsTrace {
  readonly code: readonly string[]
  readonly frames: readonly BsFrame[]
  readonly result: BsResult
}

const fmt = (a: readonly number[]): string => `[${a.join(", ")}]`

/**
 * Проганяє двійковий пошук на відсортованому масиві + цілі й збирає trace для
 * плеєра/віджетів: init + по два кадри на крок (проба + розв'язок) + done.
 * `recursive` перемикає лістинг коду й глибину (еволюція вікна ідентична).
 */
export function buildBinarySearchTrace(
  input: readonly number[],
  target: number,
  recursive = false,
  t: Translate = identityTranslate,
): BsTrace {
  const arr = [...input]
  const n = arr.length
  const code = recursive ? RECURSIVE_CODE : ITERATIVE_CODE
  const LM = recursive ? REC_LINES : ITER_LINES

  const frames: BsFrame[] = []
  let steps = 0
  let result = -1
  let low = 0
  let high = n - 1

  const push = (
    phase: BsPhase,
    f: {
      low: number
      high: number
      mid: number | null
      value?: number | null
      discardLo?: number | null
      discardHi?: number | null
      lines: readonly number[]
      contextLines: readonly number[]
      caption: string
    },
  ) => {
    frames.push({
      i: frames.length,
      phase,
      array: arr,
      target,
      low: f.low,
      high: f.high,
      mid: f.mid,
      value: f.value ?? null,
      discardLo: f.discardLo ?? null,
      discardHi: f.discardHi ?? null,
      steps,
      result,
      depth: steps,
      recursive,
      lines: f.lines,
      contextLines: f.contextLines,
      caption: f.caption,
    })
  }

  push("init", {
    low, high, mid: null,
    lines: LM.init, contextLines: LM.initCtx,
    caption: t("play.nBinInit", { arr: fmt(arr), target, high: n - 1 }),
  })

  while (low <= high) {
    const oldLow = low
    const oldHigh = high
    const mid = Math.floor((oldLow + oldHigh) / 2)
    const value = arr[mid]
    steps += 1

    push("probe", {
      low: oldLow, high: oldHigh, mid, value,
      lines: LM.probe, contextLines: LM.probeCtx,
      caption: t("play.nBinProbe", {
        k: steps, low: oldLow, high: oldHigh, mid, value, target,
      }),
    })

    if (value < target) {
      low = mid + 1
      push("discard", {
        low, high: oldHigh, mid, value,
        discardLo: oldLow, discardHi: mid,
        lines: LM.discardRight, contextLines: LM.probeCtx,
        caption: t("play.nBinDiscardRight", { value, target, mid, low }),
      })
    } else if (value > target) {
      high = mid - 1
      push("discard", {
        low: oldLow, high, mid, value,
        discardLo: mid, discardHi: oldHigh,
        lines: LM.discardLeft, contextLines: LM.probeCtx,
        caption: t("play.nBinDiscardLeft", { value, target, mid, high }),
      })
    } else {
      result = mid
      push("found", {
        low: oldLow, high: oldHigh, mid, value,
        lines: LM.found, contextLines: LM.probeCtx,
        caption: t("play.nBinFound", { value, target, mid }),
      })
      break
    }
  }

  const found = result >= 0
  if (found) {
    push("done", {
      low: result, high: result, mid: result,
      lines: LM.doneFound, contextLines: [],
      caption: t("play.nBinDoneFound", { target, i: result, steps }),
    })
  } else {
    push("done", {
      low, high, mid: null,
      lines: LM.doneAbsent, contextLines: [],
      caption: t("play.nBinDoneAbsent", { target, steps }),
    })
  }

  const result0: BsResult = {
    input: arr,
    target,
    result,
    steps,
    size: n,
    recursive,
    found,
  }
  return { code, frames, result: result0 }
}
