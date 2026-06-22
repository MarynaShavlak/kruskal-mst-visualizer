// Модель trace для інтерполяційного пошуку. Алгоритм проганяється ОДИН раз на
// відсортованому масиві + цілі й пишемо список незмінних кадрів (IpFrame) — UI лише
// рухає курсор. Як у двійковому пошуку, плеєр розбиває кожен крок на ДВА кадри:
// «проба» (обчислили index ФОРМУЛОЮ, порівнюємо arr[index] з x?) і «розв'язок»
// (відкидаємо частину / збіг). init + (проба+розв'язок)×проби + done — рівно як
// повне трасування README (6 кадрів на демо 2 = step_00..05).
//
// Два режими — ІТЕРАТИВНИЙ (while-цикл) і РЕКУРСИВНИЙ (та сама логіка на піддіапазоні):
// еволюція вікна [low..high] та проб ІДЕНТИЧНА (це й є теза — той самий результат),
// різниться лише лістинг коду + глибина рекурсії. Сигнатурний образ — ДВА рівні:
// 1) ВІКНО [low..high] масиву (🟦 активне · 🌸 проба index · 🟥 відкинута частина ·
//    🟢 збіг · 🩶 поза вікном) — як у двійкового, але проба НЕ в середині;
// 2) «ПРЯМА-МОДЕЛЬ» — геометрична проєкція ключа на пряму (low,arr[low])→(high,arr[high]),
//    яка й пояснює, ЧОМУ проба стрибає саме сюди. На рівномірних даних пряма точна
//    (1 проба), на скупчених — бреше (деградація).
//
// На відміну від двійкового, цикл може вийти РАНО за «охоронцем діапазону значень»
// (x поза [arr[low]..arr[high]]) — це і є рання відмова інтерполяційного пошуку.

import { identityTranslate, type Translate } from "@/lib/translate"
import type { ArraySearchFrameBase } from "@/lib/traceFrame"

/** Ітеративний лістинг (база з конспекту) — його розбирає README рядок за рядком. */
export const BASE_CODE: readonly string[] = [
  "def interpolation_search(arr, x):          # масив МУСИТЬ бути відсортований",
  "    low, high = 0, len(arr) - 1            # межі вікна — весь масив",
  "    while low <= high and arr[low] <= x <= arr[high]:  # вікно й діапазон значень",
  "        index = low + int((float(high - low)     # ПРОБА — не середина, а",
  "                / (arr[high] - arr[low])) * (x - arr[low]))  #   формула інтерполяції",
  "        if arr[index] == x:                # збіг →",
  "            return index                   #   знайдено",
  "        if arr[index] < x:                 # шукане праворуч →",
  "            low = index + 1                #   відкидаємо ліву частину",
  "        else:                              # шукане ліворуч →",
  "            high = index - 1               #   відкидаємо праву частину",
  "    return -1                              # вікно порожнє / ключ поза → немає",
]

/** Рекурсивний лістинг — та сама логіка на піддіапазоні `[low, high]`. */
export const RECURSIVE_CODE: readonly string[] = [
  "def interpolation_search(arr, x, low, high):   # піддіапазон [low, high]",
  "    if low > high or x < arr[low] or x > arr[high]:  # порожнє / поза діапазоном →",
  "        return -1                              #   немає",
  "    index = low + int((float(high - low)       # ПРОБА — формула",
  "            / (arr[high] - arr[low])) * (x - arr[low]))  #   інтерполяції",
  "    if arr[index] == x:                        # збіг →",
  "        return index                           #   знайдено",
  "    if arr[index] < x:                         # шукане праворуч →",
  "        return interpolation_search(arr, x, index + 1, high)  # рекурсія",
  "    else:                                      # шукане ліворуч →",
  "        return interpolation_search(arr, x, low, index - 1)   # рекурсія",
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
  readonly doneEmpty: readonly number[]
  readonly doneGuard: readonly number[]
}

const ITER_LINES: LineMap = {
  init: [2], initCtx: [],
  probe: [4, 5, 6], probeCtx: [3],
  discardRight: [8, 9], discardLeft: [10, 11],
  found: [6, 7],
  doneFound: [7], doneEmpty: [12], doneGuard: [3, 12],
}

const REC_LINES: LineMap = {
  init: [1], initCtx: [],
  probe: [4, 5, 6], probeCtx: [2],
  discardRight: [8, 9], discardLeft: [10, 11],
  found: [6, 7],
  doneFound: [7], doneEmpty: [2, 3], doneGuard: [2, 3],
}

