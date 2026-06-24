import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  buildQuickSortTrace,
  type QsPhase,
  type QsResult,
} from "@/lib/quickSortTrace"
import type { PivotStrategy } from "@/lib/quickSort"
import { useQuickSortStore } from "@/store/quick-sort-store"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { PlayerShell } from "@/algorithms/shared/playback/PlayerShell"
import { PhaseBadge, type PhaseStyle } from "@/algorithms/shared/playback/PhaseBadge"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { StatsBar, Stat } from "@/algorithms/shared/playback/Stats"
import { LiveComplexity } from "@/algorithms/shared/playback/LiveComplexity"
import { ModeSwitch } from "@/algorithms/shared/playback/ModeSwitch"
import { useTraceRun, TraceFallback } from "@/algorithms/shared/playback/use-trace-run"
import { QuickTreePanel } from "@/algorithms/quick-sort/playback/QuickTreePanel"
import { QuickPartitionPanel } from "@/algorithms/quick-sort/playback/QuickPartitionPanel"
import { useT, useTr } from "@/i18n/use-t"
import { useLangStore } from "@/store/lang-store"
import { cn } from "@/lib/utils"

// Поріг розміру масиву: дерево рекурсії (вузлів O(n), глибина до n у виродженому
// випадку) стає завеликим для плавного плеєра — редактор попереджає вже від 14.
const MAX_SIZE = 16

export function PlaybackView() {
  const values = useQuickSortStore((s) => s.values)
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr = useTr()
  const [strategy, setStrategy] = useState<PivotStrategy>("middle")

  // Сигнатура стабільна щодо мови — курсор плеєра не скидається на UA/EN.
  const sig = `${strategy}|${values.join(",")}`

  const run = useTraceRun(() => buildQuickSortTrace(values, strategy, tr), {
    empty: values.length === 0,
    tooBig: values.length > MAX_SIZE,
    sig,
    lang,
  })

  const frameCount = run.kind === "ok" ? run.trace.frames.length : 1
  const player = usePlayer(frameCount, sig)

  const switcher = (
    <ModeSwitch
      label={t("play.qsPivot")}
      value={strategy}
      onChange={setStrategy}
      options={[
        { key: "middle", label: t("play.qsPivotMiddle") },
        { key: "first", label: t("play.qsPivotFirst") },
        { key: "last", label: t("play.qsPivotLast") },
        { key: "median3", label: t("play.qsPivotMedian3") },
      ]}
      wrapButtons
    />
  )

  if (run.kind !== "ok") {
    return (
      <TraceFallback
        headerExtra={switcher}
        message={run.kind === "empty" ? t("play.qsEmpty") : t("play.qsTooBig", { max: MAX_SIZE })}
      />
    )
  }

  const { trace } = run
  const index = Math.min(player.index, trace.frames.length - 1)
  const frame = trace.frames[index]
  const node = trace.tree.nodes[frame.currentId]

  // Межі складності В ОДИНИЦЯХ лічильника comparisons (= Σ розмірів не-базових
  // вузлів): найгірша = вироджене дерево n(n+1)/2−1 (рівно стільки на відсортованому
  // вході з опорним-першим/останнім); орієнтир O(n·log n) = ⌈n·log₂n⌉.
  const n = trace.result.size
  const worstCmp = Math.max(0, (n * (n + 1)) / 2 - 1)
  const refCmp = n >= 2 ? Math.ceil(n * Math.log2(n)) : 0

  return (
    <PlayerShell
      player={player}
      headerExtra={switcher}
      caption={frame.caption}
      captionBadge={<PhaseBadge phase={frame.phase} styles={PHASE_STYLES} />}
      statsBar={
        <>
          <StatsBar>
            <Stat label={t("play.qsStatComparisons")} value={String(frame.comparisons)} />
            <Stat label={t("play.qsStatCalls")} value={String(frame.calls)} />
            <Stat label={t("play.qsStatDepth")} value={String(trace.result.depth)} />
            <Stat label={t("play.qsStatSize")} value={String(trace.result.size)} />
          </StatsBar>
          <LiveComplexity
            title={t("play.qsLcTitle")}
            n={n}
            unit={t("play.qsLcUnit")}
            actual={frame.comparisons}
            actualLabel={t("play.qsLcActual")}
            reference={{
              value: refCmp,
              cls: "O(n·log n)",
              name: t("play.qsLcTypical"),
              formula: `⌈n·log₂n⌉ = ${refCmp}`,
            }}
            worst={{
              value: worstCmp,
              cls: "O(n²)",
              name: t("play.qsLcWorst"),
              formula: `n(n+1)/2 − 1 = ${worstCmp}`,
            }}
            verdict={
              frame.phase === "done" ? (
                <LcVerdict
                  actual={trace.result.comparisons}
                  reference={refCmp}
                  worst={worstCmp}
                />
              ) : undefined
            }
          />
        </>
      }
      panels={
        <>
          <CodePanel
            code={trace.code}
            title={t("play.qsCodeTitle")}
            activeLines={frame.lines}
            contextLines={frame.contextLines}
            className="min-h-[340px]"
          />
          <QuickTreePanel
            tree={trace.tree}
            revealedMax={frame.revealedMax}
            currentId={frame.phase === "done" ? null : frame.currentId}
            className="min-h-[340px] lg:col-span-2"
          />
        </>
      }
      secondRow={
        <>
          <QuickPartitionPanel
            node={node}
            phase={frame.phase}
            sorted={trace.result.sorted}
            className="lg:col-span-2"
          />
          <ResultCard result={trace.result} done={frame.phase === "done"} />
        </>
      }
    />
  )
}

// — дрібні презентаційні шматки ----------------------------------------------

/** Вердикт «живої складності» при завершенні: куди лягла фактична ціна. */
function LcVerdict({
  actual,
  reference,
  worst,
}: {
  actual: number
  reference: number
  worst: number
}) {
  const t = useT()
  const msg =
    actual <= reference * 1.05
      ? t("play.qsLcVerdictGood")
      : actual >= worst * 0.95
        ? t("play.qsLcVerdictBad")
        : t("play.qsLcVerdictMid")
  return <span>{msg}</span>
}

const PHASE_STYLES: Record<QsPhase, PhaseStyle> = {
    partition: { labelKey: "play.qsPhasePartition", cls: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
    base: { labelKey: "play.qsPhaseBase", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
    done: { labelKey: "play.qsPhaseDone", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  }

function ResultCard({
  result,
  done,
  className,
}: {
  result: QsResult
  done: boolean
  className?: string
}) {
  const t = useT()
  return (
    <Card className={cn(className, done && "border-emerald-500/50")}>
      <CardContent className="flex flex-col gap-2 py-4 text-sm">
        <div>
          <div className="text-muted-foreground">{t("play.qsInputLabel")}</div>
          <div className="font-mono text-xs">[{result.input.join(", ")}]</div>
        </div>
        <div>
          <div className="text-muted-foreground">{t("play.qsSortedLabel")}</div>
          <div className="font-mono text-xs">{done ? `[${result.sorted.join(", ")}]` : "…"}</div>
        </div>
        <div className="tabular-nums text-xs">
          {t("play.qsResultCounts", {
            comparisons: result.comparisons,
            calls: result.calls,
            depth: result.depth,
          })}
        </div>
      </CardContent>
    </Card>
  )
}
