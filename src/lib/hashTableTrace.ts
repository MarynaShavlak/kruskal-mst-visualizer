// Модель trace для хеш-таблиці. Скрипт операцій проганяється ОДИН раз (через
// hashTableSteps) і пишемо список незмінних кадрів (HtFrame) — по одному на КОЖНУ
// подію журналу (init → (op_start → hash → [collision] → compare* → insert/update/
// found/miss/delete → op_done)* → done). UI лише рухає курсор. Кожен кадр несе
// повний знімок таблиці, домашній індекс, позицію сканування, активні підсвітки
// коду й нарацію. Лічильники — порівняння ключів і колізії. Сигнатурний образ —
// масив комірок + ланцюги пар + «хеш-конвеєр» ключ→hash→%size→індекс.
//
// Кадр розширює лише FrameNarration (нарація + рядки коду): у хеш-таблиці немає
// одного масиву-входу+результату, як у пошуку — тут послідовність операцій над
// станом, тож базові ArraySearchFrameBase/StringSearchFrameBase не підходять.

import {
  hashTableSteps,
  runHashTable,
  type HtBuckets,
  type HtEvent,
  type HtEventKind,
  type HtOp,
  type HtOpResult,
  type HtOptions,
  type HtPerOp,
  type CollisionStrategy,
  type HashFnId,
} from "@/lib/hashTable"
import { identityTranslate, type Translate } from "@/lib/translate"
import type { FrameNarration } from "@/lib/traceFrame"

/** Наочний лістинг «з ланцюжками» для панелі підсвітки (1-based рядки). */
export const HT_CODE: readonly string[] = [
  "def insert(key, value):",
  "    i = hash(key) % size          # хеш → індекс комірки",
  "    bucket = table[i]",
  "    for pair in bucket:           # чи ключ уже в ланцюзі?",
  "        if pair.key == key:",
  "            pair.value = value    # оновлюємо наявний",
  "            return",
  "    bucket.append((key, value))   # новий ключ → у кінець ланцюга",
  "",
  "def get(key):",
  "    i = hash(key) % size",
  "    for pair in table[i]:         # скан ланцюга комірки",
  "        if pair.key == key:",
  "            return pair.value     # знайдено",
  "    return None                   # немає ключа",
  "",
  "def delete(key):",
  "    i = hash(key) % size",
  "    for j, pair in enumerate(table[i]):",
  "        if pair.key == key:",
  "            table[i].pop(j)       # вирізаємо ноду з ланцюга",
  "            return",
]

/** Фаза кадру для бейджа в нарації. */
export type HtPhase =
  | "init"
  | "op"
  | "hash"
  | "collision"
  | "compare"
  | "insert"
  | "update"
  | "found"
  | "miss"
  | "delete"
  | "done"

export interface HtFrame extends FrameNarration {
  /** Індекс кадру в trace (0-based). */
  readonly i: number
  readonly phase: HtPhase
  /** Повний знімок таблиці на цьому кадрі (незмінний). */
  readonly buckets: HtBuckets
  readonly capacity: number
  /** Кількість збережених пар (n). */
  readonly size: number
  /** Навантаження α = size / capacity на цьому кадрі. */
  readonly loadFactor: number
  /** Поточна операція або null (init/done). */
  readonly op: HtOp | null
  readonly opIndex: number | null
  /** Коди символів ключа (для «хеш-конвеєра») або []. */
  readonly keyCodes: readonly number[]
  /** «Сире» число хеша (сума кодів) або null. */
  readonly rawHash: number | null
  /** Домашній індекс hash%capacity або null. */
  readonly homeIndex: number | null
  /** Позиція в ланцюзі, яку зараз порівнюємо, або null. */
  readonly scanPos: number | null
  /** Куди сіла/оновилась/знайшлась пара в ланцюзі, або null. */
  readonly landedChainPos: number | null
  /** Наслідок операції (на op_done) або null. */
  readonly opResult: HtOpResult | null
  readonly resultValue: number | null
  readonly comparisons: number
  readonly collisions: number
}

/** Підсумок прогону для картки результату. */
export interface HtResult {
  readonly ops: readonly HtOp[]
  readonly buckets: HtBuckets
  readonly perOp: readonly HtPerOp[]
  readonly capacity: number
  readonly size: number
  readonly loadFactor: number
  readonly comparisons: number
  readonly collisions: number
  readonly hashFn: HashFnId
  readonly strategy: CollisionStrategy
}

export interface HtTrace {
  readonly code: readonly string[]
  readonly frames: readonly HtFrame[]
  readonly result: HtResult
}

