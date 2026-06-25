import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  buildRabinKarpStringSearchTrace,
  type RkPhase,
  type RkResult,
} from "@/lib/rabinKarpStringSearchTrace"
import { useRabinKarpStringSearchStore } from "@/store/rabin-karp-string-search-store"
import { rabinKarpStringSearchCodec } from "@/algorithms/rabin-karp-string-search/editor/rabin-karp-string-search-doc"
import { usePlaybackDeeplink } from "@/algorithms/shared/playback/use-playback-deeplink"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { PlayerShell } from "@/algorithms/shared/playback/PlayerShell"
import { PhaseBadge, type PhaseStyle } from "@/algorithms/shared/playback/PhaseBadge"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { StatsBar, Stat } from "@/algorithms/shared/playback/Stats"
import { LiveComplexity } from "@/algorithms/shared/playback/LiveComplexity"
import { ModeSwitch } from "@/algorithms/shared/playback/ModeSwitch"
import { HashBuildPanel } from "@/algorithms/rabin-karp-string-search/playback/HashBuildPanel"
import { RkStripPanel } from "@/algorithms/rabin-karp-string-search/playback/RkStripPanel"
import { ResultVerdict, resultBorderClass } from "@/algorithms/shared/playback/ResultVerdict"
import { useT, useTr } from "@/i18n/use-t"
import { useLangStore } from "@/store/lang-store"
import { cn } from "@/lib/utils"

type Mode = "rolling" | "recompute"

// Поріг довжини тексту: стрічка стає завеликою (хоч і прокручується).
const MAX_TEXT = 80

export function PlaybackView() {
  const text = useRabinKarpStringSearchStore((s) => s.text)
  const loadDoc = useRabinKarpStringSearchStore((s) => s.loadDoc)
  const toDoc = useRabinKarpStringSearchStore((s) => s.toDoc)
  const pattern = useRabinKarpStringSearchStore((s) => s.pattern)
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr = useTr()
  const [mode, setMode] = useState<Mode>("rolling")
  const rolling = mode === "rolling"

  const sig = `${mode}|${text}|${pattern}`

  const run = useMemo<Run>(() => {
    if (pattern.length === 0) return { kind: "empty" }
    if (pattern.length > text.length) return { kind: "too-long" }
    if (text.length > MAX_TEXT) return { kind: "too-big" }
    const trace = buildRabinKarpStringSearchTrace(text, pattern, rolling, tr)
    return { kind: "ok", trace }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, lang])

  const frameCount = run.kind === "ok" ? run.trace.frames.length : 1
  const player = usePlayer(frameCount, sig)

  const { shareStep } = usePlaybackDeeplink({
    player,
    codec: rabinKarpStringSearchCodec,
    loadDoc,
    toDoc,
    mode: mode,
    setMode: setMode,
    modeKeys: ["rolling", "recompute"] as const,
    routePath: "rabin-karp-string-search/playback",
  })

  const switcher = (
    <ModeSwitch
      label={t("play.rkMode")}
      value={mode}
      onChange={setMode}
      options={[
        { key: "rolling", label: t("play.rkModeRollingShort") },
        { key: "recompute", label: t("play.rkModeRecomputeShort") },
      ]}
    />
  )

  if (run.kind !== "ok") {
    return (
      <div className="flex flex-col gap-3">
        {switcher}
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {run.kind === "empty"
              ? t("play.rkEmpty")
              : run.kind === "too-long"
                ? t("play.rkTooLong")
                : t("play.rkTooBig", { max: MAX_TEXT })}
          </CardContent>
        </Card>
      </div>
    )
  }

  const { trace } = run
  const index = Math.min(player.index, trace.frames.length - 1)
  const frame = trace.frames[index]
  const done = frame.phase === "done"
  const inHash = frame.panel === "hash"

  // Рабіна–Карпа порівнює ХЕШІ (O(1) за вікно з ковзним хешем) → у середньому O(n+m).
  // Орієнтир — ця межа N+M; права межа — O(n·m), куди штовхають КОЛІЗІЇ (рівний хеш,
  // різні рядки → доперевірка символів). Лічильник — хеш-порівняння + доперевірки.
  const n = text.length
  const m = pattern.length
  const refOps = n + m
  const worstOps = Math.max(0, n - m + 1) * m

  return (
    <PlayerShell
      player={player}
      onShareStep={shareStep}
      headerExtra={switcher}
      caption={frame.caption}
      captionBadge={<PhaseBadge phase={frame.phase} styles={PHASE_STYLES} />}
      statsBar={
        <>
          <StatsBar>
            <Stat label={t("play.rkStatPatternHash")} value={String(frame.patternHash)} />
            <Stat label={t("play.rkStatHashComparisons")} value={String(frame.hashComparisons)} />
            <Stat label={t("play.rkStatCharVerifications")} value={String(frame.charVerifications)} />
            <Stat label={t("play.rkStatCollisions")} value={String(frame.collisions)} />
            <Stat
              label={rolling ? t("play.rkStatRolls") : t("play.rkStatRecomputes")}
              value={String(rolling ? frame.rolls : frame.recomputes)}
            />
            <Stat
              label={t("play.statResult")}
              value={frame.result >= 0 ? String(frame.result) : "−1"}
            />
          </StatsBar>
          <LiveComplexity
            title={t("play.lcTitle")}
            n={n}
            unit={t("play.rkLcUnit")}
            actual={frame.hashComparisons + frame.charVerifications}
            actualLabel={t("play.lcActual")}
            reference={{
              value: refOps,
              cls: "O(n+m)",
              name: t("play.rkLcAvg"),
              formula: `N+M = ${refOps}`,
            }}
            worst={{
              value: worstOps,
              cls: "O(n·m)",
              name: t("play.rkLcWorst"),
              formula: `(N−M+1)·M = ${worstOps}`,
            }}
            verdict={
              done ? t("play.rkLcVerdict", { collisions: trace.result.collisions }) : undefined
            }
          />
        </>
      }
      panels={
        <>
          <CodePanel
            code={inHash ? trace.hashCode : trace.searchCode}
            title={inHash ? t("play.rkCodeHash") : rolling ? t("play.rkCodeRolling") : t("play.rkCodeRecompute")}
            activeLines={frame.lines}
            contextLines={frame.contextLines}
            className="min-h-[320px]"
          />
          {inHash ? (
            <HashBuildPanel
              pattern={frame.pattern}
              base={frame.base}
              modulus={frame.modulus}
              termIndex={frame.hashTermIndex}
              char={frame.hashChar}
              code={frame.hashCode}
              power={frame.hashPower}
              contribution={frame.hashContribution}
              hashValue={frame.hashValue}
              done={frame.phase === "hashDone"}
              className="min-h-[320px] lg:col-span-2"
            />
          ) : (
            <RkStripPanel
              text={frame.text}
              pattern={frame.pattern}
              offset={frame.offset}
              verdict={frame.verdict}
              matched={frame.matched}
              mismatchJ={frame.mismatchJ}
              windowHash={frame.windowHash}
              patternHash={frame.patternHash}
              roll={frame.roll}
              className="min-h-[320px] lg:col-span-2"
            />
          )}
        </>
      }
      secondRow={<ResultCard result={trace.result} done={done} />}
    />
  )
}

