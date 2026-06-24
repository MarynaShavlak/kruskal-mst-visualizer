// Швидке сортування (Quick Sort): базова реалізація з конспекту (тристороннє
// розбиття, стабільна, не на місці) + класичний in-place варіант (розбиття
// Ломуто, нестабільний) + інструментована версія, що будує ДЕРЕВО РЕКУРСІЇ як
// журнал подій. Фреймворк-незалежне ядро — порт quick_sort/core.py
// Python-репозиторію algo-quick-sort. Без React.
//
// «Розділяй і володарюй»: обираємо опорний (pivot), ділимо масив на три частини —
// left (< pivot), middle (== pivot), right (> pivot) — рекурсивно сортуємо left і
// right та конкатенуємо. Форма дерева рекурсії (і складність) повністю залежить
// від вибору опорного: збалансоване дерево → O(n·log n), вироджене (ланцюг) → O(n²).

/** Допустимі (детерміновані) стратегії вибору опорного. */
export const PIVOT_STRATEGIES = ["middle", "first", "last", "median3"] as const
export type PivotStrategy = (typeof PIVOT_STRATEGIES)[number]

/** Один вузол дерева рекурсії — запис журналу `quicksortSteps`. */
export interface QuickEvent {
  /** Порядковий номер виклику (pre-order, 0-based). */
  readonly id: number
  /** id батьківського виклику (null для кореня). */
  readonly parent: number | null
  /** Гілка від батька. */
  readonly branch: "root" | "left" | "right"
  /** Глибина (корінь — 0). */
  readonly depth: number
  /** Рівень рекурсії (depth + 1). */
  readonly level: number
  /** Підмасив цього виклику. */
  readonly array: readonly number[]
  /** Довжина підмасиву. */
  readonly size: number
  /** Чи це базовий випадок (len ≤ 1). */
  readonly isBase: boolean
  /** Опорний ЕЛЕМЕНТ (null у базовому випадку). */
  readonly pivot: number | null
  /** Індекс опорного в `array` (null у базовому випадку). */
  readonly pivotIndex: number | null
  /** Три частини поділу (null у базовому випадку). */
  readonly left: readonly number[] | null
  readonly middle: readonly number[] | null
  readonly right: readonly number[] | null
  /** Відсортований підмасив, який повернув цей виклик (null, доки не повернувся). */
  readonly result: readonly number[] | null
  /** Накопичені порівняння ПІСЛЯ розбиття цього виклику. */
  readonly comparisons: number
  /** id дочірніх викликів (left, потім right). */
  readonly children: readonly number[]
}

/** Підсумок прогону: порівняння, кількість викликів, глибина рекурсії. */
export interface QuickCounts {
  readonly comparisons: number
  readonly calls: number
  readonly depth: number
}

/**
 * Базова реалізація з конспекту: тристороннє розбиття списко-включеннями +
 * рекурсія. Повертає НОВИЙ список (вхід не змінюється), O(n) пам'яті, СТАБІЛЬНА
 * (рівні елементи осідають у middle у початковому порядку). O(n·log n) у середньому,
 * O(n²) у гіршому випадку.
 */
export function quicksort(input: readonly number[]): number[] {
  if (input.length <= 1) return [...input]
  const pivot = input[Math.floor(input.length / 2)]
  const left = input.filter((x) => x < pivot)
  const middle = input.filter((x) => x === pivot)
  const right = input.filter((x) => x > pivot)
  return [...quicksort(left), ...middle, ...quicksort(right)]
}

/** Індекс опорного у зрізі `a[lo..hi]` за обраною стратегією. */
function pivotIndexFor(
  a: readonly number[],
  lo: number,
  hi: number,
  strategy: PivotStrategy,
): number {
  if (strategy === "first") return lo
  if (strategy === "last") return hi
  if (strategy === "middle") return lo + Math.floor((hi - lo + 1) / 2)
  // median3: медіана першого, середнього й останнього елементів.
  const mid = Math.floor((lo + hi) / 2)
  const trio = [lo, mid, hi].sort((i, j) => a[i] - a[j])
  return trio[1]
}

