// Модель trace для сортування прямим вибором — аналог insertionSortTrace.ts.
// Алгоритм проганяється ОДИН раз (через selectionSortSteps) і пишемо список
// незмінних кадрів (SelFrame); UI лише рухає курсор по них. Кожен кадр несе
// знімок масиву, межу відсортованого префікса, «біжучий мінімум», активні
// підсвітки (порівняння/обмін/зсув) і рядки коду. Порядок кадрів дослівно
// повторює журнал подій:
//  - стандартна: init → (passStart → compare* → swap)* → done;
//  - стабільна:  init → (passStart → compare* → shift* → place)* → done.

import {
  selectionSortSteps,
  maxComparisons,
  type SelectionEvent,
} from "@/lib/selectionSort"
import { identityTranslate, type Translate } from "@/lib/translate"

/** Лістинг стандартної версії для панелі підсвітки (1-based рядки). */
export const STANDARD_CODE: readonly string[] = [
  "def selection_sort(arr):",
  "    n = len(arr)",
  "    for i in range(n):                # проходи: межа префікса",
  "        min_idx = i                   # кандидат-мінімум",
  "        for j in range(i + 1, n):     # скануємо весь суфікс",
  "            if arr[j] < arr[min_idx]: # знайшли менший?",
  "                min_idx = j           # «біжучий мінімум» перестрибує",
  "        arr[i], arr[min_idx] = arr[min_idx], arr[i]  # один обмін",
  "    return arr",
]

/** Лістинг стабільної версії (зсув блоку замість обміну). */
export const STABLE_CODE: readonly string[] = [
  "def selection_sort_stable(lst):",
  "    n = len(lst)",
  "    for i in range(n):",
  "        min_idx = i",
  "        for j in range(i + 1, n):",
  "            if lst[j] < lst[min_idx]:",
  "                min_idx = j",
  "        min_val = lst[min_idx]        # виймаємо мінімум",
  "        while min_idx > i:            # зсуваємо блок праворуч",
  "            lst[min_idx] = lst[min_idx - 1]",
  "            min_idx -= 1",
  "        lst[i] = min_val              # вставка на межу префікса",
  "    return lst",
]

/** Фаза кадру для бейджа в нарації. */
export type SelPhase = "scan" | "place" | "done"

/** Підкрок кадру. Дискримінант — `kind` (дзеркалить SelectionEvent). */
export type SelSub =
  | { readonly kind: "init" }
  | { readonly kind: "passStart"; readonly minVal: number }
  | {
      readonly kind: "compare"
      readonly j: number
      readonly jVal: number
      readonly candVal: number
      readonly newMin: boolean
    }
  | { readonly kind: "swap"; readonly a: number; readonly b: number; readonly selfSwap: boolean }
  | { readonly kind: "shift"; readonly from: number; readonly to: number }
  | { readonly kind: "place"; readonly at: number }
  | { readonly kind: "done" }

export interface SelFrame {
  /** Порядковий індекс кадру. */
  readonly i: number
  readonly sub: SelSub
  readonly phase: SelPhase
  /** Знімок масиву на цьому кадрі. */
  readonly array: readonly number[]
  /** Номер зовнішнього проходу або null. */
  readonly pass: number | null
  /** Межа відсортованого префікса (зелена межа ліворуч). */
  readonly sortedTo: number
  /** Індекс «біжучого мінімуму» (бурштиновий) або null. */
  readonly minIdx: number | null
  /** Індекс курсора j, що сканує суфікс (фіолетовий ▲) або null. */
  readonly cursor: number | null
  /** Індекс елемента, що став на місце (синій) або null. */
  readonly placedAt: number | null
  /** Індекс елемента пари обміну / щойно зсунутого (червоний) або null. */
  readonly swapAt: number | null
  /** Індекс «дірки» (пунктир, стабільна версія) або null. */
  readonly hole: number | null
  /** Значення мінімуму «в руці» (плаваючий бурштиновий, стабільна версія) або null. */
  readonly keyValue: number | null
  readonly comparisons: number
  readonly swaps: number
  readonly writes: number
  /** Підсвічені рядки коду (1-based у CODE). */
  readonly lines: readonly number[]
  /** Рядки-контекст (охопні цикли) — тьмяна підсвітка. */
  readonly contextLines: readonly number[]
  /** Нарація. */
  readonly caption: string
}

export interface SelResult {
  readonly input: readonly number[]
  readonly sorted: readonly number[]
  readonly comparisons: number
  /** Справжні обміни (стандартна версія, ≤ n−1). */
  readonly swaps: number
  /** Записи в масив (стабільна версія, O(n²)). */
  readonly writes: number
  readonly passes: number
  /** Чи це стабільна версія (зсув замість обміну). */
  readonly stable: boolean
  readonly size: number
  /** Порівнянь у будь-якому випадку: n(n−1)/2 (метод НЕ адаптивний). */
  readonly maxComparisons: number
}

export interface SelTrace {
  readonly code: readonly string[]
  readonly frames: readonly SelFrame[]
  readonly result: SelResult
  readonly stable: boolean
}

const fmtArray = (a: readonly number[]): string => `[${a.join(", ")}]`

