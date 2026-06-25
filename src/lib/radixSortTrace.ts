// Модель trace для порозрядного сортування. Алгоритм проганяється ОДИН раз (через
// radixSortSteps) і пишемо список незмінних кадрів (RxFrame) — по одному на КОЖНУ
// подію журналу (init → (pass_start → distribute* → gather)* → final). UI лише
// рухає курсор. Кожен кадр несе знімок масиву, стан 10 кошиків, активну фішку, що
// падає, поточний розряд (digitIndex/position), ширину доповнення (maxDigits),
// активні підсвітки й рядки коду. Порозрядне НЕ порівнює елементи — лічильники це
// проходи й розкладання. Сигнатурний образ — кошики 0–9 і фішки з підсвіченою
// цифрою (а не стовпчики, як у сортуваннях на основі порівнянь).

import {
  radixSortSteps,
  countOperations,
  maxDigits,
  BASE,
  type RadixEvent,
} from "@/lib/radixSort"
import { formatArray as fmt } from "@/lib/arrayUtils"
import { identityTranslate, type Translate } from "@/lib/translate"
import type { SortFrameBase } from "@/lib/traceFrame"

/** Лістинг для панелі підсвітки (1-based рядки). Наочна версія з кошиками. */
export const RADIX_CODE: readonly string[] = [
  "def radix_sort(arr):                 # LSD: від молодшого розряду до старшого",
  "    a = list(arr)",
  "    for d in range(max_digits(a)):   # розряд за розрядом",
  "        buckets = [[] for _ in range(10)]   # 10 порожніх кошиків 0–9",
  "        for x in a:                  # кожне число",
  "            digit = x // 10 ** d % 10   # цифра поточного розряду",
  "            buckets[digit].append(x)    # у кошик за цифрою",
  "        a = [x for b in buckets for x in b]  # склеюємо кошики 0→9",
  "    return a",
]

/** Фаза кадру для бейджа в нарації. */
export type RxPhase = "init" | "pass" | "distribute" | "gather" | "done"

export interface RxFrame extends SortFrameBase {
  readonly phase: RxPhase
  /** Знімок масиву на цьому кадрі (джерело проходу або зібраний результат). */
  readonly array: readonly number[]
  /** Індекс розряду (0 — одиниці) або null поза проходом. */
  readonly digitIndex: number | null
  /** Позиція розряду (1, 10, 100…) або null. */
  readonly position: number | null
  /** Ширина доповнення нулями (кількість розрядів максимуму) — для фішок. */
  readonly maxDigits: number
  /** Стан усіх 10 кошиків на цьому кадрі. */
  readonly buckets: readonly (readonly number[])[]
  /** Індекс елемента у джерелі, що ЗАРАЗ падає в кошик (червоний) або null. */
  readonly activeIndex: number | null
  /** Значення фішки, що падає, або null. */
  readonly activeValue: number | null
  /** Кошик, у який падає фішка (підсвічений) або null. */
  readonly activeBucket: number | null
  /** Масив — це зібраний/відсортований результат (рендеримо зеленим). */
  readonly gathered: boolean
  readonly passes: number
  readonly distributions: number
}

export interface RxResult {
  readonly input: readonly number[]
  readonly sorted: readonly number[]
  readonly passes: number
  readonly distributions: number
  /** Порозрядне не порівнює елементи — завжди 0. */
  readonly comparisons: number
  readonly maxDigits: number
  readonly base: number
  readonly size: number
}

export interface RxTrace {
  readonly code: readonly string[]
  readonly frames: readonly RxFrame[]
  readonly result: RxResult
}

/** Назва розряду українською мовою для нарації (одиниці / десятки / …). */
const placeName = (digitIndex: number, t: Translate): string =>
  t(`play.rxPlace${Math.min(digitIndex, 3)}` as string)

const EMPTY_BUCKETS: readonly (readonly number[])[] = Array.from(
  { length: BASE },
  () => [],
)

/**
 * Проганяє порозрядне сортування на масиві й збирає trace для плеєра/віджетів:
 * по кадру на кожну подію журналу + підсумок.
 */
export function buildRadixSortTrace(
  input: readonly number[],
  t: Translate = identityTranslate,
): RxTrace {
  const { sorted, events } = radixSortSteps(input)
  const width = Math.max(1, maxDigits(input))
  const frames: RxFrame[] = events.map((ev, i) => ({
    i, ...frameFor(ev, width, t),
  }))

  const counts = countOperations(input)
  const result: RxResult = {
    input, sorted,
    passes: counts.passes, distributions: counts.distributions,
    comparisons: 0, maxDigits: width, base: BASE, size: input.length,
  }
  return { code: RADIX_CODE, frames, result }
}

/** Перетворює одну подію журналу на кадр (рядки коду + нарація). */
function frameFor(
  ev: RadixEvent,
  width: number,
  t: Translate,
): Omit<RxFrame, "i"> {
  const common = {
    array: ev.array,
    digitIndex: ev.digitIndex,
    position: ev.position,
    maxDigits: width,
    buckets: ev.buckets ?? EMPTY_BUCKETS,
    activeIndex: null as number | null,
    activeValue: null as number | null,
    activeBucket: null as number | null,
    gathered: false,
    passes: ev.passes,
    distributions: ev.distributions,
  }

  switch (ev.kind) {
    case "init":
      return {
        ...common, phase: "init",
        lines: [2], contextLines: [],
        caption: t("play.nRxInit", { arr: fmt(ev.array), digits: width }),
      }
    case "pass_start":
      return {
        ...common, phase: "pass",
        lines: [3, 4], contextLines: [],
        caption: t("play.nRxPass", {
          place: placeName(ev.digitIndex ?? 0, t),
          position: ev.position ?? 1,
        }),
      }
    case "distribute":
      return {
        ...common, phase: "distribute",
        activeIndex: ev.i ?? null,
        activeValue: ev.value ?? null,
        activeBucket: ev.bucket ?? null,
        lines: [6, 7], contextLines: [3, 5],
        caption: t("play.nRxDistribute", {
          value: ev.value ?? 0, bucket: ev.bucket ?? 0,
          place: placeName(ev.digitIndex ?? 0, t),
          distributions: ev.distributions,
        }),
      }
    case "gather":
      return {
        ...common, phase: "gather", gathered: true,
        lines: [8], contextLines: [3],
        caption: t("play.nRxGather", {
          place: placeName(ev.digitIndex ?? 0, t),
          arr: fmt(ev.array),
        }),
      }
    case "final":
      return {
        ...common, phase: "done", gathered: true,
        lines: [9], contextLines: [],
        caption: t("play.nRxDone", {
          arr: fmt(ev.array),
          passes: ev.passes, distributions: ev.distributions,
        }),
      }
  }
}
