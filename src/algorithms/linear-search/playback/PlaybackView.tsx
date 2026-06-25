import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  buildLinearSearchTrace,
  type LsPhase,
  type LsResult,
} from "@/lib/linearSearchTrace"
import { useLinearSearchStore } from "@/store/linear-search-store"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { PlayerShell } from "@/algorithms/shared/playback/PlayerShell"
import { PhaseBadge, type PhaseStyle } from "@/algorithms/shared/playback/PhaseBadge"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { StatsBar, Stat } from "@/algorithms/shared/playback/Stats"
import { LiveComplexity } from "@/algorithms/shared/playback/LiveComplexity"
import { ModeSwitch } from "@/algorithms/shared/playback/ModeSwitch"
import { useTraceRun, TraceFallback } from "@/algorithms/shared/playback/use-trace-run"
import { ScanPanel } from "@/algorithms/linear-search/playback/ScanPanel"
import { ResultVerdict, resultBorderClass } from "@/algorithms/shared/playback/ResultVerdict"
import { useT, useTr } from "@/i18n/use-t"
import { useLangStore } from "@/store/lang-store"
import { cn } from "@/lib/utils"

type Mode = "first" | "all"

// Поріг розміру масиву: кадрів ≈ 2n+2, вище — плеєр стає менш плавним.
const MAX_SIZE = 60

export function PlaybackView() {
  const values = useLinearSearchStore((s) => s.values)
  const target = useLinearSearchStore((s) => s.target)
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr = useTr()
  const [mode, setMode] = useState<Mode>("first")
  const findAll = mode === "all"

  // Сигнатура стабільна щодо мови — курсор плеєра не скидається на UA/EN.
  const sig = `${mode}|${target}|${values.join(",")}`

  const run = useTraceRun(() => buildLinearSearchTrace(values, target, findAll, tr), {
    empty: values.length === 0,
    tooBig: values.length > MAX_SIZE,
    sig,
    lang,
  })

  const frameCount = run.kind === "ok" ? run.trace.frames.length : 1
  const player = usePlayer(frameCount, sig)

  const switcher = (
    <ModeSwitch
      label={t("play.lsMethod")}
      value={mode}
      onChange={setMode}
      options={[
        { key: "first", label: t("play.lsModeFirst") },
        { key: "all", label: t("play.lsModeAll") },
      ]}
    />
  )

  if (run.kind !== "ok") {
    return (
      <TraceFallback
        headerExtra={switcher}
        message={run.kind === "empty" ? t("play.lsEmpty") : t("play.lsTooBig", { max: MAX_SIZE })}
      />
    )
  }

  const { trace } = run
  const index = Math.min(player.index, trace.frames.length - 1)
  const frame = trace.frames[index]
  const done = frame.phase === "done"

  // Межі в одиницях лічильника перевірок: найкраща O(1) = 1 (збіг на першому
  // елементі), найгірша O(n) = n (збіг у кінці або відсутній; режим «усі входження»
  // завжди сканує всі n). Стовпчик показує, куди лягла ЦЯ ціль.
  const n = trace.result.size
  const lcVerdict = done
    ? trace.result.comparisons <= Math.max(1, n * 0.25)
      ? t("play.lsLcVerdictGood")
      : trace.result.comparisons >= n * 0.9
        ? t("play.lsLcVerdictBad")
        : t("play.lsLcVerdictMid")
    : undefined

  return (
    <PlayerShell
      player={player}
      headerExtra={switcher}
      caption={frame.caption}
      captionBadge={<PhaseBadge phase={frame.phase} styles={PHASE_STYLES} />}
      statsBar={
        <>
          <StatsBar>
            <Stat label={t("play.lsStatChecks")} value={String(frame.comparisons)} />
            <Stat
              label={t("play.lsStatResult")}
              value={frame.result >= 0 ? String(frame.result) : "−1"}
            />
            {findAll && (
              <Stat label={t("play.lsStatMatches")} value={String(frame.matches.length)} />
            )}
            <Stat label={t("play.lsStatSize")} value={String(trace.result.size)} />
          </StatsBar>
          <LiveComplexity
            title={t("play.lsLcTitle")}
            n={n}
            unit={t("play.lsLcUnit")}
            actual={frame.comparisons}
            actualLabel={t("play.lsLcActual")}
            reference={{
              value: 1,
              cls: "O(1)",
              name: t("play.lsLcBest"),
              formula: "1",
            }}
            worst={{
              value: n,
              cls: "O(n)",
              name: t("play.lsLcWorst"),
              formula: `n = ${n}`,
            }}
            verdict={lcVerdict}
          />
        </>
      }
      panels={
        <>
          <CodePanel
            code={trace.code}
            title={findAll ? t("play.lsCodeAll") : t("play.lsCodeFirst")}
            activeLines={frame.lines}
            contextLines={frame.contextLines}
            className="min-h-[340px]"
          />
          <ScanPanel
            array={frame.array}
            target={frame.target}
            cursor={frame.cursor}
            checking={frame.phase === "check"}
            matches={frame.matches}
            resolvedTo={frame.resolvedTo}
            className="min-h-[340px] lg:col-span-2"
          />
        </>
      }
      secondRow={<ResultCard result={trace.result} done={done} />}
    />
  )
}

// — дрібні презентаційні шматки ----------------------------------------------

const PHASE_STYLES: Record<LsPhase, PhaseStyle> = {
    init: { labelKey: "play.lsPhaseInit", cls: "bg-slate-500/15 text-slate-700 dark:text-slate-300" },
    check: { labelKey: "play.lsPhaseCheck", cls: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
    reject: { labelKey: "play.lsPhaseReject", cls: "bg-slate-500/15 text-slate-700 dark:text-slate-300" },
    match: { labelKey: "play.lsPhaseMatch", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
    done: { labelKey: "play.lsPhaseDone", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  }

function ResultCard({ result, done }: { result: LsResult; done: boolean }) {
  const t = useT()
  const found = result.found
  return (
    <Card className={cn(resultBorderClass(done, found), "lg:col-span-3")}>
      <CardContent className="flex flex-col gap-2 py-4 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8">
        <div>
          <div className="text-muted-foreground">{t("play.lsInputLabel")}</div>
          <div className="font-mono text-xs">[{result.input.join(", ")}]</div>
        </div>
        <div>
          <div className="text-muted-foreground">{t("play.lsTargetLabel")}</div>
          <div className="font-mono text-xs tabular-nums">{result.target}</div>
        </div>
        <div>
          <div className="text-muted-foreground">{t("play.lsResultLabel")}</div>
          <ResultVerdict
            done={done}
            found={found}
            foundContent={
              result.findAll
                ? t("play.lsResultMatches", { matches: `[${result.matches.join(", ")}]` })
                : t("play.lsResultIndex", { i: result.result })
            }
            absentText={t("play.lsResultAbsent")}
          />
        </div>
        <div className="tabular-nums text-xs">
          {t("play.lsResultChecks", { comparisons: result.comparisons })}
        </div>
      </CardContent>
    </Card>
  )
}
