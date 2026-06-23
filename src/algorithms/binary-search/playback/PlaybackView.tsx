import { useState } from "react"
import { AlertTriangle, Check, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import {
  buildBinarySearchTrace,
  type BsPhase,
  type BsResult,
} from "@/lib/binarySearchTrace"
import { isSorted } from "@/lib/binarySearch"
import { useBinarySearchStore } from "@/store/binary-search-store"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { PlayerShell } from "@/algorithms/shared/playback/PlayerShell"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { StatsBar, Stat } from "@/algorithms/shared/playback/Stats"
import { LiveComplexity } from "@/algorithms/shared/playback/LiveComplexity"
import { ModeSwitch } from "@/algorithms/shared/playback/ModeSwitch"
import { useTraceRun, TraceFallback } from "@/algorithms/shared/playback/use-trace-run"
import { WindowPanel } from "@/algorithms/binary-search/playback/WindowPanel"
import type { Translate } from "@/lib/translate"
import { useT } from "@/i18n/use-t"
import type { MessageKey } from "@/i18n/messages"
import { useLangStore } from "@/store/lang-store"
import { cn } from "@/lib/utils"

type Mode = "iterative" | "recursive"

// Поріг розміру масиву: кадрів ≈ 2·log₂n+2 (дуже мало), але вікно стає вузьким.
const MAX_SIZE = 64

export function PlaybackView() {
  const values = useBinarySearchStore((s) => s.values)
  const target = useBinarySearchStore((s) => s.target)
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)
  const [mode, setMode] = useState<Mode>("iterative")
  const recursive = mode === "recursive"

  const sorted = isSorted(values)
  // Сигнатура стабільна щодо мови — курсор плеєра не скидається на UA/EN.
  const sig = `${mode}|${target}|${values.join(",")}`

  const run = useTraceRun(() => buildBinarySearchTrace(values, target, recursive, tr), {
    empty: values.length === 0,
    tooBig: values.length > MAX_SIZE,
    sig,
    lang,
  })

  const frameCount = run.kind === "ok" ? run.trace.frames.length : 1
  const player = usePlayer(frameCount, sig)

  const switcher = (
    <ModeSwitch
      label={t("play.binMethod")}
      value={mode}
      onChange={setMode}
      options={[
        { key: "iterative", label: t("play.binModeIterative") },
        { key: "recursive", label: t("play.binModeRecursive") },
      ]}
    />
  )

  if (run.kind !== "ok") {
    return (
      <TraceFallback
        headerExtra={switcher}
        message={run.kind === "empty" ? t("play.binEmpty") : t("play.binTooBig", { max: MAX_SIZE })}
      />
    )
  }

  const { trace } = run
  const index = Math.min(player.index, trace.frames.length - 1)
  const frame = trace.frames[index]
  const done = frame.phase === "done"

  // Двійковий не «деградує» — його історія в іншому: O(log n) проти O(n) лінійного.
  // Орієнтир = межа двійкового ⌊log₂n⌋+1; права межа шкали = n (скільки коштував би
  // лінійний скан). Фактичні проби заповнюють лише крихту шкали.
  const n = trace.result.size
  const logBound = Math.floor(Math.log2(n)) + 1

  return (
    <PlayerShell
      player={player}
      headerExtra={
        <div className="flex flex-col gap-2">
          {switcher}
          {!sorted && (
            <div className="flex items-start gap-1.5 rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              {t("play.binUnsorted")}
            </div>
          )}
        </div>
      }
      caption={frame.caption}
      captionBadge={<PhaseBadge phase={frame.phase} />}
      statsBar={
        <>
          <StatsBar>
            <Stat label={t("play.binStatSteps")} value={String(frame.steps)} />
            <Stat
              label={t("play.binStatResult")}
              value={frame.result >= 0 ? String(frame.result) : "−1"}
            />
            <Stat label={t("play.binStatWindow")} value={windowLabel(frame)} />
            {recursive && (
              <Stat label={t("play.binStatDepth")} value={String(frame.depth)} />
            )}
            <Stat label={t("play.binStatSize")} value={String(trace.result.size)} />
          </StatsBar>
          <LiveComplexity
            title={t("play.binLcTitle")}
            n={n}
            unit={t("play.binLcUnit")}
            actual={frame.steps}
            actualLabel={t("play.binLcActual")}
            reference={{
              value: logBound,
              cls: "O(log n)",
              name: t("play.binLcLog"),
              formula: `⌊log₂n⌋+1 = ${logBound}`,
            }}
            worst={{
              value: n,
              cls: "O(n)",
              name: t("play.binLcLinear"),
              formula: `n = ${n}`,
            }}
            verdict={
              done
                ? t("play.binLcVerdict", { steps: trace.result.steps, n })
                : undefined
            }
          />
        </>
      }
      panels={
        <>
          <CodePanel
            code={trace.code}
            title={recursive ? t("play.binCodeRecursive") : t("play.binCodeIterative")}
            activeLines={frame.lines}
            contextLines={frame.contextLines}
            className="min-h-[340px]"
          />
          <WindowPanel
            array={frame.array}
            target={frame.target}
            low={frame.low}
            high={frame.high}
            mid={frame.mid}
            probing={frame.phase === "probe"}
            discardLo={frame.discardLo}
            discardHi={frame.discardHi}
            result={frame.result}
            resolved={frame.phase === "found" || frame.phase === "done"}
            className="min-h-[340px] lg:col-span-2"
          />
        </>
      }
      secondRow={<ResultCard result={trace.result} done={done} />}
    />
  )
}

