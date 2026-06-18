// Індексно-послідовний пошук (Indexed Sequential Search): ГІБРИДНИЙ метод і ТРЕТІЙ
// (завершальний) алгоритм пошуку серії — синтез двійкового й лінійного. Працює у
// ДВІ ФАЗИ на ДВОХ РІВНЯХ даних:
//   Фаза 1 — ДВІЙКОВИЙ пошук по розрідженій ІНДЕКСНІЙ ТАБЛИЦІ (кожен step-ий елемент
//            як пара (ключ, позиція)) → визначає БЛОК основного масиву.
//   Фаза 2 — ПОСЛІДОВНИЙ скан ЛИШЕ цього блоку → індекс першого збігу або -1.
// Складність O(log n + m): зондування індексу (двійкові, ≈ log n) + порівняння в
// блоці (≈ m ≈ step). Оптимум кроку — біля √n (місток до Jump Search). ПЕРЕДУМОВА:
// масив відсортований (інакше некоректно). Порт indexed_sequential_search/core.py.
// Фреймворк-незалежне ядро, без React.

/** Запис індексної таблиці: пара (ключ, позиція в основному масиві). */
export type IndexEntry = readonly [key: number, pos: number]

/**
 * Будує індексну таблицю (код з конспекту): кожен `step`-ий елемент масиву як пару
 * `(ключ, позиція)`. Розріджена підмножина — «сигнальні стовпи», рівномірно
 * розподілені. Напр. `[1,3,5,7,9,11,13,15,17,19,21,23,25]`, `step=4` →
 * `[(1,0),(9,4),(17,8),(25,12)]`.
 */
export function createIndexTable(
  array: readonly number[],
  step: number,
): IndexEntry[] {
  const table: IndexEntry[] = []
  // НАВМИСНЕ відхилення від core.py: крок клампиться до ≥1. Python `range(0,n,step)`
  // кидав би ValueError на step==0 і повертав порожню таблицю на step<0; ми ж
  // гартуємо вхід (стор `setStep`/`loadDoc` теж клампить, тож невалідний крок не
  // дійде сюди через UI). Для коректного step≥1 поведінка ІДЕНТИЧНА Python.
  const s = Math.max(1, Math.trunc(step))
  for (let i = 0; i < array.length; i += s) table.push([array[i], i])
  return table
}

/**
 * Базова двофазна реалізація (код з конспекту). Фаза 1 — двійковий пошук по
 * `indexTable` (вікно `[start, end]`, середина `mid`): рівне — повертаємо позицію
 * одразу; менше — `start = mid+1`; більше — `end = mid-1`. Коли вікно спорожніло,
 * `start` указує, МІЖ ЯКИМИ стовпами лежить шукане → три гілки задають блок. Фаза 2
 * — лінійний прохід у межах блоку.
 *
 * ПЕРЕДУМОВА: `array` відсортований, `indexTable` побудована з нього. Не змінює
 * `array`. O(log n + m).
 */
export function indexedSequentialSearch(
  array: readonly number[],
  indexTable: readonly IndexEntry[],
  target: number,
): number {
  // Фаза 1: двійковий пошук в індексній таблиці
  let start = 0
  let end = indexTable.length - 1
  while (start <= end) {
    const mid = Math.floor((start + end) / 2)
    if (indexTable[mid][0] === target) return indexTable[mid][1]
    else if (indexTable[mid][0] < target) start = mid + 1
    else end = mid - 1
  }

  const range = blockRange(array, indexTable, start)
  // Фаза 2: послідовний пошук у межах блоку
  for (let i = range[0]; i < range[1]; i++) {
    if (array[i] === target) return i
  }
  return -1
}

/**
 * Варіант: фаза 1 — ЛІНІЙНИЙ прохід по індексу (замість двійкового). Простіше для
 * розуміння (`O(n/step)` на першу фазу), але логіка вибору блоку й фаза 2 —
 * ІДЕНТИЧНІ базовій, тож результат той самий індекс. Показує, що «двійковий по
 * індексу» — лише ПРИСКОРЕННЯ першої фази, а не зміна суті методу.
 */
