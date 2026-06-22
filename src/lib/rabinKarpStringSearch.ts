// Пошук Рабіна-Карпа (Rabin-Karp, ковзний хеш) — ЧЕТВЕРТИЙ алгоритм рядкового пошуку
// серії й перший, що порівнює НЕ символи, а ЧИСЛА. Поліноміальний хеш перетворює кожне
// вікно завдовжки M на число; хеш вікна порівнюємо з хешем шаблону, і ЛИШЕ на збігу
// хешів робимо посимвольну перевірку (щоб відсіяти КОЛІЗІЇ — різні рядки з однаковим
// хешем). Ковзний хеш (rolling hash) оновлює хеш за O(1) на кожен зсув: віднімаємо
// зважений внесок лівого символу, множимо на базу, додаємо правий символ. Середнє
// O(n+m); найгірший O(n·m) при поганому модулі. base=256, modulus=101 (просте).
// Порт core.py репозиторію algo-rabin-karp-string-search. Фреймворк-незалежне ядро,
// без React.
//
// Рівні: polynomialHash (база з конспекту) + polynomialHashRaw (велике число без модуля)
// + rabinKarpSearch (база пошуку, rolling) + rabinKarpSearchAll (усі входження)
// + rabinKarpSearchRecompute (перерахунок з нуля O(m)/крок — контраст ціни)
// + polynomialHashSteps / rabinKarpSearchSteps (журнали подій для візуалізацій)
// + rabinKarpMetrics + countHashCharOps + findCollisions.

const DEFAULT_BASE = 256
const DEFAULT_MODULUS = 101

/**
 * Поліноміальний хеш рядка `s` за модулем `modulus`: h(s) = Σ ord(s[i])·base^(n-i-1)
 * mod modulus. Кожен степінь беремо за модулем (`pow(base, n-i-1) % modulus`), щоб число
 * не росло. Код з конспекту; для «developer» дає 35, для «abc» — 90, для «general» — 82.
 */
export function polynomialHash(s: string, base = DEFAULT_BASE, modulus = DEFAULT_MODULUS): number {
  const n = s.length
  let hashValue = 0
  for (let i = 0; i < n; i++) {
    const powerOfBase = modPow(base, n - i - 1, modulus)
    hashValue = (hashValue + s.charCodeAt(i) * powerOfBase) % modulus
  }
  return hashValue + 0 // нормалізуємо можливий -0 → 0
}

/**
 * Поліноміальний хеш БЕЗ модуля — «справжнє» велике число рядка Σ ord(s[i])·base^(n-i-1).
 * Саме його конспект наводить для «abc» (6382179), перш ніж пояснити, навіщо модуль.
 * На довгих рядках число росте експоненційно (тут — BigInt, щоб не втратити точність).
 */
export function polynomialHashRaw(s: string, base = DEFAULT_BASE): bigint {
  const n = s.length
  const b = BigInt(base)
  let sum = 0n
  for (let i = 0; i < n; i++) {
    sum += BigInt(s.charCodeAt(i)) * b ** BigInt(n - i - 1)
  }
  return sum
}

/** Модульне піднесення до степеня `base^exp % mod` (як `pow(base, exp) % modulus` у Python). */
function modPow(base: number, exp: number, mod: number): number {
  if (mod === 1) return 0
  let result = 1
  let b = base % mod
  let e = exp
  while (e > 0) {
    if (e & 1) result = (result * b) % mod
    e = Math.floor(e / 2)
    b = (b * b) % mod
  }
  return result
}

/**
 * Базовий пошук Рабіна-Карпа (код з конспекту, ROLLING-хеш). Повертає позицію ПЕРШОГО
 * входження `substring` у `mainString` або `-1`. Вікно завдовжки M ковзає текстом; на
 * кожному зміщенні порівнюємо хеш вікна з хешем шаблону, а на збігу хешів — звіряємо
 * символи (через колізії). Хеш наступного вікна оновлюється за O(1).
 */
