// Порозрядне сортування (Radix Sort): перший у серії алгоритм, який НЕ порівнює
// елементи між собою. Замість «що більше, a чи b?» він дивиться на самі ЦИФРИ:
// розкладає числа по 10 кошиках (0–9) за цифрою поточного розряду й збирає назад —
// від молодшого розряду до старшого (LSD — Least Significant Digit first). На
// кожному розряді працює СТАБІЛЬНЕ сортування підрахунком, і саме стабільність
// зберігає порядок, досягнутий на попередніх розрядах. Час лінійний O(d·(n+k)),
// де d — кількість розрядів, k — основа (тут 10). Порт radix_sort/core.py
// репозиторію algo-radix-sort. Фреймворк-незалежне ядро, без React.
//
// Базова версія працює з НЕВІД'ЄМНИМИ цілими. Модуль містить чотири рівні:
//   counting_sort + radix_sort — базова з конспекту (на місці), її розбирає README;
//   radixSortBuckets — наочна версія з 10 явними кошиками (append + конкатенація);
//   radixSortSteps — інструментована (журнал подій моделі кошиків) для візуалізацій;
//   countingSortSteps — фази сортування підрахунком за ОДНИМ розрядом («кухня»).
// Порозрядне НЕ in-place (O(n+k) пам'яті), стабільне, НЕ на основі порівнянь.

/** Основа за замовчуванням (десяткові цифри → 10 кошиків). */
export const BASE = 10

/** Цифра числа `value` у розряді `digitIndex` (0 — одиниці) за основою `base`. */
export function digitAt(value: number, digitIndex: number, base = BASE): number {
  return Math.floor(value / base ** digitIndex) % base
}

/**
 * Скільки розрядів у найбільшого числа (= кількість розрядних проходів). Для
 * порожнього входу або всіх нулів повертає 0 (рівно стільки проходів робить
 * `radixSort`: `while max // position > 0`).
 */
export function maxDigits(values: readonly number[], base = BASE): number {
  if (values.length === 0) return 0
  const maxNum = Math.max(...values.map((v) => Math.trunc(v)))
  let digits = 0
  let position = 1
  while (Math.floor(maxNum / position) > 0) {
    digits += 1
    position *= base
  }
  return digits
}

// ---------------------------------------------------------------------------
// Базова реалізація з конспекту (зберігаємо ДОСЛІВНО — її розбирає README)
// ---------------------------------------------------------------------------

/**
 * Стабільне сортування підрахунком за одним розрядом `position` (1 — одиниці,
 * 10 — десятки…). Сортує `arr` НА МІСЦІ. Три фази: частоти цифр → префіксні суми →
 * стабільна побудова `output` з КІНЦЯ масиву (саме обхід з кінця дає стабільність).
 */
export function countingSort(arr: number[], position: number): void {
  const size = arr.length
  const output = new Array<number>(size).fill(0)
  const count = new Array<number>(BASE).fill(0)

  for (let i = 0; i < size; i++) {
    const index = Math.floor(arr[i] / position) % BASE
    count[index] += 1
  }
  for (let i = 1; i < BASE; i++) {
    count[i] += count[i - 1]
  }
  for (let i = size - 1; i >= 0; i--) {
    const index = Math.floor(arr[i] / position) % BASE
    output[count[index] - 1] = arr[i]
    count[index] -= 1
  }
  for (let i = 0; i < size; i++) {
    arr[i] = output[i]
  }
}

/**
 * Порозрядне сортування (код з конспекту): LSD, від одиниць до старших розрядів.
 * Працює над КОПІЄЮ входу й повертає відсортований масив. Невід'ємні цілі.
 */
export function radixSort(input: readonly number[]): number[] {
  const arr = input.map((v) => Math.trunc(v))
  if (arr.length === 0) return arr
  const maxNum = Math.max(...arr)
  let position = 1
  while (Math.floor(maxNum / position) > 0) {
    countingSort(arr, position)
    position *= BASE
  }
  return arr
}

