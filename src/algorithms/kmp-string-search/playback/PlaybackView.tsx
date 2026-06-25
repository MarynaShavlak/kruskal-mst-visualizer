import { Card, CardContent } from "@/components/ui/card"
import {
  buildKmpStringSearchTrace,
  type KmpFrame,
  type KmpPhase,
  type KmpResult,
} from "@/lib/kmpStringSearchTrace"
import { useKmpStringSearchStore } from "@/store/kmp-string-search-store"
import { kmpStringSearchCodec } from "@/algorithms/kmp-string-search/editor/kmp-string-search-doc"
import { usePlaybackDeeplink } from "@/algorithms/shared/playback/use-playback-deeplink"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { PlayerShell } from "@/algorithms/shared/playback/PlayerShell"
import { PhaseBadge, type PhaseStyle } from "@/algorithms/shared/playback/PhaseBadge"
import { PhaseDiffRow } from "@/algorithms/shared/playback/PhaseDiffRow"
import { usePhaseMarkers, usePhaseDiff } from "@/algorithms/shared/playback/use-phase-markers"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { StatsBar, Stat } from "@/algorithms/shared/playback/Stats"
import { LiveComplexity } from "@/algorithms/shared/playback/LiveComplexity"
import { useTraceRun, TraceFallback } from "@/algorithms/shared/playback/use-trace-run"
import { LpsTablePanel } from "@/algorithms/kmp-string-search/playback/LpsTablePanel"
import { KmpStripPanel } from "@/algorithms/kmp-string-search/playback/KmpStripPanel"
import { ResultVerdict, resultBorderClass } from "@/algorithms/shared/playback/ResultVerdict"
import { useT, useTr } from "@/i18n/use-t"
import { useLangStore } from "@/store/lang-store"
import { cn } from "@/lib/utils"

// Поріг довжини тексту: стрічка стає завеликою (хоч і прокручується).
const MAX_TEXT = 80

