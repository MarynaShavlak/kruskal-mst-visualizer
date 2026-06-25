import { Card, CardContent } from "@/components/ui/card"
import {
  buildRadixSortTrace,
  type RxPhase,
  type RxResult,
} from "@/lib/radixSortTrace"
import { useRadixSortStore } from "@/store/radix-sort-store"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { PlayerShell } from "@/algorithms/shared/playback/PlayerShell"
import { PhaseBadge, type PhaseStyle } from "@/algorithms/shared/playback/PhaseBadge"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { StatsBar, Stat } from "@/algorithms/shared/playback/Stats"
import { LiveComplexity } from "@/algorithms/shared/playback/LiveComplexity"
import { useTraceRun, TraceFallback } from "@/algorithms/shared/playback/use-trace-run"
import { BucketsPanel } from "@/algorithms/radix-sort/playback/BucketsPanel"
import { useT, useTr } from "@/i18n/use-t"
import { useLangStore } from "@/store/lang-store"
import { cn } from "@/lib/utils"

// Поріг розміру масиву для плавного плеєра (редактор попереджає вже від 12).
const MAX_SIZE = 12

export function PlaybackView() {
  const values = useRadixSortStore((s) => s.values)
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr = useTr()

  const sig = values.join(",")

  const run = useTraceRun(() => buildRadixSortTrace(values, tr), {
    empty: values.length === 0,
    tooBig: values.length > MAX_SIZE,
    sig,
    lang,
  })

  const frameCount = run.kind === "ok" ? run.trace.frames.length : 1
  const player = usePlayer(frameCount, sig)

  if (run.kind !== "ok") {
    return (
      <TraceFallback
        message={run.kind === "empty" ? t("play.rxEmpty") : t("play.rxTooBig", { max: MAX_SIZE })}
      />
    )
  }

  const { trace } = run
  const index = Math.min(player.index, trace.frames.length - 1)
  const frame = trace.frames[index]

  // Порозрядне — НЕПОРІВНЯЛЬНЕ: 0 порівнянь, лише d·n розкладань по кошиках (лінійно).
  // Орієнтир — ця лінійна ціна d·n; права межа — O(n²) порівнянь ПОРІВНЯЛЬНИХ сортувань.
  // Radix виграє, НЕ порівнюючи (поки d мале відносно log n).
  const n = trace.result.size
  const d = trace.result.maxDigits
  const refCmp = d * n
  // Права межа — точне n(n−1)/2 порівнянь, які платять ПОРІВНЯЛЬНІ сортування. Radix
  // (d·n розкладань) виграє, поки d·n < n(n−1)/2; за великого d може й програти —
  // стовпчик чесно вийде за мітку.
  const worstCmp = (n * (n - 1)) / 2

  return (
    <PlayerShell
      player={player}
      caption={frame.caption}
      captionBadge={<PhaseBadge phase={frame.phase} styles={PHASE_STYLES} />}
      statsBar={
        <>
          <StatsBar>
            <Stat label={t("play.rxStatPasses")} value={String(frame.passes)} />
            <Stat label={t("play.rxStatDistributions")} value={String(frame.distributions)} />
            <Stat label={t("play.rxStatComparisons")} value="0" />
            <Stat label={t("play.rxStatDigits")} value={String(trace.result.maxDigits)} />
            <Stat label={t("play.rxStatSize")} value={String(trace.result.size)} />
          </StatsBar>
          <LiveComplexity
            title={t("play.lcTitle")}
            n={n}
            unit={t("play.rxLcUnit")}
            actual={frame.distributions}
            actualLabel={t("play.lcActual")}
            reference={{
              value: refCmp,
              cls: "O(d·n)",
              name: t("play.rxLcLinear"),
              formula: `d·n = ${refCmp}`,
            }}
            worst={{
              value: worstCmp,
              cls: "O(n²)",
              name: t("play.rxLcCompare"),
              formula: `n(n−1)/2 = ${worstCmp}`,
            }}
            verdict={frame.phase === "done" ? t("play.rxLcVerdict", { d }) : undefined}
          />
        </>
      }
      panels={
        <>
          <CodePanel
            code={trace.code}
            title={t("play.rxCodeTitle")}
            activeLines={frame.lines}
            contextLines={frame.contextLines}
            className="min-h-[360px]"
          />
          <BucketsPanel
            array={frame.array}
            buckets={frame.buckets}
            digitIndex={frame.digitIndex}
            maxDigits={frame.maxDigits}
            activeIndex={frame.activeIndex}
            activeBucket={frame.activeBucket}
            gathered={frame.gathered}
            position={frame.position}
            className="min-h-[360px] lg:col-span-2"
          />
        </>
      }
      secondRow={<ResultCard result={trace.result} done={frame.phase === "done"} />}
    />
  )
}

// — дрібні презентаційні шматки ----------------------------------------------

const PHASE_STYLES: Record<RxPhase, PhaseStyle> = {
    init: { labelKey: "play.rxPhaseInit", cls: "bg-slate-500/15 text-slate-700 dark:text-slate-300" },
    pass: { labelKey: "play.rxPhasePass", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
    distribute: { labelKey: "play.rxPhaseDistribute", cls: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
    gather: { labelKey: "play.rxPhaseGather", cls: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
    done: { labelKey: "play.rxPhaseDone", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  }

function ResultCard({
  result,
  done,
  className,
}: {
  result: RxResult
  done: boolean
  className?: string
}) {
  const t = useT()
  return (
    <Card className={cn(className, done && "border-emerald-500/50", "lg:col-span-3")}>
      <CardContent className="flex flex-col gap-2 py-4 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8">
        <div>
          <div className="text-muted-foreground">{t("play.rxInputLabel")}</div>
          <div className="font-mono text-xs">[{result.input.join(", ")}]</div>
        </div>
        <div>
          <div className="text-muted-foreground">{t("play.rxSortedLabel")}</div>
          <div className="font-mono text-xs">{done ? `[${result.sorted.join(", ")}]` : "…"}</div>
        </div>
        <div className="tabular-nums text-xs">
          {t("play.rxResultCounts", {
            passes: result.passes,
            distributions: result.distributions,
          })}
        </div>
      </CardContent>
    </Card>
  )
}
