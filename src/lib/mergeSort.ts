// Сортування злиттям (Merge Sort): базова НИЗХІДНА рекурсивна реалізація з
// конспекту (поділ навпіл за позицією + злиття двома вказівниками) + ВИХІДНА
// ітеративна версія (bottom-up: зливаємо пробіжки 1,2,4,…) + інструментовані
// версії, що будують ДЕРЕВО РЕКУРСІЇ та журнал злить як список подій.
// Фреймворк-незалежне ядро — порт merge_sort/core.py Python-репозиторію
// algo-merge-sort. Без React.
//
// «Розділяй і володарюй»: щоб відсортувати масив, ділимо його навпіл, рекурсивно
// сортуємо обидві половини й ЗЛИВАЄМО дві відсортовані половини в одну. Поділ
// строго навпіл за позицією робить дерево рекурсії ЗАВЖДИ збалансованим (глибина
// ⌈log₂n⌉), тож складність O(n·log n) ГАРАНТОВАНА в усіх випадках — виродженого
// O(n²), як у quicksort, тут немає. Сортування СТАБІЛЬНЕ (нестроге <=: за рівності
// голів першим беремо елемент із лівої половини) і НЕ на місці (O(n) пам'яті).

/** Допустимі режими (дві реалізації одного алгоритму). */
export const MERGE_MODES = ["topDown", "bottomUp"] as const
export type MergeMode = (typeof MERGE_MODES)[number]

/**
 * Зливає два ВЖЕ ВІДСОРТОВАНІ списки в один відсортований (код з конспекту).
 * Іде обома списками двома вказівниками, додає менший у `merged`; коли один
 * вичерпано — доливає решту іншого. Нестроге `<=` робить злиття стабільним.
 */
export function merge(
  left: readonly number[],
  right: readonly number[],
): number[] {
  const merged: number[] = []
  let i = 0
  let j = 0
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) merged.push(left[i++])
    else merged.push(right[j++])
  }
  while (i < left.length) merged.push(left[i++])
  while (j < right.length) merged.push(right[j++])
  return merged
}

/**
 * Базова низхідна рекурсивна реалізація (код з конспекту). Повертає НОВИЙ
 * відсортований список (вхід не змінюється). O(n·log n) у всіх випадках.
 */
export function mergeSort(arr: readonly number[]): number[] {
  if (arr.length <= 1) return [...arr]
  const mid = Math.floor(arr.length / 2)
  return merge(mergeSort(arr.slice(0, mid)), mergeSort(arr.slice(mid)))
}

/**
 * Вихідна ітеративна версія (bottom-up, без рекурсії): зливаємо сусідні пробіжки
 * довжини 1, потім 2, 4, … аж поки одна пробіжка не накриє весь масив. Прямий
 * місток до TimSort. На розмірах-степенях двійки дає той самий результат і ту
 * саму кількість порівнянь, що й низхідна версія.
 */
export function mergeSortBottomUp(input: readonly number[]): number[] {
  const a = [...input]
  const n = a.length
  let width = 1
  while (width < n) {
    for (let lo = 0; lo < n; lo += 2 * width) {
      const mid = Math.min(lo + width, n)
      const hi = Math.min(lo + 2 * width, n)
      const merged = merge(a.slice(lo, mid), a.slice(mid, hi))
      for (let k = 0; k < merged.length; k++) a[lo + k] = merged[k]
    }
    width *= 2
  }
  return a
}

/** Чи впорядкований масив за зростанням? */
export function isSorted(seq: readonly number[]): boolean {
  for (let i = 0; i < seq.length - 1; i++) {
    if (seq[i] > seq[i + 1]) return false
  }
  return true
}

// ---------------------------------------------------------------------------
// Інструментоване злиття (журнал двох вказівників) — «зіркова» панель
// ---------------------------------------------------------------------------

/** Фаза кроку злиття: порівняли голови / доливаємо залишок лівої / правої. */
export type MergePhase = "compare" | "drainLeft" | "drainRight"

