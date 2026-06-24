// Наївний (грубої сили) пошук у рядках (Naive String Search) — ПЕРШИЙ алгоритм
// рядкового пошуку серії й базовий орієнтир. Ковзаємо шаблоном `pattern` уздовж тексту
// `text`: на кожному ВИРІВНЮВАННІ `i` (зсуві шаблону) порівнюємо символи зліва направо
// `text[i+j] == pattern[j]`; на першій розбіжності — БРЕЙК і зсув на 1 (i += 1), j знову з 0.
// Жодної передобробки, жодної пам'яті про вже звірене — звідси «марна робота»: повторне
// порівняння вже перевіреного префікса (саме це усуває KMP). «Ціна» — кількість ПОРІВНЯНЬ
// символів: найкращий випадок ≈ N-M+1 (розбіжність на першому символі щоразу), найгірший
// (N-M+1)·M (повторюваний префікс, як AAAA…/AAAAB). Порт core.py репозиторію
// algo-naive-string-search. Фреймворк-незалежне ядро, без React.
//
// Рівні: naiveSearch (база з конспекту — її розбирає README) + naiveSearchAll (усі
// входження) + naiveSearchSlices (Pythonic через зрізи) + naiveSearchSteps (журнал подій
// для візуалізацій + лічильники) + countComparisons + caseAnalysis.

/**
 * Базовий наївний пошук (код з конспекту). Повертає індекс ПЕРШОГО входження `pattern`
 * у `text` або `-1`. Ковзає шаблоном: для кожного вирівнювання `i ∈ [0, N-M]` порівнює
 * символи доти, доки не дійде кінця шаблону (збіг) або не натрапить на розбіжність
 * (тоді зсувається на 1). Порожній шаблон вважається знайденим на позиції 0.
 */
export function naiveSearch(text: string, pattern: string): number {
  const n = text.length
  const m = pattern.length
  if (m === 0) return 0
  for (let i = 0; i <= n - m; i++) {
    let j = 0
    while (j < m && text[i + j] === pattern[j]) j++
    if (j === m) return i
  }
  return -1
}

/**
 * Усі входження `pattern` у `text` (зокрема такі, що перекриваються) — список початкових
 * позицій або порожній список. Продовжує ковзати після кожного збігу (зсув на 1).
 * Порожній шаблон → усі позиції `[0..N]`.
 */
export function naiveSearchAll(text: string, pattern: string): number[] {
  const n = text.length
  const m = pattern.length
  const out: number[] = []
  if (m === 0) {
    for (let i = 0; i <= n; i++) out.push(i)
    return out
  }
  for (let i = 0; i <= n - m; i++) {
    let j = 0
    while (j < m && text[i + j] === pattern[j]) j++
    if (j === m) out.push(i)
  }
  return out
}

/**
 * Pythonic-варіант через зрізи: `text.slice(i, i+M) === pattern`. Той самий результат,
 * що `naiveSearch`, але порівняння рядків приховує посимвольний цикл (короткий код ціною
 * неявних порівнянь). Корисний для контрасту «що насправді робить інтерпретатор».
 */
export function naiveSearchSlices(text: string, pattern: string): number {
  const n = text.length
  const m = pattern.length
  if (m === 0) return 0
  for (let i = 0; i <= n - m; i++) {
    if (text.slice(i, i + m) === pattern) return i
  }
  return -1
}

// ---------------------------------------------------------------------------
// Інструментована версія: журнал подій + лічильники (для перевірок коректності)
// ---------------------------------------------------------------------------

/** Тип події журналу `naiveSearchSteps` (як у core.py). */
export type NaiveEventKind =
  | "init"
  | "align"
  | "compare"
  | "mismatch"
  | "match_found"
  | "not_found"
  | "final"

/** Один запис журналу подій наївного пошуку (знімок стану + лічильники). */
export interface NaiveEvent {
  readonly kind: NaiveEventKind
  /** Поточне вирівнювання (зсув шаблону) або null. */
  readonly i: number | null
  /** Позиція в шаблоні або null. */
  readonly j: number | null
  /** Символ тексту `text[i+j]` для порівняння. */
  readonly textChar: string | null
  /** Символ шаблону `pattern[j]` для порівняння. */
  readonly patternChar: string | null
  /** Результат порівняння символів (для compare/mismatch). */
  readonly match: boolean | null
  /** Скільки символів збіглося в поточному вирівнюванні (до цього порівняння). */
  readonly matched: number
  // — накопичені лічильники —
  readonly comparisons: number
  readonly alignments: number
  readonly shifts: number
  readonly result: number | null
}

