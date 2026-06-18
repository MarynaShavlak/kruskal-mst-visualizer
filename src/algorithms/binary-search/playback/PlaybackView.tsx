import { useMemo, useState, type ReactNode } from "react"
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

  const run = useMemo<Run>(() => {
    if (values.length === 0) return { kind: "empty" }
    if (values.length > MAX_SIZE) return { kind: "too-big" }
    const trace = buildBinarySearchTrace(values, target, recursive, tr)
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
            {run.kind === "empty" ? t("play.binEmpty") : t("play.binTooBig", { max: MAX_SIZE })}
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
              {t("play.binUnsorted")}
            </div>
          )}
        </div>
      }
      caption={frame.caption}
      captionBadge={<PhaseBadge phase={frame.phase} />}
      statsBar={
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

type Run =
  | { kind: "empty" }
  | { kind: "too-big" }
  | { kind: "ok"; trace: ReturnType<typeof buildBinarySearchTrace> }

// — дрібні презентаційні шматки ----------------------------------------------

function ModeSwitch({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  const t = useT()
  const opts: { key: Mode; label: string }[] = [
    { key: "iterative", label: t("play.binModeIterative") },
    { key: "recursive", label: t("play.binModeRecursive") },
  ]
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="font-medium text-muted-foreground">{t("play.binMethod")}</span>
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