// ---------------------------------------------------------------------------
// Наочна версія: явні кошики-списки (append + конкатенація)
// ---------------------------------------------------------------------------

/**
 * Наочне порозрядне сортування через `base` ЯВНИХ кошиків-списків. На кожному
 * розряді: 10 порожніх кошиків, кожне число → кошик за цифрою розряду, потім
 * конкатенація кошиків по порядку 0..base-1 (стабільне розкладання). Працює над
 * копією, повертає новий масив. Результат збігається з `radixSort`.
 */
export function radixSortBuckets(
  input: readonly number[],
  base = BASE,
): number[] {
  let a = input.map((v) => Math.trunc(v))
  const d = maxDigits(a, base)
  for (let digitIndex = 0; digitIndex < d; digitIndex++) {
    const buckets: number[][] = Array.from({ length: base }, () => [])
    for (const x of a) buckets[digitAt(x, digitIndex, base)].push(x)
    a = buckets.flat()
  }
  return a
}

/** Чи впорядкований масив за зростанням? */
export function isSorted(seq: readonly number[]): boolean {
  for (let i = 0; i < seq.length - 1; i++) {
    if (seq[i] > seq[i + 1]) return false
  }
  return true
}

// ---------------------------------------------------------------------------
// Інструментована версія: журнал подій (модель кошиків)
// ---------------------------------------------------------------------------

/** Тип події журналу `radixSortSteps`. */
export type RadixKind = "init" | "pass_start" | "distribute" | "gather" | "final"

/** Один запис журналу подій порозрядного сортування (знімок стану + лічильники). */
export interface RadixEvent {
  readonly kind: RadixKind
  /** Знімок масиву: для distribute — джерело проходу; для gather — зібраний. */
  readonly array: readonly number[]
  /** Індекс розряду (0 — одиниці) або null поза проходом. */
  readonly digitIndex: number | null
  /** Позиція розряду (1, 10, 100…) або null. */
  readonly position: number | null
  /** Накопичена кількість розрядних проходів. */
  readonly passes: number
  /** Накопичена кількість розкладань по кошиках. */
  readonly distributions: number
  // pass_start:
  /** Цифра поточного розряду КОЖНОГО елемента (за цим розрядом розкладаємо). */
  readonly digits?: readonly number[]
  // distribute:
  /** Індекс елемента у джерелі, який ЗАРАЗ падає в кошик. */
  readonly i?: number
  /** Значення елемента, що падає. */
  readonly value?: number
  /** Кошик (цифра), у який падає елемент. */
  readonly bucket?: number
  // distribute / gather:
  /** Стан усіх `base` кошиків на цей момент. */
  readonly buckets?: readonly (readonly number[])[]
}

/** Результат прогону: відсортований масив + журнал подій. */
export interface RadixSortStepsResult {
  readonly sorted: number[]
  readonly events: RadixEvent[]
}

/**
 * Інструментоване порозрядне сортування для покрокового розбору. Повторює
 * `radixSortBuckets` дія в дію (той самий порядок розкладань і збирань), але після
 * кожної значущої події кладе у журнал знімок стану. Працює над копією входу.
 * Порівнянь елементів між собою — НУЛЬ.
 */
export function radixSortSteps(
  input: readonly number[],
  base = BASE,
): RadixSortStepsResult {
  let current = input.map((v) => Math.trunc(v))
  const events: RadixEvent[] = []
  let distributions = 0
  let passes = 0

  events.push({
    kind: "init", array: [...current], digitIndex: null, position: null,
    passes, distributions,
  })

  const d = maxDigits(current, base)
  for (let digitIndex = 0; digitIndex < d; digitIndex++) {
    const position = base ** digitIndex
    const digits = current.map((x) => digitAt(x, digitIndex, base))
    events.push({
      kind: "pass_start", array: [...current], digitIndex, position,
      digits: [...digits], passes, distributions,
    })

    const source = [...current]
    const buckets: number[][] = Array.from({ length: base }, () => [])
    for (let i = 0; i < source.length; i++) {
      const x = source[i]
      const b = digitAt(x, digitIndex, base)
      buckets[b].push(x)
      distributions += 1
      events.push({
        kind: "distribute", array: [...source], digitIndex, position,
        i, value: x, bucket: b,
        buckets: buckets.map((bk) => [...bk]),
        passes, distributions,
      })
    }

    const gathered = buckets.flat()
    passes += 1
    events.push({
      kind: "gather", array: [...gathered], digitIndex, position,
      buckets: buckets.map((bk) => [...bk]),
      passes, distributions,
    })
    current = gathered
  }

  events.push({
    kind: "final", array: [...current], digitIndex: null, position: null,
    passes, distributions,
  })
  return { sorted: current, events }
}

