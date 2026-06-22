// Модель trace для пошуку Боєра-Мура (таблиця поганого символу). Алгоритм проганяється
// ОДИН раз на парі (текст, шаблон) і пишемо список незмінних кадрів (BmFrame) — UI лише
// рухає курсор. Дві самостійні фази, тож і кадри двох видів:
//
//   ФАЗА 1 — ПЕРЕДОБРОБКА: будуємо таблицю поганого символу зі самого шаблону. Кадри
//   table-init / table-entry (запис, з акцентом на перезаписі повторюваного символу) /
//   table-default (setdefault останнього) / table-final. На «developer» = 11 кадрів
//   (T00–T10): init + 8 записів + default + final.
//
//   ФАЗА 2 — ПОШУК: сканування СПРАВА НАЛІВО всередині кожного вікна + стрибки за таблицею.
//   Кадри search-init / compare (один на кожне посимвольне порівняння; зелений суфікс
//   росте вліво) / shift (стрибок вікна; підсвічуємо символ кінця вікна й пропущений
//   текст) / found / done. На «developer» у тексті конспекту = 13 кадрів (S00–S12):
//   init + порівняння-розбіжність + стрибок + 9 порівнянь-збігів + збіг.
//
// Разом канонічний приклад = 24 кадри. Сигнатурний образ фази 1 — словник «символ → зсув»,
// що будується (з акцентом на перезаписі); фази 2 — СТРІЧКА «текст / шаблон» зі скануванням
// справа наліво, зеленим суфіксом і ВЕЛИКИМИ стрибками з пропущеними (🩶) символами.

import { identityTranslate, type Translate } from "@/lib/translate"
import {
  buildShiftTableSteps,
  boyerMooreSearchSteps,
  type SearchEvent,
} from "@/lib/boyerMooreStringSearch"

/** Лістинг передобробки (база з конспекту) — його розбирає README. */
export const TABLE_CODE: readonly string[] = [
  "def build_shift_table(pattern):           # шаблон → таблиця зсувів",
  "    table = {}                            # словник «символ → зсув»",
  "    length = len(pattern)                 # довжина шаблону M",
  "    for index, char in enumerate(pattern[:-1]):  # усі, крім останнього",
  "        table[char] = length - index - 1  #   зсув; перемагає ОСТАННЄ входження",
  "    table.setdefault(pattern[-1], length) # останній: M, якщо ще не записано",
  "    return table                          # готова таблиця поганого символу",
]

/** Лістинг пошуку (база з конспекту) — його розбирає README. */
export const SEARCH_CODE: readonly string[] = [
  "def boyer_moore_search(text, pattern):                    # текст і шаблон",
  "    shift_table = build_shift_table(pattern)              # фаза 1 — передобробка",
  "    i = 0                                                 # старт вікна",
  "    while i <= len(text) - len(pattern):                  # ковзаємо вікном",
  "        j = len(pattern) - 1                              # СПРАВА: останній символ",
  "        while j >= 0 and text[i + j] == pattern[j]:       # звіряємо справа наліво",
  "            j -= 1                                        #   збіг — далі вліво",
  "        if j < 0:                                         # увесь шаблон збігся →",
  "            return i                                      #   знайдено на позиції i",
  "        i += shift_table.get(text[i + len(pattern) - 1], len(pattern))  # СТРИБОК",
  "    return -1                                             # шаблону немає",
]

interface TableLineMap {
  readonly init: readonly number[]
  readonly entry: readonly number[]
  readonly entryCtx: readonly number[]
  readonly def: readonly number[]
  readonly final: readonly number[]
}

const TABLE_LINES: TableLineMap = {
  init: [1, 2],
  entry: [4],
  entryCtx: [3],
  def: [5],
  final: [6],
}