/** Фаза кадру для бейджа в нарації. */
export type IpPhase = "init" | "probe" | "discard" | "found" | "done"

/** Чому пошук завершився без збігу (для нарації done). */
export type IpExit = "found" | "empty" | "guard"

export interface IpFrame extends ArraySearchFrameBase {
  readonly phase: IpPhase
  /** Активне вікно `[low..high]` масиву на цьому кадрі (🟦). */
  readonly low: number
  readonly high: number
  /** Проба (інтерпольований індекс) або null (init / done-без-проби). */
  readonly index: number | null
  /** Значення `arr[index]` або null. */
  readonly value: number | null
  /** Частина, яку відкидаємо ЦЬОГО кроку (🟥), або null. */
  readonly discardLo: number | null
  readonly discardHi: number | null
  // — «пряма-модель» (геометрична проєкція) —
  /** Межі прямої `[lineLow..lineHigh]` (вікно НА МОМЕНТ проби). */
  readonly lineLow: number
  readonly lineHigh: number
  /** Значення на кінцях прямої `arr[lineLow]`/`arr[lineHigh]`. */
  readonly loVal: number | null
  readonly hiVal: number | null
  /** Частка інтерполяції ∈ [0,1] та дробова проєкція pos, або null. */
  readonly frac: number | null
  readonly pos: number | null
  /** Накопичена кількість проб (обчислень index). */
  readonly probes: number
  /** Глибина рекурсії (рекурсивний режим; = номер проби). */
  readonly depth: number
  readonly recursive: boolean
  /** Як завершився пошук (лише на фінальному кадрі осмислено). */
  readonly exit: IpExit
}

export interface IpResult {
  readonly input: readonly number[]
  readonly target: number
  readonly result: number
  readonly probes: number
  readonly size: number
  readonly recursive: boolean
  readonly found: boolean
  readonly exit: IpExit
}

export interface IpTrace {
  readonly code: readonly string[]
  readonly frames: readonly IpFrame[]
  readonly result: IpResult
}

const fmt = (a: readonly number[]): string => `[${a.join(", ")}]`
const pct = (f: number): string => `${Math.round(f * 100)}%`

/**
 * Проганяє інтерполяційний пошук на відсортованому масиві + цілі й збирає trace для
 * плеєра/віджетів: init + по два кадри на пробу (проба + розв'язок) + done.
 * `recursive` перемикає лістинг коду й глибину (еволюція вікна ідентична).
 */
