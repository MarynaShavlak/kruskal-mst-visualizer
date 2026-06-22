// Модель trace для сортування Шелла. Алгоритм проганяється ОДИН раз (через
// shellSortSteps) і пишемо список незмінних кадрів (ShFrame) — по одному на КОЖНУ
// подію журналу (init → (gap_start → (i_start → compare* (+shift*) → insert)* →
// gap_end)* → final). UI лише рухає курсор. Кожен кадр несе знімок масиву, поточний
// gap, «дірку», temp «у руці», поточну підпослідовність, активні підсвітки й рядки
// коду. Режим = послідовність проміжків (Шелла / Кнута / Ciura) — впливає на gaps,
// складність і нарацію; код спільний (параметризований `for gap in gaps`).

import {
  shellSortSteps,
  gapsFor,
  countOperations,
  type GapSequence,
  type ShellEvent,
} from "@/lib/shellSort"
import { identityTranslate, type Translate } from "@/lib/translate"
import type { SortFrameBase } from "@/lib/traceFrame"

/** Лістинг для панелі підсвітки (1-based рядки). Параметризований gaps-варіант. */
export const SHELL_CODE: readonly string[] = [
  "def shell_sort(arr, gaps):          # gaps — спадна послідовність проміжків",
  "    n = len(arr)",
  "    for gap in gaps:                # фази проміжку",
  "        for i in range(gap, n):     # елементи підпослідовностей",
  "            temp = arr[i]           # беремо temp «у руку»",
  "            j = i",
  "            while j >= gap and arr[j-gap] > temp:",
  "                arr[j] = arr[j-gap]  # gap-зсув праворуч",
  "                j -= gap",
  "            arr[j] = temp           # вставка на звільнене місце",
  "    return arr",
]

/** Фаза кадру для бейджа в нарації. */
export type ShPhase =
  | "init"
  | "gap"
  | "take"
  | "compare"
  | "shift"
  | "insert"
  | "done"

export interface ShFrame extends SortFrameBase {
  readonly phase: ShPhase
  /** Знімок масиву на цьому кадрі. */
  readonly array: readonly number[]
  /** Поточний проміжок або null. */
  readonly gap: number | null
  /** Залишок i % gap — поточна підпослідовність (для підсвітки); -1 поза вставкою. */
  readonly groupResidue: number
  /** Індекс «дірки» (пунктир) або null. */
  readonly hole: number | null
  /** temp «у руці» (плаваючий бурштиновий стовпчик) або null. */
  readonly key: number | null
  /** Індекс елемента, який ЗАРАЗ порівнюють (arr[j-gap], бурштиновий) або null. */
  readonly compareAt: number | null
  /** Індекс елемента, який щойно ЗСУНУЛИ (червоний) або null. */
  readonly shiftAt: number | null
  /** Індекс щойно вставленого temp (зелений) або null. */
  readonly insertAt: number | null
  /** Усі стовпчики зелені (фінал). */
  readonly sortedAll: boolean
  readonly comparisons: number
  readonly shifts: number
}

export interface ShResult {
  readonly input: readonly number[]
  readonly sorted: readonly number[]
  readonly comparisons: number
  readonly shifts: number
  readonly gapPhases: number
  readonly sequence: GapSequence
  readonly gaps: readonly number[]
  readonly size: number
}

export interface ShTrace {
  readonly code: readonly string[]
  readonly frames: readonly ShFrame[]
  readonly result: ShResult
  readonly sequence: GapSequence
}

const fmt = (a: readonly number[]): string => `[${a.join(", ")}]`

const SEQ_LABEL: Record<GapSequence, string> = {
  shell: "n//2",
  knuth: "3k+1",
  ciura: "Ciura",
}

/**
 * Проганяє сортування Шелла на масиві з обраною послідовністю проміжків і збирає
 * trace для плеєра/віджетів: по кадру на кожну подію журналу + підсумок.
 */
