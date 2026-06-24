// Двійковий (бінарний) пошук (Binary Search): швидкий пошук у ВІДСОРТОВАНОМУ масиві
// й ДРУГИЙ алгоритм пошуку серії — «винагорода за сортування». Тримаємо діапазон
// [low, high], дивимось на його СЕРЕДИНУ mid і відкидаємо половину, у якій шуканого
// точно немає: ліву (low = mid+1), якщо arr[mid] < x, або праву (high = mid-1),
// якщо arr[mid] > x; на arr[mid] == x повертаємо mid. Щокроку вікно звужується
// ВДВІЧІ → O(log n) кроків. ПЕРЕДУМОВА: масив відсортований (інакше некоректно) —
// головна ціна методу й прямий зв'язок із сортуваннями. Порт binary_search/core.py
// репозиторію algo-binary-search. Фреймворк-незалежне ядро, без React.
//
// Рівні: binary_search (база з конспекту — її розбирає README) + binarySearchRecursive
// (та сама логіка рекурсією, «розділяй і володарюй») + lowerBound/upperBound (межі в
// дусі bisect — перше/за останнім входженням при дублікатах) + binarySearchSteps
// (журнал подій для візуалізацій) + countSteps + isSorted (перевірка передумови).

/**
 * Базовий двійковий пошук (код з конспекту). Тримає діапазон `[low, high]`; на
 * кожному кроці обчислює `mid` і порівнює `arr[mid]` з `x`: менше — відкидає ліву
 * половину (`low = mid+1`), більше — праву (`high = mid-1`), рівне — повертає `mid`.
 * Коли `low > high`, діапазон порожній — повертає `-1`.
 *
 * ПЕРЕДУМОВА: `arr` відсортований за зростанням (інакше результат не визначений).
 * Не змінює `arr`. O(log n) порівнянь, O(1) пам'яті.
 */
export function binarySearch(arr: readonly number[], x: number): number {
  let low = 0
  let high = arr.length - 1
  while (low <= high) {
    const mid = Math.floor((high + low) / 2)
    if (arr[mid] < x) low = mid + 1
    else if (arr[mid] > x) high = mid - 1
    else return mid
  }
  return -1
}

/**
 * Рекурсивний двійковий пошук — та сама логіка на піддіапазоні `[low, high]`
 * (наочний «розділяй і володарюй», як у швидкому сортуванні чи злитті). Результат
 * ДОСЛІВНО збігається з `binarySearch`.
 */
export function binarySearchRecursive(
  arr: readonly number[],
  x: number,
  low = 0,
  high: number = arr.length - 1,
): number {
  if (low > high) return -1 // порожній діапазон → елемента немає
  const mid = Math.floor((high + low) / 2)
  if (arr[mid] < x) return binarySearchRecursive(arr, x, mid + 1, high) // шукане праворуч
  if (arr[mid] > x) return binarySearchRecursive(arr, x, low, mid - 1) // шукане ліворуч
  return mid // arr[mid] == x → знайдено
}

/**
 * Перший індекс `i`, для якого `arr[i] >= x` (як `bisect.bisect_left`). На масиві з
 * дублікатами це ПЕРШЕ входження `x` (якщо є) або точка вставки. Повертає `[0, n]`.
 */
export function lowerBound(arr: readonly number[], x: number): number {
  let low = 0
  let high = arr.length
  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    if (arr[mid] < x) low = mid + 1
    else high = mid
  }
  return low
}

/**
 * Перший індекс `i`, для якого `arr[i] > x` (як `bisect.bisect_right`). Це індекс
 * ВІДРАЗУ ЗА останнім входженням `x`; разом із `lowerBound` дає проміжок усіх
 * входжень `[lowerBound, upperBound)` і їхню кількість. Повертає `[0, n]`.
 */
export function upperBound(arr: readonly number[], x: number): number {
  let low = 0
  let high = arr.length
  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    if (arr[mid] <= x) low = mid + 1
    else high = mid
  }
  return low
}

// `isSorted` — ПЕРЕДУМОВА коректності двійкового пошуку: на невпорядкованих даних
// алгоритм може «відкинути» половину, де насправді лежить шукане. Реалізація — спільна.
export { isSorted } from "@/lib/arrayUtils"

// ---------------------------------------------------------------------------
// Інструментована версія: журнал подій (для перевірок коректності)
// ---------------------------------------------------------------------------

/** Тип події журналу `binarySearchSteps` (як у core.py). */
export type BinaryEventKind = "init" | "probe" | "found" | "not_found" | "final"