export function indexedSequentialSearchLinearIndex(
  array: readonly number[],
  indexTable: readonly IndexEntry[],
  target: number,
): number {
  // Фаза 1 (лінійно): шукаємо, між якими стовпами лежить target
  let start = 0
  while (start < indexTable.length) {
    if (indexTable[start][0] === target) return indexTable[start][1]
    if (indexTable[start][0] > target) break
    start += 1
  }

  const range = blockRange(array, indexTable, start)
  for (let i = range[0]; i < range[1]; i++) {
    if (array[i] === target) return i
  }
  return -1
}

/**
 * Споріднений блочний пошук «стрибками» (Jump Search): замість двійкового пошуку по
 * окремій таблиці робить ЛІНІЙНІ стрибки завдовжки `step` прямо по масиву, доки
 * останній елемент блоку не стане `>= target`, а тоді сканує блок. За замовчуванням
 * `step = ⌊√n⌋` — той самий баланс, що мінімізує роботу й тут. Той самий результат.
 */
export function jumpSearch(
  array: readonly number[],
  target: number,
  step?: number,
): number {
  const n = array.length
  if (n === 0) return -1
  const s = step != null ? Math.max(1, Math.trunc(step)) : Math.max(1, Math.floor(Math.sqrt(n)))
  let prev = 0
  while (prev < n && array[Math.min(prev + s, n) - 1] < target) prev += s
  for (let i = prev; i < Math.min(prev + s, n); i++) {
    if (array[i] === target) return i
  }
  return -1
}

/** Гілка вибору блоку для значення `start` (де спинилась фаза 1). Спільна логіка. */
export type Branch = "start==0" | "start>=len" | "general"

/** Обчислює `[lo, hi)` блоку основного масиву за значенням `start` (три гілки). */
export function blockRange(
  array: readonly number[],
  indexTable: readonly IndexEntry[],
  start: number,
): readonly [number, number] {
  if (start === 0) return [0, indexTable[0][1]]
  if (start >= indexTable.length) return [indexTable[indexTable.length - 1][1], array.length]
  return [indexTable[start - 1][1], indexTable[start][1]]
}

/** Назва гілки для значення `start` (для нарації / step-table). */
export function branchFor(indexTable: readonly IndexEntry[], start: number): Branch {
  if (start === 0) return "start==0"
  if (start >= indexTable.length) return "start>=len"
  return "general"
}

/**
 * Чи відсортований `arr` за зростанням? ПЕРЕДУМОВА коректності: і двійковий пошук по
 * індексу, і логіка вибору блоку покладаються на впорядкованість. На невідсортованих
 * даних метод може «відкинути» блок, у якому насправді лежить шукане.
 */
export function isSorted(arr: readonly number[]): boolean {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) return false
  }
  return true
}

/** Оптимальний крок ≈ √n (баланс розміру таблиці й довжини блоку). */
export function optimalStep(n: number): number {
  return Math.max(1, Math.round(Math.sqrt(Math.max(0, n))))
}

// ---------------------------------------------------------------------------
// Інструментована версія: журнал подій (для перевірок коректності, як у core.py)
// ---------------------------------------------------------------------------

/** Тип події журналу (як у core.py). */
export type IxsEventKind =
  | "init"
  | "index_probe"
  | "found"
  | "block_selected"
  | "seq_step"
  | "not_found"
  | "final"

/** Порівняння ключа стовпа / значення з ціллю. */
export type Compare = "lt" | "gt" | "eq"
/** Рішення кроку фази 1. */
export type Decision = "right" | "left" | "found"

/** Один запис журналу (знімок стану + лічильники). Масив НЕЗМІННИЙ. */
export interface IxsEvent {
  readonly kind: IxsEventKind
  readonly phase: "index" | "block" | null
  readonly array: readonly number[]
  readonly indexTable: readonly IndexEntry[]
  readonly step: number
  readonly target: number
  readonly start: number | null
  readonly end: number | null
  readonly mid: number | null
  readonly key: number | null
  readonly pos: number | null
  readonly compare: Compare | null
  readonly decision: Decision | null
  readonly searchRange: readonly [number, number] | null
  readonly branch: Branch | null
  readonly i: number | null
  readonly value: number | null
  readonly match: boolean | null
  readonly indexProbes: number
  readonly seqComparisons: number
  readonly total: number
  readonly result: number | null
}

