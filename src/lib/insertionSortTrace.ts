// Модель trace для сортування вставками — аналог bubbleSortTrace.ts. Алгоритм
// проганяється ОДИН раз (через insertionSortSteps) і пишемо список незмінних
// кадрів (InsFrame); UI лише рухає курсор по них. Кожен кадр несе знімок масиву,
// довжину відсортованого префікса, «дірку», key «в руці», активні підсвітки
// (порівняння/зсув) і рядки коду. Порядок кадрів дослівно повторює журнал подій:
//  - лінійна: init → (take → compare* → insert)* → done;
//  - бінарна: init → (take → probe* → shift* → insert)* → done.

import {
  insertionSortSteps,
  maxComparisons,
  type InsertionEvent,
} from "@/lib/insertionSort"
import { identityTranslate, type Translate } from "@/lib/translate"

/** Лістинг лінійної версії для панелі підсвітки (1-based рядки). */
export const LINEAR_CODE: readonly string[] = [
  "def insertion_sort(lst):",
  "    for i in range(1, len(lst)):       # елементи несортованого суфікса",
  "        key = lst[i]                   # беремо key «у руку»",
  "        j = i - 1                      # правий край префікса",
  "        while j >= 0 and key < lst[j]: # доки префікс більший за key",
  "            lst[j + 1] = lst[j]        # зсуваємо більший елемент праворуч",
  "            j -= 1",
  "        lst[j + 1] = key               # вставка у звільнену позицію",
  "    return lst",
]

/** Лістинг бінарної версії (пошук місця двійковим пошуком). */
export const BINARY_CODE: readonly string[] = [
  "def insertion_sort_binary(lst):",
  "    for i in range(1, len(lst)):",
  "        cur = lst[i]                       # беремо key «у руку»",
  "        pos = bisect_right(lst, cur, 0, i) # двійковий пошук місця",
  "        j = i",
  "        while j > pos:                     # зсуваємо блок праворуч",
  "            lst[j] = lst[j - 1]",
  "            j -= 1",
  "        lst[pos] = cur                     # вставка",
  "    return lst",
]

/** Фаза кадру для бейджа в нарації. */
export type InsPhase = "key" | "scan" | "insert" | "done"

/** Підкрок кадру. Дискримінант — `kind` (дзеркалить InsertionEvent). */
export type InsSub =
  | { readonly kind: "init" }
  | { readonly kind: "take"; readonly key: number }
  | {
      readonly kind: "compare"
      readonly j: number
      readonly compared: number
      readonly shifted: boolean
    }
  | {
      readonly kind: "probe"
      readonly mid: number
      readonly compared: number
      readonly goLeft: boolean
    }
  | { readonly kind: "shift"; readonly from: number; readonly to: number }
  | { readonly kind: "insert"; readonly at: number }
  | { readonly kind: "done" }

export interface InsFrame {
  /** Порядковий індекс кадру. */
  readonly i: number
  readonly sub: InsSub
  readonly phase: InsPhase
  /** Знімок масиву на цьому кадрі. */
  readonly array: readonly number[]
  /** Номер зовнішньої ітерації або null. */
  readonly pass: number | null
  /** Довжина відсортованого префікса (зелена межа ліворуч). */
  readonly prefixLen: number
  /** Індекс «дірки» (пунктир) або null. */
  readonly hole: number | null
  /** key «в руці» (плаваючий бурштиновий стовпчик) або null. */
  readonly key: number | null
  /** Індекс елемента, який ЗАРАЗ порівнюють/перевіряють (бурштиновий) або null. */
  readonly compareAt: number | null
  /** Індекс елемента, який щойно ЗСУНУЛИ (червоний) або null. */
  readonly shiftAt: number | null
  readonly comparisons: number
  readonly shifts: number
  /** Підсвічені рядки коду (1-based у CODE). */
  readonly lines: readonly number[]
  /** Рядки-контекст (охопні цикли) — тьмяна підсвітка. */
  readonly contextLines: readonly number[]
  /** Нарація. */
  readonly caption: string
}

export interface InsResult {
  readonly input: readonly number[]
  readonly sorted: readonly number[]
  readonly comparisons: number
  readonly shifts: number
  readonly insertions: number
  /** Чи це бінарна версія. */
  readonly binary: boolean
  readonly size: number
  /** Порівнянь у лінійній версії в гіршому випадку: n(n−1)/2 — для «ціни». */
  readonly maxComparisons: number
}

export interface InsTrace {
  readonly code: readonly string[]
  readonly frames: readonly InsFrame[]
  readonly result: InsResult
  readonly binary: boolean
}

const fmtArray = (a: readonly number[]): string => `[${a.join(", ")}]`

/**
 * Проганяє сортування вставками на масиві й збирає trace для плеєра. Результат
 * (sorted/comparisons/shifts/insertions) збігається з чистим insertionSort(Binary).
 */