/**
 * Проганяє сортування прямим вибором на масиві й збирає trace для плеєра.
 * Результат (sorted/comparisons/swaps/writes) збігається з чистим
 * selectionSort(Stable).
 */
export function buildSelectionSortTrace(
  input: readonly number[],
  stable = false,
  t: Translate = identityTranslate,
): SelTrace {
  const { sorted, events } = selectionSortSteps(input, stable)
  const code = stable ? STABLE_CODE : STANDARD_CODE
  const n = input.length

  const frames: SelFrame[] = []
  for (const ev of events) {
    frames.push({ i: frames.length, ...frameFor(ev, stable, n, t) })
  }

  const last = events[events.length - 1]
  const result: SelResult = {
    input,
    sorted,
    comparisons: last.comparisons,
    swaps: last.swaps,
    writes: last.writes,
    passes: n,
    stable,
    size: n,
    maxComparisons: maxComparisons(n),
  }
  return { code, frames, result, stable }
}

/** Перетворює одну подію журналу на кадр (рядки коду + нарація). */
function frameFor(
  ev: SelectionEvent,
  stable: boolean,
  n: number,
  t: Translate,
): Omit<SelFrame, "i"> {
  const common = {
    array: ev.array,
    pass: ev.pass,
    sortedTo: ev.sortedTo,
    comparisons: ev.comparisons,
    swaps: ev.swaps,
    writes: ev.writes,
  }
  const blank = {
    minIdx: null,
    cursor: null,
    placedAt: null,
    swapAt: null,
    hole: null,
    keyValue: null,
  }

  switch (ev.kind) {
    case "init":
      return {
        ...common,
        ...blank,
        sub: { kind: "init" },
        phase: "scan",
        lines: [3],
        contextLines: [2],
        caption: t("play.nSsInit", { arr: fmtArray(ev.array), n }),
      }

    case "passStart":
      return {
        ...common,
        ...blank,
        minIdx: ev.minIdx,
        sub: { kind: "passStart", minVal: ev.minVal },
        phase: "scan",
        lines: [3, 4],
        contextLines: [2],
        caption: t("play.nSsPassStart", {
          i: ev.pass ?? 0,
          minVal: ev.minVal,
          prefix: ev.sortedTo,
        }),
      }

    case "compare":
      return {
        ...common,
        ...blank,
        minIdx: ev.minIdx,
        cursor: ev.comparedAt,
        sub: {
          kind: "compare",
          j: ev.comparedAt,
          jVal: ev.jVal,
          candVal: ev.candVal,
          newMin: ev.newMin,
        },
        phase: "scan",
        lines: ev.newMin ? [6, 7] : [6],
        contextLines: [3, 5],
        caption: t(ev.newMin ? "play.nSsNewMin" : "play.nSsKeepMin", {
          i: ev.pass ?? 0,
          j: ev.comparedAt,
          jVal: ev.jVal,
          candVal: ev.candVal,
          minIdx: ev.minIdx ?? 0,
          comparisons: ev.comparisons,
        }),
      }

    case "swap":
      return {
        ...common,
        ...blank,
        placedAt: ev.a,
        swapAt: ev.selfSwap ? null : ev.b,
        sub: { kind: "swap", a: ev.a, b: ev.b, selfSwap: ev.selfSwap },
        phase: "place",
        lines: [8],
        contextLines: [3],
        caption: ev.selfSwap
          ? t("play.nSsSelfSwap", { i: ev.a, swaps: ev.swaps })
          : t("play.nSsSwap", {
              i: ev.a,
              minIdx: ev.b,
              placed: ev.placed,
              swaps: ev.swaps,
            }),
      }

    case "shift":
      return {
        ...common,
        ...blank,
        swapAt: ev.to,
        hole: ev.from,
        keyValue: ev.held,
        sub: { kind: "shift", from: ev.from, to: ev.to },
        phase: "place",
        lines: [9, 10, 11],
        contextLines: [3],
        caption: t("play.nSsShift", {
          i: ev.pass ?? 0,
          value: ev.array[ev.to] ?? 0,
          from: ev.from,
          to: ev.to,
          held: ev.held,
          writes: ev.writes,
        }),
      }

    case "place":
      return {
        ...common,
        ...blank,
        placedAt: ev.at,
        sub: { kind: "place", at: ev.at },
        phase: "place",
        lines: [12],
        contextLines: [3],
        caption: t("play.nSsPlace", {
          i: ev.pass ?? 0,
          value: ev.value,
          at: ev.at,
          prefix: ev.sortedTo,
          writes: ev.writes,
        }),
      }

    case "final":
      return {
        ...common,
        ...blank,
        sub: { kind: "done" },
        phase: "done",
        lines: stable ? [13] : [9],
        contextLines: [],
        caption: stable
          ? t("play.nSsDoneStable", {
              arr: fmtArray(ev.array),
              comparisons: ev.comparisons,
              writes: ev.writes,
              passes: n,
            })
          : t("play.nSsDone", {
              arr: fmtArray(ev.array),
              comparisons: ev.comparisons,
              swaps: ev.swaps,
              passes: n,
            }),
      }
  }
}