/** Порівняння `arr[mid]` з `x`: менше / більше / рівне. */
export type Compare = "lt" | "gt" | "eq"

/** Рішення кроку: відкидаємо праву/ліву половину / знайдено. */
export type Decision = "right" | "left" | "found"

/** Один запис журналу подій двійкового пошуку (знімок вікна + лічильник кроків). */
export interface BinaryEvent {
  readonly kind: BinaryEventKind
  /** Знімок масиву — НЕЗМІННИЙ (пошук лише читає). */
  readonly array: readonly number[]
  readonly target: number
  /** Межі діапазону НА МОМЕНТ обчислення mid (для probe/found — до відкидання). */
  readonly low: number
  readonly high: number
  /** Індекс проби або null (init/not_found). */
  readonly mid: number | null
  /** Значення `arr[mid]` для порівнянь. */
  readonly value: number | null
  readonly compare: Compare | null
  readonly decision: Decision | null
  /** Накопичена кількість кроків (порівнянь). */
  readonly steps: number
  /** Знайдений індекс / -1 / null (поки не вирішено). */
  readonly result: number | null
}

/** Результат прогону: знайдений індекс + журнал подій. */
export interface BinaryStepsResult {
  readonly result: number
  readonly events: BinaryEvent[]
}

/**
 * Інструментований двійковий пошук для покрокового розбору. Повторює `binarySearch`
 * дія в дію — той самий порядок обчислень `mid` і порівнянь, — але після кожного
 * порівняння кладе у журнал знімок стану. Масив не змінюється; рухаються лише межі
 * `low`/`high` (вікно звужується вдвічі) та проба `mid`.
 */
export function binarySearchSteps(
  arr: readonly number[],
  x: number,
): BinaryStepsResult {
  const a = [...arr]
  let low = 0
  let high = a.length - 1
  let steps = 0
  const events: BinaryEvent[] = []

  const snap = (
    kind: BinaryEventKind,
    f: {
      low: number
      high: number
      mid: number | null
      value?: number | null
      compare?: Compare | null
      decision?: Decision | null
      result?: number | null
    },
  ): BinaryEvent => ({
    kind,
    array: a,
    target: x,
    low: f.low,
    high: f.high,
    mid: f.mid,
    value: f.value ?? null,
    compare: f.compare ?? null,
    decision: f.decision ?? null,
    steps,
    result: f.result ?? null,
  })

  events.push(snap("init", { low, high, mid: null }))

  let result = -1
  let found = false
  while (low <= high) {
    const mid = Math.floor((high + low) / 2)
    const value = a[mid]
    steps += 1
    if (value < x) {
      events.push(snap("probe", { low, high, mid, value, compare: "lt", decision: "right" }))
      low = mid + 1
    } else if (value > x) {
      events.push(snap("probe", { low, high, mid, value, compare: "gt", decision: "left" }))
      high = mid - 1
    } else {
      result = mid
      found = true
      events.push(snap("found", { low, high, mid, value, compare: "eq", decision: "found", result: mid }))
      break
    }
  }
  if (!found) {
    events.push(snap("not_found", { low, high, mid: null, result: -1 }))
  }
  events.push(snap("final", { low, high, mid: result >= 0 ? result : null, result }))
  return { result, events }
}

// ---------------------------------------------------------------------------
// Лічильники й аналіз випадків
// ---------------------------------------------------------------------------

/**
 * Кількість кроків (порівнянь `arr[mid]` з `x`) до результату — без журналу.
 * Найкращий випадок (x одразу в першому mid) — 1; гірший (відсутній або «лист»
 * дерева пошуку) — ⌊log₂ n⌋ + 1. Рахує через `binarySearchSteps`.
 */
export function countSteps(arr: readonly number[], x: number): number {
  const { events } = binarySearchSteps(arr, x)
  return events[events.length - 1].steps
}

/** Аналіз випадків двійкового пошуку для масиву довжини `n`. */
export interface BinaryCaseAnalysis {
  readonly n: number
  /** Найкращий: x одразу в першому mid — 1 крок (O(1)). */
  readonly best: number
  /** Гірший: ⌊log₂ n⌋ + 1 (повний спуск). */
  readonly worst: number
  /** Лінійний пошук у гіршому випадку — n кроків (для контрасту). */
  readonly linear: number
}

/** Аналіз випадків для масиву (best / worst-log / контраст із лінійним). */
export function caseAnalysis(values: readonly number[]): BinaryCaseAnalysis {
  const n = values.length
  return {
    n,
    best: n > 0 ? 1 : 0,
    worst: n > 0 ? Math.floor(Math.log2(n)) + 1 : 0,
    linear: n,
  }
}
