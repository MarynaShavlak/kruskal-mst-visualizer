// Модель trace для KMP. Алгоритм проганяється ОДИН раз на парі (текст, шаблон) і пишемо
// список незмінних кадрів (KmpFrame) — UI лише рухає курсор. Дві фази, дві панелі даних:
//
// ФАЗА 1 (передобробка, phase="lps") — будуємо таблицю `lps` із самого шаблону. Сигнатурна
//   панель: ТАБЛИЦЯ LPS (символи шаблону + значення lps під ними; підсвічуємо узгоджений
//   префікс і суфікс у pattern[0..i]; на відкоті — крок length = lps[length-1]).
// ФАЗА 2 (пошук, phase="search") — один прохід тексту зі стрибками за `lps`. Панель:
//   спільна СТРІЧКА «текст / шаблон» (StringStrip) — шаблон зсунутий так, що pattern[0]
//   стоїть під text[i-j]; на розбіжності `j` стрибає на lps[j-1], а `i` СТОЇТЬ на місці
//   (визначальний інваріант: i ніколи не зменшується — місток-контраст до наївного).
//
// Кадри: init + (фаза lps: усі події крім advance) + (фаза search: усі події крім final) +
// done. На канонічному прикладі = 20 (lps) + 48 (search) + 1 (done) = 69 кадрів.

import { identityTranslate, type Translate } from "@/lib/translate"
import type { StringSearchFrameBase } from "@/lib/traceFrame"
import {
  computeLpsSteps,
  kmpSearchSteps,
  type LpsEvent,
  type KmpSearchEvent,
} from "@/lib/kmpStringSearch"

/** Лістинг фази 1 — побудова таблиці `lps` (дослівно з конспекту). */
export const LPS_CODE: readonly string[] = [
  "def compute_lps(pattern):              # будуємо таблицю lps із шаблону",
  "    lps = [0] * len(pattern)            # lps[0] = 0 завжди",
  "    length = 0                          # довжина збіжного префікса-суфікса",
  "    i = 1                               # стартуємо з другого символу",
  "    while i < len(pattern):             # проходимо шаблон",
  "        if pattern[i] == pattern[length]:  # префікс подовжується?",
  "            length += 1                 #   так — на 1 довший",
  "            lps[i] = length             #   записуємо довжину",
  "            i += 1                      #   далі",
  "        elif length != 0:               # розбіжність, але префікс є →",
  "            length = lps[length - 1]    #   ВІДКІТ length (i не рухаємо)",
  "        else:                           # префікса немає →",
  "            lps[i] = 0                  #   нуль і далі",
  "            i += 1",
  "    return lps                          # готова таблиця",
]

/** Лістинг фази 2 — пошук KMP (дослівно з конспекту). */
export const SEARCH_CODE: readonly string[] = [
  "def kmp_search(text, pattern):          # пошук у тексті",
  "    M, N = len(pattern), len(text)      # довжини",
  "    lps = compute_lps(pattern)          # фаза 1 — таблиця lps",
  "    i = j = 0                           # i — у тексті, j — у шаблоні",
  "    while i < N:                        # один прохід тексту",
  "        if pattern[j] == text[i]:       # символи збігаються?",
  "            i += 1; j += 1              #   так — обидва вперед",
  "        elif j != 0:                    # розбіжність, j != 0 →",
  "            j = lps[j - 1]              #   СТРИБОК шаблону (i стоїть!)",
  "        else:                           # розбіжність, j == 0 →",
  "            i += 1                      #   просто далі по тексту",
  "        if j == M:                      # дійшли кінця шаблону →",
  "            return i - j                #   знайдено на позиції i-j",
  "    return -1                           # не знайдено",
]

interface LpsLineMap {
  readonly init: readonly number[]
  readonly compare: readonly number[]
  readonly set: readonly number[]
  readonly fallback: readonly number[]
  readonly zero: readonly number[]
  readonly final: readonly number[]
}