export function buildShellSortTrace(
  input: readonly number[],
  sequence: GapSequence = "shell",
  t: Translate = identityTranslate,
): ShTrace {
  const gaps = gapsFor(sequence, input.length)
  const { sorted, events } = shellSortSteps(input, gaps)
  const frames: ShFrame[] = events.map((ev, i) => ({
    i, ...frameFor(ev, sequence, gaps, t),
  }))

  const counts = countOperations(input, gaps)
  const result: ShResult = {
    input, sorted,
    comparisons: counts.comparisons, shifts: counts.shifts, gapPhases: counts.gapPhases,
    sequence, gaps, size: input.length,
  }
  return { code: SHELL_CODE, frames, result, sequence }
}

/** Перетворює одну подію журналу на кадр (рядки коду + нарація). */
function frameFor(
  ev: ShellEvent,
  sequence: GapSequence,
  gaps: readonly number[],
  t: Translate,
): Omit<ShFrame, "i"> {
  const residue = ev.gap != null && ev.i != null ? ev.i % ev.gap : -1
  const common = {
    array: ev.array,
    gap: ev.gap,
    groupResidue: residue,
    hole: ev.hole,
    key: ev.temp,
    compareAt: null as number | null,
    shiftAt: null as number | null,
    insertAt: null as number | null,
    sortedAll: false,
    comparisons: ev.comparisons,
    shifts: ev.shifts,
  }

  switch (ev.kind) {
    case "init":
      return {
        ...common, phase: "init", groupResidue: -1, key: null,
        lines: [2], contextLines: [],
        caption: t("play.nShInit", {
          arr: fmt(ev.array), seq: SEQ_LABEL[sequence], gaps: fmt(gaps),
        }),
      }
    case "gap_start":
      return {
        ...common, phase: "gap", groupResidue: -1, key: null,
        lines: [3, 4], contextLines: [],
        caption: t("play.nShGapStart", {
          gap: ev.gap ?? 0, groups: ev.groups?.length ?? 0,
        }),
      }
    case "i_start":
      return {
        ...common, phase: "take",
        lines: [5, 6], contextLines: [3, 4],
        caption: t("play.nShTake", {
          gap: ev.gap ?? 0, i: ev.i ?? 0, temp: ev.temp ?? 0,
        }),
      }
    case "compare":
      return {
        ...common, phase: "compare", compareAt: ev.jGap ?? null,
        lines: ev.greater ? [7] : [7],
        contextLines: [3, 4],
        caption: ev.greater
          ? t("play.nShCompare", {
              gap: ev.gap ?? 0, jGap: ev.jGap ?? 0,
              compared: ev.compared ?? 0, temp: ev.temp ?? 0,
            })
          : t("play.nShStop", {
              gap: ev.gap ?? 0, jGap: ev.jGap ?? 0,
              compared: ev.compared ?? 0, temp: ev.temp ?? 0,
            }),
      }
    case "shift":
      return {
        ...common, phase: "shift", shiftAt: ev.shiftedTo ?? null,
        lines: [7, 8, 9], contextLines: [3, 4],
        caption: t("play.nShShift", {
          gap: ev.gap ?? 0,
          value: ev.shiftedTo != null ? ev.array[ev.shiftedTo] ?? 0 : 0,
          from: ev.shiftedFrom ?? 0, to: ev.shiftedTo ?? 0,
        }),
      }
    case "insert":
      return {
        ...common, phase: "insert", insertAt: ev.insertAt ?? null, hole: null, key: null,
        lines: [10], contextLines: [3, 4],
        caption: t("play.nShInsert", {
          gap: ev.gap ?? 0, temp: ev.temp ?? 0, at: ev.insertAt ?? 0,
        }),
      }
    case "gap_end":
      return {
        ...common, phase: "gap", groupResidue: -1, key: null,
        lines: [3], contextLines: [],
        caption: t("play.nShGapEnd", { gap: ev.gap ?? 0 }),
      }
    case "final":
      return {
        ...common, phase: "done", groupResidue: -1, key: null, sortedAll: true,
        lines: [11], contextLines: [],
        caption: t("play.nShDone", {
          arr: fmt(ev.array),
          comparisons: ev.comparisons, shifts: ev.shifts,
          gapPhases: gaps.length,
        }),
      }
  }
}
