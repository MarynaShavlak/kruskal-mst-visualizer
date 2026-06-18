// Інтерполяційний пошук (Interpolation Search): «розумна» проба у ВІДСОРТОВАНОМУ
// масиві й ЧЕТВЕРТИЙ алгоритм пошуку серії. Каркас той самий, що в двійкового
// (тримаємо діапазон [low, high], відкидаємо половину за порівнянням), але замість
// СЕРЕДИНИ mid обчислюємо пробу index ФОРМУЛОЮ ЛІНІЙНОЇ ІНТЕРПОЛЯЦІЇ — «вгадуємо»
// позицію за значенням ключа:
//
//     index = low + ⌊ (high - low) / (arr[high] - arr[low]) · (x - arr[low]) ⌋
//
// тобто яку ЧАСТКУ діапазону значень становить (x - arr[low]), таку саму частку
// діапазону індексів (high - low) відкладаємо від low (проєкція ключа на «пряму-
// модель»). Далі — як двійковий: arr[index] < x → low = index+1, arr[index] > x →
// high = index-1, arr[index] == x → повертаємо index. ПЕРЕДУМОВИ: масив відсортований
// (інакше некоректно) і — для ПЕРЕВАГИ — ключі розподілені РІВНОМІРНО. «Ціна» — проби
// (обчислення index): на рівномірних даних O(log log n) (часто 1–2 незалежно від n),
// на скупчених деградує до O(n) — гірше за двійковий. Порт core.py репозиторію
// algo-interpolation-search. Фреймворк-незалежне ядро, без React.
//
// Рівні: interpolationSearch (база з конспекту — її розбирає README) +
// interpolationSearchRecursive (та сама логіка рекурсією) + interpolationSearchSafe
// (закриває дві пастки: ділення на нуль і пробу поза межами) + interpolationSearchSteps
// (журнал подій для візуалізацій) + countProbes + caseAnalysis. Перевірка передумови
// (isSorted) і контраст із двійковим (countBinaryProbes) — спільні з двійковим пошуком.

import { binarySearch, countSteps, isSorted } from "@/lib/binarySearch"

// Перевикористовуємо спільне з двійкового пошуку: передумова відсортованості —
// та сама, а двійковий пошук потрібен для КОНТРАСТУ (середина проти формули).
export { binarySearch, isSorted }

/** Кількість проб двійкового пошуку (порівнянь arr[mid] з x) — для контрасту. */
export function countBinaryProbes(arr: readonly number[], x: number): number {
  return countSteps(arr, x)
}

/**
 * Базовий інтерполяційний пошук (код з конспекту). Тримає діапазон `[low, high]`;
 * на кожному кроці ОБЧИСЛЮЄ ПРОБУ формулою лінійної інтерполяції (а не як середину)
 * й порівнює `arr[index]` з `x`: менше — відкидає ліву частину (`low = index+1`),
 * більше — праву (`high = index-1`), рівне — повертає `index`. Цикл триває, ПОКИ
 * вікно не порожнє І ключ лежить у поточному діапазоні значень
 * (`x >= arr[low] && x <= arr[high]`).
 *
 * ПЕРЕДУМОВА: `arr` відсортований за зростанням (інакше результат не визначений).
 * Не змінює `arr`. ПАСТКА: якщо `arr[high] == arr[low]` (усі елементи вікна
 * однакові), знаменник = 0 → NaN; безпечний варіант — `interpolationSearchSafe`.
 */
export function interpolationSearch(arr: readonly number[], x: number): number {
  let low = 0
  let high = arr.length - 1
  while (low <= high && x >= arr[low] && x <= arr[high]) {
    const index = low + Math.trunc(((high - low) / (arr[high] - arr[low])) * (x - arr[low]))
    if (arr[index] === x) return index
    if (arr[index] < x) low = index + 1
    else high = index - 1
  }
  return -1
}

/**
 * Рекурсивний інтерполяційний пошук — та сама логіка на піддіапазоні `[low, high]`
 * (паралель до рекурсивного двійкового, тільки проба обчислюється формулою, а не як
 * середина). Результат ДОСЛІВНО збігається з `interpolationSearch`. Базові випадки:
 * порожнє вікно (`low > high`) або ключ поза діапазоном значень (`x < arr[low]` /
 * `x > arr[high]`) → `-1`; `arr[index] == x` → знайдено.
 */
export function interpolationSearchRecursive(
  arr: readonly number[],
  x: number,
  low = 0,
  high: number = arr.length - 1,
): number {
  if (low > high || x < arr[low] || x > arr[high]) return -1 // вікно порожнє / ключ поза діапазоном
  const index = low + Math.trunc(((high - low) / (arr[high] - arr[low])) * (x - arr[low]))
  if (arr[index] === x) return index // знайдено
  if (arr[index] < x) return interpolationSearchRecursive(arr, x, index + 1, high) // праворуч
  return interpolationSearchRecursive(arr, x, low, index - 1) // ліворуч
}