interface SearchLineMap {
  readonly init: readonly number[]
  readonly initCtx: readonly number[]
  readonly compare: readonly number[]
  readonly compareCtx: readonly number[]
  readonly compareMatch: readonly number[]
  readonly shift: readonly number[]
  readonly shiftCtx: readonly number[]
  readonly found: readonly number[]
  readonly foundCtx: readonly number[]
  readonly none: readonly number[]
}

const SEARCH_LINES: SearchLineMap = {
  init: [1, 2], initCtx: [],
  compare: [5], compareCtx: [3, 4],
  compareMatch: [5, 6], shift: [9], shiftCtx: [7],
  found: [8], foundCtx: [7],
  none: [10],
}

/** Фаза кадру для бейджа в нарації. */
export type BmPhase = "table" | "search"

/** Підвид кадру (детальніший за фазу). */
export type BmStep =
  | "table-init"
  | "table-entry"
  | "table-default"
  | "table-final"
  | "search-init"
  | "compare"
  | "shift"
  | "found"
  | "done"

export interface BmFrame {
  readonly i: number
  readonly phase: BmPhase
  readonly step: BmStep
  readonly text: string
  readonly pattern: string
  // — фаза таблиці —
  /** Знімок словника зсувів на цей момент. */
  readonly table: Record<string, number>
  /** Активний символ запису (entry/default) або null. */
  readonly tableChar: string | null
  /** Активний індекс у шаблоні (entry/default) або -1. */
  readonly tableIndex: number
  /** entry: чи перезаписуємо вже наявний ключ. */
  readonly overwrite: boolean
  /** entry: попереднє значення при перезаписі (або null). */
  readonly prevShift: number | null
  // — фаза пошуку —
  /** Зсув вікна (pattern[0] під text[offset]); -1 поза фазою пошуку / done-без-вікна. */
  readonly offset: number
  /** Поточна позиція в шаблоні (справа наліво) або null. */
  readonly j: number | null
  /** Скільки символів СУФІКСА збіглося в цьому вікні (зелений суфікс справа). */
  readonly matchedSuffix: number
  /** compare: результат поточного порівняння. */
  readonly compareMatch: boolean | null
  /** Цей кадр — повний збіг (j<0). */
  readonly full: boolean
  /** shift: символ кінця вікна (поганий символ). */
  readonly windowEndChar: string | null
  /** shift: величина стрибка. */
  readonly jump: number | null
  /** shift: індекси тексту, перестрибнуті без порівняння. */
  readonly skippedNow: readonly number[]
  // — накопичені лічильники —
  readonly comparisons: number
  readonly jumps: number
  readonly skipped: number
  readonly result: number
  readonly lines: readonly number[]
  readonly contextLines: readonly number[]
  readonly caption: string
}

export interface BmResult {
  readonly text: string
  readonly pattern: string
  readonly result: number
  readonly table: Record<string, number>
  readonly comparisons: number
  readonly jumps: number
  readonly skipped: number
  readonly found: boolean
}

export interface BmTrace {
  readonly tableCode: readonly string[]
  readonly searchCode: readonly string[]
  readonly frames: readonly BmFrame[]
  readonly result: BmResult
}

/**
 * Проганяє Боєра-Мура на парі (текст, шаблон) і збирає trace для плеєра/віджетів: спершу
 * фаза передобробки (кадри побудови таблиці зсувів), потім фаза пошуку (init + порівняння
 * справа наліво + стрибки + збіг/відмова). `t` — інжектована нарація (lib лишається
 * фреймворк-незалежним; за замовчуванням identityTranslate, тож тести не звіряють текст).
 */