export function rabinKarpSearch(mainString: string, substring: string): number {
  const substringLength = substring.length
  const mainStringLength = mainString.length
  const base = 256
  const modulus = 101
  const substringHash = polynomialHash(substring, base, modulus)
  let currentSliceHash = polynomialHash(mainString.slice(0, substringLength), base, modulus)
  const hMultiplier = modPow(base, substringLength - 1, modulus)
  for (let i = 0; i <= mainStringLength - substringLength; i++) {
    if (substringHash === currentSliceHash) {
      if (mainString.slice(i, i + substringLength) === substring) return i
    }
    if (i < mainStringLength - substringLength) {
      currentSliceHash =
        (currentSliceHash - mainString.charCodeAt(i) * hMultiplier) % modulus
      currentSliceHash =
        (currentSliceHash * base + mainString.charCodeAt(i + substringLength)) % modulus
      if (currentSliceHash < 0) currentSliceHash += modulus
    }
  }
  return -1
}

/**
 * УСІ позиції входжень `substring` у `mainString` (а не лише перша) — природна сила
 * Рабіна-Карпа: знайти багато входжень одним проходом, лишаючи хеш-порівняння дешевими.
 * Порожній шаблон → усі позиції `[0..N]`. Шаблон довший за текст → `[]`.
 */
export function rabinKarpSearchAll(
  mainString: string,
  substring: string,
  base = DEFAULT_BASE,
  modulus = DEFAULT_MODULUS,
): number[] {
  const m = substring.length
  const n = mainString.length
  if (m === 0) {
    const out: number[] = []
    for (let i = 0; i <= n; i++) out.push(i)
    return out
  }
  if (m > n) return []

  const substringHash = polynomialHash(substring, base, modulus)
  let current = polynomialHash(mainString.slice(0, m), base, modulus)
  const hMultiplier = modPow(base, m - 1, modulus)

  const positions: number[] = []
  for (let i = 0; i <= n - m; i++) {
    if (substringHash === current) {
      if (mainString.slice(i, i + m) === substring) positions.push(i)
    }
    if (i < n - m) {
      current = (current - mainString.charCodeAt(i) * hMultiplier) % modulus
      current = (current * base + mainString.charCodeAt(i + m)) % modulus
      if (current < 0) current += modulus
    }
  }
  return positions
}

/**
 * Той самий пошук, але хеш вікна щоразу рахується З НУЛЯ (без rolling) — `polynomialHash`
 * усього вікна на кожному зміщенні, тобто O(m) на крок → O(n·m) лише на хешуванні.
 * Існує для КОНТРАСТУ: показати, скільки економить rolling hash. Результат збігається з
 * `rabinKarpSearch`.
 */
export function rabinKarpSearchRecompute(
  mainString: string,
  substring: string,
  base = DEFAULT_BASE,
  modulus = DEFAULT_MODULUS,
): number {
  const m = substring.length
  const n = mainString.length
  for (let i = 0; i <= n - m; i++) {
    if (
      polynomialHash(mainString.slice(i, i + m), base, modulus) ===
      polynomialHash(substring, base, modulus)
    ) {
      if (mainString.slice(i, i + m) === substring) return i
    }
  }
  return -1
}

// ---------------------------------------------------------------------------
// Інструментовані версії: журнали подій (для перевірок коректності й візуалізацій)
// ---------------------------------------------------------------------------

/** Тип події журналу `polynomialHashSteps` (як у core.py). */
export type HashEventKind = "init" | "term" | "final"

/** Один запис журналу обчислення поліноміального хешу (знімок Horner-кроку). */
export interface HashEvent {
  readonly kind: HashEventKind
  readonly s: string
  readonly base: number
  readonly modulus: number
  readonly n: number
  /** Позиція символу або null (init/final). */
  readonly i: number | null
  /** Поточний символ або null. */
  readonly char: string | null
  /** Код символу `ord(char)` або null. */
  readonly code: number | null
  /** Степінь бази за модулем `base^(n-i-1) % modulus` або null. */
  readonly power: number | null
  /** Внесок `code·power` або null. */
  readonly contribution: number | null
  /** Внесок без модуля `code·base^(n-i-1)` (BigInt) або null. */
  readonly raw: bigint | null
  /** Накопичений хеш на цей момент (після `% modulus`). */
  readonly hashValue: number
}

