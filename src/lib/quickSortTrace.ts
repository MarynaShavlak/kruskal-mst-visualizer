// Модель trace для швидкого сортування. Алгоритм проганяється ОДИН раз (через
// quicksortSteps) → дерево рекурсії (вузли в порядку pre-order). Будуємо:
//  - геометрію дерева (x-слоти листя, середина дітей для внутрішніх вузлів);
//  - список кадрів: по одному на виклик (вузол) у порядку обходу + фінальний
//    кадр «конкатенація». UI лише рухає курсор: на кадрі k відкриті вузли з id ≤ k,
//    поточний — id = k. Лістинг коду залежить від стратегії опорного.

import {
  quicksortSteps,
  type PivotStrategy,
  type QuickEvent,
} from "@/lib/quickSort"
import { formatArray as fmtArray } from "@/lib/arrayUtils"
import { identityTranslate, type Translate } from "@/lib/translate"
import type { SortFrameBase } from "@/lib/traceFrame"

/** Рядок лістингу, де змінюється лише вибір опорного (рядок 4) — решта спільна. */
function pivotLine(strategy: PivotStrategy): string {
  switch (strategy) {
    case "first":
      return "    pivot = arr[0]                # опорний — перший"
    case "last":
      return "    pivot = arr[-1]               # опорний — останній"
    case "median3":
      return "    pivot = median3(arr)          # медіана першого/середнього/останнього"
    case "middle":
    default:
      return "    pivot = arr[len(arr) // 2]    # опорний — середній"
  }
}

/** Лістинг базової (тристоронньої) реалізації з конспекту під обрану стратегію. */
export function codeFor(strategy: PivotStrategy): readonly string[] {
  return [
    "def quicksort(arr):",
    "    if len(arr) <= 1:             # базовий випадок",
    "        return arr",
    pivotLine(strategy),
    "    left   = [x for x in arr if x <  pivot]   # менші",
    "    middle = [x for x in arr if x == pivot]   # рівні",
    "    right  = [x for x in arr if x >  pivot]   # більші",
    "    return quicksort(left) + middle + quicksort(right)",
  ]
}

/** Фаза кадру для бейджа в нарації. */
export type QsPhase = "partition" | "base" | "done"

/** Вузол дерева рекурсії з геометрією (x — колонка-слот, depth — рядок). */
export interface QsTreeNode {
  readonly id: number
  readonly parent: number | null
  readonly branch: "root" | "left" | "right"
  readonly depth: number
  readonly level: number
  readonly array: readonly number[]
  readonly size: number
  readonly isBase: boolean
  readonly pivot: number | null
  readonly pivotIndex: number | null
  readonly left: readonly number[] | null
  readonly middle: readonly number[] | null
  readonly right: readonly number[] | null
  readonly result: readonly number[] | null
  readonly children: readonly number[]
  /** Колонка-слот для розкладки (леф-у-право серед листя). */
  readonly x: number
}

export interface QsTree {
  readonly nodes: readonly QsTreeNode[]
  readonly leafCount: number
  readonly maxDepth: number
}

export interface QsFrame extends SortFrameBase {
  /** id поточного вузла (підсвічений). */
  readonly currentId: number
  /** Відкриті вузли — ті, чий id ≤ revealedMax (дерево «росте» в pre-order). */
  readonly revealedMax: number
  readonly phase: QsPhase
  readonly comparisons: number
  /** Скільки викликів зроблено (вузлів відкрито). */
  readonly calls: number
}

export interface QsResult {
  readonly input: readonly number[]
  readonly sorted: readonly number[]
  readonly comparisons: number
  readonly calls: number
  readonly depth: number
  readonly strategy: PivotStrategy
  readonly size: number
}

export interface QsTrace {
  readonly code: readonly string[]
  readonly tree: QsTree
  readonly frames: readonly QsFrame[]
  readonly result: QsResult
  readonly strategy: PivotStrategy
}

/** Назва виклику для нарації (код-ідіома, не перекладається). */
function callName(branch: "root" | "left" | "right"): string {
  return branch === "root"
    ? "quicksort(arr)"
    : branch === "left"
      ? "quicksort(left)"
      : "quicksort(right)"
}

/** Геометрія дерева: листя отримують послідовні x-слоти, внутрішні — середину дітей. */
function layout(events: readonly QuickEvent[]): {
  xs: number[]
  leafCount: number
} {
  const xs = new Array<number>(events.length).fill(0)
  let nextLeaf = 0
  const place = (id: number): void => {
    const ev = events[id]
    if (ev.children.length === 0) {
      xs[id] = nextLeaf++
      return
    }
    for (const c of ev.children) place(c)
    const first = ev.children[0]
    const last = ev.children[ev.children.length - 1]
    xs[id] = (xs[first] + xs[last]) / 2
  }
  if (events.length > 0) place(0)
  return { xs, leafCount: nextLeaf }
}

/**
 * Проганяє швидке сортування на масиві й збирає trace для плеєра: дерево рекурсії +
 * кадри (по одному на виклик у pre-order + фінальна конкатенація).
 */
export function buildQuickSortTrace(
  input: readonly number[],
  strategy: PivotStrategy = "middle",
  t: Translate = identityTranslate,
): QsTrace {
  const { result, events } = quicksortSteps(input, strategy)
  const code = codeFor(strategy)
  const { xs, leafCount } = layout(events)

  const nodes: QsTreeNode[] = events.map((e) => ({
    id: e.id, parent: e.parent, branch: e.branch, depth: e.depth, level: e.level,
    array: e.array, size: e.size, isBase: e.isBase,
    pivot: e.pivot, pivotIndex: e.pivotIndex,
    left: e.left, middle: e.middle, right: e.right,
    result: e.result, children: e.children,
    x: xs[e.id],
  }))
  const maxDepth = nodes.reduce((m, n) => Math.max(m, n.depth), 0)
  const comparisons = events.reduce((m, e) => Math.max(m, e.comparisons), 0)
  const depth = maxDepth + 1

  const frames: QsFrame[] = events.map((e, k) => {
    if (e.isBase) {
      return {
        i: k, currentId: e.id, revealedMax: e.id, phase: "base",
        comparisons: e.comparisons, calls: k + 1,
        lines: [2, 3], contextLines: [1],
        caption: t("play.nQsBase", {
          level: e.level, call: callName(e.branch), arr: fmtArray(e.array),
        }),
      }
    }
    return {
      i: k, currentId: e.id, revealedMax: e.id, phase: "partition",
      comparisons: e.comparisons, calls: k + 1,
      lines: [4, 5, 6, 7], contextLines: [1, 8],
      caption: t("play.nQsPartition", {
        level: e.level, call: callName(e.branch), arr: fmtArray(e.array),
        pivot: e.pivot ?? 0,
        left: fmtArray(e.left ?? []), middle: fmtArray(e.middle ?? []), right: fmtArray(e.right ?? []),
      }),
    }
  })

  // Фінальний кадр: усе дерево відкрите, корінь склеює відповідь.
  frames.push({
    i: events.length,
    currentId: 0,
    revealedMax: events.length - 1,
    phase: "done",
    comparisons,
    calls: events.length,
    lines: [8],
    contextLines: [1],
    caption: t("play.nQsDone", {
      arr: fmtArray(result), comparisons, calls: events.length, depth,
    }),
  })

  const res: QsResult = {
    input, sorted: result, comparisons, calls: events.length, depth, strategy, size: input.length,
  }
  return { code, tree: { nodes, leafCount, maxDepth }, frames, result: res, strategy }
}
