import { useMemo, type ReactNode } from "react"
import { ArrowRight } from "lucide-react"
import {
  mergeSort,
  mergeSteps,
  type MergeMicroStep,
} from "@/lib/mergeSort"
import { buildMergeSortTrace, mergeDetail, type MsTreeNode } from "@/lib/mergeSortTrace"
import { MergeTree } from "@/algorithms/merge-sort/playback/MergeTreePanel"
import { MergeState, ArrayRow } from "@/algorithms/merge-sort/playback/MergeStatePanel"
import { barHeightPct } from "@/algorithms/merge-sort/playback/highlight"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { MiniPlayerShell } from "@/algorithms/shared/learn/MiniPlayerShell"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { useT } from "@/i18n/use-t"
import type { MessageKey } from "@/i18n/messages"
import type { Translate } from "@/lib/translate"
import { useLangStore } from "@/store/lang-store"
import { cn } from "@/lib/utils"

// Живі навчальні віджети сортування злиттям на еталонних масивах. Замінюють
// статичні фігури README обчисленнями з lib/. Головні образи — ДЕРЕВО РЕКУРСІЇ
// (поділ навпіл униз, злиття вгору) і ЗІРКОВА панель злиття двома вказівниками.
// Кольори: 🔵 ліва половина · 🟧 права · 🟢 відсортований/злитий · 🟡 поточна голова.

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

export function ResultFigure({
  values,
  caption,
}: {
  values: readonly number[]
  caption?: string
}) {
  const t = useT()
  const { result } = useMemo(() => buildMergeSortTrace(values, "topDown"), [values])
  return (
    <Figure caption={caption}>
      <ArrayBars values={result.sorted} sorted height={130} />
      <span className="mt-2 block text-center text-sm tabular-nums">
        {t("learn.msResultSummary", {
          comparisons: result.comparisons,
          appends: result.appends,
          merges: result.merges,
          depth: result.depth,
        })}
      </span>
    </Figure>
  )
}

// — Інтуїція: поділ навпіл → дві відсортовані половини → злиття ---------------

export function IdeaFigure({
  values,
  caption,
}: {
  values: readonly number[]
  caption?: string
}) {
  const t = useT()
  const mid = Math.floor(values.length / 2)
  const left = useMemo(() => mergeSort(values.slice(0, mid)), [values, mid])
  const right = useMemo(() => mergeSort(values.slice(mid)), [values, mid])
  const merged = useMemo(() => mergeSort(values), [values])
  return (
    <Figure caption={caption}>
      <span className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <span className="flex flex-col items-center gap-1">
          <ArrayRow values={values} />
          <span className="text-[11px] text-muted-foreground">{t("learn.msIdeaSplit")}</span>
        </span>
        <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
        <span className="flex flex-col items-center gap-1">
          <span className="inline-flex gap-2">
            <ArrayRow values={left} tone="left" />
            <ArrayRow values={right} tone="right" />
          </span>
          <span className="text-[11px] text-muted-foreground">{t("learn.msIdeaHalves")}</span>
        </span>
        <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
        <span className="flex flex-col items-center gap-1">
          <ArrayRow values={merged} tone="merged" />
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400">{t("learn.msIdeaMerge")}</span>
        </span>
      </span>
    </Figure>
  )
}

// — Зіркова панель злиття (міні-плеєр одного злиття) --------------------------

export function MergeAnimationFigure({
  left,
  right,
  caption,
}: {
  left: readonly number[]
  right: readonly number[]
  caption?: string
}) {
  const t = useT()
  const tr: Translate = (k, v) => t(k as MessageKey, v)
  const frames = useMemo<(MergeMicroStep | null)[]>(
    () => [null, ...mergeSteps(left, right).steps],
    [left, right],
  )
  const player = usePlayer(frames.length, `${left.join()}|${right.join()}`)
  const step = frames[Math.min(player.index, frames.length - 1)]
  const cap = step === null ? t("play.msMergeStart") : mergeDetail(step, left, right, tr)
  return (
    <MiniPlayerShell player={player} frameCount={frames.length} caption={cap}>
      <span className="block overflow-auto">
        <MergeState left={left} right={right} step={step} />
      </span>
      {caption && (
        <span className="mt-2 block text-center text-xs text-muted-foreground">{caption}</span>
      )}
    </MiniPlayerShell>
  )
}

// — Дерево рекурсії (статичне) ------------------------------------------------