/** Один крок інструментованого злиття (знімок стану двох вказівників). */
export interface MergeMicroStep {
  readonly phase: MergePhase
  /** Індекси голів, що порівнювалися (до руху вказівника). */
  readonly headLeft: number
  readonly headRight: number
  /** Звідки взято елемент цього кроку. */
  readonly took: "left" | "right"
  /** Додане значення. */
  readonly value: number
  /** Вказівники ПІСЛЯ кроку. */
  readonly leftIndex: number
  readonly rightIndex: number
  /** Знімок результату `merged` після кроку. */
  readonly merged: readonly number[]
  /** Накопичені порівняння (у межах цього злиття). */
  readonly comparisons: number
}

/** Результат інструментованого злиття: результат + журнал кроків + порівняння. */
export interface MergeStepsResult {
  readonly merged: number[]
  readonly steps: MergeMicroStep[]
  readonly comparisons: number
}

/**
 * Інструментоване злиття: повторює `merge` дія в дію, але після кожного додавання
 * кладе у журнал знімок стану (вказівники, які голови порівнювалися, звідки взято
 * елемент, `merged`). На цьому журналі стоїть «зіркова» панель злиття.
 */
export function mergeSteps(
  left: readonly number[],
  right: readonly number[],
): MergeStepsResult {
  const merged: number[] = []
  const steps: MergeMicroStep[] = []
  let i = 0
  let j = 0
  let comparisons = 0

  while (i < left.length && j < right.length) {
    comparisons += 1
    const headLeft = i
    const headRight = j
    let took: "left" | "right"
    let value: number
    if (left[i] <= right[j]) {
      took = "left"
      value = left[i]
      merged.push(left[i])
      i += 1
    } else {
      took = "right"
      value = right[j]
      merged.push(right[j])
      j += 1
    }
    steps.push({
      phase: "compare", headLeft, headRight, took, value,
      leftIndex: i, rightIndex: j, merged: [...merged], comparisons,
    })
  }

  while (i < left.length) {
    const value = left[i]
    merged.push(left[i])
    i += 1
    steps.push({
      phase: "drainLeft", headLeft: i - 1, headRight: j, took: "left", value,
      leftIndex: i, rightIndex: j, merged: [...merged], comparisons,
    })
  }

  while (j < right.length) {
    const value = right[j]
    merged.push(right[j])
    j += 1
    steps.push({
      phase: "drainRight", headLeft: i, headRight: j - 1, took: "right", value,
      leftIndex: i, rightIndex: j, merged: [...merged], comparisons,
    })
  }

  return { merged, steps, comparisons }
}

// ---------------------------------------------------------------------------
// Інструментована низхідна версія: журнал подій + дерево рекурсії
// ---------------------------------------------------------------------------

/** Тип події журналу `mergeSortSteps`. */
export type MergeKind = "split" | "base" | "merge" | "final"

/** Один запис журналу подій розбору (поділ / базовий / злиття / фінал). */
export interface MergeEvent {
  readonly kind: MergeKind
  /** id вузла дерева рекурсії (у порядку викликів, pre-order). */
  readonly node: number
  readonly depth: number
  readonly parent: number | null
  readonly branch: "root" | "left" | "right"
  // split / base:
  readonly array?: readonly number[]
  readonly mid?: number
  readonly leftHalf?: readonly number[]
  readonly rightHalf?: readonly number[]
  // merge:
  readonly left?: readonly number[]
  readonly right?: readonly number[]
  readonly merged?: readonly number[]
  readonly leftChild?: number
  readonly rightChild?: number
  readonly steps?: readonly MergeMicroStep[]
  // спільні накопичені лічильники (стан ПІСЛЯ події):
  readonly comparisons: number
  readonly appends: number
  readonly merges: number
  readonly maxDepth: number
}

/** Результат прогону: відсортований масив + журнал подій. */
export interface MergeSortStepsResult {
  readonly result: number[]
  readonly events: MergeEvent[]
}