export function buildBoyerMooreStringSearchTrace(
  text: string,
  pattern: string,
  t: Translate = identityTranslate,
): BmTrace {
  const m = pattern.length
  const frames: BmFrame[] = []

  // Спільні «нейтральні» значення полів — кожен push перевизначає потрібні.
  const base = {
    text,
    pattern,
    table: {} as Record<string, number>,
    tableChar: null as string | null,
    tableIndex: -1,
    overwrite: false,
    prevShift: null as number | null,
    offset: -1,
    j: null as number | null,
    matchedSuffix: 0,
    compareMatch: null as boolean | null,
    full: false,
    windowEndChar: null as string | null,
    jump: null as number | null,
    skippedNow: [] as readonly number[],
    comparisons: 0,
    jumps: 0,
    skipped: 0,
    result: -1,
  }

  const push = (f: Partial<BmFrame> & { step: BmStep; phase: BmPhase; lines: readonly number[]; caption: string }) => {
    frames.push({
      ...base,
      ...f,
      i: frames.length,
      contextLines: f.contextLines ?? [],
    } as BmFrame)
  }

  // ─── ФАЗА 1: побудова таблиці поганого символу ──────────────────────────
  const { table, events: tableEvents } = buildShiftTableSteps(pattern)

  for (const e of tableEvents) {
    if (e.kind === "init") {
      push({
        step: "table-init", phase: "table",
        table: { ...e.table }, comparisons: 0,
        lines: TABLE_LINES.init,
        caption: t("play.nBmTableInit", { pattern: pattern || "∅", m }),
      })
    } else if (e.kind === "entry") {
      push({
        step: "table-entry", phase: "table",
        table: { ...e.table },
        tableChar: e.char, tableIndex: e.index ?? -1,
        overwrite: e.overwrite ?? false, prevShift: e.prev,
        lines: TABLE_LINES.entry, contextLines: TABLE_LINES.entryCtx,
        caption: e.overwrite
          ? t("play.nBmTableEntryOw", {
              char: e.char ?? "?", index: e.index ?? 0, prev: e.prev ?? 0, shift: e.shift ?? 0, m,
            })
          : t("play.nBmTableEntry", {
              char: e.char ?? "?", index: e.index ?? 0, shift: e.shift ?? 0, m,
            }),
      })
    } else if (e.kind === "default") {
      push({
        step: "table-default", phase: "table",
        table: { ...e.table },
        tableChar: e.char, tableIndex: e.index ?? -1,
        lines: TABLE_LINES.def,
        caption: e.added
          ? t("play.nBmTableDefault", { char: e.char ?? "?", m })
          : t("play.nBmTableDefaultKeep", { char: e.char ?? "?", existing: e.existing ?? 0, m }),
      })
    } else {
      // final
      push({
        step: "table-final", phase: "table",
        table: { ...e.table },
        lines: TABLE_LINES.final,
        caption: t("play.nBmTableFinal", { pattern: pattern || "∅", table: fmtTable(e.table) }),
      })
    }
  }

  // ─── ФАЗА 2: пошук ──────────────────────────────────────────────────────
  const search = boyerMooreSearchSteps(text, pattern)
  const ev = search.events

  // Поточне вікно (для compare-кадрів): відстежуємо offset і скільки суфікса збіглося.
  let curOffset = -1
  let matchedSuffix = 0

  for (let k = 0; k < ev.length; k++) {
    const e = ev[k]
    switch (e.kind) {
      case "init":
        push({
          step: "search-init", phase: "search",
          table: { ...e.shiftTable },
          lines: SEARCH_LINES.init, contextLines: SEARCH_LINES.initCtx,
          comparisons: e.comparisons, jumps: e.jumps, skipped: e.skipped,
          caption: t("play.nBmSearchInit", {
            pattern: pattern || "∅", text: text || "∅", table: fmtTable(e.shiftTable),
          }),
        })
        break
      case "align":
        curOffset = e.i
        matchedSuffix = 0
        break
      case "compare": {
        const j = e.j ?? 0
        const isMatch = e.match ?? false
        // matchedSuffix ДО цього порівняння = M-1-j (скільки правіших уже збіглося).
        const suffixBefore = m - 1 - j
        push({
          step: "compare", phase: "search",
          table: { ...e.shiftTable },
          offset: curOffset, j,
          matchedSuffix: suffixBefore + (isMatch ? 1 : 0),
          compareMatch: isMatch,
          lines: isMatch ? SEARCH_LINES.compareMatch : SEARCH_LINES.compare,
          contextLines: SEARCH_LINES.compareCtx,
          comparisons: e.comparisons, jumps: e.jumps, skipped: e.skipped,
          caption: t(isMatch ? "play.nBmCompareMatch" : "play.nBmCompareMiss", {
            i: curOffset, j,
            pos: curOffset + j,
            tc: e.textChar ?? "?", pc: e.patternChar ?? "?",
          }),
        })
        matchedSuffix = suffixBefore + (isMatch ? 1 : 0)
        break
      }
      case "mismatch":
        // Розбіжність уже показана попереднім compare-кадром (червоний символ); шукаємо
        // далі shift, який і дає окремий кадр стрибка.
        break
      case "shift": {
        const skippedNow = e.skippedNow ?? []
        push({
          step: "shift", phase: "search",
          table: { ...e.shiftTable },
          offset: e.i, j: e.j,
          matchedSuffix,
          windowEndChar: e.windowEndChar, jump: e.jump,
          skippedNow,
          lines: SEARCH_LINES.shift, contextLines: SEARCH_LINES.shiftCtx,
          comparisons: e.comparisons, jumps: e.jumps, skipped: e.skipped,
          caption:
            e.tableValue == null
              ? t("play.nBmShiftAbsent", {
                  i: e.i, wec: e.windowEndChar ?? "?", jump: e.jump ?? 0, newI: e.newI ?? 0,
                  skipped: skippedNow.length,
                })
              : t("play.nBmShift", {
                  i: e.i, wec: e.windowEndChar ?? "?", value: e.tableValue,
                  jump: e.jump ?? 0, newI: e.newI ?? 0, skipped: skippedNow.length,
                }),
        })
        break
      }
      case "match_found":
        // Збіг — окремого кадра не робимо: підсумковий кадр `done` (S12) показує
        // повний збіг і фінальні лічильники (README: останній крок пошуку = знайдено).
        break
      case "not_found":
        // Окремого кадра не робимо — підсумок дає done.
        break
      case "final":
        push({
          step: "done", phase: "search",
          table: { ...e.shiftTable },
          offset: e.result != null && e.result >= 0 ? e.result : -1,
          j: e.result != null && e.result >= 0 ? -1 : null,
          matchedSuffix: e.result != null && e.result >= 0 ? m : 0,
          full: e.result != null && e.result >= 0,
          lines: e.result != null && e.result >= 0 ? SEARCH_LINES.found : SEARCH_LINES.none,
          comparisons: e.comparisons, jumps: e.jumps, skipped: e.skipped,
          result: e.result ?? -1,
          caption:
            e.result != null && e.result >= 0
              ? t("play.nBmDoneFound", {
                  pattern: pattern || "∅", index: e.result, m,
                  comparisons: e.comparisons, jumps: e.jumps, skipped: e.skipped,
                })
              : t("play.nBmDoneNotFound", {
                  pattern: pattern || "∅",
                  comparisons: e.comparisons, jumps: e.jumps, skipped: e.skipped,
                }),
        })
        break
    }
  }

  const found = search.result >= 0
  return {
    tableCode: TABLE_CODE,
    searchCode: SEARCH_CODE,
    frames,
    result: {
      text,
      pattern,
      result: search.result,
      table,
      comparisons: search.comparisons,
      jumps: search.jumps,
      skipped: search.skipped,
      found,
    },
  }
}

/** Форматує таблицю зсувів `{'d': 8, …}` у компактний рядок для нарації. */
function fmtTable(table: Record<string, number>): string {
  const parts = Object.entries(table).map(([k, v]) => `${k === " " ? "␣" : k}:${v}`)
  return `{${parts.join(", ")}}`
}

export type { SearchEvent }
