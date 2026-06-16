// Задача про рюкзак 0/1: три підходи з конспекту (повний перебір, жадібний,
// динамічне програмування) + відновлення набору. Фреймворк-незалежне ядро —
// порт knapsack/core.py Python-репозиторію algo-knapsack. Без імпортів React.
//
// Усі три підходи з однаковим оптимумом ОБОВ'ЯЗКОВО (звіряють тести проти
// еталона): повний перебір і ДП — точні; жадібний для задачі 0/1 оптимуму НЕ
// гарантує (навчальний контрприклад). Інваріант входу: ваги — додатні цілі,
// вартості — невід'ємні цілі, місткість — невід'ємне ціле.

/** Один предмет: мітка, вага (≥1) і вартість (≥0). Порядок предметів задає індекси. */
export interface KnapsackItem {
  readonly name: string
  readonly weight: number
  readonly value: number
}

/** Інстанс задачі: предмети + місткість рюкзака W. */
export interface KnapsackInstance {
  readonly items: readonly KnapsackItem[]
  readonly capacity: number
}

/** Таблиця ДП `(n+1) × (W+1)` цілих значень (мутабельна — робоча). */
export type Table = number[][]
/** Незмінна таблиця (для входів і знімків). */
export type ReadonlyTable = ReadonlyArray<ReadonlyArray<number>>

/** Один запис журналу жадібного методу (для покрокової візуалізації). */
export interface GreedyStep {
  /** Вихідний індекс предмета (до сортування за питомою цінністю). */
  readonly index: number
  readonly weight: number
  readonly value: number
  /** Питома цінність value / weight. */
  readonly ratio: number
  /** Чи взято предмет (вільного місця вистачило). */
  readonly taken: boolean
  readonly freeBefore: number
  readonly freeAfter: number
  /** Накопичена вартість після цього кроку. */
  readonly totalAfter: number
}

// ---------------------------------------------------------------------------
// Повний перебір
// ---------------------------------------------------------------------------

/**
 * Повний перебір рекурсією «взяти / не брати»: максимальна вартість для перших
 * `n` предметів і вільної місткості `capacity`. Код «з конспекту» — саме його
 * README розбирає рядок за рядком. На кожному предметі два виклики, тож
 * перевіряються всі 2ⁿ комбінації. Час O(2ⁿ), пам'ять O(n) (глибина рекурсії).
 */
export function knapsackRecursive(
  capacity: number,
  weights: readonly number[],
  values: readonly number[],
  n: number,
): number {
  if (n === 0 || capacity === 0) return 0
  if (weights[n - 1] > capacity) {
    return knapsackRecursive(capacity, weights, values, n - 1)
  }
  return Math.max(
    values[n - 1] + knapsackRecursive(capacity - weights[n - 1], weights, values, n - 1),
    knapsackRecursive(capacity, weights, values, n - 1),
  )
}

/**
 * Повний перебір явним переліком усіх 2ⁿ підмножин: повертає найкращу вартість
 * і сам набір (індекси обраних предметів). Серед кількох оптимумів — перший у
 * порядку перебору (менші підмножини раніше); вартість завжди збігається з ДП.
 * Час O(n·2ⁿ).
 */
export function knapsackBruteForce(
  weights: readonly number[],
  values: readonly number[],
  capacity: number,
): { readonly value: number; readonly combo: readonly number[] } {
  const n = weights.length
  let bestValue = 0
  let bestCombo: readonly number[] = []

  // Підмножини як бітмаски 0..2ⁿ−1; порядок (за зростанням маски) відтворює
  // «менші підмножини — раніше» для непустих рівних оптимумів так само, як
  // itertools.combinations за зростанням r не змінив би вже знайдений лідер.
  for (let r = 0; r <= n; r++) {
    for (const combo of combinations(n, r)) {
      let totalWeight = 0
      let totalValue = 0
      for (const i of combo) {
        totalWeight += weights[i]
        totalValue += values[i]
      }
      if (totalWeight <= capacity && totalValue > bestValue) {
        bestValue = totalValue
        bestCombo = combo
      }
    }
  }
  return { value: bestValue, combo: bestCombo }
}

/** Усі `r`-елементні підмножини індексів 0..n−1 у лексикографічному порядку. */
function* combinations(n: number, r: number): Generator<number[]> {
  if (r < 0 || r > n) return
  const idx = Array.from({ length: r }, (_, i) => i)
  for (;;) {
    yield idx.slice()
    let i = r - 1
    while (i >= 0 && idx[i] === n - r + i) i--
    if (i < 0) return
    idx[i]++
    for (let j = i + 1; j < r; j++) idx[j] = idx[j - 1] + 1
  }
}

