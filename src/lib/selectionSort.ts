// Сортування прямим вибором (Selection Sort): дві реалізації з конспекту
// (стандартна — обмін; стабільна — зсув блоку) + інструментована версія, що пише
// журнал подій для покрокової візуалізації. Фреймворк-незалежне ядро — порт
// selection_sort/core.py Python-репозиторію algo-selection-sort. Без React.
//
// Сортування працює над МАСИВОМ на місці (O(1) додаткової пам'яті). Дві ключові
// властивості: воно НЕ адаптивне (порівнянь завжди рівно n(n−1)/2, незалежно від
// входу) і робить МІНІМУМ обмінів (≤ n−1 — найменше серед сортувань порівнянням).
// Стандартний вибір НЕстабільний: обмін arr[i] ↔ arr[min_idx] може «перестрибнути»
// рівні ключі. Стабільність відновлює варіант зі ЗСУВОМ блоку — ціною O(n²) записів.

/** Спільні поля будь-якої події журналу. */
interface SelectionEventBase {
  /** Знімок масиву на цьому кроці. */
  readonly array: readonly number[]
  /** Номер зовнішнього проходу (i) або null поза ним (init/final). */
  readonly pass: number | null
  /** Індекс у внутрішньому циклі (j) або null. */
  readonly j: number | null
  /** Індекс поточного кандидата-мінімуму («біжучий мінімум») або null. */
  readonly minIdx: number | null
  /** Межа відсортованого префікса (скільки елементів уже на місцях). */
  readonly sortedTo: number
  /** Накопичена кількість порівнянь. */
  readonly comparisons: number
  /** Накопичена кількість справжніх обмінів (стандартна версія). */
  readonly swaps: number
  /** Накопичена кількість записів у масив (стабільна версія: зсуви + вставка). */
  readonly writes: number
}

/** Один запис журналу `selectionSortSteps`. Дискримінант — `kind`. */
export type SelectionEvent =
  | (SelectionEventBase & { readonly kind: "init" })
  | (SelectionEventBase & {
      readonly kind: "passStart"
      /** Значення кандидата-мінімуму на старті проходу (a[i]). */
      readonly minVal: number
    })
  | (SelectionEventBase & {
      readonly kind: "compare"
      /** Індекс елемента суфікса, що його порівнюють (j). */
      readonly comparedAt: number
      /** Значення a[j]. */
      readonly jVal: number
      /** Значення поточного мінімуму до порівняння. */
      readonly candVal: number
      /** Чи знайдено нового, меншого кандидата (a[j] < a[min_idx]). */
      readonly newMin: boolean
      /** Індекс мінімуму ДО цього порівняння. */
      readonly prevMinIdx: number
    })
  | (SelectionEventBase & {
      readonly kind: "swap"
      /** Перша позиція обміну (межа префікса = i). */
      readonly a: number
      /** Друга позиція обміну (min_idx). */
      readonly b: number
      /** Самообмін (min_idx == i) — холостий, фізично не виконується. */
      readonly selfSwap: boolean
      /** Значення, що стало на позицію i. */
      readonly placed: number
    })
  | (SelectionEventBase & {
      readonly kind: "shift"
      /** Звідки рухається елемент (k−1). */
      readonly from: number
      /** Куди рухається елемент (k). */
      readonly to: number
      /** Значення мінімуму «в руці», під яке звільняємо місце. */
      readonly held: number
    })
  | (SelectionEventBase & {
      readonly kind: "place"
      /** Позиція, на яку стає вийнятий мінімум (i). */
      readonly at: number
      /** Значення мінімуму. */
      readonly value: number
    })
  | (SelectionEventBase & { readonly kind: "final" })

/** Підсумок прогону: порівняння, обміни, записи, проходи. */
export interface SelectionCounts {
  readonly comparisons: number
  readonly swaps: number
  readonly writes: number
  readonly passes: number
}

