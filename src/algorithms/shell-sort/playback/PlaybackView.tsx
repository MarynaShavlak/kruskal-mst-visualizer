import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  buildShellSortTrace,
  type ShPhase,
  type ShResult,
} from "@/lib/shellSortTrace"
import { type GapSequence } from "@/lib/shellSort"
import { useShellSortStore } from "@/store/shell-sort-store"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { PlayerShell } from "@/algorithms/shared/playback/PlayerShell"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { StatsBar, Stat } from "@/algorithms/shared/playback/Stats"
import { LiveComplexity } from "@/algorithms/shared/playback/LiveComplexity"
import { ModeSwitch } from "@/algorithms/shared/playback/ModeSwitch"
import { useTraceRun, TraceFallback } from "@/algorithms/shared/playback/use-trace-run"
import { ShellBarsPanel } from "@/algorithms/shell-sort/playback/ShellBarsPanel"
import type { Translate } from "@/lib/translate"
import { useT } from "@/i18n/use-t"
import type { MessageKey } from "@/i18n/messages"
import { useLangStore } from "@/store/lang-store"
import { cn } from "@/lib/utils"

// Поріг розміру масиву для плавного плеєра (редактор попереджає вже від 16).
const MAX_SIZE = 16

export function PlaybackView() {
  const values = useShellSortStore((s) => s.values)
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)
  const [sequence, setSequence] = useState<GapSequence>("shell")

  const sig = `${sequence}|${values.join(",")}`

  const run = useTraceRun(() => buildShellSortTrace(values, sequence, tr), {
    empty: values.length === 0,
    tooBig: values.length > MAX_SIZE,
    sig,
    lang,
  })

  const frameCount = run.kind === "ok" ? run.trace.frames.length : 1
  const player = usePlayer(frameCount, sig)

  const switcher = (
    <ModeSwitch
      label={t("play.shSeq")}
      value={sequence}
      onChange={setSequence}
      options={[
        { key: "shell", label: t("play.shSeqShell") },
        { key: "knuth", label: t("play.shSeqKnuth") },
        { key: "ciura", label: t("play.shSeqCiura") },
      ]}
      wrapButtons
    />
  )

  if (run.kind !== "ok") {
    return (
      <TraceFallback
        headerExtra={switcher}
        message={run.kind === "empty" ? t("play.shEmpty") : t("play.shTooBig", { max: MAX_SIZE })}
      />
    )
  }

  const { trace } = run
  const index = Math.min(player.index, trace.frames.length - 1)
  const frame = trace.frames[index]

  // Ціна Шелла залежить від ПОСЛІДОВНОСТІ ПРОМІЖКІВ: орієнтир — субквадратична межа
  // O(n^1.5) (Кнут), права межа — O(n²) (зрив n//2 ≈ звичайні вставки). Той самий
  // масив за різних послідовностей дає різну ціну — стовпчик помітно рухається.
  const shDone = frame.phase === "done"
  const n = trace.result.size
  const refCmp = Math.ceil(n * Math.sqrt(n))
  const worstCmp = (n * (n - 1)) / 2
  const lcVerdict = shDone
    ? trace.result.comparisons <= refCmp * 1.05
      ? t("play.shLcVerdictGood")
      : trace.result.comparisons >= worstCmp * 0.9
        ? t("play.shLcVerdictBad")
        : t("play.shLcVerdictMid")
    : undefined

  return (
    <PlayerShell
      player={player}
      headerExtra={switcher}
      caption={frame.caption}
      captionBadge={<PhaseBadge phase={frame.phase} />}
      statsBar={
        <>
          <StatsBar>
            <Stat label={t("play.shStatComparisons")} value={String(frame.comparisons)} />
            <Stat label={t("play.shStatShifts")} value={String(frame.shifts)} />
            <Stat label={t("play.shStatPhases")} value={String(trace.result.gapPhases)} />
            <Stat label={t("play.shStatGaps")} value={`[${trace.result.gaps.join(", ")}]`} />
            <Stat label={t("play.shStatSize")} value={String(trace.result.size)} />
          </StatsBar>
          <LiveComplexity
            title={t("play.shLcTitle")}
            n={n}
            unit={t("play.shLcUnit")}
            actual={frame.comparisons}
            actualLabel={t("play.shLcActual")}
            reference={{
              value: refCmp,
              cls: "O(n^1.5)",
              name: t("play.shLcSub"),
              formula: `⌈n·√n⌉ = ${refCmp}`,
            }}
            worst={{
              value: worstCmp,
              cls: "O(n²)",
              name: t("play.shLcWorst"),
              formula: `n(n−1)/2 = ${worstCmp}`,
            }}
            verdict={lcVerdict}
          />
        </>
      }
      panels={
        <>
          <CodePanel
            code={trace.code}
            title={t("play.shCodeTitle")}
            activeLines={frame.lines}
            contextLines={frame.contextLines}
            className="min-h-[340px]"
          />
          <ShellBarsPanel
            array={frame.array}
            gap={frame.gap}
            groupResidue={frame.groupResidue}
            hole={frame.hole}
            keyValue={frame.key}
            compareAt={frame.compareAt}
            shiftAt={frame.shiftAt}
            insertAt={frame.insertAt}
            sortedAll={frame.sortedAll}
            className="min-h-[340px] lg:col-span-2"
          />
        </>
      }
      secondRow={<ResultCard result={trace.result} done={frame.phase === "done"} />}
    />
  )
}

// — дрібні презентаційні шматки ----------------------------------------------

function PhaseBadge({ phase }: { phase: ShPhase }) {
  const t = useT()
  const map: Record<ShPhase, { text: string; cls: string }> = {
    init: { text: t("play.shPhaseInit"), cls: "bg-slate-500/15 text-slate-700 dark:text-slate-300" },
    gap: { text: t("play.shPhaseGap"), cls: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
    take: { text: t("play.shPhaseTake"), cls: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
    compare: { text: t("play.shPhaseCompare"), cls: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
    shift: { text: t("play.shPhaseShift"), cls: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
    insert: { text: t("play.shPhaseInsert"), cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
    done: { text: t("play.shPhaseDone"), cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
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
  result: ShResult
  done: boolean
  className?: string
}) {
  const t = useT()
  return (
    <Card className={cn(className, done && "border-emerald-500/50", "lg:col-span-3")}>
      <CardContent className="flex flex-col gap-2 py-4 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8">
        <div>
          <div className="text-muted-foreground">{t("play.shInputLabel")}</div>
          <div className="font-mono text-xs">[{result.input.join(", ")}]</div>
        </div>
        <div>
          <div className="text-muted-foreground">{t("play.shSortedLabel")}</div>
          <div className="font-mono text-xs">{done ? `[${result.sorted.join(", ")}]` : "…"}</div>
        </div>
        <div className="tabular-nums text-xs">
          {t("play.shResultCounts", {
            comparisons: result.comparisons,
            shifts: result.shifts,
            gapPhases: result.gapPhases,
          })}
        </div>
      </CardContent>
    </Card>
  )
}
