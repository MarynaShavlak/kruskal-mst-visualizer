// Сортування вставками (Insertion Sort): дві реалізації з конспекту (лінійна
// базова й бінарна — пошук місця двійковим пошуком) + інструментована версія,
// що пише журнал подій для покрокової візуалізації. Фреймворк-незалежне ядро —
// порт insertion_sort/core.py Python-репозиторію algo-insertion-sort. Без React.
//
// Сортування працює над МАСИВОМ на місці (O(1) додаткової пам'яті) і є СТАБІЛЬНИМ:
// зсув відбувається лише за СТРОГОЇ нерівності (`key < lst[j]`), тож рівні елементи
// ніколи не «перестрибують» одне одного. Метод АДАПТИВНИЙ: на вже відсортованому
// вході тіло while не виконується — O(n) порівнянь і НУЛЬ зсувів, БЕЗ прапорця.
// Бінарна версія скорочує порівняння до O(n·log n), але зсуви лишаються O(n²).

/** Спільні поля будь-якої події журналу. */
interface InsertionEventBase {
  /** Знімок масиву на цьому кроці (після можливого зсуву). */
  readonly array: readonly number[]
  /** Номер зовнішньої ітерації або null поза нею (init/final). */
  readonly i: number | null
  /** Індекс у внутрішньому циклі або null. */
  readonly j: number | null
  /** Довжина відсортованого префікса (зелена межа ліворуч). */
  readonly prefixLen: number
  /** Індекс «дірки» (вільної позиції під key) або null. */
  readonly hole: number | null
  /** Значення key «в руці» або null. */
  readonly key: number | null
  /** Накопичена кількість порівнянь. */
  readonly comparisons: number
  /** Накопичена кількість зсувів. */
  readonly shifts: number
}

/** Один запис журналу `insertionSortSteps`. Дискримінант — `kind`. */
export type InsertionEvent =
  | (InsertionEventBase & { readonly kind: "init" })
  | (InsertionEventBase & {
      readonly kind: "take"
      /** Позиція, з якої взяли key (там утворилася «дірка»). */
      readonly takenFrom: number
    })
  | (InsertionEventBase & {
      readonly kind: "compare"
      /** Індекс елемента префікса, з яким порівнюють (j). */
      readonly comparedAt: number
      /** Значення цього елемента (до можливого зсуву). */
      readonly compared: number
      /** Чи привело порівняння до зсуву (key < compared). */
      readonly shifted: boolean
    })
  | (InsertionEventBase & {
      readonly kind: "probe"
      /** Поточні межі двійкового пошуку. */
      readonly lo: number
      readonly hi: number
      /** Середній індекс, що його перевіряють. */
      readonly mid: number
      /** Значення a[mid]. */
      readonly compared: number
      /** Чи пішли ліворуч (key < a[mid]). */
      readonly goLeft: boolean
    })
  | (InsertionEventBase & {
      readonly kind: "shift"
      /** Звідки рухається елемент (j−1). */
      readonly from: number
      /** Куди рухається елемент (j). */
      readonly to: number
    })
  | (InsertionEventBase & {
      readonly kind: "insert"
      /** Позиція, на яку стає key. */
      readonly insertAt: number
    })
  | (InsertionEventBase & { readonly kind: "final" })

/** Підсумок прогону: порівняння, зсуви, вставки. */
export interface InsertionCounts {
  readonly comparisons: number
  readonly shifts: number
  readonly insertions: number
}

/**
 * Базова (лінійна) реалізація з конспекту: для кожного елемента беремо key «у
 * руку» й зсуваємо праворуч усі більші елементи префікса, доки не звільниться
 * місце. Сортує копію за зростанням і повертає її. Час O(n²), пам'ять O(1).
 */
export function insertionSort(input: readonly number[]): number[] {
  const lst = [...input]
  for (let i = 1; i < lst.length; i++) {
    const key = lst[i]
    let j = i - 1
    while (j >= 0 && key < lst[j]) {
      lst[j + 1] = lst[j]
      j -= 1
    }
    lst[j + 1] = key
  }
  return lst
}

/**
 * Бінарна вставка: місце вставки шукаємо ДВІЙКОВИМ пошуком (права межа — рівні
 * ключі вставляються після наявних, тож сортування лишається СТАБІЛЬНИМ). Це
 * скорочує кількість порівнянь до O(n·log n), але зсуви лишаються O(n²) — елементи
 * однаково треба фізично посунути. Сортує копію й повертає її.
 */
export function insertionSortBinary(input: readonly number[]): number[] {
  const lst = [...input]
  for (let i = 1; i < lst.length; i++) {
    const cur = lst[i]
    let lo = 0
    let hi = i
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (cur < lst[mid]) hi = mid
      else lo = mid + 1
    }
    const pos = lo
    for (let j = i; j > pos; j--) lst[j] = lst[j - 1]
    lst[pos] = cur
  }
  return lst
}

/** Чи впорядкований масив за зростанням? */
export function isSorted(lst: readonly number[]): boolean {
  for (let i = 0; i < lst.length - 1; i++) {
    if (lst[i] > lst[i + 1]) return false
  }
  return true
}

/**
 * Інструментована вставка для покрокового розбору: повторює `insertionSort`
 * (або `insertionSortBinary` при `binary=true`) дія в дію, але після кожної
 * значущої дії кладе у журнал знімок стану масиву й лічильники. Працює над
 * копією вхідного масиву (вхід не змінюється). Порядок подій дослівно повторює
 * Python-оригінал:
 *  - лінійна: init → (take → compare* → insert)* → final;
 *  - бінарна: init → (take → probe* → shift* → insert)* → final.
 */