export function TreeFigure({
  values,
  caption,
}: {
  values: readonly number[]
  caption?: string
}) {
  const { tree } = useMemo(() => buildMergeSortTrace(values, "topDown"), [values])
  const allInternal = tree.nodes.filter((n) => !n.isBase).map((n) => n.id)
  return (
    <Figure caption={caption}>
      <MergeTree
        tree={tree}
        revealedMax={tree.nodes.length - 1}
        currentId={null}
        mergedIds={allInternal}
      />
    </Figure>
  )
}

// — Дерево, що «росте» (міні-плеєр: поділ ↓ + злиття ↑) -----------------------

export function TreeAnimationFigure({
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
    () => buildMergeSortTrace(values, "topDown", tr),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values, lang],
  )
  const player = usePlayer(frames.length, `${values.join()}|${lang}`)
  const frame = frames[Math.min(player.index, frames.length - 1)]
  return (
    <MiniPlayerShell player={player} frameCount={frames.length} caption={frame.caption}>
      <span className="block overflow-auto">
        <MergeTree
          tree={tree}
          revealedMax={frame.revealedMax}
          currentId={frame.phase === "final" ? null : frame.currentId}
          mergedIds={frame.mergedIds}
        />
      </span>
      {caption && (
        <span className="mt-2 block text-center text-xs text-muted-foreground">{caption}</span>
      )}
    </MiniPlayerShell>
  )
}

// — Підмасиви по рівнях рекурсії ----------------------------------------------

export function LevelsFigure({
  values,
  caption,
}: {
  values: readonly number[]
  caption?: string
}) {
  const t = useT()
  const { tree } = useMemo(() => buildMergeSortTrace(values, "topDown"), [values])
  const levels: MsTreeNode[][] = []
  for (let d = 0; d <= tree.maxDepth; d++) {
    const here = tree.nodes.filter(
      (n) => n.depth === d || (n.isBase && n.depth < d),
    )
    here.sort((a, b) => a.x - b.x)
    levels.push(here)
  }
  return (
    <Figure caption={caption}>
      <span className="flex flex-col gap-2">
        {levels.map((nodes, d) => (
          <span key={d} className="flex items-center gap-2">
            <span className="w-20 shrink-0 text-right text-[11px] font-medium text-muted-foreground">
              {t("learn.msLevel", { level: d + 1 })}
            </span>
            <span className="inline-flex flex-wrap gap-1.5">
              {nodes.map((n, gi) => (
                <ArrayRow
                  key={n.id}
                  values={n.array}
                  tone={n.isBase ? "merged" : gi % 2 === 0 ? "left" : "right"}
                />
              ))}
            </span>
          </span>
        ))}
      </span>
    </Figure>
  )
}

// — Один крок повного трасування: дерево + панель «поточна дія» ---------------

export function StepFigure({
  values,
  eventIndex,
  caption,
}: {
  values: readonly number[]
  eventIndex: number
  caption?: string
}) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)
  const { tree, frames, stepIndices } = useMemo(
    () => buildMergeSortTrace(values, "topDown", tr),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values, lang],
  )
  const idx = Math.min(eventIndex, stepIndices.length - 1)
  const frame = frames[stepIndices[idx]]
  const node = frame.currentId >= 0 ? tree.nodes[frame.currentId] ?? null : null
  return (
    <Figure caption={caption}>
      <span className="grid gap-3 lg:grid-cols-2">
        <span className="block overflow-auto rounded-md border bg-muted/20 p-2">
          <MergeTree
            tree={tree}
            revealedMax={frame.revealedMax}
            currentId={frame.phase === "final" ? null : frame.currentId}
            mergedIds={frame.mergedIds}
          />
        </span>
        <span className="flex items-center justify-center overflow-auto rounded-md border bg-muted/20 p-2">
          <StepDetail frame={frame} node={node} sorted={tree.nodes[0]?.result ?? []} />
        </span>
      </span>
      <span className="mt-2 block text-center text-[11px] text-muted-foreground">{frame.caption}</span>
    </Figure>
  )
}