export function buildInsertionSortTrace(
  input: readonly number[],
  binary = false,
  t: Translate = identityTranslate,
): InsTrace {
  const { sorted, events } = insertionSortSteps(input, binary)
  const code = binary ? BINARY_CODE : LINEAR_CODE
  const n = input.length

  const frames: InsFrame[] = []
  for (const ev of events) {
    frames.push({ i: frames.length, ...frameFor(ev, binary, n, t) })
  }

  const last = events[events.length - 1]
  const insertions = events.filter((e) => e.kind === "insert").length
  const result: InsResult = {
    input,
    sorted,
    comparisons: last.comparisons,
    shifts: last.shifts,
    insertions,
    binary,
    size: n,
    maxComparisons: maxComparisons(n),
  }
  return { code, frames, result, binary }
}

/** Перетворює одну подію журналу на кадр (рядки коду + нарація). */
function frameFor(
  ev: InsertionEvent,
  binary: boolean,
  n: number,
  t: Translate,
): Omit<InsFrame, "i"> {
  const common = {
    array: ev.array,
    pass: ev.i,
    prefixLen: ev.prefixLen,
    hole: ev.hole,
    key: ev.key,
    comparisons: ev.comparisons,
    shifts: ev.shifts,
  }

  switch (ev.kind) {
    case "init":
      return {
        ...common,
        sub: { kind: "init" },
        phase: "scan",
        compareAt: null,
        shiftAt: null,
        lines: [2],
        contextLines: [],
        caption: t("play.nIsInit", { arr: fmtArray(ev.array), n }),
      }

    case "take":
      return {
        ...common,
        sub: { kind: "take", key: ev.key ?? 0 },
        phase: "key",
        compareAt: null,
        shiftAt: null,
        lines: binary ? [3, 5] : [3, 4],
        contextLines: [2],
        caption: t("play.nIsTake", {
          i: ev.i ?? 0,
          key: ev.key ?? 0,
          pos: ev.takenFrom,
          prefix: ev.prefixLen,
        }),
      }

    case "compare":
      return {
        ...common,
        sub: { kind: "compare", j: ev.comparedAt, compared: ev.compared, shifted: ev.shifted },
        phase: "scan",
        // Зсунутий елемент тепер стоїть на j+1 (червоний); зупинне порівняння —
        // елемент на j лишається на місці (бурштиновий).
        compareAt: ev.shifted ? null : ev.comparedAt,
        shiftAt: ev.shifted ? ev.comparedAt + 1 : null,
        lines: ev.shifted ? [5, 6, 7] : [5],
        contextLines: [2],
        caption: t(ev.shifted ? "play.nIsShift" : "play.nIsStop", {
          i: ev.i ?? 0,
          j: ev.comparedAt,
          key: ev.key ?? 0,
          compared: ev.compared,
          comparisons: ev.comparisons,
          shifts: ev.shifts,
        }),
      }

    case "probe":
      return {
        ...common,
        sub: { kind: "probe", mid: ev.mid, compared: ev.compared, goLeft: ev.goLeft },
        phase: "scan",
        compareAt: ev.mid,
        shiftAt: null,
        lines: [4],
        contextLines: [2],
        caption: t(ev.goLeft ? "play.nIsProbeLeft" : "play.nIsProbeRight", {
          i: ev.i ?? 0,
          mid: ev.mid,
          compared: ev.compared,
          key: ev.key ?? 0,
          comparisons: ev.comparisons,
        }),
      }

    case "shift":
      return {
        ...common,
        sub: { kind: "shift", from: ev.from, to: ev.to },
        phase: "scan",
        compareAt: null,
        shiftAt: ev.to,
        lines: [6, 7, 8],
        contextLines: [2],
        caption: t("play.nIsBShift", {
          i: ev.i ?? 0,
          value: ev.array[ev.to] ?? 0,
          from: ev.from,
          to: ev.to,
          shifts: ev.shifts,
        }),
      }

    case "insert":
      return {
        ...common,
        sub: { kind: "insert", at: ev.insertAt },
        phase: "insert",
        compareAt: null,
        shiftAt: null,
        lines: binary ? [9] : [8],
        contextLines: [2],
        caption: t("play.nIsInsert", {
          i: ev.i ?? 0,
          key: ev.array[ev.insertAt] ?? 0,
          at: ev.insertAt,
          prefix: ev.prefixLen,
        }),
      }

    case "final":
      return {
        ...common,
        sub: { kind: "done" },
        phase: "done",
        compareAt: null,
        shiftAt: null,
        lines: binary ? [10] : [9],
        contextLines: [],
        caption: t("play.nIsDone", {
          arr: fmtArray(ev.array),
          comparisons: ev.comparisons,
          shifts: ev.shifts,
          insertions: Math.max(0, n - 1),
        }),
      }
  }
}
