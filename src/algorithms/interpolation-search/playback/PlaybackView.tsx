import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import {
  buildInterpolationSearchTrace,
  type IpPhase,
  type IpResult,
} from "@/lib/interpolationSearchTrace"
import { isSorted, countBinaryProbes } from "@/lib/interpolationSearch"
import { useInterpolationSearchStore } from "@/store/interpolation-search-store"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { PlayerShell } from "@/algorithms/shared/playback/PlayerShell"
import { PhaseBadge, type PhaseStyle } from "@/algorithms/shared/playback/PhaseBadge"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { StatsBar, Stat } from "@/algorithms/shared/playback/Stats"
import { LiveComplexity } from "@/algorithms/shared/playback/LiveComplexity"
import { ModeSwitch } from "@/algorithms/shared/playback/ModeSwitch"
import { useTraceRun, TraceFallback } from "@/algorithms/shared/playback/use-trace-run"
import { WindowPanel } from "@/algorithms/interpolation-search/playback/WindowPanel"
import { LineModelPanel } from "@/algorithms/interpolation-search/playback/LineModelPanel"
import { ResultVerdict, resultBorderClass } from "@/algorithms/shared/playback/ResultVerdict"
import { useT, useTr } from "@/i18n/use-t"
import { useLangStore } from "@/store/lang-store"
import { cn } from "@/lib/utils"

type Mode = "iterative" | "recursive"

// Поріг розміру масиву: проб мало, але вікно/пряма стають вузькими.
const MAX_SIZE = 64

