// Модель trace для лінійного пошуку. Алгоритм проганяється ОДИН раз на масиві +
// цілі й пишемо список незмінних кадрів (LsFrame) — UI лише рухає курсор. На
// відміну від core.py (одна подія на перевірку), плеєр розбиває кожну перевірку
// на ДВА кадри: «інтрига» (курсор став на індекс, питаємо arr[i] == x?) і
// «розв'язок» (✗ не той → далі / ✓ збіг). init + (інтрига+розв'язок)×перевірки +
// done — рівно як у повному трасуванні README (8 кадрів на головному прикладі).
//
// Два режими: «перший збіг» (linearSearch — спиняється на першому ✓) і «усі
// входження» (find_all — сканує ВЕСЬ масив, збираючи всі збіги). Різні: лістинг
// коду, поведінка зупинки й кількість перевірок. Сигнатурний образ — нерухомий
// ряд комірок із курсором-бігунцем (🌸 перевіряємо · 🟢 знайдено · 🩶 відкинуто ·
// ⬜ ще не перевіряли), а не стовпчики/кошики, як у сортуваннях.

import { identityTranslate, type Translate } from "@/lib/translate"
import type { ArraySearchFrameBase } from "@/lib/traceFrame"

/** Лістинг базового пошуку (перший збіг) — його розбирає README рядок за рядком. */
export const LINEAR_CODE: readonly string[] = [
  "def linear_search(arr, x):       # послідовний перебір зліва направо",
  "    for i in range(len(arr)):    # індекси 0, 1, …, n-1",
  "        if arr[i] == x:          # перевірка: поточний елемент дорівнює шуканому?",
  "            return i             # збіг — повертаємо індекс і зупиняємось",
  "    return -1                    # дійшли до кінця без збігу — елемента немає",
]

/** Лістинг варіанта «усі входження»: сканує ВЕСЬ масив, збирає всі індекси. */
export const FIND_ALL_CODE: readonly string[] = [
  "def find_all(arr, x):            # усі входження, а не лише перше",
  "    result = []                  # сюди збираємо індекси збігів",
  "    for i in range(len(arr)):    # перебираємо ВЕСЬ масив до кінця",
  "        if arr[i] == x:          # перевірка: поточний елемент дорівнює шуканому?",
  "            result.append(i)     # збіг — додаємо індекс і ШУКАЄМО ДАЛІ",
  "    return result                # усі знайдені позиції (порожній список — немає)",
]

/** Фаза кадру для бейджа в нарації. */
export type LsPhase = "init" | "check" | "reject" | "match" | "done"

export interface LsFrame extends ArraySearchFrameBase {
  readonly phase: LsPhase
  /** Індекс, який ЗАРАЗ розглядаємо (курсор), або null (init / done-відсутній). */
  readonly cursor: number | null
  /** Значення `arr[cursor]` або null. */
  readonly value: number | null
  /** Результат перевірки: null (питаємо) · false (не той) · true (збіг). */
  readonly match: boolean | null
  readonly comparisons: number
  /** Накопичені індекси збігів (для «усі входження»; для першого — [індекс] або []). */
  readonly matches: readonly number[]
  /** Найбільший УЖЕ РОЗВ'ЯЗАНИЙ (перевірений) індекс включно; -1 якщо жоден. */
  readonly resolvedTo: number
  /** Режим «усі входження» (інакше «перший збіг»). */
  readonly findAll: boolean
}

export interface LsResult {
  readonly input: readonly number[]
  readonly target: number
  /** Знайдений індекс (перший збіг) або -1. */
  readonly result: number
  /** Усі індекси входжень. */
  readonly matches: readonly number[]
  /** Кількість перевірок (порівнянь). */
  readonly comparisons: number
  readonly size: number
  readonly findAll: boolean
  /** Чи знайдено хоч один збіг. */
  readonly found: boolean
}

export interface LsTrace {
  readonly code: readonly string[]
  readonly frames: readonly LsFrame[]
  readonly result: LsResult
}

