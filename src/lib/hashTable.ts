// Хеш-таблиця (Hash Table) — перша СТРУКТУРА ДАНИХ на платформі (а не алгоритм над
// одним входом): послідовність операцій insert/get/delete над таблицею-масивом
// «комірок». Хеш-функція перетворює КЛЮЧ на ІНДЕКС комірки (slot), тож доступ —
// прямий, без перебору: у середньому O(1). Порт ідеї класу HashTable з конспекту
// edu.goit. Фреймворк-незалежне ядро, без React.
//
// ДВІ стратегії розв'язання колізій (перемикач):
//   chaining — у комірці лежить СПИСОК пар; колізії ростуть як ланцюг;
//   linear   — ВІДКРИТЕ АДРЕСУВАННЯ (лінійне зондування): один слот = одна пара,
//              при зайнятості йдемо праворуч до вільного (з переходом через край);
//              видалення лишає «надгробок» (tombstone), щоб не рвати ланцюг проб.
// Хеш за замовчуванням — «сума кодів символів % size» (перевірна руками; на ній
// тримається еталон і навчання); поліноміальний — opt-in місток до Рабіна–Карпа.
//
// Рівні (як radixSort): sumCodesHash / slotOf — хеш-функції; runHashTable — базовий
// прогін (фінальний стан + результат кожної операції); hashTableSteps —
// інструментований журнал подій зі знімками для візуалізацій.

import { polynomialHashRaw } from "@/lib/rabinKarpStringSearch"

/** Стратегія розв'язання колізій: ланцюжки або лінійне зондування (відкрите адресування). */
export type CollisionStrategy = "chaining" | "linear"

/**
 * Ідентифікатор хеш-функції.
 * `sum` — навчальна «сума кодів символів» (перевірна усно, дефолт);
 * `poly` — поліноміальний хеш рядка (той самий, що в Рабіні–Карпі); «справжній»,
 *   але усно не порахувати, тому opt-in;
 * `zero` — НАВМИСНО ПОГАНА: завжди 0, усе валиться в одну комірку (демо найгіршого);
 * `firstChar` — НАВМИСНО СЛАБКА: лише перша літера, тож ключі з однією літерою
 *   колізують (наочно для «зловмисних» ключів і історії DoS hash-flooding).
 */
export type HashFnId = "sum" | "poly" | "zero" | "firstChar"

/** Пара «ключ → значення» в комірці таблиці. */
export interface HtEntry {
  readonly key: string
  readonly value: number
}

/** Одна операція над таблицею. `value` — лише для insert. */
export interface HtOp {
  readonly kind: "insert" | "get" | "delete"
  readonly key: string
  readonly value?: number
}

/** Наслідок операції: що саме сталося (для вердикту в UI). */
export type HtOpResult = "stored" | "updated" | "hit" | "miss" | "deleted"

/** Знімок таблиці — масив комірок, кожна комірка це ланцюг пар (для linear — 0 або 1 пара). */
export type HtBuckets = readonly (readonly HtEntry[])[]

// ---------------------------------------------------------------------------
// Хеш-функції
// ---------------------------------------------------------------------------

/**
 * Навчальна хеш-функція: сума кодів символів ключа (Σ charCodeAt). Детермінована,
 * швидка, усно перевірна: "apple" → 530, "orange" → 636, "banana" → 609.
 * НЕ ідеально рівномірна (анаграми дають однакову суму) — і це навмисно наочно.
 */
export function sumCodesHash(key: string): number {
  let sum = 0
  for (let i = 0; i < key.length; i++) sum += key.charCodeAt(i)
  return sum
}

/**
 * «Сире» велике число хеша для показу в конвеєрі `ключ → hash() → % size`.
 * Для `sum` — сама сума кодів (мале число). Для `poly` повертає `null`: справжній
 * поліноміальний хеш — величезний BigInt, який усно не порахувати, тож у візуалі
 * показуємо лише кінцевий слот, а не проміжне число.
 */
