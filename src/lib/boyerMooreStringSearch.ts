// Алгоритм Боєра-Мура (таблиця поганого символу) для пошуку в рядках — ДРУГИЙ після
// наївного (тут — третій рядковий: наївний → KMP → Боєра-Мура) алгоритм серії, що
// змінює сам НАПРЯМ і КРОК. Дві риси: (1) порівнюємо суфікс шаблону СПРАВА НАЛІВО
// (`j` від M-1 до 0), збіжний суфікс росте, доки не трапиться розбіжність; (2) на
// розбіжності шаблон ПЕРЕСТРИБУЄ вперед за передобробленою таблицею поганого символу
// — аж на всю свою довжину, якщо символу кінця вікна в шаблоні немає. Чим рідші
// символи шаблону в тексті, тим більші стрибки й більше ПРОПУЩЕНИХ (жодного разу не
// порівняних) символів. Реалізовано ЛИШЕ компоненту поганого символу (добрий суфікс —
// на потім). Найкращий випадок — сублінійний (O(n) і менше); найгірший — O(n·m)
// (наприклад CAAAA в AAAA…, зсув щоразу 1). Порт core.py репозиторію
// algo-boyer-moore-string-search. Фреймворк-незалежне ядро, без React.
//
// Рівні: buildShiftTable (передобробка з конспекту) + boyerMooreSearch (база —
// її розбирає README) + boyerMooreSearchAll (усі входження) +
// buildShiftTableSteps / boyerMooreSearchSteps (журнали подій для візуалізацій) +
// countBmComparisons + bmMetrics + лічильники-контрасти (наївний / KMP).

/**
 * Таблиця поганого символу (таблиця зсувів) для шаблону. Для кожного символу `pattern[:-1]`
 * зсув = `M - index - 1` (повторюваний символ → перемагає ОСТАННЄ, найближче до кінця,
 * входження). Для ОСТАННЬОГО символу — `setdefault(pattern[-1], M)` (додає M, лише якщо
 * ключа ще немає). Дослівний порт core.build_shift_table: на порожньому шаблоні дав би
 * звернення до `pattern[-1]` — тут це безпечно повертає порожню таблицю (узгоджено зі
 * steps-варіантом).
 */
export function buildShiftTable(pattern: string): Record<string, number> {
  const table: Record<string, number> = {}
  const length = pattern.length
  if (length === 0) return table
  // Для кожного символу (крім останнього): table[char] = length - index - 1.
  for (let index = 0; index < length - 1; index++) {
    table[pattern[index]] = length - index - 1
  }
  // setdefault для останнього символу: M, лише якщо ключа ще немає.
  const last = pattern[length - 1]
  if (!(last in table)) table[last] = length
  return table
}

/**
 * Базовий пошук Боєра-Мура (код з конспекту). Повертає індекс ПЕРШОГО входження `pattern`
 * у `text` або `-1`. Усередині кожного вікна звіряє символи СПРАВА НАЛІВО (`j` від M-1);
 * на розбіжності зсуває вікно за символом КІНЦЯ вікна `text[i+M-1]` через таблицю зсувів
 * (символу немає → зсув на всю довжину M). Порожній шаблон → знайдено на 0.
 */
export function boyerMooreSearch(text: string, pattern: string): number {
  const n = text.length
  const m = pattern.length
  if (m === 0) return 0
  const shiftTable = buildShiftTable(pattern)
  let i = 0
  while (i <= n - m) {
    let j = m - 1
    while (j >= 0 && text[i + j] === pattern[j]) j -= 1
    if (j < 0) return i
    const wec = text[i + m - 1]
    i += wec in shiftTable ? shiftTable[wec] : m
  }
  return -1
}

/**
 * Усі позиції входжень `pattern` у `text` (зокрема перекривні, як «AA» у «AAAA» → [0,1,2]).
 * Після кожного збігу фіксуємо позицію й просуваємо `i` на 1 (щоб не пропустити
 * перекривні); на розбіжності — звичайний стрибок за таблицею. Порожній шаблон → `[0..N]`.
 */
export function boyerMooreSearchAll(text: string, pattern: string): number[] {
  const n = text.length
  const m = pattern.length
  const out: number[] = []
  if (m === 0) {
    for (let i = 0; i <= n; i++) out.push(i)
    return out
  }
  const shiftTable = buildShiftTable(pattern)
  let i = 0
  while (i <= n - m) {
    let j = m - 1
    while (j >= 0 && text[i + j] === pattern[j]) j -= 1
    if (j < 0) {
      out.push(i)
      i += 1
    } else {
      const wec = text[i + m - 1]
      i += wec in shiftTable ? shiftTable[wec] : m
    }
  }
  return out
}

// ---------------------------------------------------------------------------
// Інструментовані версії: журнали подій + лічильники (для перевірок і візуалізацій)
// ---------------------------------------------------------------------------

/** Тип події журналу `buildShiftTableSteps` (фаза передобробки). */
export type TableEventKind = "init" | "entry" | "default" | "final"

