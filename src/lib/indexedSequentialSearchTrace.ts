// Модель trace для індексно-послідовного пошуку. Алгоритм проганяється ОДИН раз і
// пишемо список незмінних кадрів (IxsFrame) — UI лише рухає курсор. Як у двійковому
// та лінійному пошуку, кожен крок розбито на ДВА кадри: «проба/перевірка» (інтрига)
// і «розв'язок». ДВА РІВНІ даних → дворівневий образ: 🟪 індексна таблиця згори
// (фаза 1), ⬜ масив із блоками знизу (фаза 2).
//
// init + [фаза 1: (probe+discard)…] + block + [фаза 2: (scan+reject)…/found] + done.
// Головний приклад [1,3,…,25] (крок 4, ціль 15): рівно 15 кадрів = step_00…step_14.
//
// ДВА РЕЖИМИ (як «варіанти» в README): ДВІЙКОВИЙ індекс (база з конспекту) і ЛІНІЙНИЙ
// індекс (простіша фаза 1). Вибір блоку й фаза 2 — ІДЕНТИЧНІ, тож той самий результат;
// різниться лише фаза 1 (вікно vs курсор) та її ціна (зондування індексу).

import { createFrameList } from "@/lib/frameList"
import { identityTranslate, type Translate } from "@/lib/translate"
import type { ArraySearchFrameBase } from "@/lib/traceFrame"
import {
  blockRange,
  branchFor,
  createIndexTable,
  type Branch,
  type IndexEntry,
} from "@/lib/indexedSequentialSearch"

/** Лістинг базової реалізації (двійковий індекс) — її розбирає README рядок за рядком. */
export const BASE_CODE: readonly string[] = [
  "def create_index_table(array, step):       # розріджена «карта» масиву",
  "    table = []",
  "    for i in range(0, len(array), step):    #   беремо кожен step-ий елемент",
  "        table.append((array[i], i))         #   як пару (ключ, позиція)",
  "    return table",
  "",
  "def indexed_sequential_search(array, table, x):",
  "    start, end = 0, len(table) - 1          # ФАЗА 1 — двійковий по індексу",
  "    while start <= end:                     #   вікно індексу [start, end]",
  "        mid = (start + end) // 2            #   середній сигнальний стовп",
  "        if table[mid][0] == x:              #   ключ стовпа == шуканому?",
  "            return table[mid][1]            #     → знайдено вже в індексі",
  "        elif table[mid][0] < x:             #   ключ менший → праворуч",
  "            start = mid + 1                 #     відкидаємо ліву половину",
  "        else:                               #   ключ більший → ліворуч",
  "            end = mid - 1                   #     відкидаємо праву половину",
  "    if start == 0:                          # ВИБІР БЛОКУ — три гілки",
  "        lo, hi = 0, table[0][1]             #   лівіше за перший стовп",
  "    elif start >= len(table):               #",
  "        lo, hi = table[-1][1], len(array)   #   правіше за останній (хвіст)",
  "    else:                                   #",
  "        lo, hi = table[start-1][1], table[start][1]  # між сусідніми стовпами",
  "    for i in range(lo, hi):                 # ФАЗА 2 — лінійний у блоці",
  "        if array[i] == x:                   #   array[i] == шуканому?",
  "            return i                        #     → знайдено в блоці",
  "    return -1                               # блок вичерпано → елемента немає",
]

/** Лістинг варіанта: фаза 1 — ЛІНІЙНИЙ прохід по індексу (простіше). Той самий результат. */
export const LINEAR_INDEX_CODE: readonly string[] = [
  "def create_index_table(array, step):       # розріджена «карта» масиву",
  "    table = []",
  "    for i in range(0, len(array), step):    #   беремо кожен step-ий елемент",
  "        table.append((array[i], i))         #   як пару (ключ, позиція)",
  "    return table",
  "",
  "def indexed_sequential_linear(array, table, x):",
  "    start = 0                               # ФАЗА 1 — ЛІНІЙНИЙ по індексу",
  "    while start < len(table):               #   йдемо стовпами зліва направо",
  "        if table[start][0] == x:            #   ключ стовпа == шуканому?",
  "            return table[start][1]          #     → знайдено вже в індексі",
  "        if table[start][0] > x:             #   ключ більший → стоп",
  "            break                           #     (далі стовпи завеликі)",
  "        start += 1                          #   ключ менший → наступний стовп",
  "    if start == 0:                          # ВИБІР БЛОКУ — три гілки",
  "        lo, hi = 0, table[0][1]             #   лівіше за перший стовп",
  "    elif start >= len(table):               #",
  "        lo, hi = table[-1][1], len(array)   #   правіше за останній (хвіст)",
  "    else:                                   #",
  "        lo, hi = table[start-1][1], table[start][1]  # між сусідніми стовпами",
  "    for i in range(lo, hi):                 # ФАЗА 2 — лінійний у блоці",
  "        if array[i] == x:                   #   array[i] == шуканому?",
  "            return i                        #     → знайдено в блоці",
  "    return -1                               # блок вичерпано → елемента немає",
]

