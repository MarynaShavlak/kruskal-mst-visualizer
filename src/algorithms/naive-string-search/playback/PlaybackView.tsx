import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  buildNaiveStringSearchTrace,
  type NaivePhase,
  type NaiveResult,
} from "@/lib/naiveStringSearchTrace"
import { useNaiveStringSearchStore } from "@/store/naive-string-search-store"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { PlayerShell } from "@/algorithms/shared/playback/PlayerShell"
import { PhaseBadge, type PhaseStyle } from "@/algorithms/shared/playback/PhaseBadge"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { StatsBar, Stat } from "@/algorithms/shared/playback/Stats"
import { LiveComplexity } from "@/algorithms/shared/playback/LiveComplexity"
import { ModeSwitch } from "@/algorithms/shared/playback/ModeSwitch"
import { useTraceRun, TraceFallback } from "@/algorithms/shared/playback/use-trace-run"
import { StripPanel } from "@/algorithms/naive-string-search/playback/StripPanel"
import { ResultVerdict, resultBorderClass } from "@/algorithms/shared/playback/ResultVerdict"
import { useT, useTr } from "@/i18n/use-t"
import { useLangStore } from "@/store/lang-store"
import { cn } from "@/lib/utils"

type Mode = "first" | "all"

// Поріг довжини тексту: стрічка стає завеликою (хоч і прокручується).
const MAX_TEXT = 80

export function PlaybackView() {
  const text = useNaiveStringSearchStore((s) => s.text)
  const pattern = useNaiveStringSearchStore((s) => s.pattern)
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr = useTr()
  const [mode, setMode] = useState<Mode>("first")
  const findAll = mode === "all"

  const sig = `${mode}|${text}|${pattern}`

  const run = useTraceRun(() => buildNaiveStringSearchTrace(text, pattern, findAll, tr), {
    empty: pattern.length === 0,
    tooBig: text.length > MAX_TEXT,
    sig,
    lang,
  })

  const frameCount = run.kind === "ok" ? run.trace.frames.length : 1
  const player = usePlayer(frameCount, sig)

  const switcher = (
    <ModeSwitch
      label={t("play.nssMode")}
      value={mode}
      onChange={setMode}
      options={[
        { key: "first", label: t("play.nssModeFirst") },
        { key: "all", label: t("play.nssModeAll") },
      ]}
    />
  )

  if (run.kind !== "ok") {
    return (
      <TraceFallback
        headerExtra={switcher}
        message={run.kind === "empty" ? t("play.nssEmpty") : t("play.nssTooBig", { max: MAX_TEXT })}
      />
    )
  }

  const { trace } = run
  const index = Math.min(player.index, trace.frames.length - 1)
  const frame = trace.frames[index]
  const done = frame.phase === "done"

  // Межі в одиницях порівнянь символів: найкраща ≈ N−M+1 вирівнювань (швидка
  // розбіжність на першому символі щоразу), найгірша (N−M+1)·M (повний префікс
  // матчиться, далі розбіжність — марна повторна робота, місток до KMP).
  const n = text.length
  const m = pattern.length
  const bestC = Math.max(0, n - m + 1)
  const worstC = bestC * m
  const lcVerdict = done
    ? trace.result.comparisons <= Math.max(1, bestC * 1.5)
      ? t("play.nssLcVerdictGood")
      : trace.result.comparisons >= worstC * 0.7
        ? t("play.nssLcVerdictBad")
        : t("play.nssLcVerdictMid")
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
            <Stat label={t("play.nssStatComparisons")} value={String(frame.comparisons)} />
            <Stat label={t("play.nssStatAlignments")} value={String(frame.alignments)} />
            <Stat label={t("play.nssStatShifts")} value={String(frame.shifts)} />
            {findAll ? (
              <Stat label={t("play.nssStatMatches")} value={String(frame.matches.length)} />
            ) : (
              <Stat
                label={t("play.statResult")}
                value={frame.result >= 0 ? String(frame.result) : "−1"}
              />
            )}
            <Stat label={t("play.strStatLen")} value={`${text.length}/${pattern.length}`} />
          </StatsBar>
          <LiveComplexity
            title={t("play.lcTitle")}
            n={n}
            unit={t("play.nssLcUnit")}
            actual={frame.comparisons}
            actualLabel={t("play.lcActual")}
            reference={{
              value: bestC,
              cls: "O(n)",
              name: t("play.nssLcBest"),
              formula: `N−M+1 = ${bestC}`,
            }}
            worst={{
              value: worstC,
              cls: "O(n·m)",
              name: t("play.nssLcWorst"),
              formula: `(N−M+1)·M = ${worstC}`,
            }}
            verdict={lcVerdict}
          />
        </>
      }
      panels={
        <>
          <CodePanel
            code={trace.code}
            title={findAll ? t("play.nssCodeAll") : t("play.nssCodeFirst")}
            activeLines={frame.lines}
            contextLines={frame.contextLines}
            className="min-h-[320px]"
          />
          <StripPanel
            text={frame.text}
            pattern={frame.pattern}
            offset={frame.offset}
            matched={frame.matched}
            mismatchJ={frame.mismatchJ}
            className="min-h-[320px] lg:col-span-2"
          />
        </>
      }
      secondRow={<ResultCard result={trace.result} done={done} />}
    />
  )
}

// — дрібні презентаційні шматки ----------------------------------------------

const PHASE_STYLES: Record<NaivePhase, PhaseStyle> = {
    init: { labelKey: "play.nssPhaseInit", cls: "bg-slate-500/15 text-slate-700 dark:text-slate-300" },
    align: { labelKey: "play.nssPhaseAlign", cls: "bg-red-500/15 text-red-700 dark:text-red-300" },
    found: { labelKey: "play.nssPhaseFound", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
    done: { labelKey: "play.nssPhaseDone", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  }

function ResultCard({ result, done }: { result: NaiveResult; done: boolean }) {
  const t = useT()
  const found = result.found
  return (
    <Card className={cn("lg:col-span-3", resultBorderClass(done, found))}>
      <CardContent className="flex flex-col gap-2 py-4 text-sm">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <div>
            <div className="text-muted-foreground">{t("play.resultLabel")}</div>
            <ResultVerdict
              done={done}
              found={found}
              foundContent={
                result.findAll
                  ? t("play.nssResultAll", { list: result.matches.join(", "), count: result.matches.length })
                  : t("play.nssResultIndex", { i: result.result })
              }
              absentText={t("play.nssResultAbsent")}
            />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 tabular-nums text-muted-foreground">
            <span>{t("play.nssResultComparisons", { comparisons: result.comparisons })}</span>
            <span>{t("play.nssResultAlignments", { alignments: result.alignments })}</span>
            <span>{t("play.nssResultShifts", { shifts: result.shifts })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