export function rawHashNumber(key: string, fn: HashFnId = "sum"): number | null {
  switch (fn) {
    case "sum":
      return sumCodesHash(key)
    case "zero":
      return 0
    case "firstChar":
      return key.length > 0 ? key.charCodeAt(0) : 0
    default:
      return null // poly — велике число, усно не показуємо
  }
}

/**
 * Індекс комірки для ключа: `hash(key) % capacity`. Саме цей крок «складає»
 * велике число хеша в діапазон реальних комірок `0..capacity-1`.
 */
export function slotOf(
  key: string,
  capacity: number,
  fn: HashFnId = "sum",
): number {
  if (capacity <= 0) return 0
  switch (fn) {
    case "poly":
      return Number(polynomialHashRaw(key) % BigInt(capacity))
    case "zero":
      return 0
    case "firstChar":
      return (key.length > 0 ? key.charCodeAt(0) : 0) % capacity
    default:
      return sumCodesHash(key) % capacity
  }
}

// ---------------------------------------------------------------------------
// Базовий прогін (фінальний стан + результат кожної операції)
// ---------------------------------------------------------------------------

/** Опції прогону хеш-таблиці. */
export interface HtOptions {
  readonly hashFn?: HashFnId
  readonly strategy?: CollisionStrategy
}

/** Результат однієї операції в прогоні. */
export interface HtPerOp {
  readonly op: HtOp
  readonly result: HtOpResult
  /** Значення для stored/updated/hit; null для miss/deleted. */
  readonly value: number | null
  /** Індекс домашньої комірки `hash%capacity`. */
  readonly homeIndex: number
}

/** Підсумок прогону: фінальний стан таблиці + лічильники. */
export interface HtRunResult {
  readonly buckets: HtBuckets
  /** Надгробки (лише для linear): комірка була очищена delete. Для chaining — усі false. */
  readonly tombstones: readonly boolean[]
  readonly perOp: readonly HtPerOp[]
  readonly capacity: number
  /** Кількість збережених пар (n) → навантаження α = size/capacity. */
  readonly size: number
  /** Порівнянь ключів (сумарно). */
  readonly comparisons: number
  /** Скільки вставок влучили в НЕпорожню домашню комірку (колізія). */
  readonly collisions: number
  readonly hashFn: HashFnId
  readonly strategy: CollisionStrategy
}

/**
 * Проганяє послідовність операцій над хеш-таблицею фіксованої місткості `capacity`.
 * Повертає фінальний стан, результат кожної операції й лічильники. Мутує лише власні
 * внутрішні масиви; вхід не чіпає.
 */
export function runHashTable(
  ops: readonly HtOp[],
  capacity: number,
  opts: HtOptions = {},
): HtRunResult {
  const hashFn = opts.hashFn ?? "sum"
  const strategy = opts.strategy ?? "chaining"
  const r =
    strategy === "linear"
      ? runLinear(ops, capacity, hashFn)
      : runChaining(ops, capacity, hashFn)
  return { ...r, capacity, hashFn, strategy }
}

type RunCore = Omit<HtRunResult, "capacity" | "hashFn" | "strategy">

/** Прогін методом ланцюжків. */
function runChaining(ops: readonly HtOp[], capacity: number, hashFn: HashFnId): RunCore {
  const buckets: HtEntry[][] = Array.from({ length: capacity }, () => [])
  const perOp: HtPerOp[] = []
  let comparisons = 0
  let collisions = 0
  let size = 0

  for (const op of ops) {
    const home = slotOf(op.key, capacity, hashFn)
    const chain = buckets[home]
    if (op.kind === "insert") {
      if (chain.length > 0) collisions += 1
      let found = -1
      for (let j = 0; j < chain.length; j++) {
        comparisons += 1
        if (chain[j].key === op.key) { found = j; break }
      }
      const value = op.value ?? 0
      if (found >= 0) {
        chain[found] = { key: op.key, value }
        perOp.push({ op, result: "updated", value, homeIndex: home })
      } else {
        chain.push({ key: op.key, value })
        size += 1
        perOp.push({ op, result: "stored", value, homeIndex: home })
      }
    } else if (op.kind === "get") {
      let found = -1
      for (let j = 0; j < chain.length; j++) {
        comparisons += 1
        if (chain[j].key === op.key) { found = j; break }
      }
      if (found >= 0) perOp.push({ op, result: "hit", value: chain[found].value, homeIndex: home })
      else perOp.push({ op, result: "miss", value: null, homeIndex: home })
    } else {
      let found = -1
      for (let j = 0; j < chain.length; j++) {
        comparisons += 1
        if (chain[j].key === op.key) { found = j; break }
      }
      if (found >= 0) {
        chain.splice(found, 1)
        size -= 1
        perOp.push({ op, result: "deleted", value: null, homeIndex: home })
      } else {
        perOp.push({ op, result: "miss", value: null, homeIndex: home })
      }
    }
  }

  return {
    buckets: snapshot(buckets),
    tombstones: new Array<boolean>(capacity).fill(false),
    perOp, size, comparisons, collisions,
  }
}