export function PlaybackView() {
  const text = useKmpStringSearchStore((s) => s.text)
  const loadDoc = useKmpStringSearchStore((s) => s.loadDoc)
  const toDoc = useKmpStringSearchStore((s) => s.toDoc)
  const pattern = useKmpStringSearchStore((s) => s.pattern)
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr = useTr()

  const sig = `${text}|${pattern}`

  const run = useTraceRun(() => buildKmpStringSearchTrace(text, pattern, tr), {
    empty: pattern.length === 0,
    tooBig: text.length > MAX_TEXT,
    sig,
    lang,
  })

  const frameCount = run.kind === "ok" ? run.trace.frames.length : 1
  const player = usePlayer(frameCount, sig)

  const { shareStep } = usePlaybackDeeplink({
    player,
    codec: kmpStringSearchCodec,
    loadDoc,
    toDoc,
    mode: "",
    setMode: () => undefined,
    modeKeys: [] as const,
    routePath: "kmp-string-search/playback",
  })

  // Семантичні засічки фаз + рядок-діф. Hooks викликаємо безумовно (порожні кадри
  // на fallback → засічок немає), щоб не порушити правила хуків перед раннім return.
  const phaseFrames = run.kind === "ok" ? run.trace.frames : EMPTY_FRAMES
  const markers = usePhaseMarkers(phaseFrames, getKmpPhase, PHASE_STYLES)
  const phaseDiff = usePhaseDiff(
    phaseFrames,
    Math.min(player.index, Math.max(0, phaseFrames.length - 1)),
    getKmpPhase,
    PHASE_STYLES,
  )

  if (run.kind !== "ok") {
    return (
      <TraceFallback
        message={run.kind === "empty" ? t("play.kmpEmpty") : t("play.kmpTooBig", { max: MAX_TEXT })}
      />
    )
  }

  const { trace } = run
  const index = Math.min(player.index, trace.frames.length - 1)
  const frame = trace.frames[index]
  const done = frame.phase === "done"
  const isLps = frame.lpsState != null

  // KMP ГАРАНТУЄ лінійний O(n+m): індекс тексту i ніколи не відкочується. Орієнтир —
  // ця гарантія N+M; права межа — O(n·m) наївного, якого KMP уникає. На «легких»
  // даних може бути трохи більше за наївний — виграш на повторюваних префіксах.
  const n = text.length
  const m = pattern.length
  const refOps = n + m
  const worstOps = Math.max(0, n - m + 1) * m

  // У фазі lps (та init) праворуч — таблиця lps; інакше — стрічка пошуку.
  // На done показуємо останній відомий стан пошуку (offset/i/j з результату).
  const dataPanel = isLps ? (
    <LpsTablePanel state={frame.lpsState!} className="min-h-[320px] lg:col-span-2" />
  ) : frame.searchState ? (
    <KmpStripPanel
      text={frame.text}
      pattern={frame.pattern}
      state={frame.searchState}
      iMonotonic={frame.iMonotonic}
      className="min-h-[320px] lg:col-span-2"
    />
  ) : (
    <KmpStripPanel
      text={frame.text}
      pattern={frame.pattern}
      state={lastSearchState(trace)}
      iMonotonic={frame.iMonotonic}
      className="min-h-[320px] lg:col-span-2"
    />
  )

  return (
    <PlayerShell
      player={player}
      onShareStep={shareStep}
      caption={frame.caption}
      captionBadge={<PhaseBadge phase={frame.phase} styles={PHASE_STYLES} />}
      markers={markers}
      diffRow={<PhaseDiffRow diff={phaseDiff} />}
      statsBar={
        <>
          <StatsBar>
            <Stat label={t("play.kmpStatLps")} value={String(frame.lpsComparisons)} />
            <Stat label={t("play.kmpStatSearch")} value={String(frame.searchComparisons)} />
            <Stat label={t("play.kmpStatTotal")} value={String(frame.lpsComparisons + frame.searchComparisons)} />
            <Stat label={t("play.kmpStatMonotonic")} value={frame.iMonotonic ? t("play.kmpMonoNo") : t("play.kmpMonoYes")} />
            <Stat
              label={t("play.statResult")}
              value={frame.result >= 0 ? String(frame.result) : "−1"}
            />
            <Stat label={t("play.strStatLen")} value={`${text.length}/${pattern.length}`} />
          </StatsBar>
          <LiveComplexity
            title={t("play.lcTitle")}
            n={n}
            unit={t("play.kmpLcUnit")}
            actual={frame.lpsComparisons + frame.searchComparisons}
            actualLabel={t("play.lcActual")}
            reference={{
              value: refOps,
              cls: "O(n+m)",
              name: t("play.kmpLcGuaranteed"),
              formula: `N+M = ${refOps}`,
            }}
            worst={{
              value: worstOps,
              cls: "O(n·m)",
              name: t("play.kmpLcNaive"),
              formula: `(N−M+1)·M = ${worstOps}`,
            }}
            verdict={
              done
                ? t("play.kmpLcVerdict", {
                    total: trace.result.totalComparisons,
                    naive: trace.result.naiveComparisons,
                  })
                : undefined
            }
          />
        </>
      }
      panels={
        <>
          <CodePanel
            code={frame.code === "lps" ? trace.lpsCode : trace.searchCode}
            title={frame.code === "lps" ? t("play.kmpCodeLps") : t("play.kmpCodeSearch")}
            activeLines={frame.lines}
            contextLines={frame.contextLines}
            className="min-h-[320px]"
          />
          {dataPanel}
        </>
      }
      secondRow={<ResultCard result={trace.result} done={done} />}
    />
  )
}

/** Останній кадр фази пошуку зі станом (для відмальовки на done). */
function lastSearchState(trace: ReturnType<typeof buildKmpStringSearchTrace>) {
  for (let i = trace.frames.length - 1; i >= 0; i--) {
    const st = trace.frames[i].searchState
    if (st) return st
  }
  return { i: 0, j: 0, offset: 0, kind: "init" as const, jump: null, match: null }
}

// — дрібні презентаційні шматки ----------------------------------------------

// Стабільні module-level хелпери для phase-маркерів. KMP має ЄДИНУ чисту межу
// lps→search (init/done на краях) — ідеальний пілот семантичного скрабера.
const EMPTY_FRAMES: readonly KmpFrame[] = []
const getKmpPhase = (f: KmpFrame): KmpPhase => f.phase

const PHASE_STYLES: Record<KmpPhase, PhaseStyle> = {
    init: { labelKey: "play.kmpPhaseInit", cls: "bg-slate-500/15 text-slate-700 dark:text-slate-300" },
    lps: { labelKey: "play.kmpPhaseLps", cls: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
    search: { labelKey: "play.kmpPhaseSearch", cls: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
    done: { labelKey: "play.kmpPhaseDone", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  }

function ResultCard({ result, done }: { result: KmpResult; done: boolean }) {
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
              foundContent={t("play.kmpResultIndex", { i: result.result })}
              absentText={t("play.kmpResultAbsent")}
            />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 tabular-nums text-muted-foreground">
            <span>{t("play.kmpResultLps", { lps: result.lpsComparisons })}</span>
            <span>{t("play.kmpResultSearch", { search: result.searchComparisons })}</span>
            <span>{t("play.kmpResultTotal", { total: result.totalComparisons })}</span>
            <span>{t("play.kmpResultNaive", { naive: result.naiveComparisons })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
