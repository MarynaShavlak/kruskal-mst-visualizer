import { ArrowDown } from "lucide-react"
import { Panel } from "@/algorithms/shared/playback/Panel"
import { mergeStateView, type HalfRole } from "@/algorithms/merge-sort/playback/highlight"
import type { MergeMicroStep } from "@/lib/mergeSort"
import type { MsPhase, MsTreeNode } from "@/lib/mergeSortTrace"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

// — Базова комірка значення -------------------------------------------------

const TONE = {
  left: "bg-sky-500/15 border-sky-500/50 text-sky-700 dark:text-sky-300",
  right: "bg-orange-400/15 border-orange-400/50 text-orange-700 dark:text-orange-300",
  merged: "bg-emerald-500/15 border-emerald-500/50 text-emerald-700 dark:text-emerald-300",
  head: "bg-amber-400/80 border-amber-500 text-amber-950 ring-2 ring-amber-300",
  spent: "bg-muted border-border text-muted-foreground/50",
  neutral: "bg-card border-border/70 text-foreground",
} as const

function Cell({ value, tone }: { value: number; tone: keyof typeof TONE }) {
  return (
    <span
      className={cn(
        "inline-flex size-7 items-center justify-center rounded border text-[12px] font-semibold tabular-nums",
        TONE[tone],
      )}
    >
      {value}
    </span>
  )
}

/** Рядок комірок масиву (поділ/базовий/результат). */
export function ArrayRow({
  values,
  tone = "neutral",
  mid,
}: {
  values: readonly number[]
  tone?: keyof typeof TONE
  /** Якщо задано — комірки до `mid` сині (ліва половина), решта помаранчеві. */
  mid?: number
}) {
  if (values.length === 0) {
    return <span className="px-1 text-sm text-muted-foreground">∅</span>
  }
  return (
    <span className="inline-flex gap-1">
      {values.map((v, i) => (
        <Cell
          key={i}
          value={v}
          tone={mid != null ? (i < mid ? "left" : "right") : tone}
        />
      ))}
    </span>
  )
}

// — Зіркова панель злиття двома вказівниками ---------------------------------

const HALF_TONE: Record<HalfRole, keyof typeof TONE> = {
  spent: "spent",
  head: "head",
  pending: "neutral",
}

/**
 * Зіркова панель злиття: дві відсортовані половини (🔵 ліва, 🟧 права) зі своїми
 * курсорами `left_index`/`right_index`, поточна голова 🟡, і результат `merged`
 * (🟢, остання додана комірка 🟡). `step === null` — стартовий стан. Спільна для
 * плеєра й навчальних віджетів.
 */
export function MergeState({
  left,
  right,
  step,
}: {
  left: readonly number[]
  right: readonly number[]
  step: MergeMicroStep | null
}) {
  const t = useT()
  const view = mergeStateView(left, right, step)

  const half = (
    cells: typeof view.left,
    cursor: number,
    baseTone: "left" | "right",
    label: string,
    labelCls: string,
  ) => (
    <div className="flex items-start gap-2">
      <span className={cn("w-28 shrink-0 pt-1 text-right text-[11px] font-medium", labelCls)}>
        {label}
      </span>
      <div className="flex flex-col gap-0.5">
        <span className="inline-flex gap-1">
          {cells.map((c, i) => (
            <Cell
              key={i}
              value={c.value}
              tone={c.role === "pending" ? baseTone : HALF_TONE[c.role]}
            />
          ))}
          {cells.length === 0 && <span className="text-sm text-muted-foreground">∅</span>}
        </span>
        <span className="inline-flex gap-1">
          {cells.map((_, i) => (
            <span key={i} className="inline-flex size-3 items-center justify-center text-[10px] text-primary">
              {i === cursor ? "▲" : ""}
            </span>
          ))}
          {cursor === -1 && cells.length > 0 && (
            <span className="pl-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">✓</span>
          )}
        </span>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-2">
      {half(view.left, view.leftCursor, "left", t("play.msLeftHalf"), "text-sky-600 dark:text-sky-400")}
      {half(view.right, view.rightCursor, "right", t("play.msRightHalf"), "text-orange-600 dark:text-orange-400")}
      <div className="flex items-start gap-2 border-t pt-2">
        <span className="w-28 shrink-0 pt-1 text-right text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          {t("play.msMerged")}
        </span>
        <span className="inline-flex gap-1">
          {view.merged.map((m, i) => (
            <Cell key={i} value={m.value} tone={m.head ? "head" : "merged"} />
          ))}
          {view.merged.length === 0 && <span className="text-sm text-muted-foreground">∅</span>}
        </span>
      </div>
    </div>
  )
}

/**
 * Адаптивна панель «поточна дія»: на злитті — зіркова панель двох вказівників; на
 * поділі — підмасив, поділений навпіл (🔵 left | 🟧 right); базовий випадок —
 * поодинокий елемент «уже відсортовано»; старт/фінал — вхід/відсортований масив.
 */
export function MergeDetailPanel({
  phase,
  node,
  mergeLeft,
  mergeRight,
  mergeStep,
  input,
  sorted,
  className,
}: {
  phase: MsPhase
  node: MsTreeNode | null
  mergeLeft: readonly number[] | null
  mergeRight: readonly number[] | null
  mergeStep: MergeMicroStep | null
  input: readonly number[]
  sorted: readonly number[]
  className?: string
}) {
  const t = useT()
  return (
    <Panel
      title={t("play.msDetailTitle")}
      className={className}
      bodyClassName="flex flex-col gap-3 p-3"
    >
      {phase === "merge" && mergeLeft != null && mergeRight != null ? (
        <MergeState left={mergeLeft} right={mergeRight} step={mergeStep} />
      ) : phase === "split" && node ? (
        <div className="flex flex-col items-start gap-2">
          <ArrayRow values={node.array} mid={node.mid ?? undefined} />
          <ArrowDown className="size-4 text-muted-foreground" />
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col items-start gap-1">
              <span className="text-[11px] font-medium text-sky-600 dark:text-sky-400">{t("play.msLeftHalf")}</span>
              <ArrayRow values={node.leftHalf ?? []} tone="left" />
            </div>
            <div className="flex flex-col items-start gap-1">
              <span className="text-[11px] font-medium text-orange-600 dark:text-orange-400">{t("play.msRightHalf")}</span>
              <ArrayRow values={node.rightHalf ?? []} tone="right" />
            </div>
          </div>
        </div>
      ) : phase === "base" && node ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <ArrayRow values={node.array} tone="merged" />
          <span className="text-muted-foreground">{t("play.msBaseNote")}</span>
        </div>
      ) : phase === "final" ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <ArrayRow values={sorted} tone="merged" />
          <span className="text-muted-foreground">{t("play.msFinalNote")}</span>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <ArrayRow values={input} />
          <span className="text-muted-foreground">{t("play.msInitNote")}</span>
        </div>
      )}
    </Panel>
  )
}