interface LineMap {
  readonly init: readonly number[]
  readonly probe: readonly number[]
  readonly probeCtx: readonly number[]
  readonly discardRight: readonly number[]
  readonly discardLeft: readonly number[]
  readonly indexFound: readonly number[]
  readonly blockLeft: readonly number[]
  readonly blockRight: readonly number[]
  readonly blockGeneral: readonly number[]
  readonly scan: readonly number[]
  readonly reject: readonly number[]
  readonly blockFound: readonly number[]
  readonly doneFoundIndex: readonly number[]
  readonly doneFoundBlock: readonly number[]
  readonly doneAbsent: readonly number[]
}

const BASE_LINES: LineMap = {
  init: [1, 2, 3, 4, 5],
  probe: [10, 11], probeCtx: [9],
  discardRight: [13, 14], discardLeft: [15, 16],
  indexFound: [11, 12],
  blockLeft: [17, 18], blockRight: [19, 20], blockGeneral: [21, 22],
  scan: [23, 24], reject: [23], blockFound: [24, 25],
  doneFoundIndex: [12], doneFoundBlock: [25], doneAbsent: [26],
}

const LINEAR_LINES: LineMap = {
  init: [1, 2, 3, 4, 5],
  probe: [9, 10], probeCtx: [9],
  discardRight: [14], discardLeft: [12, 13],
  indexFound: [10, 11],
  blockLeft: [15, 16], blockRight: [17, 18], blockGeneral: [19, 20],
  scan: [21, 22], reject: [21], blockFound: [22, 23],
  doneFoundIndex: [11], doneFoundBlock: [23], doneAbsent: [24],
}

/** Фаза кадру (бейдж/нарація). */
export type IxsPhase =
  | "init"
  | "probe"
  | "discard"
  | "block"
  | "scan"
  | "reject"
  | "found"
  | "done"

export interface IxsFrame extends ArraySearchFrameBase {
  readonly phase: IxsPhase
  /** Чи це подія РІВНЯ ІНДЕКСУ (фаза 1) — для бейджа/легенди. */
  readonly level: "index" | "block"
  readonly indexTable: readonly IndexEntry[]
  readonly step: number

  // — Рівень індексу (фаза 1) —
  /** Активне вікно індексу `[idxLow..idxHigh]` (двійковий: [start,end]; лінійний: [cursor,len-1]). */
  readonly idxLow: number | null
  readonly idxHigh: number | null
  /** Проба — сигнальний стовп, який зондуємо (рожевий ▼), або null. */
  readonly idxMid: number | null
  /** Ключ стовпа `idxMid` (для порівняння). */
  readonly idxKey: number | null
  /** Стовпи індексу, які відкидаємо ЦЬОГО кроку (🟥), або null. */
  readonly idxDiscardLo: number | null
  readonly idxDiscardHi: number | null

  // — Рівень масиву (вибір блоку + фаза 2) —
  /** Межі обраного блоку `[blockLo, blockHi)` (від кадру `block` і далі), або null. */
  readonly blockLo: number | null
  readonly blockHi: number | null
  readonly branch: Branch | null
  /** Курсор фази 2 (поточна комірка масиву, що перевіряється), або null. */
  readonly cursor: number | null
  readonly value: number | null

  // — Лічильники / результат —
  readonly indexProbes: number
  readonly seqComparisons: number

  readonly linearIndex: boolean
}

export interface IxsTraceResult {
  readonly input: readonly number[]
  readonly target: number
  readonly step: number
  readonly indexTable: readonly IndexEntry[]
  readonly result: number
  readonly indexProbes: number
  readonly seqComparisons: number
  readonly total: number
  readonly size: number
  readonly branch: Branch | null
  readonly linearIndex: boolean
  readonly found: boolean
}

export interface IxsTrace {
  readonly code: readonly string[]
  readonly frames: readonly IxsFrame[]
  readonly result: IxsTraceResult
}

const fmtTable = (t: readonly IndexEntry[]): string =>
  `[${t.map((e) => `(${e[0]},${e[1]})`).join(", ")}]`

