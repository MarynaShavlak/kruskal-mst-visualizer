// Алгоритм Кнута-Морріса-Пратта (KMP) для пошуку в рядках — ДРУГИЙ алгоритм рядкового
// пошуку серії після наївного. Задача та сама: знайти, з якої позиції ШАБЛОН (`pattern`)
// входить у ТЕКСТ (`text`). Наївний метод після розбіжності зсувається на 1 і ПОВТОРНО
// звіряє вже перевірений префікс (індекс тексту «відкочується»). KMP цього не робить: він
// спершу ОДИН раз аналізує сам шаблон і будує ПРЕФІКСНУ ФУНКЦІЮ — таблицю `lps`
// (longest-prefix-suffix), що на розбіжності підказує, на скільки «відкотити» індекс
// шаблону `j`, не торкаючись тексту. Завдяки цьому індекс тексту `i` НІКОЛИ не зменшується,
// а сумарна робота лінійна — O(n+m). Порт core.py репозиторію algo-knuth-morris-pratt-search.
// Фреймворк-незалежне ядро, без React.
//
// Дві фази: 1) ПЕРЕДОБРОБКА — computeLps будує `lps` за O(m), не дивлячись на текст;
// 2) ПОШУК — kmpSearch робить один прохід тексту за O(n), стрибаючи шаблоном за `lps`.

/** Тип події журналу `computeLpsSteps` (як у core.py). */
export type LpsEventKind = "init" | "compare" | "set" | "fallback" | "zero" | "advance" | "final"

/** Один запис журналу побудови таблиці `lps` (знімок стану + лічильник). */
export interface LpsEvent {
  readonly kind: LpsEventKind
  /** Знімок таблиці `lps` на цей момент. */
  readonly lps: readonly number[]
  /** Поточна позиція в шаблоні або null. */
  readonly i: number | null
  /** Довжина збіжного префікса-суфікса. */
  readonly length: number
  /** Символ `pattern[i]` для порівняння. */
  readonly charI: string | null
  /** Символ `pattern[length]` для порівняння. */
  readonly charLen: string | null
  /** Результат порівняння символів (для compare). */
  readonly match: boolean | null
  /** Нове значення `length` після відкоту (для fallback). */
  readonly newLength: number | null
  readonly comparisons: number
}

/** Результат інструментованої побудови `lps`: готова таблиця + журнал. */
export interface LpsStepsResult {
  readonly lps: number[]
  readonly events: LpsEvent[]
  readonly comparisons: number
}

/** Тип події журналу `kmpSearchSteps` (як у core.py). */
export type KmpSearchEventKind =
  | "init"
  | "compare"
  | "advance_both"
  | "shift"
  | "advance_i"
  | "match_found"
  | "not_found"
  | "final"

/** Один запис журналу пошуку KMP (знімок стану + лічильник). */
export interface KmpSearchEvent {
  readonly kind: KmpSearchEventKind
  /** Таблиця префіксної функції шаблону. */
  readonly lps: readonly number[]
  /** Позиція в тексті. */
  readonly i: number
  /** Позиція в шаблоні. */
  readonly j: number
  /** Зміщення шаблону вздовж тексту (`i - j`). */
  readonly offset: number
  /** Символ `text[i]` для порівняння. */
  readonly textChar: string | null
  /** Символ `pattern[j]` для порівняння. */
  readonly patternChar: string | null
  /** Результат порівняння символів (для compare). */
  readonly match: boolean | null
  /** На скільки шаблон стрибнув уперед (для shift). */
  readonly jump: number | null
  readonly comparisons: number
  /** True, доки `i` жодного разу не зменшилося. */
  readonly iMonotonic: boolean
  readonly result: number | null
}

/** Результат інструментованого пошуку KMP: перший індекс + журнал. */
export interface KmpSearchStepsResult {
  readonly result: number
  readonly events: KmpSearchEvent[]
  readonly comparisons: number
}

// ===========================================================================
// Фаза 1 — ПЕРЕДОБРОБКА: префіксна функція (таблиця lps)
// ===========================================================================

/**
 * Побудувати таблицю `lps` (префіксну функцію) шаблону — код з конспекту. `lps[i]` —
 * довжина найбільшого ВЛАСНОГО префікса відрізка `pattern[0..i]`, який одночасно є його
 * суфіксом. Таблиця вказує, на скільки «відкотити» індекс шаблону `j` у разі розбіжності
 * під час пошуку. Складність O(m); текст не використовується. Серце KMP.
 */
export function computeLps(pattern: string): number[] {
  const lps = new Array<number>(pattern.length).fill(0)
  let length = 0
  let i = 1
  while (i < pattern.length) {
    if (pattern[i] === pattern[length]) {
      length += 1
      lps[i] = length
      i += 1
    } else if (length !== 0) {
      length = lps[length - 1]
    } else {
      lps[i] = 0
      i += 1
    }
  }
  return lps
}

// ===========================================================================
// Фаза 2 — ПОШУК: один прохід тексту з використанням lps
// ===========================================================================