/** Рядки коду, підсвічені для (тип операції, тип події). */
function linesFor(op: HtOp | null, kind: HtEventKind): {
  lines: number[]
  contextLines: number[]
} {
  const k = op?.kind
  switch (kind) {
    case "op_start":
      if (k === "get") return { lines: [10], contextLines: [] }
      if (k === "delete") return { lines: [17], contextLines: [] }
      return { lines: [1], contextLines: [] }
    case "hash":
      if (k === "get") return { lines: [11], contextLines: [] }
      if (k === "delete") return { lines: [18], contextLines: [] }
      return { lines: [2, 3], contextLines: [] }
    case "collision":
      return { lines: [4], contextLines: [3] }
    case "compare":
      if (k === "get") return { lines: [12, 13], contextLines: [] }
      if (k === "delete") return { lines: [19, 20], contextLines: [] }
      return { lines: [4, 5], contextLines: [] }
    case "insert":
      return { lines: [8], contextLines: [] }
    case "update":
      return { lines: [6, 7], contextLines: [] }
    case "found":
      return { lines: [14], contextLines: [] }
    case "miss":
      if (k === "delete") return { lines: [19], contextLines: [] }
      return { lines: [15], contextLines: [] }
    case "delete":
      return { lines: [21], contextLines: [] }
    case "op_done":
      if (k === "get") return { lines: [10], contextLines: [] }
      if (k === "delete") return { lines: [17], contextLines: [] }
      return { lines: [1], contextLines: [] }
    case "init":
    case "done":
      return { lines: [], contextLines: [] }
  }
}

const PHASE_OF: Record<HtEventKind, HtPhase> = {
  init: "init",
  op_start: "op",
  hash: "hash",
  collision: "collision",
  compare: "compare",
  insert: "insert",
  update: "update",
  found: "found",
  miss: "miss",
  delete: "delete",
  op_done: "op",
  done: "done",
}

/** Ключ нарації для події (наповнюється в messages.ts у фазі плеєра). */
function captionKey(kind: HtEventKind): string {
  const suffix = kind
    .split("_")
    .map((p, i) => (i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join("")
  return `play.nHt${suffix.charAt(0).toUpperCase()}${suffix.slice(1)}`
}

/** Перетворює одну подію журналу на кадр (рядки коду + нарація). */
function frameFor(ev: HtEvent, t: Translate): Omit<HtFrame, "i"> {
  const { lines, contextLines } = linesFor(ev.op, ev.kind)
  const key = ev.op?.key ?? ""
  const keyCodes = key ? [...key].map((ch) => ch.charCodeAt(0)) : []
  const loadFactor = ev.capacity > 0 ? ev.size / ev.capacity : 0

  const vars: Record<string, string | number> = {
    key,
    value: ev.op?.value ?? 0,
    home: ev.homeIndex ?? 0,
    raw: ev.rawHash ?? 0,
    pos: ev.scanPos ?? 0,
    landed: ev.landedChainPos ?? 0,
    result: ev.resultValue ?? 0,
    comparisons: ev.comparisons,
    collisions: ev.collisions,
    size: ev.size,
    capacity: ev.capacity,
    alpha: loadFactor.toFixed(2),
  }

  return {
    phase: PHASE_OF[ev.kind],
    buckets: ev.buckets,
    capacity: ev.capacity,
    size: ev.size,
    loadFactor,
    op: ev.op,
    opIndex: ev.opIndex,
    keyCodes,
    rawHash: ev.rawHash,
    homeIndex: ev.homeIndex,
    scanPos: ev.scanPos,
    landedChainPos: ev.landedChainPos,
    opResult: ev.opResult,
    resultValue: ev.resultValue,
    comparisons: ev.comparisons,
    collisions: ev.collisions,
    lines,
    contextLines,
    caption: t(captionKey(ev.kind), vars),
  }
}

/**
 * Проганяє скрипт операцій над хеш-таблицею й збирає trace для плеєра/віджетів:
 * по кадру на кожну подію журналу + підсумок. Дефолт — хеш «сума кодів», ланцюжки.
 */
export function buildHashTableTrace(
  ops: readonly HtOp[],
  capacity: number,
  opts: HtOptions = {},
  t: Translate = identityTranslate,
): HtTrace {
  const { events } = hashTableSteps(ops, capacity, opts)
  const frames: HtFrame[] = events.map((ev, i) => ({ i, ...frameFor(ev, t) }))

  const run = runHashTable(ops, capacity, opts)
  const result: HtResult = {
    ops,
    buckets: run.buckets,
    perOp: run.perOp,
    capacity: run.capacity,
    size: run.size,
    loadFactor: run.capacity > 0 ? run.size / run.capacity : 0,
    comparisons: run.comparisons,
    collisions: run.collisions,
    hashFn: run.hashFn,
    strategy: run.strategy,
  }
  return { code: HT_CODE, frames, result }
}