/**
 * Класичний in-place варіант (розбиття Ломуто) — сортує НА МІСЦІ обмінами двох
 * індексів (O(log n) стека в середньому), але НЕстабільний (обмін через увесь
 * масив може «перестрибнути» рівний ключ). Працює над копією, повертає її.
 */
export function quicksortInplace(
  input: readonly number[],
  strategy: PivotStrategy = "middle",
): number[] {
  const a = [...input]

  const partition = (lo: number, hi: number): number => {
    const p = pivotIndexFor(a, lo, hi, strategy)
    ;[a[p], a[hi]] = [a[hi], a[p]]
    const pivotVal = a[hi]
    let i = lo
    for (let j = lo; j < hi; j++) {
      if (a[j] < pivotVal) {
        ;[a[i], a[j]] = [a[j], a[i]]
        i += 1
      }
    }
    ;[a[i], a[hi]] = [a[hi], a[i]]
    return i
  }

  const qsort = (lo: number, hi: number): void => {
    if (lo < hi) {
      const p = partition(lo, hi)
      qsort(lo, p - 1)
      qsort(p + 1, hi)
    }
  }

  qsort(0, a.length - 1)
  return a
}

export { isSorted } from "@/lib/arrayUtils"

/**
 * Інструментоване швидке сортування: будує ДЕРЕВО РЕКУРСІЇ як журнал. Повторює
 * `quicksort` (тристороннє розбиття) дія в дію, але кожен рекурсивний виклик
 * записує вузол. Події йдуть у порядку обходу в глибину (pre-order) — точно так,
 * як виконуються виклики. Стратегія опорного впливає на форму дерева.
 */
export function quicksortSteps(
  input: readonly number[],
  strategy: PivotStrategy = "middle",
): { readonly result: number[]; readonly events: QuickEvent[] } {
  const events: QuickEvent[] = []
  let comparisons = 0
  let nextId = 0

  const call = (
    arr: readonly number[],
    depth: number,
    parent: number | null,
    branch: "root" | "left" | "right",
  ): number[] => {
    const id = nextId++
    const n = arr.length

    if (n <= 1) {
      events.push({
        id, parent, branch, depth, level: depth + 1,
        array: [...arr], size: n, isBase: true,
        pivot: null, pivotIndex: null,
        left: null, middle: null, right: null,
        result: [...arr], comparisons, children: [],
      })
      return [...arr]
    }

    const pidx = pivotIndexFor(arr, 0, n - 1, strategy)
    const pivotVal = arr[pidx]
    const left: number[] = []
    const middle: number[] = []
    const right: number[] = []
    for (const x of arr) {
      comparisons += 1
      if (x < pivotVal) left.push(x)
      else if (x === pivotVal) middle.push(x)
      else right.push(x)
    }

    const node: QuickEvent = {
      id, parent, branch, depth, level: depth + 1,
      array: [...arr], size: n, isBase: false,
      pivot: pivotVal, pivotIndex: pidx,
      left: [...left], middle: [...middle], right: [...right],
      result: null, comparisons, children: [],
    }
    events.push(node)
    const pos = events.length - 1

    const leftId = nextId
    const sortedLeft = call(left, depth + 1, id, "left")
    const rightId = nextId
    const sortedRight = call(right, depth + 1, id, "right")

    const result = [...sortedLeft, ...middle, ...sortedRight]
    // Заповнюємо children/result після повернення рекурсії (вузол незмінний — замінюємо запис).
    events[pos] = { ...events[pos], children: [leftId, rightId], result: [...result] }
    return result
  }

  const result = call([...input], 0, null, "root")
  return { result, events }
}

/**
 * Метрики методу без журналу: порівняння, кількість викликів (вузлів дерева),
 * глибина рекурсії (кількість рівнів). Рахує через `quicksortSteps`.
 */
export function countOperations(
  input: readonly number[],
  strategy: PivotStrategy = "middle",
): QuickCounts {
  const { events } = quicksortSteps(input, strategy)
  const comparisons = events.reduce((m, e) => Math.max(m, e.comparisons), 0)
  const depth = events.reduce((m, e) => Math.max(m, e.depth), -1) + 1
  return { comparisons, calls: events.length, depth }
}