/** Результат `polynomialHashSteps`: підсумковий хеш + журнал подій. */
export interface HashStepsResult {
  readonly hash: number
  readonly events: HashEvent[]
}

/**
 * Інструментований поліноміальний хеш (Horner-акумуляція): повторює `polynomialHash` дія
 * в дію, але дорогою кладе у журнал знімок кожного доданка (символ, код, степінь, внесок,
 * накопичений хеш). Рядок не змінюється; накопичується лише `hashValue`.
 */
export function polynomialHashSteps(
  s: string,
  base = DEFAULT_BASE,
  modulus = DEFAULT_MODULUS,
): HashStepsResult {
  const n = s.length
  let hashValue = 0

  const events: HashEvent[] = []
  const snap = (
    kind: HashEventKind,
    f: Partial<Omit<HashEvent, "kind" | "s" | "base" | "modulus" | "n" | "hashValue">>,
  ): HashEvent => ({
    kind,
    s,
    base,
    modulus,
    n,
    i: f.i ?? null,
    char: f.char ?? null,
    code: f.code ?? null,
    power: f.power ?? null,
    contribution: f.contribution ?? null,
    raw: f.raw ?? null,
    hashValue,
  })

  events.push(snap("init", {}))

  for (let i = 0; i < n; i++) {
    const powerOfBase = modPow(base, n - i - 1, modulus)
    const code = s.charCodeAt(i)
    const contribution = code * powerOfBase
    hashValue = (hashValue + contribution) % modulus
    events.push(
      snap("term", {
        i,
        char: s[i],
        code,
        power: powerOfBase,
        contribution,
        raw: BigInt(code) * BigInt(base) ** BigInt(n - i - 1),
      }),
    )
  }

  events.push(snap("final", {}))
  return { hash: hashValue, events }
}

/** Тип події журналу `rabinKarpSearchSteps` (як у core.py). */
export type SearchEventKind =
  | "init"
  | "window"
  | "hash_match"
  | "verify"
  | "collision"
  | "match_found"
  | "roll"
  | "not_found"
  | "final"

/** Один запис журналу пошуку Рабіна-Карпа (знімок стану вікна + лічильники). */
export interface SearchEvent {
  readonly kind: SearchEventKind
  readonly text: string
  readonly pattern: string
  readonly base: number
  readonly modulus: number
  readonly N: number
  readonly M: number
  readonly patternHash: number
  readonly hMultiplier: number
  /** Зміщення вікна або null. */
  readonly i: number | null
  /** Текст вікна `text[i:i+M]` або null. */
  readonly window: string | null
  /** Хеш поточного вікна (інваріант: = polynomialHash(window)). */
  readonly windowHash: number
  /** Для verify: справжній збіг (true) чи колізія (false). */
  readonly confirmed: boolean | null
  /** Для roll: символ, що виходить (лівий). */
  readonly outChar: string | null
  /** Для roll: символ, що входить (правий). */
  readonly inChar: string | null
  /** Для roll: віднятий внесок `ord(outChar)·hMultiplier`. */
  readonly removed: number | null
  /** Для roll: хеш до оновлення. */
  readonly hashBefore: number | null
  /** Для roll: хеш після оновлення. */
  readonly hashAfter: number | null
  // — накопичені лічильники —
  readonly hashComparisons: number
  readonly charVerifications: number
  readonly collisions: number
  readonly rolls: number
  readonly result: number | null
}

/** Результат `rabinKarpSearchSteps`: позиція першого входження (-1) + журнал подій. */
export interface SearchStepsResult {
  readonly result: number
  readonly events: SearchEvent[]
}

