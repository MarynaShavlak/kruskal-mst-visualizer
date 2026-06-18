// Сортування Шелла (Shell Sort): УЗАГАЛЬНЕННЯ сортування вставками — порівнюємо й
// зсуваємо елементи, ВІДДАЛЕНІ на крок `gap`, а не сусідні. Великий gap дозволяє
// елементам «перестрибувати» далеко; gap зменшується до 1, і фінальний прохід —
// звичайні вставки, але вже на майже впорядкованому масиві (тому дешевий).
// Фреймворк-незалежне ядро — порт shell_sort/core.py репозиторію algo-shell-sort.
// Без React.
//
// ВИБІР послідовності проміжків (gap sequence) визначає складність — це «режим»
// алгоритму (аналог вибору опорного у швидкому сортуванні): Шелла (n//2) → O(n²)
// у гіршому; Кнута (3k+1) → O(n^1.5); Ciura (емпірична) → найшвидша на практиці.
// Сортування НА МІСЦІ (O(1) пам'яті, без рекурсії), АДАПТИВНЕ, але НЕстабільне
// (gap-зсуви можуть перестрибнути рівні ключі).

/** Іменовані послідовності проміжків (режими плеєра). */
export const GAP_SEQUENCES = ["shell", "knuth", "ciura"] as const
export type GapSequence = (typeof GAP_SEQUENCES)[number]

/** Оригінальна послідовність Шелла (1959): n//2, n//4, …, 1. */
export function gapsShell(n: number): number[] {
  const gaps: number[] = []
  let gap = Math.floor(n / 2)
  while (gap > 0) {
    gaps.push(gap)
    gap = Math.floor(gap / 2)
  }
  return gaps
}

/** Послідовність Кнута: h = 3·h + 1 (1, 4, 13, 40, …), члени < n, спадно. */
export function gapsKnuth(n: number): number[] {
  const gaps: number[] = []
  let h = 1
  while (h < n) {
    gaps.push(h)
    h = 3 * h + 1
  }
  gaps.reverse()
  return gaps
}

const CIURA = [1, 4, 10, 23, 57, 132, 301, 701] as const

/** Послідовність Ciura (2001): 1,4,10,23,57,132,301,701,… (далі ×2.25), спадно. */
export function gapsCiura(n: number): number[] {
  const gaps: number[] = CIURA.filter((g) => g < n)
  let g = gaps.length ? gaps[gaps.length - 1] : 1
  for (;;) {
    g = Math.trunc(g * 2.25)
    if (g >= n) break
    gaps.push(g)
  }
  gaps.reverse()
  return gaps
}

/** Послідовність проміжків за іменем режиму. */
export function gapsFor(seq: GapSequence, n: number): number[] {
  if (seq === "knuth") return gapsKnuth(n)
  if (seq === "ciura") return gapsCiura(n)
  return gapsShell(n)
}

/**
 * Базова реалізація з конспекту (gap = n//2, ділиться навпіл). Сортує НА МІСЦІ
 * за зростанням і повертає той самий масив (працює над копією входу для безпеки).
 */
export function shellSort(input: readonly number[]): number[] {
  const arr = [...input]
  const n = arr.length
  let gap = Math.floor(n / 2)
  while (gap > 0) {
    for (let i = gap; i < n; i++) {
      const temp = arr[i]
      let j = i
      while (j >= gap && arr[j - gap] > temp) {
        arr[j] = arr[j - gap]
        j -= gap
      }
      arr[j] = temp
    }
    gap = Math.floor(gap / 2)
  }
  return arr
}

/** Сортування Шелла із ЗАДАНОЮ послідовністю проміжків (спадна, кінчається на 1). */
export function shellSortWithGaps(
  input: readonly number[],
  gaps: readonly number[],
): number[] {
  const arr = [...input]
  const n = arr.length
  for (const gap of gaps) {
    for (let i = gap; i < n; i++) {
      const temp = arr[i]
      let j = i
      while (j >= gap && arr[j - gap] > temp) {
        arr[j] = arr[j - gap]
        j -= gap
      }
      arr[j] = temp
    }
  }
  return arr
}

/** Чи впорядкований масив за зростанням? */
export function isSorted(seq: readonly number[]): boolean {
  for (let i = 0; i < seq.length - 1; i++) {
    if (seq[i] > seq[i + 1]) return false
  }
  return true
}