/** Результат інструментованого прогону: індекс + журнал. */
export interface IxsStepsResult {
  readonly result: number
  readonly events: IxsEvent[]
}

/**
 * Інструментований індексно-послідовний пошук (базовий, двійковий по індексу) для
 * перевірок коректності. Повторює `indexedSequentialSearch` дія в дію, але після
 * кожного зондування індексу й кожного послідовного порівняння кладе у журнал
 * знімок із позначкою ФАЗИ та двома лічильниками (`indexProbes` / `seqComparisons`).
 */
export function indexedSequentialSearchSteps(
  array: readonly number[],
  target: number,
  step: number,
): IxsStepsResult {
  const a = [...array]
  const indexTable = createIndexTable(a, step)
  const s = Math.max(1, Math.trunc(step))
  let indexProbes = 0
  let seqComparisons = 0
  const events: IxsEvent[] = []

  const snap = (kind: IxsEventKind, f: Partial<IxsEvent> = {}): IxsEvent => ({
    kind,
    phase: f.phase ?? null,
    array: a,
    indexTable,
    step: s,
    target,
    start: f.start ?? null,
    end: f.end ?? null,
    mid: f.mid ?? null,
    key: f.key ?? null,
    pos: f.pos ?? null,
    compare: f.compare ?? null,
    decision: f.decision ?? null,
    searchRange: f.searchRange ?? null,
    branch: f.branch ?? null,
    i: f.i ?? null,
    value: f.value ?? null,
    match: f.match ?? null,
    indexProbes,
    seqComparisons,
    total: indexProbes + seqComparisons,
    result: f.result ?? null,
  })

  events.push(snap("init"))

  // порожня таблиця (порожній масив) → шукати нема де
  if (indexTable.length === 0) {
    events.push(snap("not_found", { searchRange: [0, 0], result: -1 }))
    events.push(snap("final", { searchRange: [0, 0], result: -1 }))
    return { result: -1, events }
  }

  // Фаза 1: двійковий пошук по індексу
  let start = 0
  let end = indexTable.length - 1
  while (start <= end) {
    const mid = Math.floor((start + end) / 2)
    const [key, pos] = indexTable[mid]
    indexProbes += 1
    if (key === target) {
      events.push(snap("found", {
        phase: "index", start, end, mid, key, pos,
        compare: "eq", decision: "found", result: pos,
      }))
      events.push(snap("final", { result: pos }))
      return { result: pos, events }
    } else if (key < target) {
      events.push(snap("index_probe", {
        phase: "index", start, end, mid, key, pos, compare: "lt", decision: "right",
      }))
      start = mid + 1
    } else {
      events.push(snap("index_probe", {
        phase: "index", start, end, mid, key, pos, compare: "gt", decision: "left",
      }))
      end = mid - 1
    }
  }

  // Визначення блоку
  const searchRange = blockRange(a, indexTable, start)
  const branch = branchFor(indexTable, start)
  events.push(snap("block_selected", { start, end, searchRange, branch }))

  // Фаза 2: послідовний пошук у блоці
  let result = -1
  for (let i = searchRange[0]; i < searchRange[1]; i++) {
    const value = a[i]
    seqComparisons += 1
    if (value === target) {
      result = i
      events.push(snap("found", {
        phase: "block", searchRange, branch, i, value, match: true, result: i,
      }))
      break
    }
    events.push(snap("seq_step", {
      phase: "block", searchRange, branch, i, value, match: false,
    }))
  }
  if (result < 0) {
    events.push(snap("not_found", { searchRange, branch, result: -1 }))
  }
  events.push(snap("final", { searchRange, branch, result }))
  return { result, events }
}

/** Лічильники методу без журналу (базова версія): зондування індексу / порівняння / сума. */
export interface IxsCounts {
  readonly indexProbes: number
  readonly seqComparisons: number
  readonly total: number
}

/** Лічильники базового (двійкового) індексно-послідовного пошуку для масиву + цілі. */
export function countSteps(
  array: readonly number[],
  target: number,
  step: number,
): IxsCounts {
  const { events } = indexedSequentialSearchSteps(array, target, step)
  const last = events[events.length - 1]
  return {
    indexProbes: last.indexProbes,
    seqComparisons: last.seqComparisons,
    total: last.total,
  }
}