/**
 * Базова реалізація пошуку KMP (код з конспекту). Спершу будує `lps`, тоді робить ОДИН
 * прохід тексту: на збігу просуває обидва індекси; на розбіжності за `j != 0` ВІДКОЧУЄ
 * лише шаблон (`j = lps[j-1]`), лишаючи `i` на місці; за `j == 0` просуває `i`. Щойно
 * `j == M` — повертає позицію початку `i - j`. Повертає `-1`, якщо не знайдено. Визначальна
 * риса: індекс тексту `i` НІКОЛИ не зменшується. Складність O(n + m).
 *
 * Зауваження: це дослівний код конспекту. На ПОРОЖНЬОМУ шаблоні `pattern[0]` дав би помилку
 * індексації — безпечну обробку дають `kmpSearchAll` та `kmpSearchSteps`.
 */
export function kmpSearch(text: string, pattern: string): number {
  const M = pattern.length
  const N = text.length
  const lps = computeLps(pattern)
  let i = 0
  let j = 0
  while (i < N) {
    if (pattern[j] === text[i]) {
      i += 1
      j += 1
    } else if (j !== 0) {
      j = lps[j - 1]
    } else {
      i += 1
    }
    if (j === M) return i - j
  }
  return -1
}

/**
 * Усі позиції входжень `pattern` у `text` (зокрема перекривні, як «AB» у «ABABAB» →
 * [0, 2, 4]). Після кожного збігу (`j == M`) фіксуємо позицію `i - j` і продовжуємо,
 * відкотивши `j = lps[j-1]`. Для ПОРОЖНЬОГО шаблону безпечно повертає `[0..N]`.
 */
export function kmpSearchAll(text: string, pattern: string): number[] {
  const M = pattern.length
  const N = text.length
  if (M === 0) {
    const out: number[] = []
    for (let k = 0; k <= N; k++) out.push(k)
    return out
  }
  const lps = computeLps(pattern)
  const positions: number[] = []
  let i = 0
  let j = 0
  while (i < N) {
    if (pattern[j] === text[i]) {
      i += 1
      j += 1
    } else if (j !== 0) {
      j = lps[j - 1]
    } else {
      i += 1
    }
    if (j === M) {
      positions.push(i - j)
      j = lps[j - 1]
    }
  }
  return positions
}

// ===========================================================================
// Інструментовані версії (журнал подій для покрокового розбору)
// ===========================================================================

/**
 * Інструментована побудова `lps` для покрокового розбору. Повторює `computeLps` дія в дію —
 * той самий порядок порівнянь і «відкотів» `length`, — але дорогою кладе у журнал знімки
 * стану. Шаблон не змінюється, рухаються лише індекси `i` та `length`.
 */
export function computeLpsSteps(pattern: string): LpsStepsResult {
  const M = pattern.length
  const lps = new Array<number>(M).fill(0)
  let length = 0
  let comparisons = 0
  const events: LpsEvent[] = []

  const snap = (
    kind: LpsEventKind,
    f: Partial<Pick<LpsEvent, "i" | "charI" | "charLen" | "match" | "newLength">>,
  ): LpsEvent => ({
    kind,
    lps: [...lps],
    i: f.i ?? null,
    length,
    charI: f.charI ?? null,
    charLen: f.charLen ?? null,
    match: f.match ?? null,
    newLength: f.newLength ?? null,
    comparisons,
  })

  events.push(snap("init", { i: 1 }))

  let i = 1
  while (i < M) {
    const ci = pattern[i]
    const cl = pattern[length]
    comparisons += 1
    const isMatch = ci === cl
    events.push(snap("compare", { i, charI: ci, charLen: cl, match: isMatch }))
    if (isMatch) {
      length += 1
      lps[i] = length
      events.push(snap("set", { i, charI: ci, charLen: cl, match: true }))
      i += 1
      events.push(snap("advance", { i }))
    } else if (length !== 0) {
      const newLen = lps[length - 1]
      events.push(snap("fallback", { i, charI: ci, charLen: cl, match: false, newLength: newLen }))
      length = newLen
    } else {
      lps[i] = 0
      events.push(snap("zero", { i, charI: ci, charLen: cl, match: false }))
      i += 1
      events.push(snap("advance", { i }))
    }
  }

  events.push(snap("final", { i }))
  return { lps, events, comparisons }
}

/**
 * Інструментований пошук KMP для покрокового розбору. Повторює `kmpSearch` дія в дію — той
 * самий порядок порівнянь, стрибків `j = lps[j-1]` і просувань `i`, — але дорогою кладе у
 * журнал знімки стану. Ключовий інваріант, зафіксований у журналі: значення `i` НІКОЛИ не
 * зменшується (`iMonotonic`). ПОРОЖНІЙ шаблон обробляється безпечно (збіг на 0).
 */
