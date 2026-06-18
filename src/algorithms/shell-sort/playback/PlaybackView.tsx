import { useMemo, useState, type ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  buildShellSortTrace,
  type ShPhase,
  type ShResult,
} from "@/lib/shellSortTrace"
import { GAP_SEQUENCES, type GapSequence } from "@/lib/shellSort"
import { useShellSortStore } from "@/store/shell-sort-store"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { PlayerShell } from "@/algorithms/shared/playback/PlayerShell"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
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

  const run = useMemo<Run>(() => {
    if (values.length === 0) return { kind: "empty" }
    if (values.length > MAX_SIZE) return { kind: "too-big" }
    const trace = buildShellSortTrace(values, sequence, tr)
    return { kind: "ok", trace }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, lang])

  const frameCount = run.kind === "ok" ? run.trace.frames.length : 1
  const player = usePlayer(frameCount, sig)

  const switcher = <GapSwitch sequence={sequence} onChange={setSequence} />

  if (run.kind !== "ok") {
    return (
      <div className="flex flex-col gap-3">
        {switcher}
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {run.kind === "empty" ? t("play.shEmpty") : t("play.shTooBig", { max: MAX_SIZE })}
          </CardContent>
        </Card>
      </div>
    )
  }

  const { trace } = run
  const index = Math.min(player.index, trace.frames.length - 1)
  const frame = trace.frames[index]

  return (
    <PlayerShell
      player={player}
      headerExtra={switcher}
      caption={frame.caption}
      captionBadge={<PhaseBadge phase={frame.phase} />}
      statsBar={
        <StatsBar>
          <Stat label={t("play.shStatComparisons")} value={String(frame.comparisons)} />
          <Stat label={t("play.shStatShifts")} value={String(frame.shifts)} />
          <Stat label={t("play.shStatPhases")} value={String(trace.result.gapPhases)} />
          <Stat label={t("play.shStatGaps")} value={`[${trace.result.gaps.join(", ")}]`} />
          <Stat label={t("play.shStatSize")} value={String(trace.result.size)} />
        </StatsBar>
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

type Run =
  | { kind: "empty" }
  | { kind: "too-big" }
  | { kind: "ok"; trace: ReturnType<typeof buildShellSortTrace> }

// — дрібні презентаційні шматки ----------------------------------------------

function GapSwitch({
  sequence,
  onChange,
}: {
  sequence: GapSequence
  onChange: (s: GapSequence) => void
}) {
  const t = useT()
  const label: Record<GapSequence, string> = {
    shell: t("play.shSeqShell"),
    knuth: t("play.shSeqKnuth"),
    ciura: t("play.shSeqCiura"),
  }
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="font-medium text-muted-foreground">{t("play.shSeq")}</span>
      <div className="inline-flex flex-wrap rounded-md border p-0.5">
        {GAP_SEQUENCES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={cn(
              "rounded px-3 py-1 transition-colors",
              sequence === s
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label[s]}
          </button>
        ))}
      </div>
    </div>
  )
}

function StatsBar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 rounded-md border bg-card px-3 py-2 text-xs">
      {children}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span>
      <b>{label}</b> <span className="tabular-nums">{value}</span>
    </span>
  )
}

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
