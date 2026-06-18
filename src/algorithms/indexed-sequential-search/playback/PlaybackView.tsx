import { useMemo, useState, type ReactNode } from "react"
import { AlertTriangle, Check, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import {
  buildIndexedSequentialSearchTrace,
  type IxsPhase,
  type IxsFrame,
  type IxsTraceResult,
} from "@/lib/indexedSequentialSearchTrace"
import { isSorted } from "@/lib/indexedSequentialSearch"
import { useIndexedSequentialSearchStore } from "@/store/indexed-sequential-search-store"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { PlayerShell } from "@/algorithms/shared/playback/PlayerShell"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import {
  TwoLevelPanel,
  type TwoLevelProps,
} from "@/algorithms/indexed-sequential-search/playback/TwoLevelPanel"
import type { Translate } from "@/lib/translate"
import { useT } from "@/i18n/use-t"
import type { MessageKey } from "@/i18n/messages"
import { useLangStore } from "@/store/lang-store"
import { cn } from "@/lib/utils"

type Mode = "binary" | "linear"

// Поріг розміру: дворівнева схема стає завеликою (індекс + масив із блоками).
const MAX_SIZE = 48

/** Поля кадру → TwoLevelView. */
export function frameView(f: IxsFrame): TwoLevelProps {
  return {
    array: f.array,
    indexTable: f.indexTable,
    target: f.target,
    step: f.step,
    idxLow: f.idxLow,
    idxHigh: f.idxHigh,
    idxMid: f.idxMid,
    idxDiscardLo: f.idxDiscardLo,
    idxDiscardHi: f.idxDiscardHi,
    probing: f.phase === "probe",
    indexFound: f.level === "index" && f.phase === "found",
    blockLo: f.blockLo,
    blockHi: f.blockHi,
    cursor: f.cursor,
    phase: f.phase,
    result: f.result,
    resolved: f.phase === "found" || f.phase === "done",
  }
}

export function PlaybackView() {
  const values = useIndexedSequentialSearchStore((s) => s.values)
  const target = useIndexedSequentialSearchStore((s) => s.target)
  const step = useIndexedSequentialSearchStore((s) => s.step)
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)
  const [mode, setMode] = useState<Mode>("binary")
  const linearIndex = mode === "linear"

  const sorted = isSorted(values)
  // Сигнатура стабільна щодо мови — курсор плеєра не скидається на UA/EN.
  const sig = `${mode}|${target}|${step}|${values.join(",")}`

  const run = useMemo<Run>(() => {
    if (values.length === 0) return { kind: "empty" }
    if (values.length > MAX_SIZE) return { kind: "too-big" }
    const trace = buildIndexedSequentialSearchTrace(values, target, step, linearIndex, tr)
    return { kind: "ok", trace }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, lang])

  const frameCount = run.kind === "ok" ? run.trace.frames.length : 1
  const player = usePlayer(frameCount, sig)

  const switcher = <ModeSwitch mode={mode} onChange={setMode} />

  if (run.kind !== "ok") {
    return (
      <div className="flex flex-col gap-3">
        {switcher}
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {run.kind === "empty" ? t("play.issEmpty") : t("play.issTooBig", { max: MAX_SIZE })}
          </CardContent>
        </Card>
      </div>
    )
  }

  const { trace } = run
  const index = Math.min(player.index, trace.frames.length - 1)
  const frame = trace.frames[index]
  const done = frame.phase === "done"

  return (
    <PlayerShell
      player={player}
      headerExtra={
        <div className="flex flex-col gap-2">
          {switcher}
          {!sorted && (
            <div className="flex items-start gap-1.5 rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              {t("play.issUnsorted")}
            </div>
          )}
        </div>
      }
      caption={frame.caption}
      captionBadge={<PhaseBadge phase={frame.phase} />}
      statsBar={
        <StatsBar>
          <Stat label={t("play.issStatProbes")} value={String(frame.indexProbes)} />
          <Stat label={t("play.issStatComparisons")} value={String(frame.seqComparisons)} />
          <Stat label={t("play.issStatTotal")} value={String(frame.indexProbes + frame.seqComparisons)} />
          <Stat label={t("play.issStatBlock")} value={blockLabel(frame)} />
          <Stat
            label={t("play.issStatResult")}
            value={frame.result >= 0 ? String(frame.result) : "−1"}
          />
          <Stat label={t("play.issStatSize")} value={String(trace.result.size)} />
        </StatsBar>
      }
      panels={
        <>
          <CodePanel
            code={trace.code}
            title={linearIndex ? t("play.issCodeLinear") : t("play.issCodeBinary")}
            activeLines={frame.lines}
            contextLines={frame.contextLines}
            className="min-h-[360px]"
          />
          <TwoLevelPanel {...frameView(frame)} className="min-h-[360px] lg:col-span-2" />
        </>
      }
      secondRow={<ResultCard result={trace.result} done={done} />}
    />
  )
}

