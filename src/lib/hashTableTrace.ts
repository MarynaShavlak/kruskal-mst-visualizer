// Модель trace для хеш-таблиці. Скрипт операцій проганяється ОДИН раз (через
// hashTableSteps) і пишемо список незмінних кадрів (HtFrame) — по одному на КОЖНУ
// подію журналу. UI лише рухає курсор. Кожен кадр несе повний знімок таблиці,
// домашній індекс, курсор сканування/зондування, активні підсвітки коду й нарацію.
// ДВІ стратегії: ланцюжки (chain-скан) і лінійне зондування (probe-прогулянка з
// надгробками). Сигнатурний образ — масив комірок + «хеш-конвеєр» + (для linear)
// курсор-зонд і кластер.
//
// Кадр розширює лише FrameNarration (нарація + рядки коду): у хеш-таблиці немає
// одного масиву-входу+результату, як у пошуку — тут послідовність операцій над станом.

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

/** Наочний лістинг «відкрите адресування» (лінійне зондування) з надгробками. */
export const HT_LINEAR_CODE: readonly string[] = [
  "def insert(key, value):",
  "    i = hash(key) % size",
  "    while table[i] is not None:   # слот зайнятий?",
  "        if table[i].key == key:",
  "            table[i].value = value  # оновити наявний",
  "            return",
  "        i = (i + 1) % size        # лінійний крок → наступний слот",
  "    table[i] = (key, value)       # вільний слот → кладемо",
  "",
  "def get(key):",
  "    i = hash(key) % size",
  "    while table[i] is not None:",
  "        if table[i].key == key:",
  "            return table[i].value  # знайдено",
  "        i = (i + 1) % size        # крок далі (навіть крізь надгробок)",
  "    return None                   # порожній слот → немає",
  "",
  "def delete(key):",
  "    i = hash(key) % size",
  "    while table[i] is not None:",
  "        if table[i].key == key:",
  "            table[i] = TOMBSTONE  # НЕ None — щоб не рвати ланцюг проб",
  "            return",
  "        i = (i + 1) % size",
]

/** Фаза кадру для бейджа в нарації. */
export type HtPhase =
  | "init"
  | "op"
  | "hash"
  | "collision"
  | "compare"
  | "probe"
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
  readonly strategy: CollisionStrategy
  /** Повний знімок таблиці на цьому кадрі (незмінний). */
  readonly buckets: HtBuckets
  /** Надгробки (linear) — очищені видаленням комірки; для chaining усі false. */
  readonly tombstones: readonly boolean[]
  readonly capacity: number
  readonly size: number
  readonly loadFactor: number
  readonly op: HtOp | null
  readonly opIndex: number | null
  readonly keyCodes: readonly number[]
  readonly rawHash: number | null
  readonly homeIndex: number | null
  /** Позиція в ланцюзі, яку зараз порівнюємо (chaining), або null. */
  readonly scanPos: number | null
  /** Слот під курсором-зондом (linear), або null. */
  readonly probeIndex: number | null
  /** Відвідані слоти поточної операції (linear-кластер). */
  readonly probeTrail: readonly number[]
  /** Позиція в ланцюзі терміналу (chaining), або null. */
  readonly landedChainPos: number | null
  /** Комірка терміналу операції, або null. */
  readonly landedIndex: number | null
  readonly opResult: HtOpResult | null
  readonly resultValue: number | null
  readonly comparisons: number
  readonly collisions: number
}