const fmt = (a: readonly number[]): string => `[${a.join(", ")}]`

/**
 * Проганяє лінійний пошук на масиві + цілі й збирає trace для плеєра/віджетів:
 * init + по два кадри на кожну перевірку (інтрига + розв'язок) + done. `findAll`
 * перемикає між «перший збіг» (зупинка на першому ✓) та «усі входження»
 * (повний скан зі збором усіх збігів).
 */
export function buildLinearSearchTrace(
  input: readonly number[],
  target: number,
  findAll = false,
  t: Translate = identityTranslate,
): LsTrace {
  const arr = [...input]
  const n = arr.length
  const code = findAll ? FIND_ALL_CODE : LINEAR_CODE
  // Рядки коду гілок (1-based): «return i / result.append(i)» і «return -1 / result».
  const matchLine = findAll ? 5 : 4
  const endLine = findAll ? 6 : 5

  const frames: LsFrame[] = []
  let comparisons = 0
  const matches: number[] = []
  let result = -1

  const push = (
    phase: LsPhase,
    fields: Partial<LsFrame> & {
      cursor: number | null
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
      value: fields.value ?? null,
      match: fields.match ?? null,
      comparisons,
      result,
      matches: [...matches],
      resolvedTo: fields.resolvedTo ?? -1,
      findAll,
      ...fields,
    })
  }

  // init — масив як на вході, нічого не перевірено.
  push("init", {
    cursor: null,
    resolvedTo: -1,
    lines: [1, 2],
    contextLines: [],
    caption: t("play.nLsInit", { arr: fmt(arr), target }),
  })

  for (let i = 0; i < n; i++) {
    const value = arr[i]
    comparisons += 1
    const isMatch = value === target

    // інтрига: курсор став на індекс i, питаємо arr[i] == x?
    push("check", {
      cursor: i,
      value,
      match: null,
      resolvedTo: i - 1,
      lines: [3],
      contextLines: [2],
      caption: t("play.nLsCheck", { k: comparisons, i, value, target }),
    })

    if (isMatch) {
      matches.push(i)
      if (result < 0) result = i
      // розв'язок: збіг ✓.
      push("match", {
        cursor: i,
        value,
        match: true,
        resolvedTo: i,
        lines: [matchLine],
        contextLines: findAll ? [2] : [],
        caption: findAll
          ? t("play.nLsMatchAll", { value, target, i })
          : t("play.nLsMatchFirst", { value, target, i }),
      })
      if (!findAll) break
    } else {
      // розв'язок: не той ✗ → наступний індекс.
      push("reject", {
        cursor: i,
        value,
        match: false,
        resolvedTo: i,
        lines: [2],
        contextLines: [3],
        caption: t("play.nLsReject", { value, target, i, comparisons }),
      })
    }
  }

  const found = matches.length > 0

  // done — підсумок: знайдено (✓) / відсутній (-1) / усі входження.
  if (findAll) {
    push("done", {
      cursor: matches[0] ?? null,
      resolvedTo: n - 1,
      lines: [endLine],
      contextLines: [],
      caption: t("play.nLsDoneAll", {
        target,
        matches: matches.length > 0 ? fmt(matches) : "[]",
        comparisons,
      }),
    })
  } else if (found) {
    push("done", {
      cursor: result,
      resolvedTo: result,
      lines: [matchLine],
      contextLines: [],
      caption: t("play.nLsDoneFound", { target, i: result, comparisons }),
    })
  } else {
    push("done", {
      cursor: null,
      resolvedTo: n - 1,
      lines: [endLine],
      contextLines: [],
      caption: t("play.nLsDoneAbsent", { target, comparisons }),
    })
  }

  const result0: LsResult = {
    input: arr,
    target,
    result,
    matches: [...matches],
    comparisons,
    size: n,
    findAll,
    found,
  }
  return { code, frames, result: result0 }
}
