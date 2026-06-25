// Модель trace для наївного пошуку в рядках. Алгоритм проганяється ОДИН раз на парі
// (текст, шаблон) і пишемо список незмінних кадрів (NaiveFrame) — UI лише рухає курсор.
// Гранулярність — ОДИН кадр на ВИРІВНЮВАННЯ (зсув шаблону): кадр показує кінцевий стан
// вирівнювання — зелений збіглий префікс + червона розбіжність (або повний збіг). Рівно
// як повне трасування README: init + по кадру на кожне вирівнювання + done (13 кадрів на
// канонічному прикладі = step_00..12).
//
// Два режими — «перший збіг» (naive_search, зупинка на першому повному збігу) і «усі
// входження» (naive_search_all, повний скан до кінця). Сигнатурний образ — СТРІЧКА
// «текст / шаблон»: ряд символів тексту + ряд шаблону під поточним вирівнюванням
// (🟢 збіглося · 🔴 розбіжність · 🟦 у вікні, ще не порівняно · 🩶 поза вікном). Червона
// розбіжність + зелений префікс, що ПОВТОРНО матчиться у наступних вирівнюваннях, — і є
// «марна робота», місток до KMP.

import { createFrameList } from "@/lib/frameList"
import { identityTranslate, type Translate } from "@/lib/translate"
import type { StringSearchFrameBase } from "@/lib/traceFrame"

/** Ітеративний лістинг «перший збіг» (база з конспекту) — його розбирає README. */
export const BASE_CODE: readonly string[] = [
  "def naive_search(text, pattern):          # текст і шаблон",
  "    n, m = len(text), len(pattern)         # довжини",
  "    for i in range(n - m + 1):             # ВИРІВНЮВАННЯ — зсув шаблону",
  "        j = 0                              # позиція в шаблоні",
  "        while j < m and text[i + j] == pattern[j]:  # звіряємо зліва направо",
  "            j += 1                         #   збіг — далі",
  "        if j == m:                         # дійшли кінця шаблону →",
  "            return i                       #   знайдено на позиції i",
  "    return -1                              # жодне вирівнювання не підійшло",
]

/** Лістинг «усі входження»: після збігу не зупиняємось, а додаємо позицію й ковзаємо далі. */
export const ALL_CODE: readonly string[] = [
  "def naive_search_all(text, pattern):       # усі входження",
  "    n, m = len(text), len(pattern)         # довжини",
  "    result = []                            # позиції збігів",
  "    for i in range(n - m + 1):             # ВИРІВНЮВАННЯ — зсув шаблону",
  "        j = 0                              # позиція в шаблоні",
  "        while j < m and text[i + j] == pattern[j]:  # звіряємо зліва направо",
  "            j += 1                         #   збіг — далі",
  "        if j == m:                         # повний збіг →",
  "            result.append(i)               #   запам'ятовуємо й ковзаємо далі",
  "    return result                          # усі позиції входжень",
]

interface LineMap {
  readonly init: readonly number[]
  readonly initCtx: readonly number[]
  readonly align: readonly number[]
  readonly alignCtx: readonly number[]
  readonly found: readonly number[]
  readonly foundCtx: readonly number[]
  readonly doneFound: readonly number[]
  readonly doneNone: readonly number[]
}

const BASE_LINES: LineMap = {
  init: [2, 3], initCtx: [],
  align: [5, 6], alignCtx: [3, 4],
  found: [7, 8], foundCtx: [5],
  doneFound: [8], doneNone: [9],
}

const ALL_LINES: LineMap = {
  init: [2, 3, 4], initCtx: [],
  align: [6, 7], alignCtx: [4, 5],
  found: [8, 9], foundCtx: [6],
  doneFound: [10], doneNone: [10],
}

/** Фаза кадру для бейджа в нарації. */
export type NaivePhase = "init" | "align" | "found" | "done"

export interface NaiveFrame extends StringSearchFrameBase {
  readonly i: number
  readonly phase: NaivePhase
  /** Зсув шаблону (pattern[0] під text[offset]); -1 на init / done-без-вирівнювання. */
  readonly offset: number
  /** Скільки символів збіглося в цьому вирівнюванні (зелений префікс). */
  readonly matched: number
  /** Позиція розбіжності в шаблоні (червона) або null (повний збіг / init). */
  readonly mismatchJ: number | null
  /** Цей кадр — повний збіг. */
  readonly full: boolean
  // — накопичені лічильники —
  readonly comparisons: number
  readonly alignments: number
  readonly shifts: number
  /** Знайдені позиції до цього кадру включно. */
  readonly matches: readonly number[]
  readonly findAll: boolean
}

export interface NaiveResult {
  readonly text: string
  readonly pattern: string
  readonly result: number
  readonly matches: readonly number[]
  readonly comparisons: number
  readonly alignments: number
  readonly shifts: number
  readonly findAll: boolean
  readonly found: boolean
}

export interface NaiveTrace {
  readonly code: readonly string[]
  readonly frames: readonly NaiveFrame[]
  readonly result: NaiveResult
}