/** Підсумок прогону для картки результату. */
export interface HtResult {
  readonly ops: readonly HtOp[]
  readonly buckets: HtBuckets
  readonly tombstones: readonly boolean[]
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

/** Рядки коду для (стратегія, тип операції, тип події). */
function linesFor(
  op: HtOp | null,
  kind: HtEventKind,
  strategy: CollisionStrategy,
): { lines: number[]; contextLines: number[] } {
  const k = op?.kind
  return strategy === "linear" ? linear() : chaining()

  function chaining(): { lines: number[]; contextLines: number[] } {
    switch (kind) {
      case "op_start":
        return { lines: [k === "get" ? 10 : k === "delete" ? 17 : 1], contextLines: [] }
      case "hash":
        return { lines: k === "get" ? [11] : k === "delete" ? [18] : [2, 3], contextLines: [] }
      case "collision":
        return { lines: [4], contextLines: [3] }
      case "compare":
        return { lines: k === "get" ? [12, 13] : k === "delete" ? [19, 20] : [4, 5], contextLines: [] }
      case "insert":
        return { lines: [8], contextLines: [] }
      case "update":
        return { lines: [6, 7], contextLines: [] }
      case "found":
        return { lines: [14], contextLines: [] }
      case "miss":
        return { lines: k === "delete" ? [19] : [15], contextLines: [] }
      case "delete":
        return { lines: [21], contextLines: [] }
      case "op_done":
        return { lines: [k === "get" ? 10 : k === "delete" ? 17 : 1], contextLines: [] }
      default:
        return { lines: [], contextLines: [] }
    }
  }

  function linear(): { lines: number[]; contextLines: number[] } {
    switch (kind) {
      case "op_start":
        return { lines: [k === "get" ? 10 : k === "delete" ? 18 : 1], contextLines: [] }
      case "hash":
        return { lines: [k === "get" ? 11 : k === "delete" ? 19 : 2], contextLines: [] }
      case "collision":
        return { lines: [3], contextLines: [] }
      case "compare":
        return { lines: k === "get" ? [12, 13] : k === "delete" ? [20, 21] : [3, 4], contextLines: [] }
      case "probe":
        return { lines: k === "get" ? [15] : k === "delete" ? [24] : [7], contextLines: [] }
      case "insert":
        return { lines: [8], contextLines: [] }
      case "update":
        return { lines: [5, 6], contextLines: [] }
      case "found":
        return { lines: [14], contextLines: [] }
      case "miss":
        return { lines: k === "delete" ? [20] : [16], contextLines: [] }
      case "delete":
        return { lines: [22], contextLines: [] }
      case "op_done":
        return { lines: [k === "get" ? 10 : k === "delete" ? 18 : 1], contextLines: [] }
      default:
        return { lines: [], contextLines: [] }
    }
  }
}

const PHASE_OF: Record<HtEventKind, HtPhase> = {
  init: "init",
  op_start: "op",
  hash: "hash",
  collision: "collision",
  compare: "compare",
  probe: "probe",
  insert: "insert",
  update: "update",
  found: "found",
  miss: "miss",
  delete: "delete",
  op_done: "op",
  done: "done",
}

/** Ключ нарації для події (наповнюється в messages.ts). */
function captionKey(kind: HtEventKind): string {
  const suffix = kind
    .split("_")
    .map((p, i) => (i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join("")
  return `play.nHt${suffix.charAt(0).toUpperCase()}${suffix.slice(1)}`
}

/** Перетворює одну подію журналу на кадр (рядки коду + нарація). */
function frameFor(ev: HtEvent, t: Translate): Omit<HtFrame, "i"> {
  const { lines, contextLines } = linesFor(ev.op, ev.kind, ev.strategy)
  const key = ev.op?.key ?? ""
  const keyCodes = key ? [...key].map((ch) => ch.charCodeAt(0)) : []
  const loadFactor = ev.capacity > 0 ? ev.size / ev.capacity : 0

  const vars: Record<string, string | number> = {
    key,
    kind: ev.op?.kind ?? "",
    value: ev.op?.value ?? 0,
    home: ev.homeIndex ?? 0,
    raw: ev.rawHash ?? 0,
    pos: ev.scanPos ?? ev.probeIndex ?? 0,
    slot: ev.probeIndex ?? ev.landedIndex ?? 0,
    landed: ev.landedIndex ?? ev.landedChainPos ?? 0,
    result: ev.resultValue ?? 0,
    comparisons: ev.comparisons,
    collisions: ev.collisions,
    size: ev.size,
    capacity: ev.capacity,
    alpha: loadFactor.toFixed(2),
  }

  return {
    phase: PHASE_OF[ev.kind],
    strategy: ev.strategy,
    buckets: ev.buckets,
    tombstones: ev.tombstones,
    capacity: ev.capacity,
    size: ev.size,
    loadFactor,
    op: ev.op,
    opIndex: ev.opIndex,
    keyCodes,
    rawHash: ev.rawHash,
    homeIndex: ev.homeIndex,
    scanPos: ev.scanPos,
    probeIndex: ev.probeIndex,
    probeTrail: ev.probeTrail,
    landedChainPos: ev.landedChainPos,
    landedIndex: ev.landedIndex,
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
  const code = run.strategy === "linear" ? HT_LINEAR_CODE : HT_CODE
  const result: HtResult = {
    ops,
    buckets: run.buckets,
    tombstones: run.tombstones,
    perOp: run.perOp,
    capacity: run.capacity,
    size: run.size,
    loadFactor: run.capacity > 0 ? run.size / run.capacity : 0,
    comparisons: run.comparisons,
    collisions: run.collisions,
    hashFn: run.hashFn,
    strategy: run.strategy,
  }
  return { code, frames, result }
}
