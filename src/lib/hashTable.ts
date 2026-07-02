// Хеш-таблиця (Hash Table) — перша СТРУКТУРА ДАНИХ на платформі (а не алгоритм над
// одним входом): послідовність операцій insert/get/delete над таблицею-масивом
// «комірок». Хеш-функція перетворює КЛЮЧ на ІНДЕКС комірки (slot), тож доступ —
// прямий, без перебору: у середньому O(1). Порт ідеї класу HashTable з конспекту
// edu.goit. Фреймворк-незалежне ядро, без React.
//
// MVP-релиз: розв'язання колізій лише МЕТОДОМ ЛАНЦЮЖКІВ (chaining) — у комірці
// лежить список пар (ключ, значення). Відкрите адресування (лінійне зондування),
// рехешування й «надгробки» — наступні фази. Хеш за замовчуванням — «сума кодів
// символів % size» (її можна перевірити руками; саме на ній тримається еталон і
// навчальний текст); поліноміальний хеш — opt-in місток до Рабіна–Карпа.
//
// Модуль містить три рівні (як radixSort):
//   sumCodesHash / slotOf   — самі хеш-функції (детермінований сурогат);
//   runHashTable            — базовий прогін (фінальний стан + результат кожної операції);
//   hashTableSteps          — інструментований журнал подій зі знімками для візуалізацій.

import { polynomialHashRaw } from "@/lib/rabinKarpStringSearch"

/** Стратегія розв'язання колізій. MVP — лише ланцюжки; "linear" додамо у фазі 5. */
export type CollisionStrategy = "chaining"

/**
 * Ідентифікатор хеш-функції. `sum` — навчальна «сума кодів символів» (перевірна
 * усно, дефолт). `poly` — поліноміальний хеш рядка (Σ ord·base^k) — той самий, що
 * в Рабіні–Карпі; «справжній», але усно не порахувати, тому opt-in.
 */
export type HashFnId = "sum" | "poly"

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

/** Знімок таблиці — масив комірок, кожна комірка це ланцюг пар. */
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
  return fn === "sum" ? sumCodesHash(key) : null
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
  if (fn === "poly") {
    return Number(polynomialHashRaw(key) % BigInt(capacity))
  }
  return sumCodesHash(key) % capacity
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
  readonly perOp: readonly HtPerOp[]
  readonly capacity: number
  /** Кількість збережених пар (n) → навантаження α = size/capacity. */
  readonly size: number
  /** Порівнянь ключів під час сканування ланцюгів (сумарно). */
  readonly comparisons: number
  /** Скільки разів insert влучив у НЕпорожню комірку (колізія). */
  readonly collisions: number
  readonly hashFn: HashFnId
  readonly strategy: CollisionStrategy
}

/**
 * Проганяє послідовність операцій над хеш-таблицею фіксованої місткості
 * `capacity` (ланцюжки). Повертає фінальний стан, результат кожної операції й
 * лічильники. Мутує лише власні внутрішні масиви; вхід не чіпає.
 */
export function runHashTable(
  ops: readonly HtOp[],
  capacity: number,
  opts: HtOptions = {},
): HtRunResult {
  const hashFn = opts.hashFn ?? "sum"
  const strategy = opts.strategy ?? "chaining"
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
        if (chain[j].key === op.key) {
          found = j
          break
        }
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
        if (chain[j].key === op.key) {
          found = j
          break
        }
      }
      if (found >= 0) {
        perOp.push({ op, result: "hit", value: chain[found].value, homeIndex: home })
      } else {
        perOp.push({ op, result: "miss", value: null, homeIndex: home })
      }
    } else {
      // delete (ланцюжки: просто вирізаємо ноду — безпечно)
      let found = -1
      for (let j = 0; j < chain.length; j++) {
        comparisons += 1
        if (chain[j].key === op.key) {
          found = j
          break
        }
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
    perOp,
    capacity,
    size,
    comparisons,
    collisions,
    hashFn,
    strategy,
  }
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
  readonly capacity: number
  /** Кількість збережених пар (n). */
  readonly size: number
  /** Індекс поточної операції (0-based) або null для init/done. */
  readonly opIndex: number | null
  /** Поточна операція або null. */
  readonly op: HtOp | null
  /** Домашній індекс `hash%capacity` (з кадру hash і далі) або null. */
  readonly homeIndex: number | null
  /** «Сире» число хеша (для конвеєра) або null. */
  readonly rawHash: number | null
  /** Позиція в ланцюзі, яку ЗАРАЗ порівнюємо (compare) або null. */
  readonly scanPos: number | null
  /** Куди сіла/оновилась пара в ланцюзі (insert/update/found) або null. */
  readonly landedChainPos: number | null
  /** Наслідок операції — лише на op_done; інакше null. */
  readonly opResult: HtOpResult | null
  /** Значення для вердикту (stored/updated/hit) або null. */
  readonly resultValue: number | null
  // Лічильники (МОНОТОННІ, копіюються в КОЖЕН запис — як radix passes/distributions):
  readonly comparisons: number
  readonly collisions: number
}