export function buildInterpolationSearchTrace(
  input: readonly number[],
  target: number,
  recursive = false,
  t: Translate = identityTranslate,
): IpTrace {
  const arr = [...input]
  const n = arr.length
  const code = recursive ? RECURSIVE_CODE : BASE_CODE
  const LM = recursive ? REC_LINES : ITER_LINES

  const frames: IpFrame[] = []
  let probes = 0
  let result = -1
  let low = 0
  let high = n - 1
  let exit: IpExit = "empty"

  const push = (
    phase: IpPhase,
    f: {
      low: number
      high: number
      index?: number | null
      value?: number | null
      discardLo?: number | null
      discardHi?: number | null
      lineLow: number
      lineHigh: number
      loVal?: number | null
      hiVal?: number | null
      frac?: number | null
      pos?: number | null
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
      index: f.index ?? null,
      value: f.value ?? null,
      discardLo: f.discardLo ?? null,
      discardHi: f.discardHi ?? null,
      lineLow: f.lineLow,
      lineHigh: f.lineHigh,
      loVal: f.loVal ?? null,
      hiVal: f.hiVal ?? null,
      frac: f.frac ?? null,
      pos: f.pos ?? null,
      probes,
      result,
      depth: probes,
      recursive,
      exit,
      lines: f.lines,
      contextLines: f.contextLines,
      caption: f.caption,
    })
  }

  // Порожній масив — окремий випадок (нема за що зачепити пряму).
  if (n === 0) {
    push("init", {
      low: 0, high: -1, lineLow: 0, lineHigh: -1,
      lines: LM.init, contextLines: LM.initCtx,
      caption: t("play.nIpInit", { arr: "[]", target, high: -1 }),
    })
    exit = "empty"
    push("done", {
      low: 0, high: -1, lineLow: 0, lineHigh: -1,
      lines: LM.doneEmpty, contextLines: [],
      caption: t("play.nIpDoneEmpty", { target, probes: 0 }),
    })
    return {
      code, frames,
      result: { input: arr, target, result: -1, probes: 0, size: 0, recursive, found: false, exit: "empty" },
    }
  }

  push("init", {
    low, high, lineLow: low, lineHigh: high, loVal: arr[low], hiVal: arr[high],
    lines: LM.init, contextLines: LM.initCtx,
    caption: t("play.nIpInit", { arr: fmt(arr), target, high: n - 1 }),
  })

  while (low <= high) {
    const oldLow = low
    const oldHigh = high
    const loVal = arr[oldLow]
    const hiVal = arr[oldHigh]

    // Охоронець діапазону значень: ключ мусить лежати між межами за значенням.
    if (!(target >= loVal && target <= hiVal) || hiVal === loVal) {
      // Вироджений діапазон (hiVal == loVal) трактуємо так само, як вихід за
      // охоронцем: формула неприйнятна, спільне значення вже перевірено межами.
      if (hiVal === loVal && loVal === target) {
        // Знайдено за прямим порівнянням зі спільним значенням.
        probes += 1
        result = oldLow
        exit = "found"
        push("found", {
          low: oldLow, high: oldHigh, index: oldLow, value: loVal,
          lineLow: oldLow, lineHigh: oldHigh, loVal, hiVal, frac: 0, pos: oldLow,
          lines: LM.found, contextLines: LM.probeCtx,
          caption: t("play.nIpFound", { value: loVal, target, index: oldLow }),
        })
        break
      }
      exit = "guard"
      break
    }

    const frac = (target - loVal) / (hiVal - loVal)
    const pos = oldLow + frac * (oldHigh - oldLow)
    const index = oldLow + Math.trunc(((oldHigh - oldLow) / (hiVal - loVal)) * (target - loVal))
    const value = arr[index]
    probes += 1

    push("probe", {
      low: oldLow, high: oldHigh, index, value,
      lineLow: oldLow, lineHigh: oldHigh, loVal, hiVal, frac, pos,
      lines: LM.probe, contextLines: LM.probeCtx,
      caption: t("play.nIpProbe", {
        k: probes, low: oldLow, high: oldHigh, loVal, hiVal,
        frac: pct(frac), index, value, target,
      }),
    })

    if (value === target) {
      result = index
      exit = "found"
      push("found", {
        low: oldLow, high: oldHigh, index, value,
        lineLow: oldLow, lineHigh: oldHigh, loVal, hiVal, frac, pos,
        lines: LM.found, contextLines: LM.probeCtx,
        caption: t("play.nIpFound", { value, target, index }),
      })
      break
    }
    if (value < target) {
      low = index + 1
      push("discard", {
        low, high: oldHigh, index, value,
        discardLo: oldLow, discardHi: index,
        lineLow: oldLow, lineHigh: oldHigh, loVal, hiVal, frac, pos,
        lines: LM.discardRight, contextLines: LM.probeCtx,
        caption: t("play.nIpDiscardRight", { value, target, index, low }),
      })
    } else {
      high = index - 1
      push("discard", {
        low: oldLow, high, index, value,
        discardLo: index, discardHi: oldHigh,
        lineLow: oldLow, lineHigh: oldHigh, loVal, hiVal, frac, pos,
        lines: LM.discardLeft, contextLines: LM.probeCtx,
        caption: t("play.nIpDiscardLeft", { value, target, index, high }),
      })
    }
  }

  const found = result >= 0
  if (found) {
    push("done", {
      low: result, high: result, index: result,
      lineLow: result, lineHigh: result, loVal: arr[result], hiVal: arr[result],
      lines: LM.doneFound, contextLines: [],
      caption: t("play.nIpDoneFound", { target, index: result, probes }),
    })
  } else if (exit === "guard") {
    // Ключ поза діапазоном значень поточного вікна — рання відмова (фішка методу).
    const safeLow = Math.max(0, Math.min(low, n - 1))
    const safeHigh = Math.max(0, Math.min(high, n - 1))
    push("done", {
      low, high, lineLow: safeLow, lineHigh: safeHigh,
      loVal: low <= high ? arr[safeLow] : null,
      hiVal: low <= high ? arr[safeHigh] : null,
      lines: LM.doneGuard, contextLines: [],
      caption: t("play.nIpDoneGuard", {
        target,
        loVal: arr[safeLow],
        hiVal: arr[safeHigh],
        probes,
      }),
    })
  } else {
    push("done", {
      low, high, lineLow: 0, lineHigh: n - 1,
      lines: LM.doneEmpty, contextLines: [],
      caption: t("play.nIpDoneEmpty", { target, probes }),
    })
  }

  return {
    code,
    frames,
    result: { input: arr, target, result, probes, size: n, recursive, found, exit },
  }
}