/**
 * Інструментована низхідна версія: повторює `mergeSort` дія в дію, працюючи над
 * копією, але будує журнал/дерево подій ПОДІЛУ (split/base) і ЗЛИТТЯ (merge) +
 * фінал. Кожному виклику присвоюється унікальний `node` у порядку викликів
 * (pre-order), що дає дерево рекурсії.
 */
export function mergeSortSteps(input: readonly number[]): MergeSortStepsResult {
  const events: MergeEvent[] = []
  const counters = { comparisons: 0, appends: 0, merges: 0, maxDepth: 0 }
  let nextId = 0

  const snapshot = (extra: Partial<MergeEvent> & { kind: MergeKind; node: number; depth: number; branch: MergeEvent["branch"]; parent: number | null }): MergeEvent => ({
    comparisons: counters.comparisons,
    appends: counters.appends,
    merges: counters.merges,
    maxDepth: counters.maxDepth,
    ...extra,
  })

  const rec = (
    sub: readonly number[],
    depth: number,
    parent: number | null,
    branch: MergeEvent["branch"],
  ): { sorted: number[]; id: number } => {
    const id = nextId++
    if (depth > counters.maxDepth) counters.maxDepth = depth

    if (sub.length <= 1) {
      events.push(snapshot({ kind: "base", node: id, depth, parent, branch, array: [...sub] }))
      return { sorted: [...sub], id }
    }

    const mid = Math.floor(sub.length / 2)
    const leftHalf = sub.slice(0, mid)
    const rightHalf = sub.slice(mid)
    events.push(snapshot({
      kind: "split", node: id, depth, parent, branch,
      array: [...sub], mid, leftHalf: [...leftHalf], rightHalf: [...rightHalf],
    }))

    const left = rec(leftHalf, depth + 1, id, "left")
    const right = rec(rightHalf, depth + 1, id, "right")

    const { merged, steps, comparisons } = mergeSteps(left.sorted, right.sorted)
    counters.comparisons += comparisons
    counters.appends += merged.length
    counters.merges += 1
    events.push(snapshot({
      kind: "merge", node: id, depth, parent, branch,
      left: [...left.sorted], right: [...right.sorted], merged: [...merged],
      leftChild: left.id, rightChild: right.id, steps,
    }))
    return { sorted: merged, id }
  }

  const root = rec([...input], 0, null, "root")
  events.push(snapshot({ kind: "final", node: root.id, depth: 0, parent: null, branch: "root", array: [...root.sorted] }))
  return { result: root.sorted, events }
}

/** Вузол дерева рекурсії, відновлений із журналу `mergeSortSteps`. */
export interface MergeTreeNode {
  readonly id: number
  readonly depth: number
  readonly parent: number | null
  readonly branch: "root" | "left" | "right"
  readonly array: readonly number[]
  readonly isBase: boolean
  readonly mid: number | null
  readonly leftHalf: readonly number[] | null
  readonly rightHalf: readonly number[] | null
  /** [leftId, rightId] для внутрішніх вузлів; [] для листків. */
  readonly children: readonly number[]
  /** Відсортований підмасив (листок — він сам; внутрішній — результат злиття). */
  readonly result: readonly number[] | null
}

/** Відновлює дерево рекурсії з журналу подій. */
export function buildTree(events: readonly MergeEvent[]): {
  nodes: Map<number, MergeTreeNode>
  root: number
} {
  const nodes = new Map<number, MergeTreeNode>()
  for (const e of events) {
    if (e.kind === "split" || e.kind === "base") {
      nodes.set(e.node, {
        id: e.node, depth: e.depth, parent: e.parent, branch: e.branch,
        array: e.array ?? [], isBase: e.kind === "base",
        mid: e.mid ?? null, leftHalf: e.leftHalf ?? null, rightHalf: e.rightHalf ?? null,
        children: [], result: null,
      })
    }
  }
  for (const e of events) {
    if (e.kind === "merge") {
      const nd = nodes.get(e.node)
      if (nd) {
        nodes.set(e.node, {
          ...nd,
          result: e.merged ?? null,
          children: [e.leftChild ?? -1, e.rightChild ?? -1],
        })
      }
    }
  }
  for (const [id, nd] of nodes) {
    if (nd.isBase) nodes.set(id, { ...nd, result: nd.array })
  }
  let root = 0
  for (const nd of nodes.values()) if (nd.parent === null) root = nd.id
  return { nodes, root }
}