/** Кількість збіглих символів і позиція розбіжності для одного вирівнювання. */
function alignmentAt(
  text: string,
  pattern: string,
  i: number,
): { matched: number; mismatchJ: number | null; full: boolean } {
  const m = pattern.length
  let j = 0
  while (j < m && text[i + j] === pattern[j]) j++
  if (j === m) return { matched: m, mismatchJ: null, full: true }
  return { matched: j, mismatchJ: j, full: false }
}

/**
 * Проганяє наївний пошук на парі (текст, шаблон) і збирає trace для плеєра/віджетів:
 * init + по кадру на кожне вирівнювання + done. `findAll` перемикає лістинг і поведінку:
 * `false` — зупинка на першому повному збігу; `true` — повний скан (усі входження).
 */
export function buildNaiveStringSearchTrace(
  text: string,
  pattern: string,
  findAll = false,
  t: Translate = identityTranslate,
): NaiveTrace {
  const n = text.length
  const m = pattern.length
  const code = findAll ? ALL_CODE : BASE_CODE
  const LM = findAll ? ALL_LINES : BASE_LINES

  const { frames, push: pushFrame } = createFrameList<NaiveFrame>()
  const matches: number[] = []
  let comparisons = 0
  let alignments = 0
  let shifts = 0
  let stopped = false

  const push = (
    phase: NaivePhase,
    f: {
      offset: number
      matched: number
      mismatchJ: number | null
      full: boolean
      lines: readonly number[]
      contextLines: readonly number[]
      caption: string
    },
  ) => {
    pushFrame({
      phase,
      text,
      pattern,
      offset: f.offset,
      matched: f.matched,
      mismatchJ: f.mismatchJ,
      full: f.full,
      comparisons,
      alignments,
      shifts,
      matches: [...matches],
      result: matches.length > 0 ? matches[0] : -1,
      findAll,
      lines: f.lines,
      contextLines: f.contextLines,
      caption: f.caption,
    })
  }

  push("init", {
    offset: -1, matched: 0, mismatchJ: null, full: false,
    lines: LM.init, contextLines: LM.initCtx,
    caption: t("play.nNssInit", { text: text || "∅", pattern: pattern || "∅", n, m }),
  })

  // Порожній шаблон трактуємо як збіг на 0 (узгоджено з naiveSearch).
  if (m === 0) {
    matches.push(0)
    push("done", {
      offset: 0, matched: 0, mismatchJ: null, full: true,
      lines: LM.doneFound, contextLines: [],
      caption: t("play.nNssDoneFound", { pattern: "∅", index: 0, comparisons }),
    })
    return {
      code, frames,
      result: { text, pattern, result: 0, matches: [0], comparisons, alignments, shifts, findAll, found: true },
    }
  }

  for (let i = 0; i <= n - m && !stopped; i++) {
    const { matched, mismatchJ, full } = alignmentAt(text, pattern, i)
    alignments += 1
    comparisons += full ? m : matched + 1
    if (full) {
      matches.push(i)
      if (!findAll) {
        push("found", {
          offset: i, matched: m, mismatchJ: null, full: true,
          lines: LM.found, contextLines: LM.foundCtx,
          caption: t("play.nNssFound", { i, m }),
        })
        stopped = true
      } else {
        push("found", {
          offset: i, matched: m, mismatchJ: null, full: true,
          lines: LM.found, contextLines: LM.foundCtx,
          caption: t("play.nNssFoundAll", { i, count: matches.length }),
        })
      }
    } else {
      shifts += 1
      push("align", {
        offset: i, matched, mismatchJ, full: false,
        lines: LM.align, contextLines: LM.alignCtx,
        caption: t("play.nNssAlign", {
          i,
          matched,
          pos: i + (mismatchJ ?? 0),
          j: mismatchJ ?? 0,
          tc: text[i + (mismatchJ ?? 0)] ?? "?",
          pc: pattern[mismatchJ ?? 0] ?? "?",
        }),
      })
    }
  }

  const found = matches.length > 0
  const result = found ? matches[0] : -1

  // Фінальний кадр.
  if (findAll) {
    push("done", {
      offset: -1, matched: 0, mismatchJ: null, full: false,
      lines: LM.doneFound, contextLines: [],
      caption: found
        ? t("play.nNssDoneAll", { pattern, list: matches.join(", "), count: matches.length, comparisons })
        : t("play.nNssDoneNone", { pattern, comparisons }),
    })
  } else if (found) {
    push("done", {
      offset: result, matched: m, mismatchJ: null, full: true,
      lines: LM.doneFound, contextLines: [],
      caption: t("play.nNssDoneFound", { pattern, index: result, comparisons }),
    })
  } else {
    push("done", {
      offset: -1, matched: 0, mismatchJ: null, full: false,
      lines: LM.doneNone, contextLines: [],
      caption: t("play.nNssDoneNotFound", { pattern, comparisons, alignments }),
    })
  }

  return {
    code,
    frames,
    result: { text, pattern, result, matches: [...matches], comparisons, alignments, shifts, findAll, found },
  }
}
