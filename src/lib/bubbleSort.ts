// Бульбашкове сортування (Bubble Sort): дві реалізації з конспекту (базова й
// оптимізована з прапорцем `swapped`) + інструментована версія, що пише журнал
// подій для покрокової візуалізації. Фреймворк-незалежне ядро — порт
// bubble_sort/core.py Python-репозиторію algo-bubble-sort. Без імпортів React.
//
// Сортування працює над МАСИВОМ на місці (O(1) додаткової пам'яті) і є СТАБІЛЬНИМ:
// обмін відбувається лише за строгої нерівності (`>`), тож рівні елементи ніколи
// не міняються місцями. Базова версія завжди робить усі n−1 проходів і n(n−1)/2
// порівнянь; оптимізована виходить достроково, якщо за прохід не було обмінів.

/** Спільні поля будь-якої події журналу. */
interface BubbleEventBase {
  /** Знімок масиву ПІСЛЯ можливого обміну на цьому кроці. */
  readonly array: readonly number[]
  /** Номер проходу (зовнішній цикл) або null поза проходом (init/final). */
  readonly i: number | null
  /** Індекс пари (j, j+1) у внутрішньому циклі або null. */
  readonly j: number | null
  /** Індекс, починаючи з якого «хвіст» уже відсортований (зелений). */
  readonly sortedFrom: number
  /** Накопичена кількість порівнянь. */
  readonly comparisons: number
  /** Накопичена кількість обмінів. */
  readonly swaps: number
}

/** Один запис журналу `bubbleSortSteps`. Дискримінант — `kind`. */
export type BubbleEvent =
  | (BubbleEventBase & { readonly kind: "init" })
  | (BubbleEventBase & {
      readonly kind: "compare"
      /** Значення лівого елемента пари (a[j]). */
      readonly left: number
      /** Значення правого елемента пари (a[j+1]). */
      readonly right: number
      /** Чи відбувся обмін (left > right). */
      readonly swapped: boolean
    })
  | (BubbleEventBase & {
      readonly kind: "pass-end"
      /** Позиція, що остаточно стала на місце цим проходом (n−i−1). */
      readonly locked: number
      /** Чи був хоч один обмін за цей прохід. */
      readonly swappedInPass: boolean
    })
  | (BubbleEventBase & {
      readonly kind: "early-stop"
      /** Скільки проходів зроблено до ранньої зупинки. */
      readonly passes: number
    })
  | (BubbleEventBase & {
      readonly kind: "final"
      /** Загальна кількість проходів. */
      readonly passes: number
    })

/** Підсумок прогону: порівняння, обміни, проходи. */
export interface BubbleCounts {
  readonly comparisons: number
  readonly swaps: number
  readonly passes: number
}

/**
 * Базова реалізація (код з конспекту): два вкладені цикли, обмін сусідніх
 * елементів за строгої нерівності. Сортує копію за зростанням і повертає її.
 * Завжди робить усі n−1 проходів. Час O(n²), пам'ять O(1).
 */
export function bubbleSort(input: readonly number[]): number[] {
  const lst = [...input]
  const n = lst.length
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (lst[j] > lst[j + 1]) {
        ;[lst[j], lst[j + 1]] = [lst[j + 1], lst[j]]
      }
    }
  }
  return lst
}

/**
 * Оптимізована версія: прапорець `swapped` + рання зупинка. Якщо за цілий прохід
 * не сталося жодного обміну — масив уже відсортовано, виходимо з циклу. Результат
 * і кількість обмінів ті самі, що в базовій; зайві «холості» проходи прибрано.
 * На вже відсортованому вході — один прохід, O(n).
 */
export function bubbleSortOptimized(input: readonly number[]): number[] {
  const lst = [...input]
  const n = lst.length
  for (let i = 0; i < n - 1; i++) {
    let swapped = false
    for (let j = 0; j < n - i - 1; j++) {
      if (lst[j] > lst[j + 1]) {
        ;[lst[j], lst[j + 1]] = [lst[j + 1], lst[j]]
        swapped = true
      }
    }
    if (!swapped) break
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
 * Інструментована бульбашка для покрокового розбору: повторює `bubbleSort`
 * (або `bubbleSortOptimized` при `optimized=true`) дія в дію, але після кожного
 * порівняння кладе у журнал знімок стану й лічильники. Працює над копією вхідного
 * масиву (вхід не змінюється). Порядок подій дослівно повторює Python-оригінал
 * `bubble_sort_steps`: init → (compare* → pass-end [→ early-stop])* → final.
 */
export function bubbleSortSteps(
  input: readonly number[],
  optimized = false,
): { readonly sorted: number[]; readonly events: BubbleEvent[] } {
  const a = [...input]
  const n = a.length
  let comparisons = 0
  let swaps = 0
  const events: BubbleEvent[] = []

  events.push({
    kind: "init",
    array: [...a],
    i: null,
    j: null,
    sortedFrom: n,
    comparisons,
    swaps,
  })

  let passes = 0
  for (let i = 0; i < n - 1; i++) {
    let swappedInPass = false
    // До проходу i вже зафіксовано i елементів у хвості → індекси [n−i, n).
    const sortedFrom = n - i
    for (let j = 0; j < n - i - 1; j++) {
      const left = a[j]
      const right = a[j + 1]
      comparisons += 1
      const willSwap = left > right
      if (willSwap) {
        a[j] = right
        a[j + 1] = left
        swaps += 1
        swappedInPass = true
      }
      events.push({
        kind: "compare",
        array: [...a],
        i,
        j,
        sortedFrom,
        comparisons,
        swaps,
        left,
        right,
        swapped: willSwap,
      })
    }

    passes += 1
    const locked = n - i - 1 // позиція, що остаточно стала на місце цим проходом
    events.push({
      kind: "pass-end",
      array: [...a],
      i,
      j: null,
      sortedFrom: locked,
      comparisons,
      swaps,
      locked,
      swappedInPass,
    })

    if (optimized && !swappedInPass) {
      events.push({
        kind: "early-stop",
        array: [...a],
        i,
        j: null,
        sortedFrom: 0,
        comparisons,
        swaps,
        passes,
      })
      break
    }
  }

  events.push({
    kind: "final",
    array: [...a],
    i: null,
    j: null,
    sortedFrom: 0,
    comparisons,
    swaps,
    passes,
  })

  return { sorted: a, events }
}

/**
 * Лічильники методу без журналу (порівняння / обміни / проходи). Рахує через
 * `bubbleSortSteps`, тож числа гарантовано збігаються з покроковими кадрами.
 */
export function countOperations(
  input: readonly number[],
  optimized = false,
): BubbleCounts {
  const { events } = bubbleSortSteps(input, optimized)
  const last = events[events.length - 1]
  const passes = events.filter((e) => e.kind === "pass-end").length
  return { comparisons: last.comparisons, swaps: last.swaps, passes }
}

/** Кількість порівнянь наївної версії: завжди n(n−1)/2. */
export function maxComparisons(n: number): number {
  return (n * (n - 1)) / 2
}