/** Результат прогону: перший індекс (-1), усі входження, лічильники + журнал. */
export interface NaiveStepsResult {
  readonly result: number
  readonly matches: readonly number[]
  readonly comparisons: number
  readonly alignments: number
  readonly shifts: number
  readonly events: NaiveEvent[]
}

/**
 * Інструментований наївний пошук для покрокового розбору. Повторює `naiveSearch` дія в
 * дію — той самий порядок вирівнювань і посимвольних порівнянь, — але кожен крок
 * супроводжує знімком стану й лічильниками (порівняння / вирівнювання / зсуви).
 * `findAll=false` зупиняється на першому збігу (як `naiveSearch`); `findAll=true`
 * продовжує до кінця тексту (як `naiveSearchAll`). Інваріанти: `comparisons` = кількість
 * подій `compare`, `alignments` = кількість `align`, `shifts` = кількість `mismatch`.
 */
export function naiveSearchSteps(
  text: string,
  pattern: string,
  findAll = false,
): NaiveStepsResult {
  const n = text.length
  const m = pattern.length
  const events: NaiveEvent[] = []
  const matches: number[] = []
  let comparisons = 0
  let alignments = 0
  let shifts = 0
  let result: number

  const snap = (
    kind: NaiveEventKind,
    f: Partial<Omit<NaiveEvent, "kind" | "comparisons" | "alignments" | "shifts">>,
  ): NaiveEvent => ({
    kind,
    i: f.i ?? null,
    j: f.j ?? null,
    textChar: f.textChar ?? null,
    patternChar: f.patternChar ?? null,
    match: f.match ?? null,
    matched: f.matched ?? 0,
    comparisons,
    alignments,
    shifts,
    result: f.result ?? null,
  })

  events.push(snap("init", {}))

  if (m === 0) {
    // Порожній шаблон — вважаємо знайденим на 0 (узгоджено з naiveSearch).
    result = 0
    matches.push(0)
    events.push(snap("match_found", { i: 0, j: 0, matched: 0, result: 0 }))
    events.push(snap("final", { result }))
    return { result, matches, comparisons, alignments, shifts, events }
  }

  for (let i = 0; i <= n - m; i++) {
    alignments += 1
    events.push(snap("align", { i, j: 0, matched: 0 }))
    let j = 0
    while (j < m) {
      const tc = text[i + j]
      const pc = pattern[j]
      const eq = tc === pc
      comparisons += 1
      events.push(snap("compare", { i, j, textChar: tc, patternChar: pc, match: eq, matched: j }))
      if (!eq) {
        shifts += 1
        events.push(snap("mismatch", { i, j, textChar: tc, patternChar: pc, match: false, matched: j }))
        break
      }
      j++
    }
    if (j === m) {
      matches.push(i)
      events.push(snap("match_found", { i, j: m, matched: m, result: i }))
      if (!findAll) {
        result = i
        events.push(snap("final", { result }))
        return { result, matches, comparisons, alignments, shifts, events }
      }
    }
  }

  result = matches.length > 0 ? matches[0] : -1
  if (result < 0) events.push(snap("not_found", { result: -1 }))
  events.push(snap("final", { result }))
  return { result, matches, comparisons, alignments, shifts, events }
}

/** Кількість посимвольних порівнянь до результату — без журналу (для таблиць складності). */
export function countComparisons(text: string, pattern: string, findAll = false): number {
  return naiveSearchSteps(text, pattern, findAll).comparisons
}

// ---------------------------------------------------------------------------
// Аналіз випадків
// ---------------------------------------------------------------------------

/** Аналіз випадків наївного пошуку для тексту довжини `n` і шаблону довжини `m`. */
export interface NssCaseAnalysis {
  readonly n: number
  readonly m: number
  /** Кількість можливих вирівнювань `N-M+1` (≥ 0). */
  readonly alignments: number
  /** Найкращий: розбіжність на першому символі щоразу — `N-M+1` порівнянь (O(n)). */
  readonly best: number
  /** Найгірший: повний префікс щоразу — `(N-M+1)·M` порівнянь (O(n·m)). */
  readonly worst: number
}

/** Аналіз випадків: best ≈ N-M+1 (O(n)) / worst (N-M+1)·M (O(n·m), при m≈n → O(n²)). */
export function caseAnalysis(text: string, pattern: string): NssCaseAnalysis {
  const n = text.length
  const m = pattern.length
  const alignments = Math.max(0, n - m + 1)
  return {
    n,
    m,
    alignments,
    best: alignments,
    worst: alignments * m,
  }
}