/** Один запис журналу побудови таблиці зсувів (знімок стану + лічильник обчислень). */
export interface TableEvent {
  readonly kind: TableEventKind
  readonly pattern: string
  readonly m: number
  /** Знімок словника зсувів на цей момент. */
  readonly table: Record<string, number>
  readonly index: number | null
  readonly char: string | null
  readonly shift: number | null
  /** entry: чи перезаписуємо вже наявний ключ (повторюваний символ). */
  readonly overwrite: boolean | null
  /** entry: попереднє значення (якщо перезапис). */
  readonly prev: number | null
  /** default: чи символ додано (його не було). */
  readonly added: boolean | null
  /** default: наявне значення (якщо ключ уже був — setdefault його не змінює). */
  readonly existing: number | null
  /** Лічильник обчислень `length-index-1`. */
  readonly computations: number
}

/** Результат побудови таблиці: готова таблиця + журнал подій. */
export interface TableStepsResult {
  readonly table: Record<string, number>
  readonly events: TableEvent[]
}

/**
 * Інструментована побудова таблиці зсувів. Повторює `buildShiftTable` дія в дію (той самий
 * порядок записів + setdefault для останнього), але дорогою кладе у журнал знімки стану.
 * Типи подій: `init` (старт; таблиця порожня) · `entry` (запис `table[char]=length-index-1`;
 * `overwrite`/`prev`) · `default` (`setdefault(pattern[-1], M)`; `added`/`existing`) ·
 * `final` (підсумок). Інваріант: `computations` = кількість `entry` = M-1.
 */
export function buildShiftTableSteps(pattern: string): TableStepsResult {
  const m = pattern.length
  const table: Record<string, number> = {}
  let computations = 0

  const snap = (
    kind: TableEventKind,
    f: Partial<Omit<TableEvent, "kind" | "pattern" | "m" | "table" | "computations">>,
  ): TableEvent => ({
    kind,
    pattern,
    m,
    table: { ...table },
    index: f.index ?? null,
    char: f.char ?? null,
    shift: f.shift ?? null,
    overwrite: f.overwrite ?? null,
    prev: f.prev ?? null,
    added: f.added ?? null,
    existing: f.existing ?? null,
    computations,
  })

  const events: TableEvent[] = [snap("init", {})]

  // Порожній шаблон деградує безпечно — порожня таблиця.
  if (m === 0) {
    events.push(snap("final", {}))
    return { table, events }
  }

  // Для кожного символу (крім останнього): table[char] = length - index - 1.
  for (let index = 0; index < m - 1; index++) {
    const char = pattern[index]
    const shift = m - index - 1
    computations += 1
    const overwrite = char in table
    const prev = overwrite ? table[char] : null
    table[char] = shift
    events.push(snap("entry", { index, char, shift, overwrite, prev }))
  }

  // setdefault для останнього символу: додає M, лише якщо ключа ще немає.
  const last = pattern[m - 1]
  const added = !(last in table)
  const existing = added ? null : table[last]
  if (added) table[last] = m
  events.push(snap("default", { index: m - 1, char: last, shift: m, added, existing }))

  events.push(snap("final", {}))
  return { table, events }
}

/** Тип події журналу `boyerMooreSearchSteps` (фаза пошуку, як у core.py). */
export type SearchEventKind =
  | "init"
  | "align"
  | "compare"
  | "mismatch"
  | "shift"
  | "match_found"
  | "not_found"
  | "final"

/** Один запис журналу пошуку Боєра-Мура (знімок стану + лічильники). */
export interface SearchEvent {
  readonly kind: SearchEventKind
  readonly text: string
  readonly pattern: string
  readonly shiftTable: Record<string, number>
  readonly n: number
  readonly m: number
  /** Старт вікна. */
  readonly i: number
  /** Позиція в шаблоні (справа наліво). */
  readonly j: number | null
  readonly textChar: string | null
  readonly patternChar: string | null
  readonly match: boolean | null
  /** shift: символ КІНЦЯ вікна `text[i+M-1]`. */
  readonly windowEndChar: string | null
  /** shift: значення символу в таблиці (null — символу немає → береться M). */
  readonly tableValue: number | null
  /** shift: величина стрибка. */
  readonly jump: number | null
  /** shift: індекси тексту, які стрибок перестрибнув, не порівнюючи. */
  readonly skippedNow: number[] | null
  /** shift: нова позиція вікна. */
  readonly newI: number | null
  // — накопичені лічильники —
  readonly comparisons: number
  readonly jumps: number
  readonly skipped: number
  readonly result: number | null
}

/** Результат прогону пошуку: перший індекс (-1), лічильники + журнал. */
export interface SearchStepsResult {
  readonly result: number
  readonly comparisons: number
  readonly jumps: number
  readonly skipped: number
  readonly events: SearchEvent[]
}