export function kmpSearchSteps(text: string, pattern: string): KmpSearchStepsResult {
  const M = pattern.length
  const N = text.length
  const lps = M ? computeLps(pattern) : []

  let comparisons = 0
  let i = 0
  let j = 0
  let prevI = 0
  let iMonotonic = true

  const snap = (
    kind: KmpSearchEventKind,
    f: Partial<Pick<KmpSearchEvent, "textChar" | "patternChar" | "match" | "jump" | "result">>,
  ): KmpSearchEvent => ({
    kind,
    lps: [...lps],
    i,
    j,
    offset: i - j,
    textChar: f.textChar ?? null,
    patternChar: f.patternChar ?? null,
    match: f.match ?? null,
    jump: f.jump ?? null,
    comparisons,
    iMonotonic,
    result: f.result ?? null,
  })

  const events: KmpSearchEvent[] = [snap("init", {})]

  if (M === 0) {
    events.push(snap("match_found", { result: 0 }))
    events.push(snap("final", { result: 0 }))
    return { result: 0, events, comparisons }
  }

  let result = -1
  while (i < N) {
    const tc = text[i]
    const pc = pattern[j]
    comparisons += 1
    const isMatch = pc === tc
    events.push(snap("compare", { textChar: tc, patternChar: pc, match: isMatch }))
    if (isMatch) {
      i += 1
      j += 1
      if (i < prevI) iMonotonic = false
      prevI = i
      events.push(snap("advance_both", {}))
    } else if (j !== 0) {
      const jump = j - lps[j - 1]
      j = lps[j - 1]
      events.push(snap("shift", { jump }))
    } else {
      i += 1
      if (i < prevI) iMonotonic = false
      prevI = i
      events.push(snap("advance_i", {}))
    }
    if (j === M) {
      result = i - j
      events.push(snap("match_found", { result }))
      break
    }
  }

  if (result < 0) events.push(snap("not_found", { result: -1 }))
  events.push(snap("final", { result }))
  return { result, events, comparisons }
}

// ===========================================================================
// Лічильники (без журналу) — для таблиць «ціни» та контрастних графіків
// ===========================================================================

/** Кількість порівнянь символів шаблону під час побудови `lps` (лінійне за m). */
export function countLpsComparisons(pattern: string): number {
  return computeLpsSteps(pattern).comparisons
}

/** Кількість посимвольних порівнянь `pattern[j] == text[i]` у пошуку (амортизовано O(n)). */
export function countSearchComparisons(text: string, pattern: string): number {
  return kmpSearchSteps(text, pattern).comparisons
}

/** Сумарна «ціна» KMP у порівняннях: передобробка + пошук → {lps, search, total}. */
export interface KmpComparisons {
  readonly lps: number
  readonly search: number
  readonly total: number
}

/** Сумарна «ціна» KMP: lps-порівняння + пошук-порівняння = total (це і є O(n+m)). */
export function countKmpComparisons(text: string, pattern: string): KmpComparisons {
  const lps = countLpsComparisons(pattern)
  const search = countSearchComparisons(text, pattern)
  return { lps, search, total: lps + search }
}

/**
 * Кількість посимвольних порівнянь НАЇВНОГО методу на тому самому вході (`text[i+j] ==
 * pattern[j]`). Потрібна лише для КОНТРАСТНОГО графіка «KMP проти наївного» — серце KMP
 * вона не реалізує. У найгіршому випадку дає ≈ (N-M+1)·M, тоді як KMP лишається лінійним.
 */
export function countNaiveComparisons(text: string, pattern: string): number {
  const M = pattern.length
  const N = text.length
  if (M === 0) return 0
  let comparisons = 0
  for (let i = 0; i <= N - M; i++) {
    let j = 0
    while (j < M) {
      comparisons += 1
      if (text[i + j] !== pattern[j]) break
      j += 1
    }
  }
  return comparisons
}

// ===========================================================================
// Послідовності прочитаних індексів тексту — для діаграми монотонності i
// ===========================================================================

/**
 * Індекс тексту `i`, прочитаний на КОЖНОМУ порівнянні символів у KMP. Послідовність НЕ
 * спадає (`i` ніколи не відкочується) — це й показує діаграма монотонності.
 */
export function kmpReadPositions(text: string, pattern: string): number[] {
  return kmpSearchSteps(text, pattern).events
    .filter((e) => e.kind === "compare")
    .map((e) => e.i)
}

/**
 * Індекс тексту (`i + j`), прочитаний на КОЖНОМУ порівнянні НАЇВНОГО методу. На противагу
 * `kmpReadPositions`, ця послідовність «пилкоподібна»: після розбіжності позиція звірки
 * «відкочується» назад. Саме цей контраст ілюструє перевагу KMP.
 */
export function naiveReadPositions(text: string, pattern: string): number[] {
  const M = pattern.length
  const N = text.length
  const positions: number[] = []
  if (M === 0) return positions
  for (let i = 0; i <= N - M; i++) {
    let j = 0
    while (j < M) {
      positions.push(i + j)
      if (text[i + j] !== pattern[j]) break
      j += 1
    }
  }
  return positions
}