const windowLabel = (f: { low: number; high: number }): string =>
  f.low <= f.high ? `[${f.low}..${f.high}]` : "∅"

// — дрібні презентаційні шматки ----------------------------------------------

function PhaseBadge({ phase }: { phase: BsPhase }) {
  const t = useT()
  const map: Record<BsPhase, { text: string; cls: string }> = {
    init: { text: t("play.binPhaseInit"), cls: "bg-slate-500/15 text-slate-700 dark:text-slate-300" },
    probe: { text: t("play.binPhaseProbe"), cls: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
    discard: { text: t("play.binPhaseDiscard"), cls: "bg-red-500/15 text-red-700 dark:text-red-300" },
    found: { text: t("play.binPhaseFound"), cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
    done: { text: t("play.binPhaseDone"), cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  }
  const b = map[phase]
  return (
    <span className={cn("ml-2 inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium", b.cls)}>
      {b.text}
    </span>
  )
}

function ResultCard({ result, done }: { result: BsResult; done: boolean }) {
  const t = useT()
  const found = result.found
  return (
    <Card className={cn(done && (found ? "border-emerald-500/50" : "border-rose-500/40"), "lg:col-span-3")}>
      <CardContent className="flex flex-col gap-2 py-4 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8">
        <div>
          <div className="text-muted-foreground">{t("play.binInputLabel")}</div>
          <div className="font-mono text-xs">[{result.input.join(", ")}]</div>
        </div>
        <div>
          <div className="text-muted-foreground">{t("play.binTargetLabel")}</div>
          <div className="font-mono text-xs tabular-nums">{result.target}</div>
        </div>
        <div>
          <div className="text-muted-foreground">{t("play.binResultLabel")}</div>
          <div
            className={cn(
              "flex items-center gap-1 font-medium",
              done && (found ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"),
            )}
          >
            {!done ? (
              "…"
            ) : found ? (
              <>
                <Check className="size-4" />
                {t("play.binResultIndex", { i: result.result })}
              </>
            ) : (
              <>
                <X className="size-4" />
                {t("play.binResultAbsent")}
              </>
            )}
          </div>
        </div>
        <div className="tabular-nums text-xs">
          {t("play.binResultSteps", { steps: result.steps })}
        </div>
      </CardContent>
    </Card>
  )
}