/** Прогін лінійним зондуванням (відкрите адресування) з надгробками. */
function runLinear(ops: readonly HtOp[], capacity: number, hashFn: HashFnId): RunCore {
  const slots: (HtEntry | null)[] = new Array<HtEntry | null>(capacity).fill(null)
  const tomb: boolean[] = new Array<boolean>(capacity).fill(false)
  const perOp: HtPerOp[] = []
  let comparisons = 0
  let collisions = 0
  let size = 0

  for (const op of ops) {
    const home = slotOf(op.key, capacity, hashFn)
    if (op.kind === "insert") {
      if (slots[home] !== null) collisions += 1
      let firstFree = -1
      let done = false
      const value = op.value ?? 0
      for (let step = 0; step < capacity; step++) {
        const idx = (home + step) % capacity
        const cell = slots[idx]
        if (cell === null && !tomb[idx]) {
          const at = firstFree >= 0 ? firstFree : idx
          slots[at] = { key: op.key, value }
          tomb[at] = false
          size += 1
          perOp.push({ op, result: "stored", value, homeIndex: home })
          done = true
          break
        }
        if (cell === null) {
          if (firstFree < 0) firstFree = idx
          continue
        }
        comparisons += 1
        if (cell.key === op.key) {
          slots[idx] = { key: op.key, value }
          perOp.push({ op, result: "updated", value, homeIndex: home })
          done = true
          break
        }
      }
      if (!done) {
        if (firstFree >= 0) {
          slots[firstFree] = { key: op.key, value }
          tomb[firstFree] = false
          size += 1
          perOp.push({ op, result: "stored", value, homeIndex: home })
        } else {
          perOp.push({ op, result: "miss", value: null, homeIndex: home })
        }
      }
    } else if (op.kind === "get") {
      let res: HtPerOp | null = null
      for (let step = 0; step < capacity; step++) {
        const idx = (home + step) % capacity
        const cell = slots[idx]
        if (cell === null && !tomb[idx]) break
        if (cell === null) continue // надгробок — крокуємо далі
        comparisons += 1
        if (cell.key === op.key) {
          res = { op, result: "hit", value: cell.value, homeIndex: home }
          break
        }
      }
      perOp.push(res ?? { op, result: "miss", value: null, homeIndex: home })
    } else {
      let res: HtPerOp | null = null
      for (let step = 0; step < capacity; step++) {
        const idx = (home + step) % capacity
        const cell = slots[idx]
        if (cell === null && !tomb[idx]) break
        if (cell === null) continue
        comparisons += 1
        if (cell.key === op.key) {
          slots[idx] = null
          tomb[idx] = true
          size -= 1
          res = { op, result: "deleted", value: null, homeIndex: home }
          break
        }
      }
      perOp.push(res ?? { op, result: "miss", value: null, homeIndex: home })
    }
  }

  const buckets: HtEntry[][] = slots.map((c) => (c ? [{ key: c.key, value: c.value }] : []))
  return { buckets, tombstones: [...tomb], perOp, size, comparisons, collisions }
}

// ---------------------------------------------------------------------------
// Інструментована версія: журнал подій зі знімками (для trace/візуалізацій)
// ---------------------------------------------------------------------------

