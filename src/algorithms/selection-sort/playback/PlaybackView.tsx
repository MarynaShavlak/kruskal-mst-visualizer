import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  buildSelectionSortTrace,
  type SelPhase,
  type SelResult,
} from "@/lib/selectionSortTrace"
import { useSelectionSortStore } from "@/store/selection-sort-store"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { PlayerShell } from "@/algorithms/shared/playback/PlayerShell"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { StatsBar, Stat } from "@/algorithms/shared/playback/Stats"
import { LiveComplexity } from "@/algorithms/shared/playback/LiveComplexity"
import { ModeSwitch } from "@/algorithms/shared/playback/ModeSwitch"
import { useTraceRun, TraceFallback } from "@/algorithms/shared/playback/use-trace-run"
import { SelectionBarsPanel } from "@/algorithms/selection-sort/playback/SelectionBarsPanel"
import type { Translate } from "@/lib/translate"
import { useT } from "@/i18n/use-t"
import type { MessageKey } from "@/i18n/messages"
import { useLangStore } from "@/store/lang-store"
import { cn } from "@/lib/utils"

type Mode = "standard" | "stable"

// Поріг розміру масиву: кадрів ≈ n²/2, вище — плеєр стає неплавним (редактор
// попереджає вже від 40).
const MAX_SIZE = 80

export function PlaybackView() {
  const values = useSelectionSortStore((s) => s.values)
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)
  const [mode, setMode] = useState<Mode>("standard")
  const stable = mode === "stable"

  // Сигнатура стабільна щодо мови — курсор плеєра не скидається на UA/EN.
  const sig = `${mode}|${values.join(",")}`

  const run = useTraceRun(() => buildSelectionSortTrace(values, stable, tr), {
    empty: values.length === 0,
    tooBig: values.length > MAX_SIZE,
    sig,
    lang,
  })

  const frameCount = run.kind === "ok" ? run.trace.frames.length : 1
  const player = usePlayer(frameCount, sig)

  const switcher = (
    <ModeSwitch
      label={t("play.ssMethod")}
      value={mode}
      onChange={setMode}
      options={[
        { key: "standard", label: t("play.ssModeStandard") },
        { key: "stable", label: t("play.ssModeStable") },
      ]}
    />
  )

  if (run.kind !== "ok") {
    return (
      <TraceFallback
        headerExtra={switcher}
        message={run.kind === "empty" ? t("play.ssEmpty") : t("play.ssTooBig", { max: MAX_SIZE })}
      />
    )
  }

  const { trace } = run
  const index = Math.min(player.index, trace.frames.length - 1)
  const frame = trace.frames[index]
  const done = frame.phase === "done"

  // Порівняння в selection ІНВАРІАНТНІ: завжди n(n−1)/2, навіть на впорядкованому
  // масиві — алгоритм НЕ адаптується (стовпчик завжди впритул до правого краю).
  // Орієнтир — n−1: куди АДАПТИВНІ сортування (бульбашка/вставки) падають на вже
  // впорядкованому вході; selection цієї «знижки» не отримує ніколи.
  const n = trace.result.size
  const worstCmp = trace.result.maxComparisons
  const bestAdaptive = Math.max(0, n - 1)

  return (
    <PlayerShell
      player={player}
      headerExtra={switcher}
      caption={frame.caption}
      captionBadge={<PhaseBadge phase={frame.phase} />}
      statsBar={
        <>
          <StatsBar>
            <Stat label={t("play.ssStatComparisons")} value={String(frame.comparisons)} />
            {stable ? (
              <Stat label={t("play.ssStatWrites")} value={String(frame.writes)} />
            ) : (
              <Stat label={t("play.ssStatSwaps")} value={String(frame.swaps)} />
            )}
            <Stat
              label={t("play.ssStatPass")}
              value={frame.pass !== null ? String(frame.pass) : "—"}
            />
            <Stat label={t("play.ssStatSize")} value={String(trace.result.size)} />
          </StatsBar>
          <LiveComplexity
            title={t("play.ssLcTitle")}
            n={n}
            unit={t("play.ssLcUnit")}
            actual={frame.comparisons}
            actualLabel={t("play.ssLcActual")}
            reference={{
              value: bestAdaptive,
              cls: "O(n)",
              name: t("play.ssLcAdaptive"),
              formula: `n−1 = ${bestAdaptive}`,
            }}
            worst={{
              value: worstCmp,
              cls: "O(n²)",
              name: t("play.ssLcSelection"),
              formula: `n(n−1)/2 = ${worstCmp}`,
            }}
            verdict={done ? t("play.ssLcVerdict") : undefined}
          />
        </>
      }
      panels={
        <>
          <CodePanel
            code={trace.code}
            title={stable ? t("play.codeSsStable") : t("play.codeSsStandard")}
            activeLines={frame.lines}
            contextLines={frame.contextLines}
            className="min-h-[320px]"
          />
          <SelectionBarsPanel
            array={frame.array}
            sortedTo={frame.sortedTo}
            minIdx={frame.minIdx}
            cursor={frame.cursor}
            placedAt={frame.placedAt}
            swapAt={frame.swapAt}
            hole={frame.hole}
            keyValue={frame.keyValue}
            className="min-h-[320px] lg:col-span-2"
          />
        </>
      }
      secondRow={<ResultCard result={trace.result} done={done} className="lg:col-span-3" />}
    />
  )
}

// — дрібні презентаційні шматки ----------------------------------------------

function PhaseBadge({ phase }: { phase: SelPhase }) {
  const t = useT()
  const map = {
    scan: { text: t("play.ssPhaseScan"), cls: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
    place: { text: t("play.ssPhasePlace"), cls: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
    done: { text: t("play.ssPhaseDone"), cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
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
  result: SelResult
  done: boolean
  className?: string
}) {
  const t = useT()
  return (
    <Card className={cn(className, done && "border-emerald-500/50")}>
      <CardContent className="flex flex-wrap items-center gap-x-8 gap-y-2 py-4 text-sm">
        <div>
          <div className="text-muted-foreground">{t("play.ssInputLabel")}</div>
          <div className="font-mono">[{result.input.join(", ")}]</div>
        </div>
        <div>
          <div className="text-muted-foreground">{t("play.ssSortedLabel")}</div>
          <div className="font-mono">{done ? `[${result.sorted.join(", ")}]` : "…"}</div>
        </div>
        <div>
          <div className="text-muted-foreground">{t("play.ssResultSummary")}</div>
          <div className="tabular-nums">
            {result.stable
              ? t("play.ssResultStable", {
                  comparisons: result.comparisons,
                  writes: result.writes,
                  passes: result.passes,
                })
              : t("play.ssResultStandard", {
                  comparisons: result.comparisons,
                  swaps: result.swaps,
                  passes: result.passes,
                })}
          </div>
        </div>
        {done && !result.stable && (
          <div className="rounded-md bg-emerald-500/10 px-2 py-1.5 text-xs text-emerald-700 dark:text-emerald-300">
            {t("play.ssSwapNote", { swaps: result.swaps, max: Math.max(0, result.size - 1) })}
          </div>
        )}
        {done && result.stable && (
          <div className="rounded-md bg-amber-500/10 px-2 py-1.5 text-xs text-amber-700 dark:text-amber-300">
            {t("play.ssWriteNote", { writes: result.writes })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
