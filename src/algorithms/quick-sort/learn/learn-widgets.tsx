import { useMemo, type ReactNode } from "react"
import { ArrowRight } from "lucide-react"
import { buildQuickSortTrace } from "@/lib/quickSortTrace"
import type { PivotStrategy } from "@/lib/quickSort"
import { QuickTree, ArrayChips } from "@/algorithms/quick-sort/playback/QuickTreePanel"
import { barHeightPct } from "@/algorithms/quick-sort/playback/highlight"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { MiniPlayerShell } from "@/algorithms/shared/learn/MiniPlayerShell"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { useT } from "@/i18n/use-t"
import type { MessageKey } from "@/i18n/messages"
import type { Translate } from "@/lib/translate"
import { useLangStore } from "@/store/lang-store"
import { cn } from "@/lib/utils"

// Живі навчальні віджети швидкого сортування на еталонних масивах. Замінюють
// статичні фігури README обчисленнями з lib/. Головний образ — ДЕРЕВО РЕКУРСІЇ.
// Кольори за легендою README: 🟣 опорний · 🔵 < · 🟪 == · 🟧 > · 🟢 повернутий.

/** Обгортка фігури: рамка-картка + опційний підпис (alt із markdown). */
function Figure({ caption, children }: { caption?: string; children: ReactNode }) {
  return (
    <span className="not-prose my-4 block overflow-x-auto rounded-lg border bg-card p-3">
      {children}
      {caption && (
        <span className="mt-2 block text-center text-xs text-muted-foreground">
          {caption}
        </span>
      )}
    </span>
  )
}

// — Масив як стовпчики --------------------------------------------------------

function ArrayBars({
  values,
  sorted,
  height = 120,
}: {
  values: readonly number[]
  sorted?: boolean
  height?: number
}) {
  const max = Math.max(1, ...values)
  return (
    <div className="flex items-end justify-center gap-1.5" style={{ height }}>
      {values.map((v, i) => (
        <div key={i} className="flex min-w-[1.5rem] flex-1 flex-col items-center justify-end gap-1">
          <span className="text-[11px] font-medium tabular-nums leading-none text-muted-foreground">
            {v}
          </span>
          <div
            className={cn(
              "w-full rounded-t",
              sorted ? "bg-emerald-500/75" : "bg-slate-400/60 dark:bg-slate-500/50",
            )}
            style={{ height: `${barHeightPct(v, max)}%` }}
          />
          <span className="text-[10px] tabular-nums text-muted-foreground/70">{i}</span>
        </div>
      ))}
    </div>
  )
}

export function ArrayFigure({
  values,
  caption,
}: {
  values: readonly number[]
  caption?: string
}) {
  return (
    <Figure caption={caption}>
      <ArrayBars values={values} />
    </Figure>
  )
}

export function ResultFigure({
  values,
  strategy,
  caption,
}: {
  values: readonly number[]
  strategy?: PivotStrategy
  caption?: string
}) {
  const t = useT()
  const { result } = useMemo(
    () => buildQuickSortTrace(values, strategy ?? "middle"),
    [values, strategy],
  )
  return (
    <Figure caption={caption}>
      <ArrayBars values={result.sorted} sorted height={130} />
      <span className="mt-2 block text-center text-sm tabular-nums">
        {t("learn.qsResultSummary", {
          comparisons: result.comparisons,
          calls: result.calls,
          depth: result.depth,
        })}
      </span>
    </Figure>
  )
}

// — Дерево рекурсії (статичне) ------------------------------------------------

export function TreeFigure({
  values,
  strategy,
  caption,
}: {
  values: readonly number[]
  strategy?: PivotStrategy
  caption?: string
}) {
  const { tree } = useMemo(
    () => buildQuickSortTrace(values, strategy ?? "middle"),
    [values, strategy],
  )
  return (
    <Figure caption={caption}>
      <QuickTree tree={tree} revealedMax={tree.nodes.length - 1} currentId={null} scale={1.25} />
    </Figure>
  )
}

// — Дерево, що «росте» (міні-плеєр) ------------------------------------------