/** Тип події журналу `hashTableSteps`. */
export type HtEventKind =
  | "init"
  | "op_start"
  | "hash"
  | "collision"
  | "compare"
  | "probe"
  | "insert"
  | "update"
  | "found"
  | "miss"
  | "delete"
  | "op_done"
  | "done"

/** Один запис журналу подій (незмінний знімок стану + активні поля + лічильники). */
export interface HtEvent {
  readonly kind: HtEventKind
  /** Повний знімок таблиці на цей момент (глибока копія — scrubbing назад чесний). */
  readonly buckets: HtBuckets
  /** Надгробки на цей момент (linear); для chaining — усі false. */
  readonly tombstones: readonly boolean[]
  readonly capacity: number
  readonly strategy: CollisionStrategy
  readonly hashFn: HashFnId
  /** Кількість збережених пар (n). */
  readonly size: number
  readonly opIndex: number | null
  readonly op: HtOp | null
  readonly homeIndex: number | null
  readonly rawHash: number | null
  /** Позиція в ланцюзі, яку ЗАРАЗ порівнюємо (chaining), або null. */
  readonly scanPos: number | null
  /** Слот, на якому ЗАРАЗ курсор-зонд (linear), або null. */
  readonly probeIndex: number | null
  /** Відвідані слоти поточної операції (linear-кластер), або []. */
  readonly probeTrail: readonly number[]
  /** Позиція в ланцюзі, куди сіла/оновилась/знайшлась пара (chaining), або null. */
  readonly landedChainPos: number | null
  /** Комірка терміналу операції (insert/update/found/delete), або null. */
  readonly landedIndex: number | null
  readonly opResult: HtOpResult | null
  readonly resultValue: number | null
  readonly comparisons: number
  readonly collisions: number
}

/** Результат інструментованого прогону: журнал подій + фінальний стан і лічильники. */
export interface HtStepsResult {
  readonly events: HtEvent[]
  readonly buckets: HtBuckets
  readonly tombstones: readonly boolean[]
  readonly perOp: readonly HtPerOp[]
  readonly capacity: number
  readonly size: number
  readonly comparisons: number
  readonly collisions: number
  readonly hashFn: HashFnId
  readonly strategy: CollisionStrategy
}

/** Глибока копія таблиці для незмінного знімка кадру. */
function snapshot(buckets: readonly HtEntry[][]): HtBuckets {
  return buckets.map((chain) => chain.map((e) => ({ key: e.key, value: e.value })))
}

/**
 * Інструментований прогін хеш-таблиці: повторює `runHashTable` дія в дію, але після
 * кожної значущої події кладе у журнал незмінний знімок таблиці, активні поля й
 * монотонні лічильники. Саме цей журнал `buildHashTableTrace` перетворює на кадри.
 */
