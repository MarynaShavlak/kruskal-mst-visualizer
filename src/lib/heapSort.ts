// Пірамідальне сортування (Heap Sort): сортування через структуру даних КУПА (heap)
// — двійкове дерево в масиві, де КОЖЕН батько «сильніший» за дітей. Для масиву
// дитина вузла `i` живе на індексах `2i+1` і `2i+2`, батько — на `(i-1)//2`; тож
// дерево НЕ зберігається окремо — це сам масив, прочитаний за рівнями.
//
// Алгоритм має дві фази:
//   1) ПОБУДОВА КУПИ (heapify знизу вгору): від останнього батька `n//2-1` до кореня
//      просіюємо кожен вузол вниз (sift-down) — масив стає купою за O(n).
//   2) СОРТУВАННЯ: корінь (екстремум) міняємо з останнім елементом купи, відкидаємо
//      його у відсортовану зону, зменшуємо купу на 1 і відновлюємо її просіюванням
//      кореня вниз. Повторюємо, доки купа не спорожніє.
//
// РЕЖИМ = напрям: `asc` (зростання) будує MAX-купу (найбільше зверху → у кінець),
// `desc` (спадання) будує MIN-купу. Складність — Θ(n·log n) у НАЙКРАЩОМУ, середньому
// й найгіршому (не залежить від даних). Сортування НА МІСЦІ (O(1) пам'яті), НЕстабільне.
// Фреймворк-незалежне ядро (без React) — порт ідеї heap_sort із конспекту GoIT.

/** Напрям сортування (режим плеєра): asc → max-купа, desc → min-купа. */
export const HEAP_ORDERS = ["asc", "desc"] as const
export type HeapOrder = (typeof HEAP_ORDERS)[number]

/** Індекс батька вузла `i` у масиві-купі. */
export const parentOf = (i: number): number => Math.floor((i - 1) / 2)
/** Індекс лівої дитини вузла `i`. */
export const leftOf = (i: number): number => 2 * i + 1
/** Індекс правої дитини вузла `i`. */
export const rightOf = (i: number): number => 2 * i + 2

/** Глибина вузла `i` у дереві (корінь — 0): ⌊log₂(i+1)⌋. */
export const depthOf = (i: number): number => Math.floor(Math.log2(i + 1))

/** Рівні дерева-купи: масив рядів індексів [[0],[1,2],[3,4,5,6],…] для перших `n`. */
export function heapLevels(n: number): number[][] {
  const rows: number[][] = []
  for (let i = 0; i < n; i++) {
    const d = depthOf(i)
    ;(rows[d] ??= []).push(i)
  }
  return rows
}

/**
 * Базова реалізація: сортує НА МІСЦІ за зростанням (`asc`, через max-купу) або за
 * спаданням (`desc`, через min-купу). Працює над копією входу й повертає НОВИЙ масив.
 */
export function heapSort(input: readonly number[], order: HeapOrder = "asc"): number[] {
  const a = [...input]
  const n = a.length
  // «Сильніший» = той, що має бути ВИЩЕ у дереві: для max-купи — більший, для min — менший.
  const stronger = order === "asc" ? (x: number, y: number) => x > y : (x: number, y: number) => x < y

  const siftDown = (size: number, root: number): void => {
    let i = root
    for (;;) {
      const l = leftOf(i)
      const r = rightOf(i)
      let best = i
      if (l < size && stronger(a[l], a[best])) best = l
      if (r < size && stronger(a[r], a[best])) best = r
      if (best === i) break
      ;[a[i], a[best]] = [a[best], a[i]]
      i = best
    }
  }

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) siftDown(n, i) // 1) побудова купи
  for (let end = n - 1; end > 0; end--) {
    ;[a[0], a[end]] = [a[end], a[0]] // 2) корінь → у відсортовану зону
    siftDown(end, 0) // відновлюємо купу меншого розміру
  }
  return a
}

export { isSorted } from "@/lib/arrayUtils"

// — Інструментований прогін (журнал подій) -----------------------------------

/** Тип події журналу `heapSortSteps`. */
export type HeapKind =
  | "init"
  | "build_start"
  | "sift_start"
  | "compare"
  | "swap"
  | "sift_end"
  | "build_end"
  | "extract"
  | "final"