/**
 * Інструментований пошук Рабіна-Карпа: повторює `rabinKarpSearch` дія в дію — той самий
 * обхід вікон, порівняння хешів, посимвольні підтвердження й rolling-оновлення, — але
 * дорогою кладе у журнал знімки стану. `base`/`modulus` винесено в аргументи (на відміну
 * від дослівного `rabinKarpSearch`), щоб демонструвати вплив модуля: на малому модулі
 * хеші збігаються майже всюди й алгоритм вироджується в наївний.
 * Порожній шаблон обробляється безпечно (збіг на 0 без проблемного `pow(base, -1)`).
 */
export function rabinKarpSearchSteps(
  mainString: string,
  substring: string,
  base = DEFAULT_BASE,
  modulus = DEFAULT_MODULUS,
): SearchStepsResult {
  const M = substring.length
  const N = mainString.length

  let hashComparisons = 0
  let charVerifications = 0
  let collisions = 0
  let rolls = 0

  const patternHash = M ? polynomialHash(substring, base, modulus) : 0
  const hMultiplier = M ? modPow(base, M - 1, modulus) : 0
  let windowHash = M <= N ? polynomialHash(mainString.slice(0, M), base, modulus) : 0

  const events: SearchEvent[] = []
  const snap = (
    kind: SearchEventKind,
    f: Partial<
      Pick<
        SearchEvent,
        | "i"
        | "window"
        | "confirmed"
        | "outChar"
        | "inChar"
        | "removed"
        | "hashBefore"
        | "hashAfter"
        | "result"
      >
    >,
  ): SearchEvent => ({
    kind,
    text: mainString,
    pattern: substring,
    base,
    modulus,
    N,
    M,
    patternHash,
    hMultiplier,
    i: f.i ?? null,
    window: f.window ?? null,
    windowHash,
    confirmed: f.confirmed ?? null,
    outChar: f.outChar ?? null,
    inChar: f.inChar ?? null,
    removed: f.removed ?? null,
    hashBefore: f.hashBefore ?? null,
    hashAfter: f.hashAfter ?? null,
    hashComparisons,
    charVerifications,
    collisions,
    rolls,
    result: f.result ?? null,
  })

  events.push(snap("init", {}))

  if (M === 0) {
    events.push(snap("match_found", { i: 0, window: "", result: 0 }))
    events.push(snap("final", { result: 0 }))
    return { result: 0, events }
  }
  if (M > N) {
    events.push(snap("not_found", { result: -1 }))
    events.push(snap("final", { result: -1 }))
    return { result: -1, events }
  }

  let result = -1
  for (let i = 0; i <= N - M; i++) {
    const window = mainString.slice(i, i + M)
    events.push(snap("window", { i, window }))
    hashComparisons += 1
    if (patternHash === windowHash) {
      events.push(snap("hash_match", { i, window }))
      charVerifications += 1
      const confirmed = window === substring
      events.push(snap("verify", { i, window, confirmed }))
      if (confirmed) {
        result = i
        events.push(snap("match_found", { i, window, result: i }))
        break
      }
      collisions += 1
      events.push(snap("collision", { i, window, confirmed: false }))
    }
    if (i < N - M) {
      const outChar = mainString[i]
      const inChar = mainString[i + M]
      const removed = mainString.charCodeAt(i) * hMultiplier
      const hashBefore = windowHash
      let newHash = (windowHash - removed) % modulus
      newHash = (newHash * base + mainString.charCodeAt(i + M)) % modulus
      if (newHash < 0) newHash += modulus
      windowHash = newHash + 0 // нормалізуємо можливий -0 → 0
      rolls += 1
      events.push(snap("roll", { i, outChar, inChar, removed, hashBefore, hashAfter: newHash }))
    }
  }

  if (result < 0) events.push(snap("not_found", { result: -1 }))
  events.push(snap("final", { result }))
  return { result, events }
}

