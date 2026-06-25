// Модель trace для пірамідального сортування. Алгоритм проганяється ОДИН раз (через
// heapSortSteps) і пишемо список незмінних кадрів (HpFrame) — по одному на КОЖНУ
// подію журналу. UI лише рухає курсор. Кожен кадр несе знімок масиву, розмір купи
// (межа «купа / відсортоване»), активний вузол просіювання, дитину порівняння, пару
// обміну та рядки коду. РЕЖИМ = напрям: asc (max-купа) / desc (min-купа) — впливає на
// лістинг (> проти <), нарацію й результат; структура кадрів однакова.

import {
  heapSortSteps,
  countOperations,
  type HeapOrder,
  type HeapEvent,
} from "@/lib/heapSort"
import { formatArray as fmt } from "@/lib/arrayUtils"
import { identityTranslate, type Translate } from "@/lib/translate"
import type { SortFrameBase } from "@/lib/traceFrame"

/** Лістинг max-купи (asc): просіювання шукає НАЙБІЛЬШУ дитину. 1-based рядки. */
export const MAX_HEAP_CODE: readonly string[] = [
  "def heapify(a, n, i):        # просіюємо вузол i вниз у купі розміру n",
  "    largest = i",
  "    l, r = 2*i + 1, 2*i + 2",
  "    if l < n and a[l] > a[largest]:   # ліва дитина більша?",
  "        largest = l",
  "    if r < n and a[r] > a[largest]:   # права дитина більша?",
  "        largest = r",
  "    if largest != i:                  # батько менший за дитину →",
  "        a[i], a[largest] = a[largest], a[i]   # піднімаємо дитину",
  "        heapify(a, n, largest)",
  "",
  "def heap_sort(a):",
  "    n = len(a)",
  "    for i in range(n // 2 - 1, -1, -1):   # 1) побудова max-купи",
  "        heapify(a, n, i)",
  "    for end in range(n - 1, 0, -1):       # 2) сортування",
  "        a[0], a[end] = a[end], a[0]       # корінь → у кінець",
  "        heapify(a, end, 0)                # відновлюємо купу",
  "    return a",
]

/** Лістинг min-купи (desc): просіювання шукає НАЙМЕНШУ дитину. */
export const MIN_HEAP_CODE: readonly string[] = [
  "def heapify(a, n, i):        # просіюємо вузол i вниз у купі розміру n",
  "    smallest = i",
  "    l, r = 2*i + 1, 2*i + 2",
  "    if l < n and a[l] < a[smallest]:  # ліва дитина менша?",
  "        smallest = l",
  "    if r < n and a[r] < a[smallest]:  # права дитина менша?",
  "        smallest = r",
  "    if smallest != i:                 # батько більший за дитину →",
  "        a[i], a[smallest] = a[smallest], a[i] # піднімаємо дитину",
  "        heapify(a, n, smallest)",
  "",
  "def heap_sort(a):",
  "    n = len(a)",
  "    for i in range(n // 2 - 1, -1, -1):   # 1) побудова min-купи",
  "        heapify(a, n, i)",
  "    for end in range(n - 1, 0, -1):       # 2) сортування",
  "        a[0], a[end] = a[end], a[0]       # корінь → у кінець",
  "        heapify(a, end, 0)                # відновлюємо купу",
  "    return a",
]

// Спільна для обох лістингів мапа рядків (структура ідентична).
const L = {
  n: 13,
  buildFor: 14,
  buildCall: 15,
  largest: 2,
  children: 3,
  compare: [4, 5, 6, 7],
  ifSwap: 8,
  doSwap: [8, 9, 10],
  sortFor: 16,
  extract: 17,
  ret: 19,
} as const

/** Фаза кадру для бейджа в нарації. */
export type HpPhase = "init" | "build" | "sift" | "compare" | "swap" | "extract" | "done"

export interface HpFrame extends SortFrameBase {
  readonly phase: HpPhase
  readonly stage: "build" | "sort"
  /** Знімок масиву на цьому кадрі. */
  readonly array: readonly number[]
  /** Розмір купи: [0..heapSize) — у купі, [heapSize..n) — відсортовані. */
  readonly heapSize: number
  /** Поточний вузол просіювання (кільце) або null. */
  readonly siftNode: number | null
  /** Дитина, яку порівнюємо (бурштинова) або null. */
  readonly compareChild: number | null
  /** Пара обміну [swapA, swapB] (червоні) або null. */
  readonly swapA: number | null
  readonly swapB: number | null
  /** Чи це extract-обмін кореня з останнім елементом купи (фіолетовий). */
  readonly isExtract: boolean
  /** Усі стовпчики/вузли зелені (фінал). */
  readonly sortedAll: boolean
  readonly comparisons: number
  readonly swaps: number
}

export interface HpResult {
  readonly input: readonly number[]
  readonly sorted: readonly number[]
  readonly comparisons: number
  readonly swaps: number
  readonly order: HeapOrder
  readonly size: number
}

export interface HpTrace {
  readonly code: readonly string[]
  readonly frames: readonly HpFrame[]
  readonly result: HpResult
  readonly order: HeapOrder
}

