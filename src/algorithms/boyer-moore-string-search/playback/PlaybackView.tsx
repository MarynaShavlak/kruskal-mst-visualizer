import { Card, CardContent } from "@/components/ui/card"
import {
  buildBoyerMooreStringSearchTrace,
  type BmPhase,
  type BmResult,
} from "@/lib/boyerMooreStringSearchTrace"
import { useBoyerMooreStringSearchStore } from "@/store/boyer-moore-string-search-store"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { PlayerShell } from "@/algorithms/shared/playback/PlayerShell"
import { PhaseBadge, type PhaseStyle } from "@/algorithms/shared/playback/PhaseBadge"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { StatsBar, Stat } from "@/algorithms/shared/playback/Stats"
import { LiveComplexity } from "@/algorithms/shared/playback/LiveComplexity"
import { useTraceRun, TraceFallback } from "@/algorithms/shared/playback/use-trace-run"
import { ShiftTablePanel } from "@/algorithms/boyer-moore-string-search/playback/ShiftTablePanel"
import { BmStripPanel } from "@/algorithms/boyer-moore-string-search/playback/BmStripPanel"
import { ResultVerdict, resultBorderClass } from "@/algorithms/shared/playback/ResultVerdict"
import { useT, useTr } from "@/i18n/use-t"
import { useLangStore } from "@/store/lang-store"
import { cn } from "@/lib/utils"

// Поріг довжини тексту: стрічка стає завеликою (хоч і прокручується).
const MAX_TEXT = 80

export function PlaybackView() {
  const text = useBoyerMooreStringSearchStore((s) => s.text)
  const pattern = useBoyerMooreStringSearchStore((s) => s.pattern)
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr = useTr()

  const sig = `${text}|${pattern}`

  const run = useTraceRun(() => buildBoyerMooreStringSearchTrace(text, pattern, tr), {
    empty: pattern.length === 0,
    tooBig: text.length > MAX_TEXT,
    sig,
    lang,
  })

  const frameCount = run.kind === "ok" ? run.trace.frames.length : 1
  const player = usePlayer(frameCount, sig)

  if (run.kind !== "ok") {
    return (
      <TraceFallback
        message={run.kind === "empty" ? t("play.bmEmpty") : t("play.bmTooBig", { max: MAX_TEXT })}
      />
    )
  }

  const { trace } = run
  const index = Math.min(player.index, trace.frames.length - 1)
  const frame = trace.frames[index]
  const done = frame.step === "done"
  const isTable = frame.phase === "table"

  // Боєра–Мура часто СУБЛІНІЙНИЙ: стрибки за таблицею поганого символу пропускають
  // символи тексту зовсім → менше за n порівнянь. Орієнтир — лінійний рівень n
  // (наївний оглядає ~n); права межа — O(n·m) на повторюваному шаблоні.
  const n = text.length
  const m = pattern.length
  const worstC = Math.max(0, n - m + 1) * m
  const lcVerdict = done
    ? trace.result.comparisons <= n
      ? t("play.bmLcVerdictGood")
      : trace.result.comparisons >= worstC * 0.7
        ? t("play.bmLcVerdictBad")
        : t("play.bmLcVerdictMid")
    : undefined

  const codePanel = (
    <CodePanel
      code={isTable ? trace.tableCode : trace.searchCode}
      title={isTable ? t("play.bmCodeTable") : t("play.bmCodeSearch")}
      activeLines={frame.lines}
      contextLines={frame.contextLines}
      className="min-h-[320px]"
    />
  )

  const dataPanel = isTable ? (
    <ShiftTablePanel
      pattern={frame.pattern}
      table={frame.table}
      activeChar={frame.tableChar}
      activeIndex={frame.tableIndex}
      overwrite={frame.overwrite}
      prevShift={frame.prevShift}
      className="min-h-[320px] lg:col-span-2"
    />
  ) : (
    <BmStripPanel
      text={frame.text}
      pattern={frame.pattern}
      offset={frame.offset}
      j={frame.j}
      matchedSuffix={frame.matchedSuffix}
      mismatch={frame.compareMatch === false}
      full={frame.full}
      skippedNow={frame.skippedNow}
      className="min-h-[320px] lg:col-span-2"
    />
  )

  return (
    <PlayerShell
      player={player}
      caption={frame.caption}
      captionBadge={<PhaseBadge phase={frame.phase} styles={PHASE_STYLES} />}
      statsBar={
        <>
          <StatsBar>
            <Stat label={t("play.bmStatPhase")} value={isTable ? t("play.bmPhaseTableShort") : t("play.bmPhaseSearchShort")} />
            <Stat label={t("play.bmStatComparisons")} value={String(frame.comparisons)} />
            <Stat label={t("play.bmStatJumps")} value={String(frame.jumps)} />
            <Stat label={t("play.bmStatSkipped")} value={String(frame.skipped)} />
            <Stat label={t("play.bmStatResult")} value={frame.result >= 0 ? String(frame.result) : "−1"} />
            <Stat label={t("play.bmStatLen")} value={`${text.length}/${pattern.length}`} />
          </StatsBar>
          <LiveComplexity
            title={t("play.bmLcTitle")}
            n={n}
            unit={t("play.bmLcUnit")}
            actual={frame.comparisons}
            actualLabel={t("play.bmLcActual")}
            reference={{
              value: n,
              cls: "O(n)",
              name: t("play.bmLcLinear"),
              formula: `n = ${n}`,
            }}
            worst={{
              value: worstC,
              cls: "O(n·m)",
              name: t("play.bmLcWorst"),
              formula: `(N−M+1)·M = ${worstC}`,
            }}
            verdict={lcVerdict}
          />
        </>
      }
      panels={
        <>
          {codePanel}
          {dataPanel}
        </>
      }
      secondRow={<ResultCard result={trace.result} done={done} />}
    />
  )
}

// — дрібні презентаційні шматки ----------------------------------------------

const PHASE_STYLES: Record<BmPhase, PhaseStyle> = {
    table: { labelKey: "play.bmPhaseTable", cls: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
    search: { labelKey: "play.bmPhaseSearch", cls: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
  }

function ResultCard({ result, done }: { result: BmResult; done: boolean }) {
  const t = useT()
  const found = result.found
  return (
    <Card className={cn("lg:col-span-3", resultBorderClass(done, found))}>
      <CardContent className="flex flex-col gap-2 py-4 text-sm">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <div>
            <div className="text-muted-foreground">{t("play.bmResultLabel")}</div>
            <ResultVerdict
              done={done}
              found={found}
              foundContent={t("play.bmResultIndex", { i: result.result })}
              absentText={t("play.bmResultAbsent")}
            />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 tabular-nums text-muted-foreground">
            <span>{t("play.bmResultComparisons", { comparisons: result.comparisons })}</span>
            <span>{t("play.bmResultJumps", { jumps: result.jumps })}</span>
            <span>{t("play.bmResultSkipped", { skipped: result.skipped })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
