// Лінійний пошук (Linear Search): найпростіший алгоритм пошуку й ПЕРШИЙ у серії,
// що не сортує, а ШУКАЄ. Щоб знайти значення x у масиві, послідовно перевіряємо
// кожен елемент зліва направо й порівнюємо з x; на першому збігу повертаємо ІНДЕКС,
// інакше — -1. Масив НЕ змінюється і не потребує впорядкованості — працює на
// невпорядкованих даних. «Ціна» — кількість ПЕРЕВІРОК (порівнянь arr[i] == x);
// жодних обмінів чи зсувів, як у сортуваннях, немає. Порт linear_search/core.py
// репозиторію algo-linear-search. Фреймворк-незалежне ядро, без React.
//
// Модуль містить кілька рівнів:
//   linearSearch — базова з конспекту (індекс першого збігу або -1), її розбирає README;
//   existsInList — булева обгортка (чи є x узагалі);
//   findAll — усі індекси входжень (а не лише перший — повний скан);
//   linearSearchSentinel — варіант із «вартовим» (прибирає перевірку меж із циклу);
//   linearSearchSteps — інструментована (журнал подій) для перевірок коректності;
//   countComparisons / caseAnalysis — лічильник перевірок і аналіз випадків.

// ---------------------------------------------------------------------------
// Базові реалізації з конспекту (зберігаємо ДОСЛІВНО — їх розбирає README)
// ---------------------------------------------------------------------------

/**
 * Базовий лінійний пошук: перебирає `arr` зліва направо й порівнює кожен елемент
 * із `x`. На першому збігу повертає його ІНДЕКС; якщо дійшли до кінця без збігу —
 * `-1`. `arr` не змінюється. O(n) перевірок у гіршому випадку, O(1) у найкращому.
 */
export function linearSearch(arr: readonly number[], x: number): number {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === x) return i
  }
  return -1
}

/** Чи існує `x` у `arr` — булева обгортка (перевіряє, що індекс не `-1`). */
export function existsInList(arr: readonly number[], x: number): boolean {
  return linearSearch(arr, x) !== -1
}

/**
 * Усі індекси входжень `x` у `arr` (а не лише перший). Базовий `linearSearch`
 * спиняється на ПЕРШОМУ збігу й мовчить про решту — щоб дістати всі, доводиться
 * пройти масив до кінця. Повертає список індексів (порожній, якщо `x` немає).
 */
export function findAll(arr: readonly number[], x: number): number[] {
  const out: number[] = []
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === x) out.push(i)
  }
  return out
}

/**
 * Лінійний пошук із «вартовим» (sentinel) — класична мікрооптимізація. Дописуємо
 * `x` у кінець копії як «вартового», тож збіг гарантований; тепер перевірку меж
 * можна прибрати з гарячого циклу — лишається тільки корисне порівняння. Результат
 * той самий, що й у `linearSearch` (вхід не змінюється). Асимптотику не змінює.
 */
export function linearSearchSentinel(arr: readonly number[], x: number): number {
  const n = arr.length
  const a = [...arr, x] // вартовий: збіг тепер гарантований
  let i = 0
  while (a[i] !== x) i += 1 // без перевірки меж: вартовий зупинить цикл
  return i < n ? i : -1 // дійшли до вартового → елемента немає
}

// ---------------------------------------------------------------------------
// Інструментована версія: журнал подій (для перевірок коректності)
// ---------------------------------------------------------------------------

/** Тип події журналу `linearSearchSteps` (як у core.py). */
export type SearchEventKind = "init" | "probe" | "found" | "not_found" | "final"

/** Один запис журналу подій лінійного пошуку (знімок стану + лічильник перевірок). */
export interface SearchEvent {
  readonly kind: SearchEventKind
  /** Знімок масиву — НЕЗМІННИЙ (пошук лише читає). */
  readonly array: readonly number[]
  readonly target: number
  /** Індекс курсора або null (init / not_found). */
  readonly i: number | null
  /** Значення `arr[i]` для перевірок. */
  readonly value: number | null
  /** Результат перевірки (true — збіг, false — ні, null — не перевірка). */
  readonly match: boolean | null
  /** Накопичена кількість перевірок (порівнянь). */
  readonly comparisons: number
  /** Знайдений індекс / -1 / null (поки не вирішено). */
  readonly result: number | null
}

/** Результат прогону: знайдений індекс + журнал подій. */
export interface SearchStepsResult {
  readonly result: number
  readonly events: SearchEvent[]
}

/**
 * Інструментований лінійний пошук для покрокового розбору. Повторює `linearSearch`
 * дія в дію — той самий порядок перевірок, — але після кожної перевірки кладе у
 * журнал знімок стану. Масив не змінюється. Кожна перевірка збільшує `comparisons`
 * на 1: невдала дає подію `probe`, вдала — `found`.
 */
export function linearSearchSteps(
  arr: readonly number[],
  x: number,
): SearchStepsResult {
  const a = [...arr]
  let comparisons = 0
  const events: SearchEvent[] = []

  const snap = (
    kind: SearchEventKind,
    i: number | null,
    value: number | null,
    match: boolean | null,
    result: number | null,
  ): SearchEvent => ({ kind, array: a, target: x, i, value, match, comparisons, result })

  events.push(snap("init", null, null, null, null))

  let result = -1
  for (let i = 0; i < a.length; i++) {
    const value = a[i]
    comparisons += 1
    if (value === x) {
      result = i
      events.push(snap("found", i, value, true, i))
      events.push(snap("final", i, null, null, result))
      return { result, events }
    }
    events.push(snap("probe", i, value, false, null))
  }
  events.push(snap("not_found", null, null, null, -1))
  events.push(snap("final", null, null, null, result))
  return { result, events }
}

// ---------------------------------------------------------------------------
// Лічильники й аналіз випадків
// ---------------------------------------------------------------------------

/**
 * Кількість перевірок `arr[i] == x` до знаходження/кінця (без журналу). Найкращий
 * випадок (елемент спереду) — 1; знайдено — індекс+1; відсутній — `len(arr)`
 * (повний скан). Рахує через `linearSearchSteps`, тож збігається з кадрами.
 */
export function countComparisons(arr: readonly number[], x: number): number {
  const { events } = linearSearchSteps(arr, x)
  return events[events.length - 1].comparisons
}

/** Аналіз випадків лінійного пошуку для масиву довжини `n` (головний акцент README). */
export interface CaseAnalysis {
  readonly n: number
  /** Найкращий: елемент спереду — 1 перевірка (O(1)). */
  readonly best: number
  /** Гірший-знайдено: елемент у кінці — n перевірок (O(n)). */
  readonly worst: number
  /** Відсутній: повний скан до -1 — n перевірок (теж гірший). */
  readonly absent: number
  /** Середній (елемент рівноймовірно на будь-якій позиції) — (n+1)/2 ≈ n/2. */
  readonly average: number
}

/** Аналіз випадків для масиву (best / worst-found / absent / average). */
export function caseAnalysis(values: readonly number[]): CaseAnalysis {
  const n = values.length
  return {
    n,
    best: n > 0 ? 1 : 0,
    worst: n,
    absent: n,
    average: n > 0 ? (n + 1) / 2 : 0,
  }
}