// ---------------------------------------------------------------------------
// Інструментоване сортування підрахунком за одним розрядом («внутрішня кухня»)
// ---------------------------------------------------------------------------

/** Один крок стабільної побудови `output` у `countingSortSteps`. */
export interface CountingBuild {
  readonly i: number
  readonly value: number
  readonly digit: number
  readonly pos: number
  /** Знімок `output` (null — ще не заповнені слоти). */
  readonly output: readonly (number | null)[]
}

/** Розклад фаз сортування підрахунком за одним розрядом. */
export interface CountingSteps {
  readonly array: readonly number[]
  /** Цифра поточного розряду кожного елемента. */
  readonly digits: readonly number[]
  /** count[] після підрахунку частот (фаза 1). */
  readonly freq: readonly number[]
  /** count[] після префіксних сум — позиції розміщення (фаза 2). */
  readonly prefix: readonly number[]
  /** Кроки стабільної побудови output з кінця (фаза 3). */
  readonly builds: readonly CountingBuild[]
  /** Готовий вихідний масив за цим розрядом. */
  readonly output: readonly number[]
  readonly position: number
  readonly base: number
}

/**
 * Розклад фаз `countingSort` за одним розрядом `position`: частоти цифр →
 * префіксні суми → стабільна побудова output з кінця. Живить «внутрішню кухню»
 * (панель підрахунку) і код-вірний розбір. Працює над копією.
 */
export function countingSortSteps(
  input: readonly number[],
  position: number,
  base = BASE,
): CountingSteps {
  const a = input.map((v) => Math.trunc(v))
  const size = a.length
  const digits = a.map((x) => Math.floor(x / position) % base)

  const count = new Array<number>(base).fill(0)
  for (const idx of digits) count[idx] += 1
  const freq = [...count]

  for (let i = 1; i < base; i++) count[i] += count[i - 1]
  const prefix = [...count]

  const output = new Array<number | null>(size).fill(null)
  const work = [...count]
  const builds: CountingBuild[] = []
  for (let i = size - 1; i >= 0; i--) {
    const idx = digits[i]
    const pos = work[idx] - 1
    output[pos] = a[i]
    work[idx] -= 1
    builds.push({ i, value: a[i], digit: idx, pos, output: [...output] })
  }

  return {
    array: a, digits, freq, prefix, builds,
    output: output.map((v) => v ?? 0), position, base,
  }
}

// ---------------------------------------------------------------------------
// Лічильники й підсумок
// ---------------------------------------------------------------------------

/** Підсумок методу: розрядні проходи, розкладання, порівняння (завжди 0). */
export interface RadixCounts {
  readonly passes: number
  readonly distributions: number
  /** Порозрядне НЕ порівнює елементи між собою — завжди 0. */
  readonly comparisons: number
}

/**
 * Лічильники методу без журналу. Рахує через `radixSortSteps`, тож числа
 * гарантовано збігаються з покроковими кадрами. Порозрядне сортування не порівнює
 * елементи між собою, тож `comparisons` завжди 0.
 */
export function countOperations(
  input: readonly number[],
  base = BASE,
): RadixCounts {
  const { events } = radixSortSteps(input, base)
  const last = events[events.length - 1]
  return {
    passes: last.passes,
    distributions: last.distributions,
    comparisons: 0,
  }
}
