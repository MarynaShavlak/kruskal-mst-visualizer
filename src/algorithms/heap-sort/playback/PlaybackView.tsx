import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { buildHeapSortTrace, type HpPhase, type HpFrame, type HpResult } from "@/lib/heapSortTrace"
import { type HeapOrder } from "@/lib/heapSort"
import { useHeapSortStore } from "@/store/heap-sort-store"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { PlayerShell } from "@/algorithms/shared/playback/PlayerShell"
import { PhaseBadge, type PhaseStyle } from "@/algorithms/shared/playback/PhaseBadge"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { StatsBar, Stat } from "@/algorithms/shared/playback/Stats"
import { LiveComplexity } from "@/algorithms/shared/playback/LiveComplexity"
import { ModeSwitch } from "@/algorithms/shared/playback/ModeSwitch"
import { useTraceRun, TraceFallback } from "@/algorithms/shared/playback/use-trace-run"
import { HeapTreePanel } from "@/algorithms/heap-sort/playback/HeapTreePanel"
import { HeapArrayPanel } from "@/algorithms/heap-sort/playback/HeapArrayPanel"
import type { HeapNodeState } from "@/algorithms/heap-sort/playback/highlight"
import { useT, useTr } from "@/i18n/use-t"
import { useLangStore } from "@/store/lang-store"
import { cn } from "@/lib/utils"

// Поріг розміру масиву для плавного плеєра (дерево стає завеликим / широким).
const MAX_SIZE = 16

/** Будує стан підсвітки вузлів із кадру. */
function nodeState(frame: HpFrame): HeapNodeState {
  return {
    heapSize: frame.heapSize,
    siftNode: frame.siftNode,
    compareChild: frame.compareChild,
    swapA: frame.swapA,
    swapB: frame.swapB,
    isExtract: frame.isExtract,
    sortedAll: frame.sortedAll,
  }
}

export function PlaybackView() {
  const values = useHeapSortStore((s) => s.values)
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr = useTr()
  const [order, setOrder] = useState<HeapOrder>("asc")

  const sig = `${order}|${values.join(",")}`

  const run = useTraceRun(() => buildHeapSortTrace(values, order, tr), {
    empty: values.length === 0,
    tooBig: values.length > MAX_SIZE,
    sig,
    lang,
  })

  const frameCount = run.kind === "ok" ? run.trace.frames.length : 1
  const player = usePlayer(frameCount, sig)

  const switcher = (
    <ModeSwitch
      label={t("play.hpOrder")}
      value={order}
      onChange={setOrder}
      options={[
        { key: "asc", label: t("play.hpOrderAsc") },
        { key: "desc", label: t("play.hpOrderDesc") },
      ]}
      wrapButtons
    />
  )

  if (run.kind !== "ok") {
    return (
      <TraceFallback
        headerExtra={switcher}
        message={run.kind === "empty" ? t("play.hpEmpty") : t("play.hpTooBig", { max: MAX_SIZE })}
      />
    )
  }

  const { trace } = run
  const index = Math.min(player.index, trace.frames.length - 1)
  const frame = trace.frames[index]
  const state = nodeState(frame)

  // Ціна Heap Sort — Θ(n·log n) у ВСІХ випадках. Орієнтир — нижня оцінка n·⌊log₂n⌋,
  // права межа — верхня ≈ 2n·⌈log₂n⌉. Фактичне завжди тримається тієї самої смуги,
  // незалежно від даних (на відміну від адаптивних методів) — у цьому й суть.
  const n = trace.result.size
  const logFloor = Math.max(1, Math.floor(Math.log2(Math.max(2, n))))
  const logCeil = Math.max(1, Math.ceil(Math.log2(Math.max(2, n))))
  const refCmp = n * logFloor
  const worstCmp = Math.max(refCmp + 1, 2 * n * logCeil)
  const hpDone = frame.phase === "done"
  const lcVerdict = hpDone ? t("play.hpLcVerdict") : undefined

  return (
    <PlayerShell
      player={player}
      headerExtra={switcher}
      caption={frame.caption}
      captionBadge={<PhaseBadge phase={frame.phase} styles={PHASE_STYLES} />}
      statsBar={
        <>
          <StatsBar>
            <Stat label={t("play.hpStatCmp")} value={String(frame.comparisons)} />
            <Stat label={t("play.hpStatSwaps")} value={String(frame.swaps)} />
            <Stat label={t("play.hpStatHeap")} value={String(frame.sortedAll ? 0 : frame.heapSize)} />
            <Stat label={t("play.statSize")} value={String(trace.result.size)} />
          </StatsBar>
          <LiveComplexity
            title={t("play.lcTitle")}
            n={n}
            unit={t("play.hpLcUnit")}
            actual={frame.comparisons}
            actualLabel={t("play.lcActual")}
            reference={{
              value: refCmp,
              cls: "O(n·log n)",
              name: t("play.hpLcGuarantee"),
              formula: `n·⌊log₂n⌋ = ${refCmp}`,
            }}
            worst={{
              value: worstCmp,
              cls: "O(n·log n)",
              name: t("play.hpLcUpper"),
              formula: `2n·⌈log₂n⌉ = ${worstCmp}`,
            }}
            verdict={lcVerdict}
          />
        </>
      }
      panels={
        <>
          <CodePanel
            code={trace.code}
            title={t("play.hpCodeTitle")}
            activeLines={frame.lines}
            contextLines={frame.contextLines}
            className="min-h-[360px]"
          />
          <HeapTreePanel array={frame.array} state={state} className="min-h-[360px] lg:col-span-2" />
        </>
      }
      secondRow={
        <>
          <HeapArrayPanel array={frame.array} state={state} className="lg:col-span-2" />
          <ResultCard result={trace.result} done={hpDone} />
        </>
      }
    />
  )
}

// — дрібні презентаційні шматки ----------------------------------------------

const PHASE_STYLES: Record<HpPhase, PhaseStyle> = {
  init: { labelKey: "play.hpPhaseInit", cls: "bg-slate-500/15 text-slate-700 dark:text-slate-300" },
  build: { labelKey: "play.hpPhaseBuild", cls: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300" },
  sift: { labelKey: "play.hpPhaseSift", cls: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
  compare: { labelKey: "play.hpPhaseCompare", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  swap: { labelKey: "play.hpPhaseSwap", cls: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
  extract: { labelKey: "play.hpPhaseExtract", cls: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
  done: { labelKey: "play.hpPhaseDone", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
}

function ResultCard({
  result,
  done,
  className,
}: {
  result: HpResult
  done: boolean
  className?: string
}) {
  const t = useT()
  return (
    <Card className={cn(className, done && "border-emerald-500/50")}>
      <CardContent className="flex flex-col gap-2 py-4 text-sm">
        <div>
          <div className="text-muted-foreground">{t("play.inputLabel")}</div>
          <div className="font-mono text-xs">[{result.input.join(", ")}]</div>
        </div>
        <div>
          <div className="text-muted-foreground">{t("play.sortedLabel")}</div>
          <div className="font-mono text-xs">{done ? `[${result.sorted.join(", ")}]` : "…"}</div>
        </div>
        <div className="tabular-nums text-xs">
          {t("play.hpResultCounts", {
            comparisons: result.comparisons,
            swaps: result.swaps,
          })}
        </div>
      </CardContent>
    </Card>
  )
}