export function TreeAnimationFigure({
  values,
  strategy,
  caption,
}: {
  values: readonly number[]
  strategy?: PivotStrategy
  caption?: string
}) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)
  const { tree, frames } = useMemo(
    () => buildQuickSortTrace(values, strategy ?? "middle", tr),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values, strategy, lang],
  )
  const player = usePlayer(frames.length, frames)
  const frame = frames[Math.min(player.index, frames.length - 1)]
  return (
    <MiniPlayerShell player={player} frameCount={frames.length} caption={frame.caption}>
      <span className="block overflow-auto">
        <QuickTree
          tree={tree}
          revealedMax={frame.revealedMax}
          currentId={frame.phase === "done" ? null : frame.currentId}
          scale={1.25}
        />
      </span>
      {caption && (
        <span className="mt-2 block text-center text-xs text-muted-foreground">{caption}</span>
      )}
    </MiniPlayerShell>
  )
}

// — Розбиття одного вузла (статичне) -----------------------------------------

function PartitionView({
  array,
  pivot,
  pivotIndex,
  left,
  middle,
  right,
}: {
  array: readonly number[]
  pivot: number | null
  pivotIndex: number | null
  left: readonly number[]
  middle: readonly number[]
  right: readonly number[]
}) {
  return (
    <span className="flex flex-col items-center gap-3">
      <ArrayChips array={array} pivot={pivot} pivotIndex={pivotIndex} />
      <span className="flex flex-wrap items-center justify-center gap-2">
        <ArrowRight className="size-4 text-muted-foreground" />
        <PartBox label="left (<)" array={left} tone="less" />
        <PartBox label="middle (==)" array={middle} tone="equal" />
        <PartBox label="right (>)" array={right} tone="greater" />
      </span>
    </span>
  )
}

const PART_TONE: Record<string, string> = {
  less: "border-sky-500/40 bg-sky-500/10",
  equal: "border-fuchsia-400/40 bg-fuchsia-400/10",
  greater: "border-orange-400/40 bg-orange-400/10",
}

function PartBox({
  label,
  array,
  tone,
}: {
  label: string
  array: readonly number[]
  tone: "less" | "equal" | "greater"
}) {
  return (
    <span className={cn("flex flex-col gap-1 rounded-md border px-2 py-1.5", PART_TONE[tone])}>
      <span className="font-mono text-[10px] text-muted-foreground">{label}</span>
      <span className="font-mono text-[12px] tabular-nums">[{array.join(", ")}]</span>
    </span>
  )
}

export function PartitionFigure({
  values,
  eventIndex = 0,
  caption,
}: {
  values: readonly number[]
  eventIndex?: number
  caption?: string
}) {
  const { tree } = useMemo(() => buildQuickSortTrace(values, "middle"), [values])
  const node = tree.nodes[Math.min(eventIndex, tree.nodes.length - 1)]
  return (
    <Figure caption={caption}>
      <PartitionView
        array={node.array}
        pivot={node.pivot}
        pivotIndex={node.pivotIndex}
        left={node.left ?? []}
        middle={node.middle ?? []}
        right={node.right ?? []}
      />
    </Figure>
  )
}

// — Послідовні розбиття (міні-плеєр по не-базових вузлах) ---------------------

export function PartitionAnimationFigure({
  values,
  caption,
}: {
  values: readonly number[]
  caption?: string
}) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)
  const { tree, frames } = useMemo(
    () => buildQuickSortTrace(values, "middle", tr),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values, lang],
  )
  // Лише кадри розбиття (не-базові виклики).
  const partFrames = frames.filter((f) => f.phase === "partition")
  const player = usePlayer(partFrames.length, partFrames)
  const frame = partFrames[Math.min(player.index, partFrames.length - 1)]
  const node = tree.nodes[frame.currentId]
  return (
    <MiniPlayerShell player={player} frameCount={partFrames.length} caption={frame.caption}>
      <PartitionView
        array={node.array}
        pivot={node.pivot}
        pivotIndex={node.pivotIndex}
        left={node.left ?? []}
        middle={node.middle ?? []}
        right={node.right ?? []}
      />
      {caption && (
        <span className="mt-2 block text-center text-xs text-muted-foreground">{caption}</span>
      )}
    </MiniPlayerShell>
  )
}

// — Один крок повного трасування: дерево + розбиття ---------------------------

export function StepFigure({
  values,
  eventIndex,
  caption,
}: {
  values: readonly number[]
  eventIndex: number
  caption?: string
}) {
  const { tree } = useMemo(() => buildQuickSortTrace(values, "middle"), [values])
  const idx = Math.min(eventIndex, tree.nodes.length - 1)
  const node = tree.nodes[idx]
  return (
    <Figure caption={caption}>
      <span className="grid gap-3 lg:grid-cols-2">
        <span className="block overflow-auto rounded-md border bg-muted/20 p-2">
          <QuickTree tree={tree} revealedMax={idx} currentId={idx} scale={1.25} />
        </span>
        <span className="flex items-center justify-center rounded-md border bg-muted/20 p-2">
          {node.isBase ? (
            <ArrayChips array={node.array} mode="sorted" />
          ) : (
            <PartitionView
              array={node.array}
              pivot={node.pivot}
              pivotIndex={node.pivotIndex}
              left={node.left ?? []}
              middle={node.middle ?? []}
              right={node.right ?? []}
            />
          )}
        </span>
      </span>
    </Figure>
  )
}