/**
 * Безпечний інтерполяційний пошук — той самий результат без двох пасток базової
 * версії: (1) ДІЛЕННЯ НА НУЛЬ, коли `arr[high] == arr[low]` (вироджений діапазон
 * значень) — обробляємо явно (повертаємо `low`, якщо `arr[low] == x`, інакше `-1`);
 * (2) ПРОБА ПОЗА МЕЖАМИ — клампимо `index` у `[low, high]` як захист. На коректних
 * (різні межі) даних результат збігається з `interpolationSearch`.
 */
export function interpolationSearchSafe(arr: readonly number[], x: number): number {
  let low = 0
  let high = arr.length - 1
  while (low <= high && x >= arr[low] && x <= arr[high]) {
    if (arr[high] === arr[low]) {
      // Вироджений діапазон: формула неприйнятна (ділення на нуль). Усі елементи
      // вікна однакові — лишилося порівняти зі спільним значенням.
      return arr[low] === x ? low : -1
    }
    let index = low + Math.trunc(((high - low) / (arr[high] - arr[low])) * (x - arr[low]))
    index = Math.max(low, Math.min(index, high)) // кламп у межі вікна (захист)
    if (arr[index] === x) return index
    if (arr[index] < x) low = index + 1
    else high = index - 1
  }
  return -1
}

// ---------------------------------------------------------------------------
// Інструментована версія: журнал подій (для перевірок коректності)
// ---------------------------------------------------------------------------

/** Тип події журналу `interpolationSearchSteps` (як у core.py). */
export type IpEventKind = "init" | "probe" | "found" | "guard_exit" | "not_found" | "final"

/** Порівняння `arr[index]` з `x`: менше / більше / рівне. */
export type Compare = "lt" | "gt" | "eq"

/** Рішення кроку: відкидаємо праву/ліву частину / знайдено. */
export type Decision = "right" | "left" | "found"

/** Причина виходу за охоронцем діапазону значень. */
export type GuardReason = "below" | "above" | "degenerate"

/** Один запис журналу подій інтерполяційного пошуку (знімок «прямої-моделі»). */
export interface IpEvent {
  readonly kind: IpEventKind
  /** Знімок масиву — НЕЗМІННИЙ (пошук лише читає). */
  readonly array: readonly number[]
  readonly target: number
  /** Межі діапазону НА МОМЕНТ обчислення index (для probe/found — до відкидання). */
  readonly low: number
  readonly high: number
  /** Значення на межах `arr[low]`/`arr[high]` — кінці «прямої-моделі». */
  readonly loVal: number | null
  readonly hiVal: number | null
  /** Частка інтерполяції `(x-arr[low])/(arr[high]-arr[low])` ∈ [0,1]. */
  readonly frac: number | null
  /** Оцінена дробова позиція `low + frac*(high-low)`. */
  readonly pos: number | null
  /** Ціла проба `⌊pos⌋` або null. */
  readonly index: number | null
  /** Значення `arr[index]` для порівнянь. */
  readonly value: number | null
  readonly compare: Compare | null
  readonly decision: Decision | null
  readonly reason: GuardReason | null
  /** Накопичена кількість проб (обчислень index). */
  readonly probes: number
  /** Знайдений індекс / -1 / null (поки не вирішено). */
  readonly result: number | null
}

/** Результат прогону: знайдений індекс + журнал подій. */
export interface IpStepsResult {
  readonly result: number
  readonly events: IpEvent[]
}

/**
 * Інструментований інтерполяційний пошук для покрокового розбору. Повторює
 * `interpolationSearch` дія в дію — той самий порядок обчислень `index` і порівнянь,
 * — але кожну пробу супроводжує знімком стану «прямої-моделі» (межі, значення на них,
 * частка, дробова позиція, проба). Знаменник захищено від нуля (вироджений діапазон
 * → `guard_exit`), щоб журнал не падав; на коректних даних поведінка дослівно
 * збігається з базовою версією.
 */