function StepDetail({
  frame,
  node,
  sorted,
}: {
  frame: ReturnType<typeof buildMergeSortTrace>["frames"][number]
  node: MsTreeNode | null
  sorted: readonly number[]
}) {
  if (frame.phase === "merge" && frame.mergeLeft && frame.mergeRight) {
    return <MergeState left={frame.mergeLeft} right={frame.mergeRight} step={frame.mergeStep} />
  }
  if (frame.phase === "split" && node) {
    return (
      <span className="flex flex-col items-center gap-2">
        <ArrayRow values={node.array} mid={node.mid ?? undefined} />
        <span className="inline-flex gap-2">
          <ArrayRow values={node.leftHalf ?? []} tone="left" />
          <ArrayRow values={node.rightHalf ?? []} tone="right" />
        </span>
      </span>
    )
  }
  if (frame.phase === "base" && node) {
    return <ArrayRow values={node.array} tone="merged" />
  }
  if (frame.phase === "final") {
    return <ArrayRow values={sorted} tone="merged" />
  }
  return <ArrayRow values={node?.array ?? sorted} />
}

// — Код ↔ дані (міні-плеєр: код | дерево) -------------------------------------

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
    () => buildMergeSortTrace(values, "topDown", tr),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values, lang],
  )
  const player = usePlayer(frames.length, `${values.join()}|${lang}`)
  const frame = frames[Math.min(player.index, frames.length - 1)]
  return (
    <MiniPlayerShell player={player} frameCount={frames.length} caption={frame.caption}>
      <span className="grid gap-3 lg:grid-cols-2">
        <CodePanel
          code={code}
          title={t("play.msCodeTitleTd")}
          activeLines={frame.lines}
          contextLines={frame.contextLines}
          className="h-[340px]"
        />
        <span className="flex h-[340px] flex-col justify-center overflow-auto rounded-lg border bg-card p-3">
          {frame.phase === "merge" && frame.mergeLeft && frame.mergeRight ? (
            <MergeState left={frame.mergeLeft} right={frame.mergeRight} step={frame.mergeStep} />
          ) : (
            <MergeTree
              tree={tree}
              revealedMax={frame.revealedMax}
              currentId={frame.phase === "final" ? null : frame.currentId}
              mergedIds={frame.mergedIds}
            />
          )}
        </span>
      </span>
      {caption && (
        <span className="mt-2 block text-center text-xs text-muted-foreground">{caption}</span>
      )}
    </MiniPlayerShell>
  )
}

// — Стабільність: завжди стабільне (нестроге <=) ------------------------------

interface Tagged {
  readonly value: number
  readonly tag: number
}

/** Мічені дублікати з README: 3₁,1₁,3₂,2₁,1₂,3₃ (база [3,1,3,2,1,3]). */
const STABILITY_INPUT: readonly Tagged[] = (() => {
  const base = [3, 1, 3, 2, 1, 3]
  const seen = new Map<number, number>()
  return base.map((value) => {
    const tag = (seen.get(value) ?? 0) + 1
    seen.set(value, tag)
    return { value, tag }
  })
})()

/** Стабільне сортування злиттям за значенням (нестроге <= → рівні з лівої першими). */
function stableMerge(arr: readonly Tagged[]): Tagged[] {
  if (arr.length <= 1) return [...arr]
  const mid = Math.floor(arr.length / 2)
  const left = stableMerge(arr.slice(0, mid))
  const right = stableMerge(arr.slice(mid))
  const out: Tagged[] = []
  let i = 0
  let j = 0
  while (i < left.length && j < right.length) {
    if (left[i].value <= right[j].value) out.push(left[i++])
    else out.push(right[j++])
  }
  while (i < left.length) out.push(left[i++])
  while (j < right.length) out.push(right[j++])
  return out
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
            className="w-full rounded-t bg-emerald-500/60"
            style={{ height: `${Math.max(12, (it.value / max) * 100)}%` }}
          />
        </div>
      ))}
    </div>
  )
}

export function StabilityFigure({ caption }: { caption?: string }) {
  const t = useT()
  const sorted = stableMerge(STABILITY_INPUT)
  return (
    <Figure caption={caption}>
      <div className="flex flex-col gap-3">
        <div>
          <span className="mb-1 block text-xs font-medium text-muted-foreground">
            {t("learn.msStableInput")}
          </span>
          <TaggedRow items={STABILITY_INPUT} />
        </div>
        <div>
          <span className="mb-1 block text-xs font-medium text-emerald-700 dark:text-emerald-300">
            {t("learn.msStableLabel")}
          </span>
          <TaggedRow items={sorted} />
        </div>
        <span className="block text-center text-xs text-muted-foreground">
          {t("learn.msStableNote")}
        </span>
      </div>
    </Figure>
  )
}

// — Зростання складності: гарантований n·log₂n проти n²/2 --------------------

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
      <span className="mt-1.5 block text-xs text-muted-foreground">{t("learn.msGrowthNote")}</span>
    </Figure>
  )
}
