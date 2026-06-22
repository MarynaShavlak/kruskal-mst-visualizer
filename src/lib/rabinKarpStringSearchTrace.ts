// Модель trace для пошуку Рабіна-Карпа. Алгоритм проганяється ОДИН раз на парі (текст,
// шаблон) і пишемо список незмінних кадрів (RkFrame) — UI лише рухає курсор. Дві фази:
//   ФАЗА 1 (preprocessing) — Horner-побудова хешу ШАБЛОНА: init + по кадру на символ +
//     final (для «developer» = init + 9 термів + final = 11 кадрів);
//   ФАЗА 2 (search) — ковзне вікно: init + по кадру на ЗМІЩЕННЯ вікна (вердикт: ковзаємо /
//     колізія / збіг) до першого підтвердженого збігу + global done.
// Сигнатурні образи: фаза 1 — Horner-акумуляція (код=ord, степінь, внесок, накопичений
// хеш); фаза 2 — СТРІЧКА «текст / шаблон» (вікно blue/active, на verify — посимвольно
// match/mismatch) + бейдж хешу вікна поряд із хешем шаблону (рівні хеші = кандидат; на
// колізії хеші РІВНІ, а символи РІЗНІ — унікальна перлина).
//
// Два режими — «ковзний хеш O(1)» (rabin_karp_search, rolling) і «перерахунок O(m)»
// (rabin_karp_search_recompute): той самий результат, контрастна ціна (rolling-оновлення
// проти повного перерахунку хешу кожного вікна). Перемикач міняє лістинг і нарацію фази 2.

import { identityTranslate, type Translate } from "@/lib/translate"
import {
  polynomialHashSteps,
  rabinKarpSearchSteps,
  countHashCharOps,
  type HashEvent,
} from "@/lib/rabinKarpStringSearch"

/** Лістинг хешу (фаза 1) — дослівно `polynomial_hash` з конспекту. */
export const HASH_CODE: readonly string[] = [
  "def polynomial_hash(s, base=256, modulus=101):",
  "    n = len(s)",
  "    hash_value = 0",
  "    for i, char in enumerate(s):",
  "        power_of_base = pow(base, n - i - 1) % modulus",
  "        hash_value = (hash_value + ord(char) * power_of_base) % modulus",
  "    return hash_value",
]

/** Лістинг пошуку (фаза 2, ROLLING) — дослівно `rabin_karp_search` з конспекту. */
export const SEARCH_CODE: readonly string[] = [
  "def rabin_karp_search(main_string, substring):",
  "    substring_length = len(substring)",
  "    main_string_length = len(main_string)",
  "    base, modulus = 256, 101",
  "    substring_hash = polynomial_hash(substring, base, modulus)",
  "    current_slice_hash = polynomial_hash(main_string[:substring_length], base, modulus)",
  "    h_multiplier = pow(base, substring_length - 1) % modulus",
  "    for i in range(main_string_length - substring_length + 1):",
  "        if substring_hash == current_slice_hash:",
  "            if main_string[i:i+substring_length] == substring:",
  "                return i",
  "        if i < main_string_length - substring_length:",
  "            current_slice_hash = (current_slice_hash - ord(main_string[i]) * h_multiplier) % modulus",
  "            current_slice_hash = (current_slice_hash * base + ord(main_string[i + substring_length])) % modulus",
  "    return -1",
]

/** Лістинг пошуку (фаза 2, ПЕРЕРАХУНОК) — `rabin_karp_search_recompute`: хеш вікна з нуля. */
export const RECOMPUTE_CODE: readonly string[] = [
  "def rabin_karp_search_recompute(main_string, substring):",
  "    base, modulus = 256, 101",
  "    m = len(substring)",
  "    n = len(main_string)",
  "    substring_hash = polynomial_hash(substring, base, modulus)",
  "    for i in range(n - m + 1):",
  "        window_hash = polynomial_hash(main_string[i:i+m], base, modulus)  # O(m)!",
  "        if window_hash == substring_hash:",
  "            if main_string[i:i+m] == substring:",
  "                return i",
  "    return -1",
]

/** Фаза кадру для бейджа в нарації. */
export type RkPhase = "hashInit" | "hashTerm" | "hashDone" | "searchInit" | "window" | "collision" | "found" | "done"

/** Вердикт вікна фази 2. */
export type RkVerdict = "slide" | "collision" | "match"