/**
 * Базова (стандартна) реалізація з конспекту: на кожному проході скануємо весь
 * несортований суфікс у пошуку мінімуму й ОДНИМ обміном ставимо його на межу
 * відсортованого префікса. Сортує копію за зростанням і повертає її. Час O(n²)
 * порівнянь у всіх випадках, ≤ n−1 обмінів, пам'ять O(1).
 */
export function selectionSort(input: readonly number[]): number[] {
  const a = [...input]
  const n = a.length
  for (let i = 0; i < n; i++) {
    let minIdx = i
    for (let j = i + 1; j < n; j++) {
      if (a[j] < a[minIdx]) minIdx = j
    }
    const tmp = a[i]
    a[i] = a[minIdx]
    a[minIdx] = tmp
  }
  return a
}

/**
 * Стабільний варіант: замість обміну arr[i] ↔ arr[min_idx] мінімум ВИЙМАЄМО,
 * елементи блоку [i..min_idx−1] ЗСУВАЄМО праворуч на одну позицію, і мінімум
 * вставляємо на позицію i. Оскільки умова пошуку строга (`<`), серед рівних
 * ключів мінімумом стає найлівіший, а зсув зберігає порядок решти — сортування
 * лишається СТАБІЛЬНИМ. Платою є O(n²) записів замість O(n) обмінів.
 */
export function selectionSortStable(input: readonly number[]): number[] {
  const a = [...input]
  const n = a.length
  for (let i = 0; i < n; i++) {
    let minIdx = i
    for (let j = i + 1; j < n; j++) {
      if (a[j] < a[minIdx]) minIdx = j
    }
    const minVal = a[minIdx]
    while (minIdx > i) {
      a[minIdx] = a[minIdx - 1]
      minIdx -= 1
    }
    a[i] = minVal
  }
  return a
}

/** Чи впорядкований масив за зростанням? */
export function isSorted(lst: readonly number[]): boolean {
  for (let i = 0; i < lst.length - 1; i++) {
    if (lst[i] > lst[i + 1]) return false
  }
  return true
}

/**
 * Інструментована версія для покрокового розбору: повторює `selectionSort`
 * (або `selectionSortStable` при `stable=true`) дія в дію, але після кожної
 * значущої дії кладе у журнал знімок стану масиву й лічильники. Працює над копією
 * вхідного масиву (вхід не змінюється). Порядок подій дослівно повторює Python-
 * оригінал:
 *  - стандартна: init → (passStart → compare* → swap)* → final;
 *  - стабільна:  init → (passStart → compare* → shift* → place)* → final.
 */
export function selectionSortSteps(
  input: readonly number[],
  stable = false,
): { readonly sorted: number[]; readonly events: SelectionEvent[] } {
  return stable ? stableSteps(input) : standardSteps(input)
}

function standardSteps(input: readonly number[]): {
  sorted: number[]
  events: SelectionEvent[]
} {
  const a = [...input]
  const n = a.length
  let comparisons = 0
  let swaps = 0
  const events: SelectionEvent[] = []

  events.push({
    kind: "init",
    array: [...a],
    pass: null,
    j: null,
    minIdx: null,
    sortedTo: 0,
    comparisons,
    swaps,
    writes: 0,
  })

  for (let i = 0; i < n; i++) {
    let minIdx = i
    // початок проходу: кандидат-мінімум = перший елемент суфікса
    events.push({
      kind: "passStart",
      array: [...a],
      pass: i,
      j: null,
      minIdx,
      sortedTo: i,
      comparisons,
      swaps,
      writes: 0,
      minVal: a[minIdx],
    })

    for (let j = i + 1; j < n; j++) {
      const jVal = a[j]
      const candVal = a[minIdx]
      comparisons += 1
      const newMin = jVal < candVal
      const prevMinIdx = minIdx
      if (newMin) minIdx = j
      events.push({
        kind: "compare",
        array: [...a],
        pass: i,
        j,
        minIdx,
        sortedTo: i,
        comparisons,
        swaps,
        writes: 0,
        comparedAt: j,
        jVal,
        candVal,
        newMin,
        prevMinIdx,
      })
    }

    // кінець проходу: один обмін ставить мінімум на межу префікса
    const selfSwap = minIdx === i
    if (!selfSwap) {
      const tmp = a[i]
      a[i] = a[minIdx]
      a[minIdx] = tmp
      swaps += 1
    }
    events.push({
      kind: "swap",
      array: [...a],
      pass: i,
      j: null,
      minIdx,
      sortedTo: i + 1,
      comparisons,
      swaps,
      writes: 0,
      a: i,
      b: minIdx,
      selfSwap,
      placed: a[i],
    })
  }

  events.push({
    kind: "final",
    array: [...a],
    pass: null,
    j: null,
    minIdx: null,
    sortedTo: n,
    comparisons,
    swaps,
    writes: 0,
  })

  return { sorted: a, events }
}