/**
 * Проганяє індексно-послідовний пошук і збирає trace для плеєра/віджетів. `linearIndex`
 * перемикає фазу 1 (двійковий ↔ лінійний прохід по індексу): вибір блоку й фаза 2
 * ідентичні, тож той самий результат — різниться лише фаза 1 і її ціна.
 */
export function buildIndexedSequentialSearchTrace(
  input: readonly number[],
  target: number,
  step: number,
  linearIndex = false,
  t: Translate = identityTranslate,
): IxsTrace {
  const arr = [...input]
  const n = arr.length
  const s = Math.max(1, Math.trunc(step))
  const indexTable = createIndexTable(arr, s)
  const code = linearIndex ? LINEAR_INDEX_CODE : BASE_CODE
  const LM = linearIndex ? LINEAR_LINES : BASE_LINES

  const { frames, push: pushFrame } = createFrameList<IxsFrame>()
  let indexProbes = 0
  let seqComparisons = 0
  let result = -1
  let blockLo: number | null = null
  let blockHi: number | null = null
  let branch: Branch | null = null

  const push = (
    phase: IxsPhase,
    level: "index" | "block",
    f: {
      idxLow?: number | null
      idxHigh?: number | null
      idxMid?: number | null
      idxKey?: number | null
      idxDiscardLo?: number | null
      idxDiscardHi?: number | null
      cursor?: number | null
      value?: number | null
      lines: readonly number[]
      contextLines?: readonly number[]
      caption: string
    },
  ) => {
    pushFrame({
      phase,
      level,
      array: arr,
      indexTable,
      step: s,
      target,
      idxLow: f.idxLow ?? null,
      idxHigh: f.idxHigh ?? null,
      idxMid: f.idxMid ?? null,
      idxKey: f.idxKey ?? null,
      idxDiscardLo: f.idxDiscardLo ?? null,
      idxDiscardHi: f.idxDiscardHi ?? null,
      blockLo,
      blockHi,
      branch,
      cursor: f.cursor ?? null,
      value: f.value ?? null,
      indexProbes,
      seqComparisons,
      result,
      linearIndex,
      lines: f.lines,
      contextLines: f.contextLines ?? [],
      caption: f.caption,
    })
  }

  const lastIdx = indexTable.length - 1

  push("init", "index", {
    idxLow: indexTable.length ? 0 : null,
    idxHigh: indexTable.length ? lastIdx : null,
    lines: LM.init,
    caption: t("play.nIssInit", {
      table: fmtTable(indexTable), step: s, target, arr: `[${arr.join(", ")}]`,
    }),
  })

  if (indexTable.length === 0) {
    push("done", "block", {
      lines: LM.doneAbsent,
      caption: t("play.nIssDoneAbsent", { target, probes: 0, seq: 0, total: 0 }),
    })
    return finish()
  }

  // ── ФАЗА 1 ────────────────────────────────────────────────────────────────
  let start = 0
  let foundInIndex = false

  if (!linearIndex) {
    let end = lastIdx
    while (start <= end) {
      const mid = Math.floor((start + end) / 2)
      const [key, pos] = indexTable[mid]
      indexProbes += 1
      push("probe", "index", {
        idxLow: start, idxHigh: end, idxMid: mid, idxKey: key,
        lines: LM.probe, contextLines: LM.probeCtx,
        caption: t("play.nIssProbe", { k: indexProbes, start, end, mid, key, target }),
      })
      if (key === target) {
        result = pos
        foundInIndex = true
        push("found", "index", {
          idxLow: start, idxHigh: end, idxMid: mid, idxKey: key,
          lines: LM.indexFound, contextLines: LM.probeCtx,
          caption: t("play.nIssIndexFound", { key, target, pos }),
        })
        break
      } else if (key < target) {
        const newStart = mid + 1
        push("discard", "index", {
          idxLow: newStart, idxHigh: end, idxMid: mid, idxKey: key,
          idxDiscardLo: start, idxDiscardHi: mid,
          lines: LM.discardRight, contextLines: LM.probeCtx,
          caption: t("play.nIssDiscardRight", { key, target, probes: indexProbes }),
        })
        start = newStart
      } else {
        const newEnd = mid - 1
        push("discard", "index", {
          idxLow: start, idxHigh: newEnd, idxMid: mid, idxKey: key,
          idxDiscardLo: mid, idxDiscardHi: end,
          lines: LM.discardLeft, contextLines: LM.probeCtx,
          caption: t("play.nIssDiscardLeft", { key, target, probes: indexProbes }),
        })
        end = newEnd
      }
    }
  } else {
    while (start < indexTable.length) {
      const [key, pos] = indexTable[start]
      indexProbes += 1
      push("probe", "index", {
        idxLow: start, idxHigh: lastIdx, idxMid: start, idxKey: key,
        lines: LM.probe, contextLines: LM.probeCtx,
        caption: t("play.nIssProbeLinear", { mid: start, key, target, k: indexProbes }),
      })
      if (key === target) {
        result = pos
        foundInIndex = true
        push("found", "index", {
          idxLow: start, idxHigh: lastIdx, idxMid: start, idxKey: key,
          lines: LM.indexFound, contextLines: LM.probeCtx,
          caption: t("play.nIssIndexFound", { key, target, pos }),
        })
        break
      }
      if (key > target) {
        push("discard", "index", {
          idxLow: start, idxHigh: lastIdx, idxMid: start, idxKey: key,
          lines: LM.discardLeft, contextLines: LM.probeCtx,
          caption: t("play.nIssStop", { key, target, probes: indexProbes }),
        })
        break
      }
      push("discard", "index", {
        idxLow: start + 1, idxHigh: lastIdx, idxMid: null, idxKey: key,
        idxDiscardLo: start, idxDiscardHi: start,
        lines: LM.discardRight, contextLines: LM.probeCtx,
        caption: t("play.nIssAdvance", { key, target, probes: indexProbes }),
      })
      start += 1
    }
  }

  if (foundInIndex) {
    push("done", "index", {
      idxMid: null,
      lines: LM.doneFoundIndex,
      caption: t("play.nIssDoneFound", {
        target, i: result, probes: indexProbes, seq: seqComparisons,
        total: indexProbes + seqComparisons,
      }),
    })
    return finish()
  }

  // ── ВИБІР БЛОКУ ─────────────────────────────────────────────────────────────
  const range = blockRange(arr, indexTable, start)
  blockLo = range[0]
  blockHi = range[1]
  branch = branchFor(indexTable, start)
  const lk = branch === "start==0" ? null : indexTable[start - 1][0]
  const rk = branch === "start>=len" ? null : indexTable[start][0]
  const blockLines =
    branch === "start==0" ? LM.blockLeft : branch === "start>=len" ? LM.blockRight : LM.blockGeneral
  const blockCaption =
    branch === "general"
      ? t("play.nIssBlockGeneral", { lk: lk ?? 0, target, rk: rk ?? 0, lo: blockLo, hi: blockHi })
      : branch === "start==0"
        ? t("play.nIssBlockLeft", { target, lo: blockLo, hi: blockHi })
        : t("play.nIssBlockRight", { target, lo: blockLo, hi: blockHi })
  push("block", "block", { idxMid: null, lines: blockLines, caption: blockCaption })

  // ── ФАЗА 2 ────────────────────────────────────────────────────────────────
  for (let i = blockLo; i < blockHi; i++) {
    const value = arr[i]
    seqComparisons += 1
    push("scan", "block", {
      cursor: i, value,
      lines: LM.scan,
      caption: t("play.nIssScan", { i, value, target }),
    })
    if (value === target) {
      result = i
      push("found", "block", {
        cursor: i, value,
        lines: LM.blockFound,
        caption: t("play.nIssBlockFound", {
          i, value, target, probes: indexProbes, seq: seqComparisons,
        }),
      })
      break
    }
    push("reject", "block", {
      cursor: i, value,
      lines: LM.reject,
      caption: t("play.nIssReject", { i, value, target, seq: seqComparisons }),
    })
  }

  const found = result >= 0
  if (found) {
    push("done", "block", {
      cursor: result, value: arr[result],
      lines: LM.doneFoundBlock,
      caption: t("play.nIssDoneFound", {
        target, i: result, probes: indexProbes, seq: seqComparisons,
        total: indexProbes + seqComparisons,
      }),
    })
  } else {
    push("done", "block", {
      // курсор на кінці блоку → всі комірки блоку показано відкинутими (✗)
      cursor: blockHi,
      lines: LM.doneAbsent,
      caption: t("play.nIssDoneAbsent", {
        target, probes: indexProbes, seq: seqComparisons,
        total: indexProbes + seqComparisons,
      }),
    })
  }
  return finish()

  function finish(): IxsTrace {
    return {
      code,
      frames,
      result: {
        input: arr,
        target,
        step: s,
        indexTable,
        result,
        indexProbes,
        seqComparisons,
        total: indexProbes + seqComparisons,
        size: n,
        branch,
        linearIndex,
        found: result >= 0,
      },
    }
  }
}