/** Один запис журналу пірамідального сортування (знімок стану + лічильники). */
export interface HeapEvent {
  readonly kind: HeapKind
  /** Знімок масиву на момент події. */
  readonly array: readonly number[]
  /** Розмір купи: елементи [0..heapSize) — у купі, [heapSize..n) — відсортовані. */
  readonly heapSize: number
  /** Груба фаза для бейджа: побудова купи чи сортування. */
  readonly stage: "build" | "sort"
  /** Поточний вузол просіювання (батько) або null. */
  readonly node: number | null
  /** Дитина, яку ЗАРАЗ розглядаємо (обрана сильніша) або null. */
  readonly child: number | null
  /** Індекс кореня просіювання (sift_start) або null. */
  readonly siftRoot: number | null
  readonly swapFrom: number | null
  readonly swapTo: number | null
  /** extract: корінь, що йде у відсортоване (завжди 0) / його нова позиція (end). */
  readonly extractFrom: number | null
  readonly extractTo: number | null
  readonly comparisons: number
  readonly swaps: number
  // compare-додатки:
  /** Чи обрана дитина — ліва (інакше — права). */
  readonly childIsLeft?: boolean
  /** Чи буде обмін (дитина сильніша за батька). */
  readonly willSwap?: boolean
}

export interface HeapSortStepsResult {
  readonly sorted: number[]
  readonly events: HeapEvent[]
}

/**
 * Інструментоване пірамідальне сортування: повторює базову логіку дія в дію, але
 * після кожної значущої дії кладе у журнал знімок стану. Працює над копією входу.
 * Послідовність подій:
 *   init → build_start → (sift_start → (compare (+swap)?)* → sift_end)* → build_end →
 *   (extract → sift_start → (compare (+swap)?)* → sift_end)* → final
 */
export function heapSortSteps(
  input: readonly number[],
  order: HeapOrder = "asc",
): HeapSortStepsResult {
  const a = [...input]
  const n = a.length
  const stronger = order === "asc" ? (x: number, y: number) => x > y : (x: number, y: number) => x < y
  let comparisons = 0
  let swaps = 0
  let heapSize = n
  const events: HeapEvent[] = []

  const base = (kind: HeapKind, stage: "build" | "sort"): HeapEvent => ({
    kind,
    array: [...a],
    heapSize,
    stage,
    node: null,
    child: null,
    siftRoot: null,
    swapFrom: null,
    swapTo: null,
    extractFrom: null,
    extractTo: null,
    comparisons,
    swaps,
  })
  const snap = (e: HeapEvent): void => {
    events.push(e)
  }

  // Просіювання вузла `root` вниз у купі розміру `size` з повним журналом.
  const siftDownStepped = (size: number, root: number, stage: "build" | "sort"): void => {
    snap({ ...base("sift_start", stage), siftRoot: root, node: root })
    let i = root
    for (;;) {
      const l = leftOf(i)
      const r = rightOf(i)
      if (l >= size) {
        snap({ ...base("sift_end", stage), node: i }) // лист — просіювати нікуди
        break
      }
      let best = i
      comparisons += 1
      if (stronger(a[l], a[best])) best = l
      if (r < size) {
        comparisons += 1
        if (stronger(a[r], a[best])) best = r
      }
      const willSwap = best !== i
      snap({
        ...base("compare", stage),
        node: i,
        child: best === i ? l : best,
        childIsLeft: (best === i ? l : best) === l,
        willSwap,
      })
      if (!willSwap) {
        snap({ ...base("sift_end", stage), node: i }) // батько вже сильніший — купу відновлено
        break
      }
      ;[a[i], a[best]] = [a[best], a[i]]
      swaps += 1
      snap({ ...base("swap", stage), node: i, child: best, swapFrom: i, swapTo: best })
      i = best
    }
  }

  snap(base("init", "build"))

  snap(base("build_start", "build"))
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) siftDownStepped(n, i, "build")
  snap(base("build_end", "build"))

  for (let end = n - 1; end > 0; end--) {
    ;[a[0], a[end]] = [a[end], a[0]]
    swaps += 1
    heapSize = end
    snap({ ...base("extract", "sort"), extractFrom: 0, extractTo: end, swapFrom: 0, swapTo: end })
    siftDownStepped(end, 0, "sort")
  }

  heapSize = 0
  snap(base("final", "sort"))
  return { sorted: a, events }
}

/** Підсумок методу: порівняння, обміни (вкл. extract-обміни). */
export interface HeapCounts {
  readonly comparisons: number
  readonly swaps: number
}

/**
 * Лічильники методу без журналу. Зручно для ПОРІВНЯННЯ напрямів (asc max-купа проти
 * desc min-купа на тих самих даних) у панелі-підсумку. Рахує через `heapSortSteps`,
 * тож числа збігаються з покроковими кадрами.
 */
export function countOperations(
  input: readonly number[],
  order: HeapOrder = "asc",
): HeapCounts {
  const { events } = heapSortSteps(input, order)
  const last = events[events.length - 1]
  return { comparisons: last.comparisons, swaps: last.swaps }
}