// — Підмасиви по рівнях (таблиця трасування) ---------------------------------

export function LevelsFigure({
  values,
  caption,
}: {
  values: readonly number[]
  caption?: string
}) {
  const t = useT()
  const { tree } = useMemo(() => buildQuickSortTrace(values, "middle"), [values])
  const callName = (b: "root" | "left" | "right") =>
    b === "root" ? "quicksort(arr)" : b === "left" ? "quicksort(left)" : "quicksort(right)"
  const dash = "—"
  const fmt = (a: readonly number[] | null) => (a ? `[${a.join(", ")}]` : dash)

  return (
    <Figure caption={caption}>
      <table className="border-collapse text-[11px] tabular-nums">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="px-2 py-1 font-medium">{t("learn.qsColLevel")}</th>
            <th className="px-2 py-1 font-medium">{t("learn.qsColCall")}</th>
            <th className="px-2 py-1 font-medium">{t("learn.qsColSub")}</th>
            <th className="px-2 py-1 font-medium">{t("learn.qsColPivot")}</th>
            <th className="px-2 py-1 font-mono font-medium">left</th>
            <th className="px-2 py-1 font-mono font-medium">middle</th>
            <th className="px-2 py-1 font-mono font-medium">right</th>
          </tr>
        </thead>
        <tbody>
          {tree.nodes.map((n) => (
            <tr key={n.id} className="border-b last:border-0">
              <td className="px-2 py-1">{n.level}</td>
              <td className="px-2 py-1 font-mono">{callName(n.branch)}</td>
              <td className="px-2 py-1 font-mono">[{n.array.join(", ")}]</td>
              <td className="px-2 py-1 font-mono text-violet-600 dark:text-violet-400">
                {n.isBase ? dash : n.pivot}
              </td>
              <td className="px-2 py-1 font-mono text-sky-600 dark:text-sky-400">{n.isBase ? dash : fmt(n.left)}</td>
              <td className="px-2 py-1 font-mono text-fuchsia-600 dark:text-fuchsia-400">{n.isBase ? dash : fmt(n.middle)}</td>
              <td className="px-2 py-1 font-mono text-orange-600 dark:text-orange-400">{n.isBase ? dash : fmt(n.right)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Figure>
  )
}

// — Код ↔ дані (міні-плеєр) ---------------------------------------------------

export function CodeWalkthroughFigure({
  values,
  caption,
}: {
  values: readonly number[]
  caption?: string
}) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)
  const { tree, frames, code } = useMemo(
    () => buildQuickSortTrace(values, "middle", tr),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values, lang],
  )
  const player = usePlayer(frames.length, frames)
  const frame = frames[Math.min(player.index, frames.length - 1)]
  return (
    <MiniPlayerShell player={player} frameCount={frames.length} caption={frame.caption}>
      <span className="grid gap-3 lg:grid-cols-2">
        <CodePanel
          code={code}
          title={t("play.qsCodeTitle")}
          activeLines={frame.lines}
          contextLines={frame.contextLines}
          className="h-[320px]"
        />
        <span className="flex h-[320px] flex-col justify-center overflow-auto rounded-lg border bg-card p-3">
          <QuickTree
            tree={tree}
            revealedMax={frame.revealedMax}
            currentId={frame.phase === "done" ? null : frame.currentId}
            scale={1.25}
          />
        </span>
      </span>
      {caption && (
        <span className="mt-2 block text-center text-xs text-muted-foreground">{caption}</span>
      )}
    </MiniPlayerShell>
  )
}

// — Стабільність: тристороння (✓) проти класичної in-place (✗) ----------------

interface Tagged {
  readonly value: number
  readonly tag: number
}

// Масив із README: 4₁, 2₁, 4₂, 4₃, 1₁, 4₄, 3₁.
const STABILITY_INPUT: readonly Tagged[] = [
  { value: 4, tag: 1 },
  { value: 2, tag: 1 },
  { value: 4, tag: 2 },
  { value: 4, tag: 3 },
  { value: 1, tag: 1 },
  { value: 4, tag: 4 },
  { value: 3, tag: 1 },
]

/** Тристороння (списко-включення) — стабільна за значенням. */
function threeWayTagged(arr: readonly Tagged[]): Tagged[] {
  if (arr.length <= 1) return [...arr]
  const p = arr[Math.floor(arr.length / 2)].value
  const left = arr.filter((x) => x.value < p)
  const middle = arr.filter((x) => x.value === p)
  const right = arr.filter((x) => x.value > p)
  return [...threeWayTagged(left), ...middle, ...threeWayTagged(right)]
}

/** Класична in-place (Ломуто, опорний-середина) — нестабільна. */
function inplaceTagged(input: readonly Tagged[]): Tagged[] {
  const a = input.map((x) => ({ ...x }))
  const partition = (lo: number, hi: number): number => {
    const p = lo + Math.floor((hi - lo + 1) / 2)
    ;[a[p], a[hi]] = [a[hi], a[p]]
    const pivotVal = a[hi].value
    let i = lo
    for (let j = lo; j < hi; j++) {
      if (a[j].value < pivotVal) {
        ;[a[i], a[j]] = [a[j], a[i]]
        i += 1
      }
    }
    ;[a[i], a[hi]] = [a[hi], a[i]]
    return i
  }
  const qsort = (lo: number, hi: number): void => {
    if (lo < hi) {
      const p = partition(lo, hi)
      qsort(lo, p - 1)
      qsort(p + 1, hi)
    }
  }
  qsort(0, a.length - 1)
  return a
}

function TaggedRow({ items }: { items: readonly Tagged[] }) {
  const max = Math.max(...items.map((x) => x.value))
  return (
    <div className="flex items-end justify-center gap-2" style={{ height: 110 }}>
      {items.map((it, i) => (
        <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
          <span className="text-[11px] font-medium leading-none">
            {it.value}
            <sub className="text-[9px] text-muted-foreground">{it.tag}</sub>
          </span>
          <div
            className="w-full rounded-t bg-sky-500/60"
            style={{ height: `${Math.max(12, (it.value / max) * 100)}%` }}
          />
        </div>
      ))}
    </div>
  )
}

export function StabilityFigure({ caption }: { caption?: string }) {
  const t = useT()
  const threeWay = threeWayTagged(STABILITY_INPUT)
  const inplace = inplaceTagged(STABILITY_INPUT)
  return (
    <Figure caption={caption}>
      <div className="flex flex-col gap-3">
        <div>
          <span className="mb-1 block text-xs font-medium text-muted-foreground">
            {t("learn.qsStableInput")}
          </span>
          <TaggedRow items={STABILITY_INPUT} />
        </div>
        <div>
          <span className="mb-1 block text-xs font-medium text-emerald-700 dark:text-emerald-300">
            {t("learn.qsStableLabel")}
          </span>
          <TaggedRow items={threeWay} />
        </div>
        <div>
          <span className="mb-1 block text-xs font-medium text-rose-700 dark:text-rose-300">
            {t("learn.qsUnstableLabel")}
          </span>
          <TaggedRow items={inplace} />
        </div>
        <span className="block text-center text-xs text-muted-foreground">
          {t("learn.qsStableNote")}
        </span>
      </div>
    </Figure>
  )
}

// — Зростання складності: n·log₂n проти n²/2 ---------------------------------

export function GrowthFigure({ caption }: { caption?: string }) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const locale = lang === "ua" ? "uk-UA" : "en-US"
  const rows = [10, 100, 1000, 10000]
  const fmt = (x: number) => Math.round(x).toLocaleString(locale)
  return (
    <Figure caption={caption}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-right text-xs text-muted-foreground">
            <th className="px-2 py-1 text-left font-medium">n</th>
            <th className="px-2 py-1 font-mono font-medium">n·log₂n</th>
            <th className="px-2 py-1 font-mono font-medium">n²/2</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((n) => (
            <tr key={n} className="border-b last:border-0 text-right tabular-nums">
              <td className="px-2 py-1 text-left font-medium">{fmt(n)}</td>
              <td className="px-2 py-1 font-mono text-emerald-700 dark:text-emerald-400">
                {fmt(n * Math.log2(n))}
              </td>
              <td className="px-2 py-1 font-mono text-rose-600 dark:text-rose-400">
                {fmt((n * n) / 2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <span className="mt-1.5 block text-xs text-muted-foreground">{t("learn.qsGrowthNote")}</span>
    </Figure>
  )
}