/** Результат інструментованого прогону: журнал подій + фінальний стан і лічильники. */
export interface HtStepsResult {
  readonly events: HtEvent[]
  readonly buckets: HtBuckets
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
  const buckets: HtEntry[][] = Array.from({ length: capacity }, () => [])
  const events: HtEvent[] = []
  const perOp: HtPerOp[] = []
  let comparisons = 0
  let collisions = 0
  let size = 0

  const base = (): Omit<
    HtEvent,
    "kind" | "opIndex" | "op" | "homeIndex" | "rawHash" | "scanPos"
    | "landedChainPos" | "opResult" | "resultValue"
  > => ({
    buckets: snapshot(buckets),
    capacity,
    size,
    comparisons,
    collisions,
  })

  const push = (
    kind: HtEventKind,
    fields: Partial<HtEvent> & {
      opIndex: number | null
      op: HtOp | null
    },
  ): void => {
    events.push({
      ...base(),
      kind,
      homeIndex: null,
      rawHash: null,
      scanPos: null,
      landedChainPos: null,
      opResult: null,
      resultValue: null,
      ...fields,
    })
  }

  push("init", { opIndex: null, op: null })

  ops.forEach((op, opIndex) => {
    const home = slotOf(op.key, capacity, hashFn)
    const raw = rawHashNumber(op.key, hashFn)
    const chain = buckets[home]

    push("op_start", { opIndex, op })
    push("hash", { opIndex, op, homeIndex: home, rawHash: raw })

    if (op.kind === "insert") {
      if (chain.length > 0) {
        collisions += 1
        push("collision", { opIndex, op, homeIndex: home })
      }
      let found = -1
      for (let j = 0; j < chain.length; j++) {
        comparisons += 1
        push("compare", { opIndex, op, homeIndex: home, scanPos: j })
        if (chain[j].key === op.key) {
          found = j
          break
        }
      }
      const value = op.value ?? 0
      if (found >= 0) {
        chain[found] = { key: op.key, value }
        push("update", { opIndex, op, homeIndex: home, landedChainPos: found, resultValue: value })
        perOp.push({ op, result: "updated", value, homeIndex: home })
        push("op_done", { opIndex, op, homeIndex: home, opResult: "updated", resultValue: value })
      } else {
        chain.push({ key: op.key, value })
        size += 1
        push("insert", {
          opIndex, op, homeIndex: home,
          landedChainPos: chain.length - 1, resultValue: value,
        })
        perOp.push({ op, result: "stored", value, homeIndex: home })
        push("op_done", { opIndex, op, homeIndex: home, opResult: "stored", resultValue: value })
      }
    } else if (op.kind === "get") {
      let found = -1
      for (let j = 0; j < chain.length; j++) {
        comparisons += 1
        push("compare", { opIndex, op, homeIndex: home, scanPos: j })
        if (chain[j].key === op.key) {
          found = j
          break
        }
      }
      if (found >= 0) {
        const value = chain[found].value
        push("found", { opIndex, op, homeIndex: home, landedChainPos: found, resultValue: value })
        perOp.push({ op, result: "hit", value, homeIndex: home })
        push("op_done", { opIndex, op, homeIndex: home, opResult: "hit", resultValue: value })
      } else {
        push("miss", { opIndex, op, homeIndex: home })
        perOp.push({ op, result: "miss", value: null, homeIndex: home })
        push("op_done", { opIndex, op, homeIndex: home, opResult: "miss" })
      }
    } else {
      let found = -1
      for (let j = 0; j < chain.length; j++) {
        comparisons += 1
        push("compare", { opIndex, op, homeIndex: home, scanPos: j })
        if (chain[j].key === op.key) {
          found = j
          break
        }
      }
      if (found >= 0) {
        chain.splice(found, 1)
        size -= 1
        push("delete", { opIndex, op, homeIndex: home, landedChainPos: found })
        perOp.push({ op, result: "deleted", value: null, homeIndex: home })
        push("op_done", { opIndex, op, homeIndex: home, opResult: "deleted" })
      } else {
        push("miss", { opIndex, op, homeIndex: home })
        perOp.push({ op, result: "miss", value: null, homeIndex: home })
        push("op_done", { opIndex, op, homeIndex: home, opResult: "miss" })
      }
    }
  })

  push("done", { opIndex: null, op: null })

  return {
    events,
    buckets: snapshot(buckets),
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