export interface RkFrame {
  readonly i: number
  readonly phase: RkPhase
  readonly text: string
  readonly pattern: string
  readonly base: number
  readonly modulus: number
  /** Яка панель активна: «hash» (фаза 1) чи «search» (фаза 2). */
  readonly panel: "hash" | "search"
  // — Фаза 1 (Horner) —
  readonly hashTermIndex: number | null
  readonly hashChar: string | null
  readonly hashCode: number | null
  readonly hashPower: number | null
  readonly hashContribution: number | null
  readonly hashValue: number
  /** Підсумковий хеш шаблону (доступний від фази hashDone). */
  readonly patternHash: number
  readonly hMultiplier: number
  // — Фаза 2 (вікно) —
  /** Зміщення вікна (pattern[0] під text[offset]); -1 поза фазою 2. */
  readonly offset: number
  /** Хеш поточного вікна. */
  readonly windowHash: number
  readonly verdict: RkVerdict | null
  /** На verify — скільки символів збіглося (для match/mismatch у стрічці). */
  readonly matched: number
  /** Позиція першої розбіжності в шаблоні на колізії, або null. */
  readonly mismatchJ: number | null
  /** Rolling-оновлення цього кроку (для контрасту режимів) або null. */
  readonly roll: { outChar: string; inChar: string; before: number; after: number } | null
  // — накопичені лічильники —
  readonly hashComparisons: number
  readonly charVerifications: number
  readonly collisions: number
  readonly rolls: number
  /** Скільки повних перерахунків хешу зроблено (режим перерахунку). */
  readonly recomputes: number
  readonly result: number
  readonly rolling: boolean
  readonly lines: readonly number[]
  readonly contextLines: readonly number[]
  readonly caption: string
}

export interface RkResult {
  readonly text: string
  readonly pattern: string
  readonly result: number
  readonly patternHash: number
  readonly hMultiplier: number
  readonly hashComparisons: number
  readonly charVerifications: number
  readonly collisions: number
  readonly rolls: number
  readonly recomputes: number
  /** Вартість хешування вікон: rolling проти перерахунку (count_hash_char_ops). */
  readonly rollingOps: number
  readonly recomputeOps: number
  readonly rolling: boolean
  readonly found: boolean
}

export interface RkTrace {
  readonly hashCode: readonly string[]
  readonly searchCode: readonly string[]
  readonly frames: readonly RkFrame[]
  readonly result: RkResult
}

interface LineMap {
  readonly searchInit: readonly number[]
  readonly searchInitCtx: readonly number[]
  readonly slide: readonly number[]
  readonly slideCtx: readonly number[]
  readonly collision: readonly number[]
  readonly collisionCtx: readonly number[]
  readonly match: readonly number[]
  readonly matchCtx: readonly number[]
  readonly notFound: readonly number[]
}

// Рядки лістингу ROLLING (SEARCH_CODE).
const ROLLING_LINES: LineMap = {
  searchInit: [4, 5, 6], searchInitCtx: [1, 2, 3],
  slide: [8, 11, 12, 13], slideCtx: [7],
  collision: [8, 9], collisionCtx: [7],
  match: [8, 9, 10], matchCtx: [7],
  notFound: [14],
}

// Рядки лістингу ПЕРЕРАХУНКУ (RECOMPUTE_CODE).
const RECOMPUTE_LINES: LineMap = {
  searchInit: [4], searchInitCtx: [1, 2, 3],
  slide: [6, 7], slideCtx: [5],
  collision: [7, 8], collisionCtx: [6],
  match: [7, 8, 9], matchCtx: [6],
  notFound: [10],
}

const HASH_LINES = {
  init: [1, 2] as const,
  term: [4, 5] as const,
  termCtx: [3] as const,
  final: [6] as const,
}

/** Скільки символів вікна збігається з шаблоном (для розфарбування стрічки на verify). */
function matchedChars(window: string, pattern: string): { matched: number; mismatchJ: number | null } {
  const len = Math.min(window.length, pattern.length)
  for (let k = 0; k < len; k++) {
    if (window[k] !== pattern[k]) return { matched: k, mismatchJ: k }
  }
  return { matched: len, mismatchJ: null }
}

/**
 * Проганяє пошук Рабіна-Карпа на парі (текст, шаблон) і збирає trace для плеєра/віджетів:
 * ФАЗА 1 (Horner-хеш шаблону) + ФАЗА 2 (ковзне вікно) + done. `rolling` перемикає лістинг
 * і нарацію фази 2: `true` — ковзний хеш O(1); `false` — перерахунок з нуля O(m)/крок
 * (той самий результат, контрастна ціна). Хеш вікон, лічильники й результат рахуються
 * інструментованими `*_steps` (rolling-журнал; на перерахунку ролів немає, лише
 * перерахунки).
 */