function stableSteps(input: readonly number[]): {
  sorted: number[]
  events: SelectionEvent[]
} {
  const a = [...input]
  const n = a.length
  let comparisons = 0
  let writes = 0
  const events: SelectionEvent[] = []

  events.push({
    kind: "init",
    array: [...a],
    pass: null,
    j: null,
    minIdx: null,
    sortedTo: 0,
    comparisons,
    swaps: 0,
    writes,
  })

  for (let i = 0; i < n; i++) {
    let minIdx = i
    events.push({
      kind: "passStart",
      array: [...a],
      pass: i,
      j: null,
      minIdx,
      sortedTo: i,
      comparisons,
      swaps: 0,
      writes,
      minVal: a[minIdx],
    })

    for (let j = i + 1; j < n; j++) {
      const jVal = a[j]
      const candVal = a[minIdx]
      comparisons += 1
      const newMin = jVal < candVal
      const prevMinIdx = minIdx
      if (newMin) minIdx = j
      events.push({
        kind: "compare",
        array: [...a],
        pass: i,
        j,
        minIdx,
        sortedTo: i,
        comparisons,
        swaps: 0,
        writes,
        comparedAt: j,
        jVal,
        candVal,
        newMin,
        prevMinIdx,
      })
    }

    // виймаємо мінімум і зсуваємо блок [i..min_idx−1] праворуч на одну позицію
    const minVal = a[minIdx]
    while (minIdx > i) {
      a[minIdx] = a[minIdx - 1]
      writes += 1
      events.push({
        kind: "shift",
        array: [...a],
        pass: i,
        j: minIdx,
        minIdx,
        sortedTo: i,
        comparisons,
        swaps: 0,
        writes,
        from: minIdx - 1,
        to: minIdx,
        held: minVal,
      })
      minIdx -= 1
    }
    a[i] = minVal
    writes += 1
    events.push({
      kind: "place",
      array: [...a],
      pass: i,
      j: i,
      minIdx: i,
      sortedTo: i + 1,
      comparisons,
      swaps: 0,
      writes,
      at: i,
      value: minVal,
    })
  }

  events.push({
    kind: "final",
    array: [...a],
    pass: null,
    j: null,
    minIdx: null,
    sortedTo: n,
    comparisons,
    swaps: 0,
    writes,
  })

  return { sorted: a, events }
}

/**
 * Лічильники методу без журналу (порівняння / обміни / записи / проходи). Рахує
 * через `selectionSortSteps`, тож числа гарантовано збігаються з покроковими
 * кадрами. Для стандартної версії значущі `swaps` (≤ n−1); для стабільної —
 * `writes` (O(n²), ціна стабільності).
 */
export function countOperations(
  input: readonly number[],
  stable = false,
): SelectionCounts {
  const { events } = selectionSortSteps(input, stable)
  const last = events[events.length - 1]
  return {
    comparisons: last.comparisons,
    swaps: last.swaps,
    writes: last.writes,
    passes: input.length,
  }
}

/** Кількість порівнянь у будь-якому випадку: n(n−1)/2 (метод НЕ адаптивний). */
export function maxComparisons(n: number): number {
  return (n * (n - 1)) / 2
}