type Run =
  | { kind: "empty" }
  | { kind: "too-long" }
  | { kind: "too-big" }
  | { kind: "ok"; trace: ReturnType<typeof buildRabinKarpStringSearchTrace> }

// — дрібні презентаційні шматки ----------------------------------------------

const PHASE_STYLES: Record<RkPhase, PhaseStyle> = {
    hashInit: { labelKey: "play.rkPhaseHash", cls: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
    hashTerm: { labelKey: "play.rkPhaseHash", cls: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
    hashDone: { labelKey: "play.rkPhaseHashDone", cls: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
    searchInit: { labelKey: "play.rkPhaseSearch", cls: "bg-slate-500/15 text-slate-700 dark:text-slate-300" },
    window: { labelKey: "play.rkPhaseWindow", cls: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
    collision: { labelKey: "play.rkPhaseCollision", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
    found: { labelKey: "play.rkPhaseFound", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
    done: { labelKey: "play.rkPhaseDone", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  }

function ResultCard({ result, done }: { result: RkResult; done: boolean }) {
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
              foundContent={t("play.rkResultIndex", { i: result.result })}
              absentText={t("play.rkResultAbsent")}
            />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 tabular-nums text-muted-foreground">
            <span>{t("play.rkResultPatternHash", { hash: result.patternHash })}</span>
            <span>{t("play.rkResultHashComparisons", { hashComparisons: result.hashComparisons })}</span>
            <span>{t("play.rkResultCharVerifications", { charVerifications: result.charVerifications })}</span>
            <span>{t("play.rkResultCollisions", { collisions: result.collisions })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