const LPS_LINES: LpsLineMap = {
  init: [1, 2, 3],
  compare: [4, 5],
  set: [6, 7, 8],
  fallback: [9, 10],
  zero: [11, 12, 13],
  final: [14],
}

const LPS_CTX: LpsLineMap = {
  init: [],
  compare: [],
  set: [5],
  fallback: [5],
  zero: [5, 9],
  final: [],
}

interface SearchLineMap {
  readonly init: readonly number[]
  readonly compare: readonly number[]
  readonly advanceBoth: readonly number[]
  readonly shift: readonly number[]
  readonly advanceI: readonly number[]
  readonly found: readonly number[]
  readonly notFound: readonly number[]
}

const SEARCH_LINES: SearchLineMap = {
  init: [1, 2, 3],
  compare: [4, 5],
  advanceBoth: [6],
  shift: [7, 8],
  advanceI: [9, 10],
  found: [11, 12],
  notFound: [13],
}

const SEARCH_CTX: SearchLineMap = {
  init: [],
  compare: [],
  advanceBoth: [5],
  shift: [5, 7],
  advanceI: [5, 9],
  found: [],
  notFound: [],
}

/** Фаза кадру для бейджа в нарації. */
export type KmpPhase = "init" | "lps" | "search" | "done"

/** Дані фази 1 (таблиця lps), якщо кадр належить фазі передобробки. */
export interface KmpLpsState {
  /** Шаблон. */
  readonly pattern: string
  /** Знімок таблиці lps. */
  readonly lps: readonly number[]
  /** Поточна позиція i (або null). */
  readonly i: number | null
  /** Довжина збіжного префікса-суфікса length. */
  readonly length: number
  /** Тип події журналу lps. */
  readonly kind: LpsEvent["kind"]
  /** Нове значення length після відкоту (для fallback). */
  readonly newLength: number | null
  /** Збіг символів pattern[i] == pattern[length] (для compare). */
  readonly match: boolean | null
}

/** Дані фази 2 (стрічка пошуку), якщо кадр належить фазі пошуку. */
export interface KmpSearchState {
  /** Позиція в тексті. */
  readonly i: number
  /** Позиція в шаблоні. */
  readonly j: number
  /** Зсув шаблону вздовж тексту (i - j). */
  readonly offset: number
  /** Тип події журналу пошуку. */
  readonly kind: KmpSearchEvent["kind"]
  /** На скільки шаблон стрибнув (для shift). */
  readonly jump: number | null
  /** Збіг символів pattern[j] == text[i] (для compare). */
  readonly match: boolean | null
}

export interface KmpFrame extends StringSearchFrameBase {
  readonly index: number
  readonly phase: KmpPhase
  /** Дані таблиці lps (для phase === "lps"), інакше null. */
  readonly lpsState: KmpLpsState | null
  /** Дані стрічки пошуку (для phase === "search"), інакше null. */
  readonly searchState: KmpSearchState | null
  // — накопичені лічильники —
  readonly lpsComparisons: number
  readonly searchComparisons: number
  /** Чи `i` жодного разу не зменшилося (завжди true для коректного KMP). */
  readonly iMonotonic: boolean
  /** Який лістинг показувати: "lps" або "search". */
  readonly code: "lps" | "search"
}

export interface KmpResult {
  readonly text: string
  readonly pattern: string
  readonly result: number
  readonly matches: readonly number[]
  readonly lps: readonly number[]
  readonly lpsComparisons: number
  readonly searchComparisons: number
  readonly totalComparisons: number
  readonly naiveComparisons: number
  readonly iMonotonic: boolean
  readonly found: boolean
}

export interface KmpTrace {
  readonly lpsCode: readonly string[]
  readonly searchCode: readonly string[]
  readonly frames: readonly KmpFrame[]
  readonly result: KmpResult
}