export function interpolationSearchSteps(
  arr: readonly number[],
  x: number,
): IpStepsResult {
  const a = [...arr]
  const n = a.length
  let low = 0
  let high = n - 1
  let probes = 0
  const events: IpEvent[] = []

  const snap = (
    kind: IpEventKind,
    f: {
      low: number
      high: number
      loVal?: number | null
      hiVal?: number | null
      frac?: number | null
      pos?: number | null
      index?: number | null
      value?: number | null
      compare?: Compare | null
      decision?: Decision | null
      reason?: GuardReason | null
      result?: number | null
    },
  ): IpEvent => ({
    kind,
    array: a,
    target: x,
    low: f.low,
    high: f.high,
    loVal: f.loVal ?? null,
    hiVal: f.hiVal ?? null,
    frac: f.frac ?? null,
    pos: f.pos ?? null,
    index: f.index ?? null,
    value: f.value ?? null,
    compare: f.compare ?? null,
    decision: f.decision ?? null,
    reason: f.reason ?? null,
    probes,
    result: f.result ?? null,
  })

  if (n === 0) {
    events.push(snap("init", { low: 0, high: -1 }))
    events.push(snap("not_found", { low: 0, high: -1, result: -1 }))
    events.push(snap("final", { low: 0, high: -1, result: -1 }))
    return { result: -1, events }
  }

  events.push(snap("init", { low, high, loVal: a[low], hiVal: a[high] }))

  let result = -1
  let exitedByGuard = false
  while (low <= high) {
    const loVal = a[low]
    const hiVal = a[high]
    // Охоронець діапазону значень: ключ мусить лежати між межами за значенням.
    if (!(x >= loVal && x <= hiVal)) {
      const reason: GuardReason = x < loVal ? "below" : "above"
      events.push(snap("guard_exit", { low, high, loVal, hiVal, reason, result: -1 }))
      exitedByGuard = true
      break
    }
    if (hiVal === loVal) {
      // Вироджений діапазон (ділення на нуль у базовій версії).
      if (loVal === x) {
        probes += 1 // пряме порівняння зі спільним значенням
        result = low
        events.push(snap("found", {
          low, high, index: low, value: loVal, loVal, hiVal,
          frac: 0, pos: low, compare: "eq", decision: "found", result: low,
        }))
      } else {
        events.push(snap("guard_exit", { low, high, loVal, hiVal, reason: "degenerate", result: -1 }))
      }
      exitedByGuard = true
      break
    }

    const frac = (x - loVal) / (hiVal - loVal) // частка для прямої-моделі ∈ [0,1]
    const pos = low + frac * (high - low) // геометрична проєкція ключа на пряму
    const index = low + Math.trunc(((high - low) / (hiVal - loVal)) * (x - loVal))
    const value = a[index]
    probes += 1

    if (value === x) {
      result = index
      events.push(snap("found", {
        low, high, index, value, loVal, hiVal, frac, pos, compare: "eq", decision: "found", result: index,
      }))
      break
    }
    if (value < x) {
      events.push(snap("probe", {
        low, high, index, value, loVal, hiVal, frac, pos, compare: "lt", decision: "right",
      }))
      low = index + 1
    } else {
      events.push(snap("probe", {
        low, high, index, value, loVal, hiVal, frac, pos, compare: "gt", decision: "left",
      }))
      high = index - 1
    }
  }

  if (result < 0 && !exitedByGuard) {
    events.push(snap("not_found", { low, high, result: -1 }))
  }
  events.push(snap("final", { low, high, index: result >= 0 ? result : null, result }))
  return { result, events }
}

// ---------------------------------------------------------------------------
// Лічильники й аналіз випадків
// ---------------------------------------------------------------------------

/**
 * Кількість проб (обчислень `index`) до результату — без журналу. На рівномірних
 * даних — часто 1–2 незалежно від n (O(log log n)); на скупчених сягає O(n).
 */
export function countProbes(arr: readonly number[], x: number): number {
  const { events } = interpolationSearchSteps(arr, x)
  return events[events.length - 1].probes
}

/** Аналіз випадків інтерполяційного пошуку для масиву довжини `n`. */
export interface IpCaseAnalysis {
  readonly n: number
  /** Найкращий: «ідеальний здогад» з першої проби — 1 (O(1)). */
  readonly best: number
  /** Очікуваний на РІВНОМІРНИХ даних: ⌈log₂ log₂ n⌉ + 1 (O(log log n)). */
  readonly avgUniform: number
  /** Двійковий пошук: ⌊log₂ n⌋ + 1 (для контрасту — байдужий до розподілу). */
  readonly binary: number
  /** Гірший (скупчені/нерівномірні дані): деградація до n (O(n)). */
  readonly worst: number
}

/** Аналіз випадків: best 1 / O(log log n) рівномірний / O(log n) двійковий / O(n) гірший. */
export function caseAnalysis(values: readonly number[]): IpCaseAnalysis {
  const n = values.length
  if (n === 0) return { n: 0, best: 0, avgUniform: 0, binary: 0, worst: 0 }
  const log2n = Math.log2(n)
  const avgUniform = log2n > 1 ? Math.ceil(Math.log2(log2n)) + 1 : 1
  return {
    n,
    best: 1,
    avgUniform: Math.max(1, avgUniform),
    binary: Math.floor(log2n) + 1,
    worst: n,
  }
}
