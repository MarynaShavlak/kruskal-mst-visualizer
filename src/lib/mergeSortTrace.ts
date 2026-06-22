// Модель trace для сортування злиттям. Алгоритм проганяється ОДИН раз і пише
// список незмінних кадрів (Frame); UI лише рухає курсор. Дві реалізації — два
// окремі trace під спільним кадром `MsFrame`:
//  - topDown  → ДЕРЕВО РЕКУРСІЇ (поділ навпіл униз, злиття вгору), кадри в порядку
//    виконання (поділи зверху-вниз, злиття знизу-вгору) + по кадру на кожне
//    додавання в merged (зіркова панель двох вказівників);
//  - bottomUp → ПРОХОДИ (пробіжки 1,2,4,…), кадри по проходах + злиттях + додаваннях.
// Спільне для обох: зіркова панель злиття (left/right + курсори + merged) і
// підсвітка коду. Нарація — через інжектований Translate (lib лишається без React).

import {
  mergeSortSteps,
  mergeSortBottomUpSteps,
  buildTree,
  type MergeMode,
  type MergeMicroStep,
  type MergeTreeNode,
  type BottomUpPass,
} from "@/lib/mergeSort"
import { identityTranslate, type Translate } from "@/lib/translate"
import type { SortFrameBase } from "@/lib/traceFrame"

const fmt = (a: readonly number[]): string => `[${a.join(", ")}]`

// ---------------------------------------------------------------------------
// Лістинги коду + підсвітка рядків (1-based) під кожну фазу
// ---------------------------------------------------------------------------

/** Низхідна реалізація з конспекту (merge_sort + merge). */
const CODE_TOP_DOWN: readonly string[] = [
  "def merge_sort(arr):",
  "    if len(arr) <= 1:",
  "        return arr",
  "    mid = len(arr) // 2",
  "    left_half = arr[:mid]",
  "    right_half = arr[mid:]",
  "    return merge(merge_sort(left_half), merge_sort(right_half))",
  "",
  "def merge(left, right):",
  "    merged = []",
  "    left_index = right_index = 0",
  "    while left_index < len(left) and right_index < len(right):",
  "        if left[left_index] <= right[right_index]:",
  "            merged.append(left[left_index])",
  "            left_index += 1",
  "        else:",
  "            merged.append(right[right_index])",
  "            right_index += 1",
  "    while left_index < len(left):",
  "        merged.append(left[left_index]); left_index += 1",
  "    while right_index < len(right):",
  "        merged.append(right[right_index]); right_index += 1",
  "    return merged",
]

/** Вихідна ітеративна реалізація (bottom-up). */
const CODE_BOTTOM_UP: readonly string[] = [
  "def merge_sort_bottom_up(arr):",
  "    a = list(arr)",
  "    n = len(a)",
  "    width = 1",
  "    while width < n:",
  "        for lo in range(0, n, 2 * width):",
  "            mid = min(lo + width, n)",
  "            hi  = min(lo + 2 * width, n)",
  "            a[lo:hi] = merge(a[lo:mid], a[mid:hi])",
  "        width *= 2",
  "    return a",
  "",
  "def merge(left, right):",
  "    merged = []",
  "    left_index = right_index = 0",
  "    while left_index < len(left) and right_index < len(right):",
  "        if left[left_index] <= right[right_index]:",
  "            merged.append(left[left_index])",
  "            left_index += 1",
  "        else:",
  "            merged.append(right[right_index])",
  "            right_index += 1",
  "    while left_index < len(left):",
  "        merged.append(left[left_index]); left_index += 1",
  "    while right_index < len(right):",
  "        merged.append(right[right_index]); right_index += 1",
  "    return merged",
]

export function codeFor(mode: MergeMode): readonly string[] {
  return mode === "bottomUp" ? CODE_BOTTOM_UP : CODE_TOP_DOWN
}

interface HL {
  readonly lines: readonly number[]
  readonly contextLines: readonly number[]
}

