import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { buildBubbleSortTrace, type BsPhase, type BsResult } from "@/lib/bubbleSortTrace"
import { useBubbleSortStore } from "@/store/bubble-sort-store"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { PlayerShell } from "@/algorithms/shared/playback/PlayerShell"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { StatsBar, Stat } from "@/algorithms/shared/playback/Stats"
import { LiveComplexity } from "@/algorithms/shared/playback/LiveComplexity"
import { ModeSwitch } from "@/algorithms/shared/playback/ModeSwitch"
import { useTraceRun, TraceFallback } from "@/algorithms/shared/playback/use-trace-run"
import { ArrayBarsPanel } from "@/algorithms/bubble-sort/playback/ArrayBarsPanel"
import { useT, useTr } from "@/i18n/use-t"
import { useLangStore } from "@/store/lang-store"
import { cn } from "@/lib/utils"

type Mode = "naive" | "optimized"

// Поріг розміру масиву: кадрів ≈ n²/2, вище — плеєр стає неплавним (редактор
// попереджає вже від 40).
const MAX_SIZE = 80

export function PlaybackView() {
  const values = useBubbleSortStore((s) => s.values)
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr = useTr()
  const [mode, setMode] = useState<Mode>("naive")
  const optimized = mode === "optimized"

  // Сигнатура стабільна щодо мови — курсор плеєра не скидається на UA/EN.
  const sig = `${mode}|${values.join(",")}`

  const run = useTraceRun(() => buildBubbleSortTrace(values, optimized, tr), {
    empty: values.length === 0,
    tooBig: values.length > MAX_SIZE,
    sig,
    lang,
  })

  const frameCount = run.kind === "ok" ? run.trace.frames.length : 1
  const player = usePlayer(frameCount, sig)

  const switcher = (
    <ModeSwitch
      label={t("play.bsMethod")}
      value={mode}
      onChange={setMode}
      options={[
        { key: "naive", label: t("play.bsModeNaive") },
        { key: "optimized", label: t("play.bsModeOptimized") },
      ]}
    />
  )

  if (run.kind !== "ok") {
    return (
      <TraceFallback
        headerExtra={switcher}
        message={run.kind === "empty" ? t("play.bsEmpty") : t("play.bsTooBig", { max: MAX_SIZE })}
      />
    )
  }

  const { trace } = run
  const index = Math.min(player.index, trace.frames.length - 1)
  const frame = trace.frames[index]
  const done = frame.phase === "done"

  // Межі в одиницях лічильника comparisons: найгірша = n(n−1)/2 (повний квадрат,
  // який завжди робить наївна), найкраща = n−1 (один прохід без обмінів — рання
  // зупинка на вже впорядкованому масиві).
  const n = trace.result.size
  const worstCmp = trace.result.maxComparisons
  const bestCmp = Math.max(0, n - 1)

  return (
    <PlayerShell
      player={player}
      headerExtra={switcher}
      caption={frame.caption}
      captionBadge={<PhaseBadge phase={frame.phase} />}
      statsBar={
        <>
          <StatsBar>
            <Stat label={t("play.bsStatComparisons")} value={String(frame.comparisons)} />
            <Stat label={t("play.bsStatSwaps")} value={String(frame.swaps)} />
            <Stat
              label={t("play.bsStatPass")}
              value={frame.pass !== null ? String(frame.pass) : "—"}
            />
            <Stat label={t("play.bsStatSize")} value={String(trace.result.size)} />
          </StatsBar>
          <LiveComplexity
            title={t("play.bsLcTitle")}
            n={n}
            unit={t("play.bsLcUnit")}
            actual={frame.comparisons}
            actualLabel={t("play.bsLcActual")}
            reference={{
              value: bestCmp,
              cls: "O(n)",
              name: t("play.bsLcBest"),
              formula: `n−1 = ${bestCmp}`,
            }}
            worst={{
              value: worstCmp,
              cls: "O(n²)",
              name: t("play.bsLcWorst"),
              formula: `n(n−1)/2 = ${worstCmp}`,
            }}
            verdict={
              done ? (
                <BsLcVerdict
                  actual={trace.result.comparisons}
                  best={bestCmp}
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
            title={optimized ? t("play.codeBsOptimized") : t("play.codeBsNaive")}
            activeLines={frame.lines}
            contextLines={frame.contextLines}
            className="min-h-[320px]"
          />
          <ArrayBarsPanel
            array={frame.array}
            pair={frame.pair}
            swapped={frame.swapped}
            sortedFrom={frame.sortedFrom}
            className="min-h-[320px] lg:col-span-2"
          />
        </>
      }
      secondRow={<ResultCard result={trace.result} done={done} className="lg:col-span-3" />}
    />
  )
}

// — дрібні презентаційні шматки ----------------------------------------------

/** Вердикт «живої складності» бульбашки: куди лягла фактична ціна для цього входу. */
function BsLcVerdict({
  actual,
  best,
  worst,
}: {
  actual: number
  best: number
  worst: number
}) {
  const t = useT()
  const msg =
    actual <= best * 1.3
      ? t("play.bsLcVerdictGood")
      : actual >= worst * 0.95
        ? t("play.bsLcVerdictBad")
        : t("play.bsLcVerdictMid")
  return <span>{msg}</span>
}

function PhaseBadge({ phase }: { phase: BsPhase }) {
  const t = useT()
  const map = {
    scan: { text: t("play.bsPhaseScan"), cls: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
    pass: { text: t("play.bsPhasePass"), cls: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
    done: { text: t("play.bsPhaseDone"), cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  }
  const b = map[phase]
  return (
    <span className={cn("ml-2 inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium", b.cls)}>
      {b.text}
    </span>
  )
}

function ResultCard({
  result,
  done,
  className,
}: {
  result: BsResult
  done: boolean
  className?: string
}) {
  const t = useT()
  const saved = result.maxComparisons - result.comparisons
  return (
    <Card className={cn(className, done && "border-emerald-500/50")}>
      <CardContent className="flex flex-wrap items-center gap-x-8 gap-y-2 py-4 text-sm">
        <div>
          <div className="text-muted-foreground">{t("play.bsInputLabel")}</div>
          <div className="font-mono">[{result.input.join(", ")}]</div>
        </div>
        <div>
          <div className="text-muted-foreground">{t("play.bsSortedLabel")}</div>
          <div className="font-mono">{done ? `[${result.sorted.join(", ")}]` : "…"}</div>
        </div>
        <div>
          <div className="text-muted-foreground">{t("play.bsResultSummary")}</div>
          <div className="tabular-nums">
            {t("play.bsResultCounts", {
              comparisons: result.comparisons,
              swaps: result.swaps,
              passes: result.passes,
            })}
          </div>
        </div>
        {result.optimized && done && saved > 0 && (
          <div className="rounded-md bg-emerald-500/10 px-2 py-1.5 text-xs text-emerald-700 dark:text-emerald-300">
            {t("play.bsSaved", { saved, max: result.maxComparisons })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