const blockLabel = (f: IxsFrame): string =>
  f.blockLo != null && f.blockHi != null ? `[${f.blockLo}, ${f.blockHi})` : "—"

type Run =
  | { kind: "empty" }
  | { kind: "too-big" }
  | { kind: "ok"; trace: ReturnType<typeof buildIndexedSequentialSearchTrace> }

// — дрібні презентаційні шматки ----------------------------------------------

function ModeSwitch({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  const t = useT()
  const opts: { key: Mode; label: string }[] = [
    { key: "binary", label: t("play.issModeBinary") },
    { key: "linear", label: t("play.issModeLinear") },
  ]
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="font-medium text-muted-foreground">{t("play.issMethod")}</span>
      <div className="inline-flex rounded-md border p-0.5">
        {opts.map((o) => (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            className={cn(
              "rounded px-3 py-1 transition-colors",
              mode === o.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
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

function PhaseBadge({ phase }: { phase: IxsPhase }) {
  const t = useT()
  const map: Record<IxsPhase, { text: string; cls: string }> = {
    init: { text: t("play.issPhaseInit"), cls: "bg-slate-500/15 text-slate-700 dark:text-slate-300" },
    probe: { text: t("play.issPhaseProbe"), cls: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
    discard: { text: t("play.issPhaseDiscard"), cls: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
    block: { text: t("play.issPhaseBlock"), cls: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
    scan: { text: t("play.issPhaseScan"), cls: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
    reject: { text: t("play.issPhaseReject"), cls: "bg-red-500/15 text-red-700 dark:text-red-300" },
    found: { text: t("play.issPhaseFound"), cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
    done: { text: t("play.issPhaseDone"), cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  }
  const b = map[phase]
  return (
    <span className={cn("ml-2 inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium", b.cls)}>
      {b.text}
    </span>
  )
}

function ResultCard({ result, done }: { result: IxsTraceResult; done: boolean }) {
  const t = useT()
  const found = result.found
  return (
    <Card className={cn(done && (found ? "border-emerald-500/50" : "border-rose-500/40"), "lg:col-span-3")}>
      <CardContent className="flex flex-col gap-2 py-4 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8">
        <div>
          <div className="text-muted-foreground">{t("play.issInputLabel")}</div>
          <div className="font-mono text-xs">[{result.input.join(", ")}]</div>
        </div>
        <div>
          <div className="text-muted-foreground">{t("play.issTargetLabel")}</div>
          <div className="font-mono text-xs tabular-nums">{result.target}</div>
        </div>
        <div>
          <div className="text-muted-foreground">{t("play.issResultLabel")}</div>
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
                {t("play.issResultIndex", { i: result.result })}
              </>
            ) : (
              <>
                <X className="size-4" />
                {t("play.issResultAbsent")}
              </>
            )}
          </div>
        </div>
        <div className="tabular-nums text-xs">
          {t("play.issResultSteps", {
            probes: result.indexProbes, seq: result.seqComparisons, total: result.total,
          })}
        </div>
      </CardContent>
    </Card>
  )
}