export function hashTableSteps(
  ops: readonly HtOp[],
  capacity: number,
  opts: HtOptions = {},
): HtStepsResult {
  const hashFn = opts.hashFn ?? "sum"
  const strategy = opts.strategy ?? "chaining"

  // Спільний стан для обох стратегій. Chaining тримає ланцюги в buckets; linear —
  // одну пару на комірку (chain довжини ≤ 1) + окремий масив надгробків.
  const buckets: HtEntry[][] = Array.from({ length: capacity }, () => [])
  const tomb: boolean[] = new Array<boolean>(capacity).fill(false)
  const events: HtEvent[] = []
  const perOp: HtPerOp[] = []
  let comparisons = 0
  let collisions = 0
  let size = 0
  let trail: number[] = []

  const push = (
    kind: HtEventKind,
    fields: Partial<HtEvent> & { opIndex: number | null; op: HtOp | null },
  ): void => {
    events.push({
      buckets: snapshot(buckets),
      tombstones: [...tomb],
      capacity,
      strategy,
      hashFn,
      size,
      comparisons,
      collisions,
      homeIndex: null,
      rawHash: null,
      scanPos: null,
      probeIndex: null,
      probeTrail: [...trail],
      landedChainPos: null,
      landedIndex: null,
      opResult: null,
      resultValue: null,
      kind,
      ...fields,
    })
  }

  push("init", { opIndex: null, op: null })

  ops.forEach((op, opIndex) => {
    const home = slotOf(op.key, capacity, hashFn)
    const raw = rawHashNumber(op.key, hashFn)
    trail = []

    push("op_start", { opIndex, op })
    push("hash", { opIndex, op, homeIndex: home, rawHash: raw })

    if (strategy === "linear") {
      stepLinear()
    } else {
      stepChaining()
    }

    function stepChaining(): void {
      const chain = buckets[home]
      const commonHome = { opIndex, op, homeIndex: home }
      if (op.kind === "insert") {
        if (chain.length > 0) {
          collisions += 1
          push("collision", commonHome)
        }
        let found = -1
        for (let j = 0; j < chain.length; j++) {
          comparisons += 1
          push("compare", { ...commonHome, scanPos: j })
          if (chain[j].key === op.key) { found = j; break }
        }
        const value = op.value ?? 0
        if (found >= 0) {
          chain[found] = { key: op.key, value }
          push("update", { ...commonHome, landedChainPos: found, landedIndex: home, resultValue: value })
          perOp.push({ op, result: "updated", value, homeIndex: home })
          push("op_done", { ...commonHome, opResult: "updated", resultValue: value })
        } else {
          chain.push({ key: op.key, value })
          size += 1
          push("insert", { ...commonHome, landedChainPos: chain.length - 1, landedIndex: home, resultValue: value })
          perOp.push({ op, result: "stored", value, homeIndex: home })
          push("op_done", { ...commonHome, opResult: "stored", resultValue: value })
        }
      } else if (op.kind === "get") {
        let found = -1
        for (let j = 0; j < chain.length; j++) {
          comparisons += 1
          push("compare", { ...commonHome, scanPos: j })
          if (chain[j].key === op.key) { found = j; break }
        }
        if (found >= 0) {
          const value = chain[found].value
          push("found", { ...commonHome, landedChainPos: found, landedIndex: home, resultValue: value })
          perOp.push({ op, result: "hit", value, homeIndex: home })
          push("op_done", { ...commonHome, opResult: "hit", resultValue: value })
        } else {
          push("miss", commonHome)
          perOp.push({ op, result: "miss", value: null, homeIndex: home })
          push("op_done", { ...commonHome, opResult: "miss" })
        }
      } else {
        let found = -1
        for (let j = 0; j < chain.length; j++) {
          comparisons += 1
          push("compare", { ...commonHome, scanPos: j })
          if (chain[j].key === op.key) { found = j; break }
        }
        if (found >= 0) {
          chain.splice(found, 1)
          size -= 1
          push("delete", { ...commonHome, landedIndex: home })
          perOp.push({ op, result: "deleted", value: null, homeIndex: home })
          push("op_done", { ...commonHome, opResult: "deleted" })
        } else {
          push("miss", commonHome)
          perOp.push({ op, result: "miss", value: null, homeIndex: home })
          push("op_done", { ...commonHome, opResult: "miss" })
        }
      }
    }

    function slotEntry(idx: number): HtEntry | null {
      const c = buckets[idx]
      return c.length > 0 ? c[0] : null
    }

    function stepLinear(): void {
      const commonHome = { opIndex, op, homeIndex: home }
      if (op.kind === "insert") {
        const value = op.value ?? 0
        if (slotEntry(home) !== null) {
          collisions += 1
          push("collision", commonHome)
        }
        let firstFree = -1
        let done = false
        for (let step = 0; step < capacity; step++) {
          const idx = (home + step) % capacity
          const cell = slotEntry(idx)
          if (cell === null && !tomb[idx]) {
            const at = firstFree >= 0 ? firstFree : idx
            buckets[at] = [{ key: op.key, value }]
            tomb[at] = false
            size += 1
            push("insert", { ...commonHome, probeIndex: at, landedIndex: at, resultValue: value })
            perOp.push({ op, result: "stored", value, homeIndex: home })
            done = true
            break
          }
          if (cell === null) {
            if (firstFree < 0) firstFree = idx
            trail.push(idx)
            push("probe", { ...commonHome, probeIndex: idx })
            continue
          }
          comparisons += 1
          trail.push(idx)
          push("compare", { ...commonHome, probeIndex: idx })
          if (cell.key === op.key) {
            buckets[idx] = [{ key: op.key, value }]
            push("update", { ...commonHome, probeIndex: idx, landedIndex: idx, resultValue: value })
            perOp.push({ op, result: "updated", value, homeIndex: home })
            done = true
            break
          }
        }
        if (!done) {
          if (firstFree >= 0) {
            buckets[firstFree] = [{ key: op.key, value }]
            tomb[firstFree] = false
            size += 1
            push("insert", { ...commonHome, probeIndex: firstFree, landedIndex: firstFree, resultValue: value })
            perOp.push({ op, result: "stored", value, homeIndex: home })
          } else {
            push("miss", commonHome)
            perOp.push({ op, result: "miss", value: null, homeIndex: home })
          }
        }
        push("op_done", { ...commonHome, opResult: perOp[perOp.length - 1].result, resultValue: value })
      } else if (op.kind === "get") {
        let hit = false
        for (let step = 0; step < capacity; step++) {
          const idx = (home + step) % capacity
          const cell = slotEntry(idx)
          if (cell === null && !tomb[idx]) break
          if (cell === null) {
            trail.push(idx)
            push("probe", { ...commonHome, probeIndex: idx })
            continue
          }
          comparisons += 1
          trail.push(idx)
          push("compare", { ...commonHome, probeIndex: idx })
          if (cell.key === op.key) {
            push("found", { ...commonHome, probeIndex: idx, landedIndex: idx, resultValue: cell.value })
            perOp.push({ op, result: "hit", value: cell.value, homeIndex: home })
            push("op_done", { ...commonHome, opResult: "hit", resultValue: cell.value })
            hit = true
            break
          }
        }
        if (!hit) {
          push("miss", commonHome)
          perOp.push({ op, result: "miss", value: null, homeIndex: home })
          push("op_done", { ...commonHome, opResult: "miss" })
        }
      } else {
        let removed = false
        for (let step = 0; step < capacity; step++) {
          const idx = (home + step) % capacity
          const cell = slotEntry(idx)
          if (cell === null && !tomb[idx]) break
          if (cell === null) {
            trail.push(idx)
            push("probe", { ...commonHome, probeIndex: idx })
            continue
          }
          comparisons += 1
          trail.push(idx)
          push("compare", { ...commonHome, probeIndex: idx })
          if (cell.key === op.key) {
            buckets[idx] = []
            tomb[idx] = true
            size -= 1
            push("delete", { ...commonHome, probeIndex: idx, landedIndex: idx })
            perOp.push({ op, result: "deleted", value: null, homeIndex: home })
            push("op_done", { ...commonHome, opResult: "deleted" })
            removed = true
            break
          }
        }
        if (!removed) {
          push("miss", commonHome)
          perOp.push({ op, result: "miss", value: null, homeIndex: home })
          push("op_done", { ...commonHome, opResult: "miss" })
        }
      }
    }
  })

  push("done", { opIndex: null, op: null })

  return {
    events,
    buckets: snapshot(buckets),
    tombstones: [...tomb],
    perOp,
    capacity,
    size,
    comparisons,
    collisions,
    hashFn,
    strategy,
  }
}

/** Підсумкові лічильники методу без журналу (рахуємо через `runHashTable`). */
export interface HtCounts {
  readonly comparisons: number
  readonly collisions: number
  readonly size: number
  readonly loadFactor: number
}

/** Лічильники методу: порівняння, колізії, навантаження α = size/capacity. */
export function countHtOperations(
  ops: readonly HtOp[],
  capacity: number,
  opts: HtOptions = {},
): HtCounts {
  const r = runHashTable(ops, capacity, opts)
  return {
    comparisons: r.comparisons,
    collisions: r.collisions,
    size: r.size,
    loadFactor: capacity > 0 ? r.size / capacity : 0,
  }
}