/**
 * Проганяє пірамідальне сортування на масиві з обраним напрямом і збирає trace для
 * плеєра/віджетів: по кадру на кожну подію журналу + підсумок.
 */
export function buildHeapSortTrace(
  input: readonly number[],
  order: HeapOrder = "asc",
  t: Translate = identityTranslate,
): HpTrace {
  const { sorted, events } = heapSortSteps(input, order)
  const frames: HpFrame[] = events.map((ev, i) => ({ i, ...frameFor(ev, order, input.length, t) }))
  const counts = countOperations(input, order)
  const result: HpResult = {
    input,
    sorted,
    comparisons: counts.comparisons,
    swaps: counts.swaps,
    order,
    size: input.length,
  }
  return { code: order === "asc" ? MAX_HEAP_CODE : MIN_HEAP_CODE, frames, result, order }
}

/** Перетворює одну подію журналу на кадр (рядки коду + нарація). */
function frameFor(
  ev: HeapEvent,
  order: HeapOrder,
  n: number,
  t: Translate,
): Omit<HpFrame, "i"> {
  const asc = order === "asc"
  const common = {
    stage: ev.stage,
    array: ev.array,
    heapSize: ev.heapSize,
    siftNode: ev.node,
    compareChild: null as number | null,
    swapA: null as number | null,
    swapB: null as number | null,
    isExtract: false,
    sortedAll: false,
    comparisons: ev.comparisons,
    swaps: ev.swaps,
  }

  switch (ev.kind) {
    case "init":
      return {
        ...common,
        phase: "init",
        siftNode: null,
        lines: [L.n],
        contextLines: [],
        caption: t(asc ? "play.nHpInitMax" : "play.nHpInitMin", { arr: fmt(ev.array) }),
      }
    case "build_start":
      return {
        ...common,
        phase: "build",
        siftNode: null,
        lines: [L.buildFor],
        contextLines: [],
        caption: t("play.nHpBuildStart", { last: Math.floor(n / 2) - 1 }),
      }
    case "sift_start":
      return {
        ...common,
        phase: "sift",
        lines: [L.largest, L.children],
        contextLines: [ev.stage === "build" ? L.buildCall : L.extract],
        caption: t(ev.stage === "build" ? "play.nHpSiftBuild" : "play.nHpSiftSort", {
          node: ev.node ?? 0,
          value: ev.array[ev.node ?? 0] ?? 0,
          size: ev.heapSize,
        }),
      }
    case "compare": {
      const node = ev.node ?? 0
      const child = ev.child ?? 0
      const up = ev.willSwap === true
      const key = up
        ? asc
          ? "play.nHpUpMax"
          : "play.nHpUpMin"
        : asc
          ? "play.nHpStopMax"
          : "play.nHpStopMin"
      return {
        ...common,
        phase: "compare",
        compareChild: child,
        lines: [...L.compare],
        contextLines: [ev.stage === "build" ? L.buildCall : L.extract],
        caption: t(key, {
          node,
          child,
          nv: ev.array[node] ?? 0,
          cv: ev.array[child] ?? 0,
        }),
      }
    }
    case "swap":
      return {
        ...common,
        phase: "swap",
        swapA: ev.swapFrom,
        swapB: ev.swapTo,
        lines: [...L.doSwap],
        contextLines: [ev.stage === "build" ? L.buildCall : L.extract],
        caption: t("play.nHpSwap", {
          from: ev.swapFrom ?? 0,
          to: ev.swapTo ?? 0,
          fv: ev.array[ev.swapFrom ?? 0] ?? 0,
          tv: ev.array[ev.swapTo ?? 0] ?? 0,
        }),
      }
    case "sift_end":
      return {
        ...common,
        phase: "sift",
        lines: [L.ifSwap],
        contextLines: [],
        caption: t("play.nHpSiftEnd"),
      }
    case "build_end":
      return {
        ...common,
        phase: "build",
        siftNode: null,
        lines: [L.sortFor],
        contextLines: [],
        caption: t(asc ? "play.nHpBuildEndMax" : "play.nHpBuildEndMin", {
          root: ev.array[0] ?? 0,
        }),
      }
    case "extract":
      return {
        ...common,
        phase: "extract",
        siftNode: null,
        swapA: ev.extractFrom,
        swapB: ev.extractTo,
        isExtract: true,
        lines: [L.extract],
        contextLines: [L.sortFor],
        caption: t(asc ? "play.nHpExtractMax" : "play.nHpExtractMin", {
          root: ev.array[ev.extractTo ?? 0] ?? 0,
          end: ev.extractTo ?? 0,
          size: ev.heapSize,
        }),
      }
    case "final":
      return {
        ...common,
        phase: "done",
        siftNode: null,
        sortedAll: true,
        lines: [L.ret],
        contextLines: [],
        caption: t("play.nHpDone", {
          arr: fmt(ev.array),
          comparisons: ev.comparisons,
          swaps: ev.swaps,
        }),
      }
  }
}