// ---------------------------------------------------------------------------
// Метрики / лічильники (без журналу) — для таблиць «ціни» та панелей
// ---------------------------------------------------------------------------

/** Метрики пошуку Рабіна-Карпа (порівняння хешів / char-перевірки / колізії / rolls). */
export interface RabinKarpMetrics {
  readonly hashComparisons: number
  readonly charVerifications: number
  readonly collisions: number
  readonly rolls: number
  /** Сумарно порівняно СИМВОЛІВ під час перевірок (зіставляється з наївним/KMP/BM). */
  readonly charComparisons: number
}

/** «Ціна» пошуку Рабіна-Карпа у числах (через `rabinKarpSearchSteps`). */
export function rabinKarpMetrics(
  mainString: string,
  substring: string,
  base = DEFAULT_BASE,
  modulus = DEFAULT_MODULUS,
): RabinKarpMetrics {
  const { events } = rabinKarpSearchSteps(mainString, substring, base, modulus)
  const last = events[events.length - 1]
  let charComparisons = 0
  for (const e of events) {
    if (e.kind === "verify" && e.window != null) {
      const window = e.window
      let matched = 0
      const len = Math.min(window.length, substring.length)
      for (let k = 0; k < len; k++) {
        matched += 1
        if (window[k] !== substring[k]) break
      }
      charComparisons += matched
    }
  }
  return {
    hashComparisons: last.hashComparisons,
    charVerifications: last.charVerifications,
    collisions: last.collisions,
    rolls: last.rolls,
    charComparisons,
  }
}

/**
 * Скільки «символьних операцій» коштує ХЕШУВАННЯ вікон (rolling чи з нуля) — контраст
 * ефективності rolling hash:
 * - `rolling=true` — O(1) на крок: M операцій на стартове вікно + по 2 символи (вийшов/
 *   зайшов) на кожне з N-M оновлень → лінійно за N;
 * - `rolling=false` — перерахунок із нуля: по M операцій на кожне з N-M+1 вікон → O(n·m).
 */
export function countHashCharOps(
  mainString: string,
  substring: string,
  rolling: boolean,
): number {
  const m = substring.length
  const n = mainString.length
  if (m === 0 || m > n) return 0
  const windows = n - m + 1
  if (rolling) return m + 2 * (windows - 1)
  return m * windows
}

// ---------------------------------------------------------------------------
// Колізії: сканування простору рядків під фіксованими (256, 101)
// ---------------------------------------------------------------------------

/** Знайдена колізія: два різні рядки однакової довжини з однаковим хешем. */
export interface Collision {
  readonly s1: string
  readonly s2: string
  readonly hash: number
}

/**
 * Знаходить КОЛІЗІЇ серед `words`: пари різних рядків однакової довжини з однаковим
 * `polynomialHash` під `(base, modulus)`. Однакові рядки дають однакові хеші завжди, але
 * однакові хеші НЕ означають однакові рядки — саме це й шукаємо. Параметри фіксовані
 * (256, 101). Повертає `(s1, s2, hash)` — показує, чому на збігу хешів обов'язкова
 * посимвольна перевірка.
 */
export function findCollisions(
  words: readonly string[],
  base = DEFAULT_BASE,
  modulus = DEFAULT_MODULUS,
): Collision[] {
  const buckets = new Map<string, string[]>()
  for (const w of words) {
    const key = `${w.length}|${polynomialHash(w, base, modulus)}`
    const arr = buckets.get(key)
    if (arr) arr.push(w)
    else buckets.set(key, [w])
  }
  const pairs: Collision[] = []
  for (const group of buckets.values()) {
    const uniq = [...new Set(group)].sort()
    for (let a = 0; a < uniq.length; a++) {
      for (let b = a + 1; b < uniq.length; b++) {
        pairs.push({ s1: uniq[a], s2: uniq[b], hash: polynomialHash(uniq[a], base, modulus) })
      }
    }
  }
  return pairs
}