/** Тип події журналу `shellSortSteps`. */
export type ShellKind =
  | "init"
  | "gap_start"
  | "i_start"
  | "compare"
  | "shift"
  | "insert"
  | "gap_end"
  | "final"

/** Один запис журналу подій сортування Шелла (знімок стану + лічильники). */
export interface ShellEvent {
  readonly kind: ShellKind
  /** Знімок масиву на момент події. */
  readonly array: readonly number[]
  /** Поточний проміжок (null поза фазою). */
  readonly gap: number | null
  /** Індекс зовнішнього циклу (null поза вставкою). */
  readonly i: number | null
  /** Індекс внутрішнього циклу (null поза вставкою). */
  readonly j: number | null
  /** Індекс «дірки» (вільної позиції) або null. */
  readonly hole: number | null
  /** Значення temp «у руці» або null. */
  readonly temp: number | null
  readonly comparisons: number
  readonly shifts: number
  // gap_start:
  readonly groups?: readonly (readonly number[])[]
  // compare:
  readonly jGap?: number
  readonly compared?: number
  readonly greater?: boolean
  // shift:
  readonly shiftedFrom?: number
  readonly shiftedTo?: number
  // insert:
  readonly insertAt?: number
}

/** Результат прогону: відсортований масив + журнал подій. */
export interface ShellSortStepsResult {
  readonly sorted: number[]
  readonly events: ShellEvent[]
}

/**
 * Інструментоване сортування Шелла: повторює базову логіку дія в дію, але після
 * кожної значущої дії кладе у журнал знімок стану. Працює над копією входу.
 * `gaps` — задана послідовність проміжків (типово `gapsShell(n)`).
 */
export function shellSortSteps(
  input: readonly number[],
  gaps?: readonly number[],
): ShellSortStepsResult {
  const a = [...input]
  const n = a.length
  const seq = gaps ?? gapsShell(n)
  let comparisons = 0
  let shifts = 0
  const events: ShellEvent[] = []

  const snap = (
    kind: ShellKind,
    gap: number | null,
    i: number | null,
    j: number | null,
    hole: number | null,
    temp: number | null,
    extra: Partial<ShellEvent> = {},
  ): void => {
    events.push({
      kind, array: [...a], gap, i, j, hole, temp, comparisons, shifts, ...extra,
    })
  }

  snap("init", null, null, null, null, null)

  for (const gap of seq) {
    const groups: number[][] = []
    for (let start = 0; start < Math.min(gap, n); start++) {
      const g: number[] = []
      for (let k = start; k < n; k += gap) g.push(k)
      groups.push(g)
    }
    snap("gap_start", gap, null, null, null, null, { groups })

    for (let i = gap; i < n; i++) {
      const temp = a[i]
      let j = i
      snap("i_start", gap, i, j, i, temp)

      for (;;) {
        if (j < gap) break
        comparisons += 1
        const greater = a[j - gap] > temp
        snap("compare", gap, i, j, j, temp, {
          jGap: j - gap, compared: a[j - gap], greater,
        })
        if (!greater) break
        a[j] = a[j - gap]
        shifts += 1
        snap("shift", gap, i, j - gap, j - gap, temp, {
          shiftedFrom: j - gap, shiftedTo: j,
        })
        j -= gap
      }

      a[j] = temp
      snap("insert", gap, i, j, null, temp, { insertAt: j })
    }

    snap("gap_end", gap, null, null, null, null)
  }

  snap("final", null, null, null, null, null)
  return { sorted: a, events }
}

/** Підсумок методу: порівняння, зсуви, кількість фаз gap. */
export interface ShellCounts {
  readonly comparisons: number
  readonly shifts: number
  readonly gapPhases: number
}

/**
 * Лічильники методу без журналу. Зручно для ПОРІВНЯННЯ послідовностей проміжків
 * (на тих самих даних рахуємо ціну для n//2 vs Кнута vs Ciura). Рахує через
 * `shellSortSteps`, тож числа збігаються з покроковими кадрами.
 */
export function countOperations(
  input: readonly number[],
  gaps?: readonly number[],
): ShellCounts {
  const { events } = shellSortSteps(input, gaps)
  const last = events[events.length - 1]
  const gapPhases = events.filter((e) => e.kind === "gap_start").length
  return { comparisons: last.comparisons, shifts: last.shifts, gapPhases }
}
