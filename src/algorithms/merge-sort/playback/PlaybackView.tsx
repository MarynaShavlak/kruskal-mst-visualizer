import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  buildMergeSortTrace,
  type MsPhase,
  type MsResult,
} from "@/lib/mergeSortTrace"
import type { MergeMode } from "@/lib/mergeSort"
import { useMergeSortStore } from "@/store/merge-sort-store"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { PlayerShell } from "@/algorithms/shared/playback/PlayerShell"
import { PhaseBadge, type PhaseStyle } from "@/algorithms/shared/playback/PhaseBadge"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { StatsBar, Stat } from "@/algorithms/shared/playback/Stats"
import { LiveComplexity } from "@/algorithms/shared/playback/LiveComplexity"
import { ModeSwitch } from "@/algorithms/shared/playback/ModeSwitch"
import { useTraceRun, TraceFallback } from "@/algorithms/shared/playback/use-trace-run"
import { MergeTreePanel } from "@/algorithms/merge-sort/playback/MergeTreePanel"
import { PassesPanel } from "@/algorithms/merge-sort/playback/PassesPanel"
import { MergeDetailPanel } from "@/algorithms/merge-sort/playback/MergeStatePanel"
import { useT, useTr } from "@/i18n/use-t"
import { useLangStore } from "@/store/lang-store"
import { cn } from "@/lib/utils"

// Поріг розміру масиву: дерево рекурсії / проходи стають завеликими для плавного
// плеєра (редактор попереджає вже від 16).
const MAX_SIZE = 16