// ---------------------------------------------------------------------------
// Жадібний метод (навчальний контрприклад для задачі 0/1)
// ---------------------------------------------------------------------------

/**
 * Жадібний метод за питомою цінністю value/weight: сортуємо спадно й беремо,
 * поки вміщається. Для задачі 0/1 НЕ гарантує оптимуму (на класичному інстансі
 * дає 160 замість 220). Передумова — додатні ваги. Час O(n·log n).
 */
export function knapsackGreedy(
  weights: readonly number[],
  values: readonly number[],
  capacity: number,
): number {
  let total = 0
  for (const s of greedySteps(weights, values, capacity)) {
    if (s.taken) total = s.totalAfter
  }
  return total
}

/**
 * Інструментований жадібний метод: журнал по одному запису на предмет (у порядку
 * спадання питомої цінності). Стабільне сортування → рівні ratio зберігають
 * вихідний порядок індексів (як reverse=True у Python).
 */
export function greedySteps(
  weights: readonly number[],
  values: readonly number[],
  capacity: number,
): GreedyStep[] {
  weights.forEach((w, k) => {
    if (w <= 0) {
      throw new Error(
        `greedySteps: вага предмета №${k} має бути ≥ 1 (отримано ${w}) — ` +
          `питома цінність ділить вартість на вагу.`,
      )
    }
  })
  const order = Array.from({ length: weights.length }, (_, i) => i).sort(
    (a, b) => values[b] / weights[b] - values[a] / weights[a],
  )
  const steps: GreedyStep[] = []
  let total = 0
  let free = capacity
  for (const i of order) {
    const weight = weights[i]
    const value = values[i]
    const taken = free >= weight
    const freeBefore = free
    if (taken) {
      free -= weight
      total += value
    }
    steps.push({
      index: i,
      weight,
      value,
      ratio: value / weight,
      taken,
      freeBefore,
      freeAfter: free,
      totalAfter: total,
    })
  }
  return steps
}

// ---------------------------------------------------------------------------
// Динамічне програмування — таблиця K[i][w]
// ---------------------------------------------------------------------------

/**
 * Будує повну таблицю ДП `K[i][w]` — найбільшу вартість для перших `i` предметів
 * і місткості `w`. Знизу вгору: база (i=0 або w=0) → 0; інакше беремо максимум із
 * «взяти» (val + K[i−1][w−wt]) та «не брати» (K[i−1][w]). Час і пам'ять O(n·W).
 */
export function knapsackDpTable(
  weights: readonly number[],
  values: readonly number[],
  capacity: number,
): Table {
  const n = weights.length
  const K: Table = Array.from({ length: n + 1 }, () =>
    new Array<number>(capacity + 1).fill(0),
  )
  for (let i = 0; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      if (i === 0 || w === 0) {
        K[i][w] = 0
      } else if (weights[i - 1] <= w) {
        K[i][w] = Math.max(values[i - 1] + K[i - 1][w - weights[i - 1]], K[i - 1][w])
      } else {
        K[i][w] = K[i - 1][w]
      }
    }
  }
  return K
}

/** Максимальна вартість через ДП: правий нижній кут таблиці K[n][W]. */
export function knapsackDp(
  weights: readonly number[],
  values: readonly number[],
  capacity: number,
): number {
  const n = weights.length
  return knapsackDpTable(weights, values, capacity)[n][capacity]
}

/**
 * Відновлює набір обраних предметів зворотним проходом по таблиці `K` з правого
 * нижнього кута вгору: якщо `K[i][w] != K[i−1][w]`, значення взялося з гілки
 * «взяти» — предмет i у наборі, «звільняємо» його вагу. На нічиї предмет НЕ
 * береться. Повертає 0-базові індекси у порядку зростання. Час O(n).
 */
export function reconstructItems(
  K: ReadonlyTable,
  weights: readonly number[],
  capacity: number,
): number[] {
  const n = K.length - 1
  let w = capacity
  const chosen: number[] = []
  for (let i = n; i > 0; i--) {
    if (K[i][w] !== K[i - 1][w]) {
      chosen.push(i - 1)
      w -= weights[i - 1]
    }
  }
  chosen.reverse()
  return chosen
}

/** Орієнтовна кількість операцій ДП для n предметів і місткості W: (n+1)·(W+1) клітинок. */
export function knapsackCells(n: number, capacity: number): number {
  return (n + 1) * (capacity + 1)
}