// Підсвітка фаз злиття (спільний хвіст merge() в обох лістингах має різний зсув).
function mergeHL(
  mode: MergeMode,
  phase: MergeMicroStep["phase"],
  took: "left" | "right",
): HL {
  // Зсув першого рядка merge(): top-down — рядок 9, bottom-up — рядок 13.
  const base = mode === "bottomUp" ? 13 : 9
  const def = base // "def merge(..)"
  const wWhile = base + 3 // головний while порівнянь
  const ifLine = base + 4 // if left<=right
  const appLeft = base + 5
  const incLeft = base + 6
  const elseApp = base + 8
  const incRight = base + 9
  const drainLW = base + 10
  const drainL = base + 11
  const drainRW = base + 12
  const drainR = base + 13
  if (phase === "compare") {
    return took === "left"
      ? { lines: [ifLine, appLeft, incLeft], contextLines: [def, wWhile] }
      : { lines: [ifLine, elseApp, incRight], contextLines: [def, wWhile] }
  }
  if (phase === "drainLeft") return { lines: [drainL], contextLines: [def, drainLW] }
  return { lines: [drainR], contextLines: [def, drainRW] }
}

// ---------------------------------------------------------------------------
// Дерево рекурсії з геометрією (x — колонка-слот)
// ---------------------------------------------------------------------------

export interface MsTreeNode extends MergeTreeNode {
  /** Колонка-слот для розкладки (зліва направо серед листя). */
  readonly x: number
}

export interface MsTree {
  readonly nodes: readonly MsTreeNode[]
  readonly leafCount: number
  readonly maxDepth: number
}

/** Будує дерево рекурсії (без кадрів) — для bottom-up-режиму й навчальних віджетів. */
function treeOnly(input: readonly number[]): MsTree {
  const { events } = mergeSortSteps(input)
  const { nodes, root } = buildTree(events)
  return layoutTree(nodes, root)
}

/** Геометрія: листя отримують послідовні x-слоти, внутрішні — середину дітей. */
function layoutTree(
  nodes: Map<number, MergeTreeNode>,
  root: number,
): MsTree {
  const xs = new Map<number, number>()
  let nextLeaf = 0
  const place = (id: number): void => {
    const nd = nodes.get(id)
    if (!nd) return
    if (nd.children.length === 0) {
      xs.set(id, nextLeaf++)
      return
    }
    for (const c of nd.children) place(c)
    const first = nd.children[0]
    const last = nd.children[nd.children.length - 1]
    xs.set(id, ((xs.get(first) ?? 0) + (xs.get(last) ?? 0)) / 2)
  }
  place(root)

  const arr: MsTreeNode[] = []
  let maxDepth = 0
  for (const nd of nodes.values()) {
    if (nd.depth > maxDepth) maxDepth = nd.depth
    arr.push({ ...nd, x: xs.get(nd.id) ?? 0 })
  }
  arr.sort((a, b) => a.id - b.id)
  return { nodes: arr, leafCount: nextLeaf, maxDepth }
}

// ---------------------------------------------------------------------------
// Кадр (спільний для обох режимів)
// ---------------------------------------------------------------------------

export type MsPhase = "init" | "split" | "base" | "merge" | "final"

export interface MsFrame extends SortFrameBase {
  readonly phase: MsPhase
  // — стан дерева (top-down) —
  readonly currentId: number
  /** Відкриті вузли — id ≤ revealedMax (дерево «росте» вниз у pre-order). */
  readonly revealedMax: number
  /** id вузлів, чий результат злиття вже показано (фаза злиття знизу-вгору). */
  readonly mergedIds: readonly number[]
  // — стан проходів (bottom-up) —
  readonly passIndex: number
  readonly mergeLo: number
  readonly mergeMid: number
  readonly mergeHi: number
  // — зіркова панель злиття (лише коли phase === "merge") —
  readonly mergeLeft: readonly number[] | null
  readonly mergeRight: readonly number[] | null
  readonly mergeStep: MergeMicroStep | null
  // — лічильники —
  readonly comparisons: number
  readonly appends: number
  readonly merges: number
}

export interface MsResult {
  readonly input: readonly number[]
  readonly sorted: readonly number[]
  readonly comparisons: number
  readonly appends: number
  readonly merges: number
  readonly depth: number
  readonly mode: MergeMode
  readonly size: number
}

export interface MsTrace {
  readonly mode: MergeMode
  readonly code: readonly string[]
  readonly tree: MsTree
  readonly passes: readonly BottomUpPass[]
  readonly frames: readonly MsFrame[]
  /** Індекси «розв'язкових» кадрів (init + поділи/базові + завершені злиття +
   * фінал) — для покрокового walkthrough навчальної вкладки (top-down). */
  readonly stepIndices: readonly number[]
  readonly result: MsResult
}