// ---------------------------------------------------------------------------
// Інструментована вихідна версія (bottom-up): журнал проходів і злить
// ---------------------------------------------------------------------------

/** Одне злиття у проході bottom-up (сусідні пробіжки [lo,mid) та [mid,hi)). */
export interface BottomUpMerge {
  readonly lo: number
  readonly mid: number
  readonly hi: number
  readonly left: readonly number[]
  readonly right: readonly number[]
  readonly merged: readonly number[]
  readonly steps: readonly MergeMicroStep[]
  readonly comparisons: number
}

/** Один прохід bottom-up: ширина пробіжки + злиття + стан масиву до/після. */
export interface BottomUpPass {
  readonly width: number
  /** Стан масиву на початку проходу (поділений на пробіжки ширини `width`). */
  readonly before: readonly number[]
  readonly merges: readonly BottomUpMerge[]
  /** Стан масиву після проходу. */
  readonly after: readonly number[]
}

/** Результат інструментованого bottom-up: відсортований масив + проходи. */
export interface BottomUpResult {
  readonly result: number[]
  readonly passes: BottomUpPass[]
}

/**
 * Інструментована вихідна (bottom-up) версія: будує журнал проходів. На кожному
 * проході ширина пробіжки `width` подвоюється (1, 2, 4, …); сусідні пробіжки
 * зливаються `mergeSteps`. Поодинокий «хвіст» без пари (порожня права частина)
 * лишається без злиття. Числа збігаються з `mergeSortBottomUp` / `countOperations`.
 */
export function mergeSortBottomUpSteps(input: readonly number[]): BottomUpResult {
  const a = [...input]
  const n = a.length
  const passes: BottomUpPass[] = []
  let width = 1
  while (width < n) {
    const before = [...a]
    const merges: BottomUpMerge[] = []
    for (let lo = 0; lo < n; lo += 2 * width) {
      const mid = Math.min(lo + width, n)
      const hi = Math.min(lo + 2 * width, n)
      const right = a.slice(mid, hi)
      if (right.length === 0) continue // поодинокий хвіст — без злиття
      const left = a.slice(lo, mid)
      const { merged, steps, comparisons } = mergeSteps(left, right)
      for (let k = 0; k < merged.length; k++) a[lo + k] = merged[k]
      merges.push({ lo, mid, hi, left, right, merged, steps, comparisons })
    }
    passes.push({ width, before, merges, after: [...a] })
    width *= 2
  }
  return { result: a, passes }
}

/** Підсумок методу: порівняння, додавання, злиття, глибина (рівні рекурсії/проходи). */
export interface MergeCounts {
  readonly comparisons: number
  readonly appends: number
  readonly merges: number
  readonly depth: number
}

/**
 * Лічильники методу без журналу. За замовчуванням рахує низхідну версію (через
 * `mergeSortSteps`); за `mode === "bottomUp"` — вихідну ітеративну. На розмірах-
 * степенях двійки обидва дають однакові числа; інакше можуть трохи різнитися.
 */
export function countOperations(
  input: readonly number[],
  mode: MergeMode = "topDown",
): MergeCounts {
  if (mode === "bottomUp") {
    const { passes } = mergeSortBottomUpSteps(input)
    let comparisons = 0
    let appends = 0
    let merges = 0
    for (const p of passes) {
      for (const m of p.merges) {
        comparisons += m.comparisons
        appends += m.merged.length
        merges += 1
      }
    }
    return { comparisons, appends, merges, depth: passes.length }
  }
  const { events } = mergeSortSteps(input)
  const f = events[events.length - 1]
  return {
    comparisons: f.comparisons,
    appends: f.appends,
    merges: f.merges,
    depth: f.maxDepth,
  }
}