export function PlaybackView() {
  const values = useMergeSortStore((s) => s.values)
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr = useTr()
  const [mode, setMode] = useState<MergeMode>("topDown")

  // Сигнатура стабільна щодо мови — курсор плеєра не скидається на UA/EN.
  const sig = `${mode}|${values.join(",")}`

  const run = useTraceRun(() => buildMergeSortTrace(values, mode, tr), {
    empty: values.length === 0,
    tooBig: values.length > MAX_SIZE,
    sig,
    lang,
  })

  const frameCount = run.kind === "ok" ? run.trace.frames.length : 1
  const player = usePlayer(frameCount, sig)

  const switcher = (
    <ModeSwitch
      label={t("play.msMode")}
      value={mode}
      onChange={setMode}
      options={[
        { key: "topDown", label: t("play.msModeTopDown") },
        { key: "bottomUp", label: t("play.msModeBottomUp") },
      ]}
      wrapButtons
    />
  )

  if (run.kind !== "ok") {
    return (
      <TraceFallback
        headerExtra={switcher}
        message={run.kind === "empty" ? t("play.msEmpty") : t("play.msTooBig", { max: MAX_SIZE })}
      />
    )
  }

  const { trace } = run
  const index = Math.min(player.index, trace.frames.length - 1)
  const frame = trace.frames[index]
  const node = frame.currentId >= 0 ? trace.tree.nodes[frame.currentId] ?? null : null
  const done = frame.phase === "final"

  // Злиття ГАРАНТУЄ O(n·log n) на будь-якому вході (дерево завжди збалансоване).
  // Орієнтир — ця гарантія ⌈n·log₂n⌉; права межа — квадрат O(n²), якого наївні
  // сортування сягають, а злиття НІКОЛИ (на відміну від швидкого — без зриву).
  const n = trace.result.size
  const refCmp = n >= 2 ? Math.ceil(n * Math.log2(n)) : 0
  // Точна квадратична межа — мітка показує саме n(n−1)/2. Для крихітних n вона близька
  // до орієнтиру n·log n; розрив гарантія↔квадрат росте на більших масивах.
  const worstCmp = (n * (n - 1)) / 2

  return (
    <PlayerShell
      player={player}
      headerExtra={switcher}
      caption={frame.caption}
      captionBadge={<PhaseBadge phase={frame.phase} styles={PHASE_STYLES} />}
      statsBar={
        <>
          <StatsBar>
            <Stat label={t("play.msStatComparisons")} value={String(frame.comparisons)} />
            <Stat label={t("play.msStatAppends")} value={String(frame.appends)} />
            <Stat label={t("play.msStatMerges")} value={String(frame.merges)} />
            <Stat label={t("play.msStatDepth")} value={String(trace.result.depth)} />
            <Stat label={t("play.msStatSize")} value={String(trace.result.size)} />
          </StatsBar>
          <LiveComplexity
            title={t("play.msLcTitle")}
            n={n}
            unit={t("play.msLcUnit")}
            actual={frame.comparisons}
            actualLabel={t("play.msLcActual")}
            reference={{
              value: refCmp,
              cls: "O(n·log n)",
              name: t("play.msLcGuaranteed"),
              formula: `⌈n·log₂n⌉ = ${refCmp}`,
            }}
            worst={{
              value: worstCmp,
              cls: "O(n²)",
              name: t("play.msLcNaive"),
              formula: `n(n−1)/2 = ${worstCmp}`,
            }}
            verdict={done ? t("play.msLcVerdict") : undefined}
          />
        </>
      }
      panels={
        <>
          <CodePanel
            code={trace.code}
            title={mode === "bottomUp" ? t("play.msCodeTitleBu") : t("play.msCodeTitleTd")}
            activeLines={frame.lines}
            contextLines={frame.contextLines}
            className="min-h-[360px]"
          />
          {mode === "topDown" ? (
            <MergeTreePanel
              tree={trace.tree}
              revealedMax={frame.revealedMax}
              currentId={done ? null : frame.currentId}
              mergedIds={frame.mergedIds}
              className="min-h-[360px] lg:col-span-2"
            />
          ) : (
            <PassesPanel
              passes={trace.passes}
              currentPass={frame.passIndex}
              mergeLo={frame.mergeLo}
              mergeHi={frame.mergeHi}
              done={done}
              className="min-h-[360px] lg:col-span-2"
            />
          )}
        </>
      }
      secondRow={
        <>
          <MergeDetailPanel
            phase={frame.phase}
            node={node}
            mergeLeft={frame.mergeLeft}
            mergeRight={frame.mergeRight}
            mergeStep={frame.mergeStep}
            input={trace.result.input}
            sorted={trace.result.sorted}
            className="lg:col-span-2"
          />
          <ResultCard result={trace.result} done={done} />
        </>
      }
    />
  )
}

// — дрібні презентаційні шматки ----------------------------------------------

const PHASE_STYLES: Record<MsPhase, PhaseStyle> = {
    init: { labelKey: "play.msPhaseInit", cls: "bg-slate-500/15 text-slate-700 dark:text-slate-300" },
    split: { labelKey: "play.msPhaseSplit", cls: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
    base: { labelKey: "play.msPhaseBase", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
    merge: { labelKey: "play.msPhaseMerge", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
    final: { labelKey: "play.msPhaseFinal", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  }

function ResultCard({
  result,
  done,
  className,
}: {
  result: MsResult
  done: boolean
  className?: string
}) {
  const t = useT()
  return (
    <Card className={cn(className, done && "border-emerald-500/50")}>
      <CardContent className="flex flex-col gap-2 py-4 text-sm">
        <div>
          <div className="text-muted-foreground">{t("play.msInputLabel")}</div>
          <div className="font-mono text-xs">[{result.input.join(", ")}]</div>
        </div>
        <div>
          <div className="text-muted-foreground">{t("play.msSortedLabel")}</div>
          <div className="font-mono text-xs">{done ? `[${result.sorted.join(", ")}]` : "…"}</div>
        </div>
        <div className="tabular-nums text-xs">
          {t("play.msResultCounts", {
            comparisons: result.comparisons,
            appends: result.appends,
            merges: result.merges,
            depth: result.depth,
          })}
        </div>
      </CardContent>
    </Card>
  )
}