/** Підпис-деталь одного кроку злиття (спільний для обох режимів і віджета злиття). */
export function mergeDetail(
  st: MergeMicroStep,
  left: readonly number[],
  right: readonly number[],
  t: Translate,
): string {
  const merged = fmt(st.merged)
  if (st.phase === "compare") {
    const lv = left[st.headLeft]
    const rv = right[st.headRight]
    return st.took === "left"
      ? t("play.msCompareLeft", { i: st.headLeft, lv, j: st.headRight, rv, value: st.value, merged })
      : t("play.msCompareRight", { i: st.headLeft, lv, j: st.headRight, rv, value: st.value, merged })
  }
  if (st.phase === "drainLeft") return t("play.msDrainLeft", { value: st.value, merged })
  return t("play.msDrainRight", { value: st.value, merged })
}

// ---------------------------------------------------------------------------
// Trace низхідної версії (дерево рекурсії)
// ---------------------------------------------------------------------------

function buildTopDown(
  input: readonly number[],
  t: Translate,
): { frames: MsFrame[]; tree: MsTree; stepIndices: number[]; result: MsResult } {
  const { result, events } = mergeSortSteps(input)
  const { nodes, root } = buildTree(events)
  const tree = layoutTree(nodes, root)
  const final = events[events.length - 1]

  const frames: MsFrame[] = []
  const stepIndices: number[] = []
  const mergedIds: number[] = []
  let revealedMax = 0
  let compDone = 0
  let appDone = 0
  let merges = 0

  const blank = {
    mergeLeft: null, mergeRight: null, mergeStep: null,
    passIndex: -1, mergeLo: -1, mergeMid: -1, mergeHi: -1,
  } as const

  // init
  frames.push({
    i: 0, phase: "init", currentId: root, revealedMax: 0, mergedIds: [],
    ...blank, comparisons: 0, appends: 0, merges: 0,
    lines: [1], contextLines: [],
    caption: t("play.nMsInit", { arr: fmt(input) }),
  })
  stepIndices.push(0)

  for (const e of events) {
    if (e.kind === "split") {
      revealedMax = e.node
      frames.push({
        i: frames.length, phase: "split", currentId: e.node, revealedMax,
        mergedIds: [...mergedIds], ...blank,
        comparisons: compDone, appends: appDone, merges,
        lines: [4, 5, 6], contextLines: [1],
        caption: t("play.nMsSplit", {
          level: e.depth + 1, arr: fmt(e.array ?? []), mid: e.mid ?? 0,
          left: fmt(e.leftHalf ?? []), right: fmt(e.rightHalf ?? []),
        }),
      })
      stepIndices.push(frames.length - 1)
    } else if (e.kind === "base") {
      if (e.node > revealedMax) revealedMax = e.node
      frames.push({
        i: frames.length, phase: "base", currentId: e.node, revealedMax,
        mergedIds: [...mergedIds], ...blank,
        comparisons: compDone, appends: appDone, merges,
        lines: [2, 3], contextLines: [1],
        caption: t("play.nMsBase", { level: e.depth + 1, arr: fmt(e.array ?? []) }),
      })
      stepIndices.push(frames.length - 1)
    } else if (e.kind === "merge") {
      const left = e.left ?? []
      const right = e.right ?? []
      const steps = e.steps ?? []
      const scope = t("play.msScopeLevel", { level: e.depth + 1 })
      for (const st of steps) {
        const hl = mergeHL("topDown", st.phase, st.took)
        frames.push({
          i: frames.length, phase: "merge", currentId: e.node, revealedMax,
          mergedIds: [...mergedIds],
          mergeLeft: left, mergeRight: right, mergeStep: st,
          passIndex: -1, mergeLo: -1, mergeMid: -1, mergeHi: -1,
          comparisons: compDone + st.comparisons, appends: appDone + st.merged.length, merges,
          lines: hl.lines, contextLines: hl.contextLines,
          caption: `${scope} — ${mergeDetail(st, left, right, t)}`,
        })
      }
      // злиття цього вузла завершено
      mergedIds.push(e.node)
      merges += 1
      compDone += steps.length ? steps[steps.length - 1].comparisons : 0
      appDone += (e.merged ?? []).length
      stepIndices.push(frames.length - 1) // останній кадр злиття = «розв'язок»
    }
  }

  // final
  frames.push({
    i: frames.length, phase: "final", currentId: root, revealedMax: tree.nodes.length - 1,
    mergedIds: [...mergedIds], ...blank,
    comparisons: final.comparisons, appends: final.appends, merges: final.merges,
    lines: [7, 23], contextLines: [],
    caption: t("play.nMsFinal", {
      arr: fmt(result), comparisons: final.comparisons, appends: final.appends,
      merges: final.merges, depth: final.maxDepth,
    }),
  })
  stepIndices.push(frames.length - 1)

  const res: MsResult = {
    input, sorted: result,
    comparisons: final.comparisons, appends: final.appends, merges: final.merges,
    depth: final.maxDepth, mode: "topDown", size: input.length,
  }
  return { frames, tree, stepIndices, result: res }
}