export function buildRabinKarpStringSearchTrace(
  text: string,
  pattern: string,
  rolling = true,
  t: Translate = identityTranslate,
): RkTrace {
  const base = 256
  const modulus = 101
  const M = pattern.length

  const LM = rolling ? ROLLING_LINES : RECOMPUTE_LINES
  const searchCode = rolling ? SEARCH_CODE : RECOMPUTE_CODE

  const { events: hashEvents, hash: patternHash } = polynomialHashSteps(pattern, base, modulus)
  const { events: searchEvents, result } = rabinKarpSearchSteps(text, pattern, base, modulus)

  // Множник h (для бейджів) — беремо з init-події пошуку.
  const initEv = searchEvents[0]
  const hMultiplier = initEv.hMultiplier

  const frames: RkFrame[] = []

  let hashComparisons = 0
  let charVerifications = 0
  let collisions = 0
  let rolls = 0
  let recomputes = 0

  const blank = {
    hashTermIndex: null as number | null,
    hashChar: null as string | null,
    hashCode: null as number | null,
    hashPower: null as number | null,
    hashContribution: null as number | null,
    offset: -1,
    windowHash: 0,
    verdict: null as RkVerdict | null,
    matched: 0,
    mismatchJ: null as number | null,
    roll: null as RkFrame["roll"],
  }

  const push = (
    phase: RkPhase,
    panel: "hash" | "search",
    f: Partial<typeof blank> & {
      hashValue?: number
      lines: readonly number[]
      contextLines: readonly number[]
      caption: string
    },
  ) => {
    frames.push({
      i: frames.length,
      phase,
      text,
      pattern,
      base,
      modulus,
      panel,
      hashTermIndex: f.hashTermIndex ?? null,
      hashChar: f.hashChar ?? null,
      hashCode: f.hashCode ?? null,
      hashPower: f.hashPower ?? null,
      hashContribution: f.hashContribution ?? null,
      hashValue: f.hashValue ?? 0,
      patternHash,
      hMultiplier,
      offset: f.offset ?? -1,
      windowHash: f.windowHash ?? 0,
      verdict: f.verdict ?? null,
      matched: f.matched ?? 0,
      mismatchJ: f.mismatchJ ?? null,
      roll: f.roll ?? null,
      hashComparisons,
      charVerifications,
      collisions,
      rolls,
      recomputes,
      result,
      rolling,
      lines: f.lines,
      contextLines: f.contextLines,
      caption: f.caption,
    })
  }

  // — ФАЗА 1: Horner-побудова хешу шаблону —
  for (const e of hashEvents as HashEvent[]) {
    if (e.kind === "init") {
      push("hashInit", "hash", {
        hashValue: e.hashValue,
        lines: HASH_LINES.init,
        contextLines: [],
        caption: t("play.nRkHashInit", { pattern: pattern || "∅", m: M, modulus }),
      })
    } else if (e.kind === "term") {
      push("hashTerm", "hash", {
        hashTermIndex: e.i,
        hashChar: e.char,
        hashCode: e.code,
        hashPower: e.power,
        hashContribution: e.contribution,
        hashValue: e.hashValue,
        lines: HASH_LINES.term,
        contextLines: HASH_LINES.termCtx,
        caption: t("play.nRkHashTerm", {
          i: e.i ?? 0,
          char: e.char ?? "?",
          code: e.code ?? 0,
          power: e.power ?? 0,
          contribution: e.contribution ?? 0,
          hash: e.hashValue,
        }),
      })
    } else {
      push("hashDone", "hash", {
        hashValue: e.hashValue,
        lines: HASH_LINES.final,
        contextLines: [],
        caption: t("play.nRkHashDone", { pattern: pattern || "∅", hash: patternHash }),
      })
    }
  }

  // — ФАЗА 2: ковзне вікно —
  // Зберемо події за зміщенням, щоб винести один кадр-вердикт на кожне вікно.
  const byOffset = new Map<number, { window: SEvent; verdict: RkVerdict; verify?: SEvent; roll?: SEvent }>()
  type SEvent = (typeof searchEvents)[number]
  const order: number[] = []
  for (const e of searchEvents) {
    if (e.kind === "window" && e.i != null) {
      byOffset.set(e.i, { window: e, verdict: "slide" })
      order.push(e.i)
    } else if (e.i != null) {
      const slot = byOffset.get(e.i)
      if (!slot) continue
      if (e.kind === "collision") slot.verdict = "collision"
      if (e.kind === "match_found") slot.verdict = "match"
      if (e.kind === "verify") slot.verify = e
      if (e.kind === "roll") slot.roll = e
    }
  }

  push("searchInit", "search", {
    offset: -1,
    windowHash: initEv.windowHash,
    lines: LM.searchInit,
    contextLines: LM.searchInitCtx,
    caption: t("play.nRkSearchInit", {
      pattern: pattern || "∅",
      hash: patternHash,
      m: M,
      mode: rolling ? t("play.rkModeRolling") : t("play.rkModeRecompute"),
    }),
  })

  for (const off of order) {
    const slot = byOffset.get(off)
    if (!slot) continue
    hashComparisons += 1
    const windowHash = slot.window.windowHash
    const windowText = slot.window.window ?? ""

    if (slot.verdict === "match") {
      charVerifications += 1
      push("found", "search", {
        offset: off,
        windowHash,
        verdict: "match",
        matched: M,
        mismatchJ: null,
        lines: LM.match,
        contextLines: LM.matchCtx,
        caption: t("play.nRkMatch", { i: off, hash: windowHash }),
      })
      break
    }

    if (slot.verdict === "collision") {
      charVerifications += 1
      collisions += 1
      // після колізії алгоритм усе одно ковзає далі — рахуємо це оновлення.
      if (slot.roll) {
        if (rolling) rolls += 1
        else recomputes += 1
      }
      const { matched, mismatchJ } = matchedChars(windowText, pattern)
      push("collision", "search", {
        offset: off,
        windowHash,
        verdict: "collision",
        matched,
        mismatchJ,
        roll:
          rolling && slot.roll
            ? {
                outChar: slot.roll.outChar ?? "?",
                inChar: slot.roll.inChar ?? "?",
                before: slot.roll.hashBefore ?? windowHash,
                after: slot.roll.hashAfter ?? windowHash,
              }
            : null,
        lines: LM.collision,
        contextLines: LM.collisionCtx,
        caption: t("play.nRkCollision", {
          i: off,
          window: windowText || "∅",
          hash: windowHash,
          pattern: pattern || "∅",
        }),
      })
    } else {
      // ковзаємо далі: хеші різні
      if (slot.roll) {
        if (rolling) rolls += 1
        else recomputes += 1
        push("window", "search", {
          offset: off,
          windowHash,
          verdict: "slide",
          roll: rolling
            ? {
                outChar: slot.roll.outChar ?? "?",
                inChar: slot.roll.inChar ?? "?",
                before: slot.roll.hashBefore ?? windowHash,
                after: slot.roll.hashAfter ?? windowHash,
              }
            : null,
          lines: LM.slide,
          contextLines: LM.slideCtx,
          caption: rolling
            ? t("play.nRkSlide", {
                i: off,
                window: windowText || "∅",
                hash: windowHash,
                patternHash,
                out: slot.roll.outChar ?? "?",
                in: slot.roll.inChar ?? "?",
              })
            : t("play.nRkSlideRecompute", {
                i: off,
                window: windowText || "∅",
                hash: windowHash,
                patternHash,
                m: M,
              }),
        })
      } else {
        // останнє вікно без rolling — лише вердикт slide
        if (!rolling) recomputes += 1
        push("window", "search", {
          offset: off,
          windowHash,
          verdict: "slide",
          lines: LM.slide,
          contextLines: LM.slideCtx,
          caption: rolling
            ? t("play.nRkSlideLast", { i: off, window: windowText || "∅", hash: windowHash, patternHash })
            : t("play.nRkSlideRecompute", { i: off, window: windowText || "∅", hash: windowHash, patternHash, m: M }),
        })
      }
    }
  }

  const found = result >= 0
  const rollingOps = countHashCharOps(text, pattern, true)
  const recomputeOps = countHashCharOps(text, pattern, false)

  if (found) {
    push("done", "search", {
      offset: result,
      windowHash: patternHash,
      verdict: "match",
      matched: M,
      lines: LM.match,
      contextLines: [],
      caption: t("play.nRkDoneFound", {
        pattern: pattern || "∅",
        index: result,
        hashComparisons,
        charVerifications,
        collisions,
      }),
    })
  } else {
    push("done", "search", {
      offset: -1,
      windowHash: 0,
      lines: LM.notFound,
      contextLines: [],
      caption: t("play.nRkDoneNone", {
        pattern: pattern || "∅",
        hashComparisons,
        collisions,
      }),
    })
  }

  return {
    hashCode: HASH_CODE,
    searchCode,
    frames,
    result: {
      text,
      pattern,
      result,
      patternHash,
      hMultiplier,
      hashComparisons,
      charVerifications,
      collisions,
      rolls,
      recomputes,
      rollingOps,
      recomputeOps,
      rolling,
      found,
    },
  }
}
