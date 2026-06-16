// Модель trace для задачі про рюкзак (ДП-версія) — аналог heldKarpTrace.ts.
// Алгоритм проганяється ОДИН раз і пише список незмінних кадрів (KnFrame); UI
// лише рухає курсор по них (scrubbing, крок назад). Формат ДВОРІВНЕВИЙ: зовнішній
// крок — рядок таблиці (предмет i), підкроки — заповнення кожної клітинки K[i][w]
// зліва направо, де й відбувається вибір «взяти / не брати». Після заповнення —
// фаза відновлення набору зворотним проходом по таблиці.
//
// Таблиця ДП ніколи не переписує вже заповнені клітинки, тож знімків не потрібно:
// кадр несе лічильник готових клітинок (`filled`), а сама таблиця лежить у
// `result.table`. Порядок кадрів дослівно повторює knapsack_dp_steps +
// reconstruct_steps Python-оригіналу.

import {
  knapsackDpTable,
  reconstructItems,
  knapsackCells,
  type KnapsackInstance,
  type ReadonlyTable,
} from "@/lib/knapsack"
import { identityTranslate, type Translate } from "@/lib/translate"

/** Лістинг коду для панелі підсвітки (рядок = елемент, 1-based індекси). */
export const KNAPSACK_CODE: readonly string[] = [
  "K = [[0]*(W+1) for _ in range(n+1)]        # таблиця (n+1)×(W+1)",
  "for i in range(n + 1):                     # рядок = перші i предметів",
  "    for w in range(W + 1):                 # стовпець = місткість w",
  "        if i == 0 or w == 0:               # БАЗА: нічого або місця нема",
  "            K[i][w] = 0",
  "        elif wt[i-1] <= w:                 # предмет вміщається",
  "            K[i][w] = max(val[i-1] + K[i-1][w - wt[i-1]],  # взяти",
  "                          K[i-1][w])                       # не брати",
  "        else:                              # не вміщається",
  "            K[i][w] = K[i-1][w]            # значення зверху",
  "answer = K[n][W]                           # ВІДПОВІДЬ — правий нижній кут",
  "w = W                                      # ВІДНОВЛЕННЯ: зворотний хід",
  "for i in range(n, 0, -1):",
  "    if K[i][w] != K[i-1][w]:               # значення змінилось → взято",
  "        chosen.append(i-1); w -= wt[i-1]   # звільняємо вагу предмета",
]

/** Гілка, що спрацювала на клітинці (як у knapsack_dp_steps). */
export type CellKind = "base" | "nofit" | "take" | "skip"

export type KnPhase = "fill" | "backtrack" | "done"

/** Підкрок кадру. Дискримінант — `kind`. */
export type KnSub =
  | { readonly kind: "init" }
  | { readonly kind: "row-open"; readonly row: number }
  | {
      readonly kind: "cell"
      readonly row: number
      readonly col: number
      readonly cellKind: CellKind
      /** Вартість варіанта «взяти» (null, якщо не вміщається або база). */
      readonly take: number | null
      /** Вартість варіанта «не брати» = значення зверху (null у базі). */
      readonly skip: number | null
      readonly value: number
    }
  | { readonly kind: "fill-done"; readonly answer: number }
  | { readonly kind: "bt-open" }
  | {
      readonly kind: "bt-row"
      readonly row: number
      readonly col: number
      readonly taken: boolean
      readonly value: number
      readonly above: number
      readonly colAfter: number
    }
  | { readonly kind: "done"; readonly answer: number }

export interface KnFrame {
  readonly i: number
  readonly sub: KnSub
  readonly phase: KnPhase
  /** Активний рядок i (предмет) або null. */
  readonly row: number | null
  /** Активний стовпець w (місткість) або null. */
  readonly col: number | null
  /** Скільки клітинок заповнено (row-major) ДО активної; UI відкриває поступово. */
  readonly filled: number
  /** Обрані предмети, відомі на цьому кадрі (сортовані за зростанням). */
  readonly chosen: readonly number[]
  /** Поточний стовпець w під час відновлення (інакше null). */
  readonly backW: number | null
  /** Підсвічені рядки коду — поточна дія (1-based у KNAPSACK_CODE). */
  readonly lines: readonly number[]
  /** Рядки-контекст (охопні цикли) — тьмяна підсвітка. */
  readonly contextLines: readonly number[]
  /** Нарація українською. */
  readonly caption: string
}

export interface KnResult {
  readonly itemNames: readonly string[]
  readonly weights: readonly number[]
  readonly values: readonly number[]
  readonly capacity: number
  /** Повна таблиця ДП (n+1)×(W+1). */
  readonly table: ReadonlyTable
  /** Оптимальна вартість K[n][W]. */
  readonly best: number
  /** Відновлений набір обраних предметів (0-базові індекси, за зростанням). */
  readonly chosen: readonly number[]
  /** Кількість клітинок таблиці = (n+1)·(W+1). */
  readonly operations: number
  /** Кількість підмножин у повному переборі = 2ⁿ. */
  readonly bruteSubsets: number
}

export interface KnTrace {
  readonly code: readonly string[]
  readonly itemNames: readonly string[]
  readonly frames: readonly KnFrame[]
  readonly result: KnResult
}

export interface KnRun {
  readonly result: KnResult
  readonly trace: KnTrace
}

/**
 * Проганяє ДП-рюкзак на інстансі й збирає trace для плеєра. Результат
 * (best/chosen) збігається з чистими knapsackDp/reconstructItems.
 */