export function insertionSortSteps(
  input: readonly number[],
  binary = false,
): { readonly sorted: number[]; readonly events: InsertionEvent[] } {
  return binary ? binarySteps(input) : linearSteps(input)
}

function linearSteps(input: readonly number[]): {
  sorted: number[]
  events: InsertionEvent[]
} {
  const a = [...input]
  const n = a.length
  let comparisons = 0
  let shifts = 0
  const events: InsertionEvent[] = []

  events.push({
    kind: "init",
    array: [...a],
    i: null,
    j: null,
    prefixLen: n ? 1 : 0,
    hole: null,
    key: null,
    comparisons,
    shifts,
  })

  for (let i = 1; i < n; i++) {
    const cur = a[i]
    let j = i - 1
    // 1) беремо key «у руку» — на позиції i утворюється «дірка»
    events.push({
      kind: "take",
      array: [...a],
      i,
      j,
      prefixLen: i,
      hole: i,
      key: cur,
      comparisons,
      shifts,
      takenFrom: i,
    })

    // 2) зсуваємо праворуч усі елементи префікса, більші за key
    while (j >= 0 && cur < a[j]) {
      const compared = a[j]
      comparisons += 1
      a[j + 1] = a[j] // зсув праворуч
      shifts += 1
      events.push({
        kind: "compare",
        array: [...a],
        i,
        j,
        prefixLen: i,
        hole: j, // «дірка» перемістилася з j+1 на j
        key: cur,
        comparisons,
        shifts,
        comparedAt: j,
        compared,
        shifted: true,
      })
      j -= 1
    }

    // порівняння, що зупинило цикл (key >= a[j]) — лише якщо не вийшли за межу
    if (j >= 0) {
      comparisons += 1
      events.push({
        kind: "compare",
        array: [...a],
        i,
        j,
        prefixLen: i,
        hole: j + 1,
        key: cur,
        comparisons,
        shifts,
        comparedAt: j,
        compared: a[j],
        shifted: false,
      })
    }

    // 3) вставляємо key на звільнену позицію j+1
    a[j + 1] = cur
    events.push({
      kind: "insert",
      array: [...a],
      i,
      j,
      prefixLen: i + 1,
      hole: null,
      key: null,
      comparisons,
      shifts,
      insertAt: j + 1,
    })
  }

  events.push({
    kind: "final",
    array: [...a],
    i: null,
    j: null,
    prefixLen: n,
    hole: null,
    key: null,
    comparisons,
    shifts,
  })

  return { sorted: a, events }
}

function binarySteps(input: readonly number[]): {
  sorted: number[]
  events: InsertionEvent[]
} {
  const a = [...input]
  const n = a.length
  let comparisons = 0
  let shifts = 0
  const events: InsertionEvent[] = []

  events.push({
    kind: "init",
    array: [...a],
    i: null,
    j: null,
    prefixLen: n ? 1 : 0,
    hole: null,
    key: null,
    comparisons,
    shifts,
  })

  for (let i = 1; i < n; i++) {
    const cur = a[i]
    // 1) беремо key «у руку»
    events.push({
      kind: "take",
      array: [...a],
      i,
      j: i,
      prefixLen: i,
      hole: i,
      key: cur,
      comparisons,
      shifts,
      takenFrom: i,
    })

    // 2) шукаємо праву межу вставки двійковим пошуком у префіксі [0, i)
    let lo = 0
    let hi = i
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      comparisons += 1
      const goLeft = cur < a[mid]
      events.push({
        kind: "probe",
        array: [...a],
        i,
        j: mid,
        prefixLen: i,
        hole: i,
        key: cur,
        comparisons,
        shifts,
        lo,
        hi,
        mid,
        compared: a[mid],
        goLeft,
      })
      if (goLeft) hi = mid
      else lo = mid + 1
    }
    const pos = lo

    // 3) зсуваємо блок [pos, i) праворуч, звільняючи місце під key
    for (let j = i; j > pos; j--) {
      a[j] = a[j - 1]
      shifts += 1
      events.push({
        kind: "shift",
        array: [...a],
        i,
        j,
        prefixLen: i,
        hole: j - 1, // «дірка» перемістилася ліворуч
        key: cur,
        comparisons,
        shifts,
        from: j - 1,
        to: j,
      })
    }

    // 4) вставляємо key на знайдену позицію
    a[pos] = cur
    events.push({
      kind: "insert",
      array: [...a],
      i,
      j: pos,
      prefixLen: i + 1,
      hole: null,
      key: null,
      comparisons,
      shifts,
      insertAt: pos,
    })
  }

  events.push({
    kind: "final",
    array: [...a],
    i: null,
    j: null,
    prefixLen: n,
    hole: null,
    key: null,
    comparisons,
    shifts,
  })

  return { sorted: a, events }
}

/**
 * Лічильники методу без журналу (порівняння / зсуви / вставки). Рахує через
 * `insertionSortSteps`, тож числа гарантовано збігаються з покроковими кадрами.
 */
export function countOperations(
  input: readonly number[],
  binary = false,
): InsertionCounts {
  const { events } = insertionSortSteps(input, binary)
  const last = events[events.length - 1]
  const insertions = events.filter((e) => e.kind === "insert").length
  return { comparisons: last.comparisons, shifts: last.shifts, insertions }
}

/** Кількість порівнянь лінійної версії в гіршому випадку: n(n−1)/2. */
export function maxComparisons(n: number): number {
  return (n * (n - 1)) / 2
}