/** Із наївного — для контрасту в підсумку (повторне звіряння префікса). */
function naiveComparisons(text: string, pattern: string): number {
  const M = pattern.length
  const N = text.length
  if (M === 0) return 0
  let c = 0
  for (let i = 0; i <= N - M; i++) {
    let j = 0
    while (j < M) {
      c += 1
      if (text[i + j] !== pattern[j]) break
      j += 1
    }
  }
  return c
}

/**
 * Проганяє KMP на парі (текст, шаблон) і збирає trace для плеєра/віджетів: init + кадри
 * фази lps (передобробка) + кадри фази пошуку + done. Нарація — через `t` (за замовчуванням
 * identity, щоб тести не залежали від мови).
 */
export function buildKmpStringSearchTrace(
  text: string,
  pattern: string,
  t: Translate = identityTranslate,
): KmpTrace {
  const n = text.length
  const m = pattern.length

  const { lps, events: lpsEvents } = computeLpsSteps(pattern)
  const { result, events: searchEvents } = kmpSearchSteps(text, pattern)

  const frames: KmpFrame[] = []
  let lpsComparisons = 0
  let searchComparisons = 0
  let iMonotonic = true

  const push = (
    phase: KmpPhase,
    f: {
      lpsState: KmpLpsState | null
      searchState: KmpSearchState | null
      lines: readonly number[]
      contextLines: readonly number[]
      code: "lps" | "search"
      caption: string
    },
  ) => {
    frames.push({
      index: frames.length,
      phase,
      text,
      pattern,
      lpsState: f.lpsState,
      searchState: f.searchState,
      lpsComparisons,
      searchComparisons,
      iMonotonic,
      result,
      lines: f.lines,
      contextLines: f.contextLines,
      code: f.code,
      caption: f.caption,
    })
  }

  const charOr = (s: string | null): string => s ?? "?"

  // — Фаза 1: побудова lps (усі події крім advance). Перша подія (init) стає загальним
  //   стартовим кадром (phase="init"). —
  for (const e of lpsEvents) {
    if (e.kind === "advance") continue
    lpsComparisons = e.comparisons
    const state: KmpLpsState = {
      pattern,
      lps: e.lps,
      i: e.i,
      length: e.length,
      kind: e.kind,
      newLength: e.newLength,
      match: e.match,
    }
    if (e.kind === "init") {
      push("init", {
        lpsState: state, searchState: null,
        lines: LPS_LINES.init, contextLines: LPS_CTX.init, code: "lps",
        caption: t("play.nKmpInit", { text: text || "∅", pattern: pattern || "∅", n, m }),
      })
    } else if (e.kind === "compare") {
      push("lps", {
        lpsState: state, searchState: null,
        lines: LPS_LINES.compare, contextLines: LPS_CTX.compare, code: "lps",
        caption: t("play.nKmpLpsCompare", {
          i: e.i ?? 0, ci: charOr(e.charI), len: e.length, cl: charOr(e.charLen),
          verdict: e.match ? "=" : "≠",
        }),
      })
    } else if (e.kind === "set") {
      push("lps", {
        lpsState: state, searchState: null,
        lines: LPS_LINES.set, contextLines: LPS_CTX.set, code: "lps",
        caption: t("play.nKmpLpsSet", { i: e.i ?? 0, len: e.length }),
      })
    } else if (e.kind === "fallback") {
      push("lps", {
        lpsState: state, searchState: null,
        lines: LPS_LINES.fallback, contextLines: LPS_CTX.fallback, code: "lps",
        caption: t("play.nKmpLpsFallback", {
          i: e.i ?? 0, from: e.length, to: e.newLength ?? 0,
        }),
      })
    } else if (e.kind === "zero") {
      push("lps", {
        lpsState: state, searchState: null,
        lines: LPS_LINES.zero, contextLines: LPS_CTX.zero, code: "lps",
        caption: t("play.nKmpLpsZero", { i: e.i ?? 0 }),
      })
    } else if (e.kind === "final") {
      push("lps", {
        lpsState: state, searchState: null,
        lines: LPS_LINES.final, contextLines: LPS_CTX.final, code: "lps",
        caption: t("play.nKmpLpsFinal", { lps: lps.join(", "), comparisons: lpsComparisons }),
      })
    }
  }

  // — Фаза 2: пошук (усі події крім final; final → загальний done) —
  for (const e of searchEvents) {
    if (e.kind === "final") continue
    searchComparisons = e.comparisons
    iMonotonic = e.iMonotonic
    const state: KmpSearchState = {
      i: e.i,
      j: e.j,
      offset: e.offset,
      kind: e.kind,
      jump: e.jump,
      match: e.match,
    }
    if (e.kind === "init") {
      push("search", {
        lpsState: null, searchState: state,
        lines: SEARCH_LINES.init, contextLines: SEARCH_CTX.init, code: "search",
        caption: t("play.nKmpSearchInit", { pattern: pattern || "∅", lps: lps.join(", ") }),
      })
    } else if (e.kind === "compare") {
      push("search", {
        lpsState: null, searchState: state,
        lines: SEARCH_LINES.compare, contextLines: SEARCH_CTX.compare, code: "search",
        caption: t("play.nKmpSearchCompare", {
          i: e.i, j: e.j, tc: charOr(e.textChar), pc: charOr(e.patternChar),
          verdict: e.match ? "=" : "≠",
        }),
      })
    } else if (e.kind === "advance_both") {
      push("search", {
        lpsState: null, searchState: state,
        lines: SEARCH_LINES.advanceBoth, contextLines: SEARCH_CTX.advanceBoth, code: "search",
        caption: t("play.nKmpSearchAdvanceBoth", { i: e.i, j: e.j }),
      })
    } else if (e.kind === "shift") {
      push("search", {
        lpsState: null, searchState: state,
        lines: SEARCH_LINES.shift, contextLines: SEARCH_CTX.shift, code: "search",
        caption: t("play.nKmpSearchShift", { i: e.i, j: e.j, jump: e.jump ?? 0 }),
      })
    } else if (e.kind === "advance_i") {
      push("search", {
        lpsState: null, searchState: state,
        lines: SEARCH_LINES.advanceI, contextLines: SEARCH_CTX.advanceI, code: "search",
        caption: t("play.nKmpSearchAdvanceI", { i: e.i }),
      })
    } else if (e.kind === "match_found") {
      push("search", {
        lpsState: null, searchState: state,
        lines: SEARCH_LINES.found, contextLines: SEARCH_CTX.found, code: "search",
        caption: t("play.nKmpSearchFound", { index: result }),
      })
    } else if (e.kind === "not_found") {
      push("search", {
        lpsState: null, searchState: state,
        lines: SEARCH_LINES.notFound, contextLines: SEARCH_CTX.notFound, code: "search",
        caption: t("play.nKmpSearchNotFound", { pattern: pattern || "∅" }),
      })
    }
  }

  const found = result >= 0
  const total = lpsComparisons + searchComparisons
  const naive = naiveComparisons(text, pattern)

  // — done —
  push("done", {
    lpsState: null,
    searchState: null,
    lines: found ? SEARCH_LINES.found : SEARCH_LINES.notFound,
    contextLines: [],
    code: "search",
    caption: found
      ? t("play.nKmpDoneFound", {
          pattern: pattern || "∅", index: result, total, lps: lpsComparisons,
          search: searchComparisons, naive,
        })
      : t("play.nKmpDoneNotFound", {
          pattern: pattern || "∅", total, naive,
        }),
  })

  const matches: number[] = found ? [result] : []

  return {
    lpsCode: LPS_CODE,
    searchCode: SEARCH_CODE,
    frames,
    result: {
      text,
      pattern,
      result,
      matches,
      lps,
      lpsComparisons,
      searchComparisons,
      totalComparisons: total,
      naiveComparisons: naive,
      iMonotonic,
      found,
    },
  }
}