export function buildKnapsackTrace(
  instance: KnapsackInstance,
  t: Translate = identityTranslate,
): KnRun {
  const itemNames = instance.items.map((it) => it.name)
  const weights = instance.items.map((it) => it.weight)
  const values = instance.items.map((it) => it.value)
  const W = instance.capacity
  const n = weights.length

  const K = knapsackDpTable(weights, values, W)
  const best = K[n][W]
  const chosenFinal = reconstructItems(K, weights, W)

  const cols = W + 1
  const linear = (i: number, w: number): number => i * cols + w
  const totalCells = (n + 1) * cols

  const frames: KnFrame[] = []
  const push = (f: Omit<KnFrame, "i">): void => {
    frames.push({ i: frames.length, ...f })
  }
  const item = (i: number): string => itemNames[i] ?? `#${i}`

  // --- ІНІЦІАЛІЗАЦІЯ ---------------------------------------------------------
  push({
    sub: { kind: "init" },
    phase: "fill",
    row: null,
    col: null,
    filled: 0,
    chosen: [],
    backW: null,
    lines: [1],
    contextLines: [],
    caption: t("play.nKnInit", { w: W, n }),
  })

  // --- ЗАПОВНЕННЯ ТАБЛИЦІ (рядок за рядком, клітинка за клітинкою) -----------
  for (let i = 0; i <= n; i++) {
    push({
      sub: { kind: "row-open", row: i },
      phase: "fill",
      row: i,
      col: null,
      filled: linear(i, 0),
      chosen: [],
      backW: null,
      lines: i === 0 ? [4, 5] : [2],
      contextLines: i === 0 ? [2] : [],
      caption:
        i === 0
          ? t("play.nKnRowBase")
          : t("play.nKnRowOpen", {
              i,
              name: item(i - 1),
              wt: weights[i - 1],
              val: values[i - 1],
            }),
    })

    for (let w = 0; w <= W; w++) {
      let cellKind: CellKind
      let take: number | null = null
      let skip: number | null = null
      let lines: readonly number[]
      let caption: string

      if (i === 0 || w === 0) {
        cellKind = "base"
        lines = [4, 5]
        caption = t("play.nKnBase", { i, w })
      } else if (weights[i - 1] <= w) {
        take = values[i - 1] + K[i - 1][w - weights[i - 1]]
        skip = K[i - 1][w]
        if (take > skip) {
          cellKind = "take"
          lines = [6, 7]
          caption = t("play.nKnTake", {
            i,
            w,
            name: item(i - 1),
            val: values[i - 1],
            rem: w - weights[i - 1],
            take,
            skip,
            value: K[i][w],
          })
        } else {
          cellKind = "skip"
          lines = [6, 8]
          caption = t("play.nKnSkip", {
            i,
            w,
            name: item(i - 1),
            take,
            skip,
            value: K[i][w],
          })
        }
      } else {
        cellKind = "nofit"
        skip = K[i - 1][w]
        lines = [9, 10]
        caption = t("play.nKnNofit", {
          i,
          w,
          name: item(i - 1),
          wt: weights[i - 1],
          value: K[i][w],
        })
      }

      push({
        sub: { kind: "cell", row: i, col: w, cellKind, take, skip, value: K[i][w] },
        phase: "fill",
        row: i,
        col: w,
        filled: linear(i, w),
        chosen: [],
        backW: null,
        lines,
        contextLines: [2, 3],
        caption,
      })
    }
  }

  push({
    sub: { kind: "fill-done", answer: best },
    phase: "fill",
    row: n,
    col: W,
    filled: totalCells,
    chosen: [],
    backW: null,
    lines: [11],
    contextLines: [],
    caption: t("play.nKnFillDone", { n, w: W, best }),
  })

  // --- ВІДНОВЛЕННЯ НАБОРУ (зворотний прохід) --------------------------------
  push({
    sub: { kind: "bt-open" },
    phase: "backtrack",
    row: n,
    col: W,
    filled: totalCells,
    chosen: [],
    backW: W,
    lines: [12],
    contextLines: [],
    caption: t("play.nKnBtOpen", { n, w: W, best }),
  })

  let w = W
  const found: number[] = []
  for (let i = n; i > 0; i--) {
    const value = K[i][w]
    const above = K[i - 1][w]
    const taken = value !== above
    const colAfter = taken ? w - weights[i - 1] : w
    if (taken) found.push(i - 1)
    const chosenSoFar = [...found].sort((a, b) => a - b)
    push({
      sub: { kind: "bt-row", row: i, col: w, taken, value, above, colAfter },
      phase: "backtrack",
      row: i,
      col: w,
      filled: totalCells,
      chosen: chosenSoFar,
      backW: colAfter,
      lines: taken ? [13, 14, 15] : [13, 14],
      contextLines: [13],
      caption: taken
        ? t("play.nKnBtTake", {
            i,
            w,
            value,
            above,
            name: item(i - 1),
            wt: weights[i - 1],
            colAfter,
          })
        : t("play.nKnBtSkip", { i, w, value, above, name: item(i - 1) }),
    })
    w = colAfter
  }

  const chosenSorted = [...found].sort((a, b) => a - b)
  const chosenWeight = chosenSorted.reduce((acc, idx) => acc + weights[idx], 0)
  push({
    sub: { kind: "done", answer: best },
    phase: "done",
    row: null,
    col: null,
    filled: totalCells,
    chosen: chosenSorted,
    backW: null,
    lines: [],
    contextLines: [],
    caption: t("play.nKnDone", {
      best,
      set: chosenSorted.map(item).join(", ") || "∅",
      weight: chosenWeight,
    }),
  })

  const result: KnResult = {
    itemNames,
    weights,
    values,
    capacity: W,
    table: K,
    best,
    chosen: chosenFinal,
    operations: knapsackCells(n, W),
    bruteSubsets: 2 ** n,
  }
  return { result, trace: { code: KNAPSACK_CODE, itemNames, frames, result } }
}