export function PlaybackView() {
  const values = useInterpolationSearchStore((s) => s.values)
  const target = useInterpolationSearchStore((s) => s.target)
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr = useTr()
  const [mode, setMode] = useState<Mode>("iterative")
  const recursive = mode === "recursive"

  const sorted = isSorted(values)
  const sig = `${mode}|${target}|${values.join(",")}`

  const run = useTraceRun(() => buildInterpolationSearchTrace(values, target, recursive, tr), {
    empty: values.length === 0,
    tooBig: values.length > MAX_SIZE,
    sig,
    lang,
  })

  const frameCount = run.kind === "ok" ? run.trace.frames.length : 1
  const player = usePlayer(frameCount, sig)

  const switcher = (
    <ModeSwitch
      label={t("play.ipMethod")}
      value={mode}
      onChange={setMode}
      options={[
        { key: "iterative", label: t("play.ipModeIterative") },
        { key: "recursive", label: t("play.ipModeRecursive") },
      ]}
    />
  )

  if (run.kind !== "ok") {
    return (
      <TraceFallback
        headerExtra={switcher}
        message={run.kind === "empty" ? t("play.ipEmpty") : t("play.ipTooBig", { max: MAX_SIZE })}
      />
    )
  }

  const { trace } = run
  const index = Math.min(player.index, trace.frames.length - 1)
  const frame = trace.frames[index]
  const done = frame.phase === "done"
  const resolved = frame.phase === "found" || frame.phase === "done"

  // Інтерполяційний: орієнтир — O(log log n) на РІВНОМІРНИХ даних (часто 1–2 проби
  // незалежно від n), права межа — O(n) на СКУПЧЕНИХ (один викид збиває «пряму» →
  // деградація до лінійного, гірше за двійковий).
  const n = trace.result.size
  const llBound = n >= 4 ? Math.max(1, Math.ceil(Math.log2(Math.log2(n))) + 1) : 1
  const lcVerdict = done
    ? trace.result.probes <= llBound
      ? t("play.ipLcVerdictGood")
      : trace.result.probes >= n * 0.6
        ? t("play.ipLcVerdictBad")
        : t("play.ipLcVerdictMid")
    : undefined

  return (
    <PlayerShell
      player={player}
      headerExtra={
        <div className="flex flex-col gap-2">
          {switcher}
          {!sorted && (
            <div className="flex items-start gap-1.5 rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              {t("play.ipUnsorted")}
            </div>
          )}
        </div>
      }
      caption={frame.caption}
      captionBadge={<PhaseBadge phase={frame.phase} styles={PHASE_STYLES} />}
      statsBar={
        <>
          <StatsBar>
            <Stat label={t("play.ipStatProbes")} value={String(frame.probes)} />
            <Stat
              label={t("play.statResult")}
              value={frame.result >= 0 ? String(frame.result) : "−1"}
            />
            <Stat label={t("play.ipStatWindow")} value={windowLabel(frame)} />
            {frame.frac != null && (
              <Stat label={t("play.ipStatFrac")} value={`${Math.round(frame.frac * 100)}%`} />
            )}
            {recursive && (
              <Stat label={t("play.ipStatDepth")} value={String(frame.depth)} />
            )}
            <Stat label={t("play.statSize")} value={String(trace.result.size)} />
          </StatsBar>
          <LiveComplexity
            title={t("play.lcTitle")}
            n={n}
            unit={t("play.ipLcUnit")}
            actual={frame.probes}
            actualLabel={t("play.lcActual")}
            reference={{
              value: llBound,
              cls: "O(log log n)",
              name: t("play.ipLcUniform"),
              formula: `≈log₂log₂n = ${llBound}`,
            }}
            worst={{
              value: n,
              cls: "O(n)",
              name: t("play.ipLcClustered"),
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
            title={recursive ? t("play.ipCodeRecursive") : t("play.ipCodeIterative")}
            activeLines={frame.lines}
            contextLines={frame.contextLines}
            className="min-h-[340px]"
          />
          <WindowPanel
            array={frame.array}
            target={frame.target}
            low={frame.low}
            high={frame.high}
            index={frame.index}
            probing={frame.phase === "probe"}
            discardLo={frame.discardLo}
            discardHi={frame.discardHi}
            result={frame.result}
            resolved={resolved}
            className="min-h-[340px] lg:col-span-2"
          />
        </>
      }
      secondRow={
        <>
          <LineModelPanel
            array={frame.array}
            target={frame.target}
            lineLow={frame.lineLow}
            lineHigh={frame.lineHigh}
            loVal={frame.loVal}
            hiVal={frame.hiVal}
            index={frame.index}
            probing={frame.phase === "probe"}
            result={frame.result}
            resolved={resolved}
            className="min-h-[300px] lg:col-span-2"
          />
          <ResultCard result={trace.result} done={done} />
        </>
      }
    />
  )
}

const windowLabel = (f: { low: number; high: number }): string =>
  f.low <= f.high ? `[${f.low}..${f.high}]` : "∅"

// — дрібні презентаційні шматки ----------------------------------------------

const PHASE_STYLES: Record<IpPhase, PhaseStyle> = {
    init: { labelKey: "play.ipPhaseInit", cls: "bg-slate-500/15 text-slate-700 dark:text-slate-300" },
    probe: { labelKey: "play.ipPhaseProbe", cls: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
    discard: { labelKey: "play.ipPhaseDiscard", cls: "bg-red-500/15 text-red-700 dark:text-red-300" },
    found: { labelKey: "play.ipPhaseFound", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
    done: { labelKey: "play.ipPhaseDone", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  }

function ResultCard({ result, done }: { result: IpResult; done: boolean }) {
  const t = useT()
  const found = result.found
  const binProbes = countBinaryProbes(result.input, result.target)
  return (
    <Card className={cn(resultBorderClass(done, found))}>
      <CardContent className="flex flex-col gap-2 py-4 text-sm">
        <div>
          <div className="text-muted-foreground">{t("play.resultLabel")}</div>
          <ResultVerdict
            done={done}
            found={found}
            foundContent={t("play.searchResultIndex", { i: result.result })}
            absentText={t("play.ipResultAbsent")}
          />
        </div>
        {/* Контраст: формула проти середини на цьому ж масиві. */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 tabular-nums">
          <span className="text-violet-600 dark:text-violet-400">
            {t("play.ipResultProbes", { probes: result.probes })}
          </span>
          <span className="text-sky-600 dark:text-sky-400">
            {t("play.ipResultBinary", { probes: binProbes })}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