// ---------------------------------------------------------------------------
// Trace вихідної версії (проходи bottom-up)
// ---------------------------------------------------------------------------

function buildBottomUp(
  input: readonly number[],
  t: Translate,
): { frames: MsFrame[]; passes: BottomUpPass[]; result: MsResult } {
  const { result, passes } = mergeSortBottomUpSteps(input)
  const frames: MsFrame[] = []
  let compDone = 0
  let appDone = 0
  let merges = 0
  let totalComparisons = 0

  const blank = {
    currentId: -1, revealedMax: -1, mergedIds: [] as number[],
    mergeLeft: null, mergeRight: null, mergeStep: null,
  } as const

  frames.push({
    i: 0, phase: "init", ...blank,
    passIndex: -1, mergeLo: -1, mergeMid: -1, mergeHi: -1,
    comparisons: 0, appends: 0, merges: 0,
    lines: [4], contextLines: [],
    caption: t("play.nMsBuInit", { arr: fmt(input) }),
  })

  passes.forEach((p, pi) => {
    for (const m of p.merges) {
      const scope = t("play.msScopeWidth", { width: p.width })
      for (const st of m.steps) {
        const hl = mergeHL("bottomUp", st.phase, st.took)
        frames.push({
          i: frames.length, phase: "merge",
          currentId: -1, revealedMax: -1, mergedIds: [],
          passIndex: pi, mergeLo: m.lo, mergeMid: m.mid, mergeHi: m.hi,
          mergeLeft: m.left, mergeRight: m.right, mergeStep: st,
          comparisons: compDone + st.comparisons, appends: appDone + st.merged.length, merges,
          lines: hl.lines, contextLines: hl.contextLines,
          caption: `${scope} — ${mergeDetail(st, m.left, m.right, t)}`,
        })
      }
      compDone += m.comparisons
      appDone += m.merged.length
      merges += 1
      totalComparisons += m.comparisons
    }
  })

  const lastPass = passes.length - 1
  frames.push({
    i: frames.length, phase: "final", ...blank,
    passIndex: lastPass, mergeLo: -1, mergeMid: -1, mergeHi: -1,
    comparisons: compDone, appends: appDone, merges,
    lines: [11], contextLines: [],
    caption: t("play.nMsFinal", {
      arr: fmt(result), comparisons: compDone, appends: appDone,
      merges, depth: passes.length,
    }),
  })

  const res: MsResult = {
    input, sorted: result,
    comparisons: totalComparisons, appends: appDone, merges,
    depth: passes.length, mode: "bottomUp", size: input.length,
  }
  return { frames, passes, result: res }
}

/**
 * Проганяє сортування злиттям на масиві й збирає trace для плеєра/віджетів:
 * дерево рекурсії (top-down) або проходи (bottom-up) + кадри (по одному на дію,
 * злиття розгорнуте по додаваннях) + підсумок. `tree` будується завжди (його
 * читають навчальні віджети), `passes` — лише для bottom-up.
 */
export function buildMergeSortTrace(
  input: readonly number[],
  mode: MergeMode = "topDown",
  t: Translate = identityTranslate,
): MsTrace {
  const code = codeFor(mode)
  if (mode === "topDown") {
    const td = buildTopDown(input, t)
    return {
      mode, code, tree: td.tree, passes: [], frames: td.frames,
      stepIndices: td.stepIndices, result: td.result,
    }
  }
  const bu = buildBottomUp(input, t)
  return {
    mode, code, tree: treeOnly(input), passes: bu.passes, frames: bu.frames,
    stepIndices: bu.frames.map((_, i) => i), result: bu.result,
  }
}