/**
 * Інструментований пошук Боєра-Мура. Повторює `boyerMooreSearch` дія в дію (той самий
 * порядок вирівнювань, посимвольних порівнянь СПРАВА НАЛІВО та стрибків за таблицею), але
 * дорогою кладе у журнал знімки стану. Типи подій: `init` · `align` (нове вікно на `i`) ·
 * `compare` (порівняли `text[i+j]` з `pattern[j]`, `j` спадає; +1 до `comparisons`) ·
 * `mismatch` (зупинка на `j>=0`) · `shift` (зсув за символом кінця вікна; `windowEndChar` /
 * `tableValue` / `jump` / `skippedNow` / `newI`) · `match_found` (`j<0` → `i`) ·
 * `not_found` · `final`. Порожній шаблон → збіг на 0.
 */
export function boyerMooreSearchSteps(text: string, pattern: string): SearchStepsResult {
  const n = text.length
  const m = pattern.length
  const shiftTable = m ? buildShiftTable(pattern) : {}

  let comparisons = 0
  let jumps = 0
  let skipped = 0
  let i = 0
  const compared = new Set<number>() // текстові індекси, які хоч раз потрапили у порівняння

  const snap = (
    kind: SearchEventKind,
    f: Partial<
      Omit<
        SearchEvent,
        "kind" | "text" | "pattern" | "shiftTable" | "n" | "m" | "i" | "comparisons" | "jumps" | "skipped"
      >
    >,
  ): SearchEvent => ({
    kind,
    text,
    pattern,
    shiftTable: { ...shiftTable },
    n,
    m,
    i,
    j: f.j ?? null,
    textChar: f.textChar ?? null,
    patternChar: f.patternChar ?? null,
    match: f.match ?? null,
    windowEndChar: f.windowEndChar ?? null,
    tableValue: f.tableValue ?? null,
    jump: f.jump ?? null,
    skippedNow: f.skippedNow ?? null,
    newI: f.newI ?? null,
    comparisons,
    jumps,
    skipped,
    result: f.result ?? null,
  })

  const events: SearchEvent[] = [snap("init", {})]

  // Порожній шаблон: безпечна обробка (збіг на позиції 0).
  if (m === 0) {
    events.push(snap("match_found", { result: 0 }))
    events.push(snap("final", { result: 0 }))
    return { result: 0, comparisons, jumps, skipped, events }
  }

  let result = -1
  while (i <= n - m) {
    events.push(snap("align", {}))
    let j = m - 1
    // порівняння справа наліво: від останнього символу шаблону до початку
    while (j >= 0) {
      const tc = text[i + j]
      const pc = pattern[j]
      comparisons += 1
      compared.add(i + j)
      const isMatch = tc === pc
      events.push(snap("compare", { j, textChar: tc, patternChar: pc, match: isMatch }))
      if (!isMatch) break
      j -= 1
    }

    if (j < 0) {
      result = i
      events.push(snap("match_found", { j, result: i }))
      break
    }

    // розбіжність на позиції j: зсуваємо за символом КІНЦЯ вікна text[i+M-1]
    events.push(snap("mismatch", { j }))
    const wec = text[i + m - 1]
    const has = wec in shiftTable
    const tableValue = has ? shiftTable[wec] : null
    const jump = has ? shiftTable[wec] : m
    const newI = i + jump
    // пропущені = індекси, які стрибок лишає позаду й яких ДОСІ не порівнювали
    const skippedNow: number[] = []
    for (let p = i; p < newI; p++) if (!compared.has(p)) skippedNow.push(p)
    jumps += 1
    skipped += skippedNow.length
    events.push(snap("shift", { j, windowEndChar: wec, tableValue, jump, skippedNow, newI }))
    i = newI
  }

  if (result < 0) events.push(snap("not_found", { result: -1 }))
  events.push(snap("final", { result }))
  return { result, comparisons, jumps, skipped, events }
}

// ---------------------------------------------------------------------------
// Лічильники (без журналу) — для таблиць «ціни» та контрастних графіків
// ---------------------------------------------------------------------------

/** Кількість посимвольних порівнянь у пошуку Боєра-Мура (через журнал → гарантовано збіг). */
export function countBmComparisons(text: string, pattern: string): number {
  return boyerMooreSearchSteps(text, pattern).comparisons
}

/** Метрики пошуку Боєра-Мура: порівняння, стрибки, сумарно пропущених символів. */
export interface BmMetrics {
  readonly comparisons: number
  readonly jumps: number
  readonly skipped: number
}

/** Метрики пошуку: усе з фінального запису журналу `boyerMooreSearchSteps`. */
export function bmMetrics(text: string, pattern: string): BmMetrics {
  const r = boyerMooreSearchSteps(text, pattern)
  return { comparisons: r.comparisons, jumps: r.jumps, skipped: r.skipped }
}

// Контрастні лічильники «Боєра-Мура проти наївного й KMP» — це НЕ серце алгоритму,
// а лише дані для графіка в навчанні/редакторі. Підрахунок ідентичний до KMP (там і
// «канонічна» наївна вартість повного сканування всіх вирівнювань), тож реекспортуємо
// замість копії — обидва контрастні графіки рахують з одного джерела (без дрейфу).
export {
  countNaiveComparisons,
  countKmpComparisons,
  type KmpComparisons,
} from "@/lib/kmpStringSearch"
