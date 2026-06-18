import { useMemo, useState, type ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  buildInsertionSortTrace,
  type InsPhase,
  type InsResult,
} from "@/lib/insertionSortTrace"
import { useInsertionSortStore } from "@/store/insertion-sort-store"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { PlayerShell } from "@/algorithms/shared/playback/PlayerShell"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { InsertionBarsPanel } from "@/algorithms/insertion-sort/playback/InsertionBarsPanel"
import type { Translate } from "@/lib/translate"
import { useT } from "@/i18n/use-t"
import type { MessageKey } from "@/i18n/messages"
import { useLangStore } from "@/store/lang-store"
import { cn } from "@/lib/utils"

type Mode = "linear" | "binary"

// Поріг розміру масиву: кадрів ≈ n²/2, вище — плеєр стає неплавним (редактор
// попереджає вже від 40).
const MAX_SIZE = 80

export function PlaybackView() {
  const values = useInsertionSortStore((s) => s.values)
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)
  const [mode, setMode] = useState<Mode>("linear")
  const binary = mode === "binary"

  // Сигнатура стабільна щодо мови — курсор плеєра не скидається на UA/EN.
  const sig = `${mode}|${values.join(",")}`

  const run = useMemo<Run>(() => {
    if (values.length === 0) return { kind: "empty" }
    if (values.length > MAX_SIZE) return { kind: "too-big" }
    const trace = buildInsertionSortTrace(values, binary, tr)
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
            {run.kind === "empty" ? t("play.isEmpty") : t("play.isTooBig", { max: MAX_SIZE })}
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
      headerExtra={switcher}
      caption={frame.caption}
      captionBadge={<PhaseBadge phase={frame.phase} />}
      statsBar={
        <StatsBar>
          <Stat label={t("play.isStatComparisons")} value={String(frame.comparisons)} />
          <Stat label={t("play.isStatShifts")} value={String(frame.shifts)} />
          <Stat
            label={t("play.isStatPass")}
            value={frame.pass !== null ? String(frame.pass) : "—"}
          />
          <Stat label={t("play.isStatSize")} value={String(trace.result.size)} />
        </StatsBar>
      }
      panels={
        <>
          <CodePanel
            code={trace.code}
            title={binary ? t("play.codeIsBinary") : t("play.codeIsLinear")}
            activeLines={frame.lines}
            contextLines={frame.contextLines}
            className="min-h-[320px]"
          />
          <InsertionBarsPanel
            array={frame.array}
            prefixLen={frame.prefixLen}
            hole={frame.hole}
            keyValue={frame.key}
            compareAt={frame.compareAt}
            shiftAt={frame.shiftAt}
            className="min-h-[320px] lg:col-span-2"
          />
        </>
      }
      secondRow={<ResultCard result={trace.result} done={done} className="lg:col-span-3" />}
    />
  )
}

type Run =
  | { kind: "empty" }
  | { kind: "too-big" }
  | { kind: "ok"; trace: ReturnType<typeof buildInsertionSortTrace> }

// — дрібні презентаційні шматки ----------------------------------------------

function ModeSwitch({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  const t = useT()
  const opts: { key: Mode; label: string }[] = [
    { key: "linear", label: t("play.isModeLinear") },
    { key: "binary", label: t("play.isModeBinary") },
  ]
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="font-medium text-muted-foreground">{t("play.isMethod")}</span>
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

function PhaseBadge({ phase }: { phase: InsPhase }) {
  const t = useT()
  const map = {
    key: { text: t("play.isPhaseKey"), cls: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
    scan: { text: t("play.isPhaseScan"), cls: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
    insert: { text: t("play.isPhaseInsert"), cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
    done: { text: t("play.isPhaseDone"), cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
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
  result: InsResult
  done: boolean
  className?: string
}) {
  const t = useT()
  const saved = result.maxComparisons - result.comparisons
  return (
    <Card className={cn(className, done && "border-emerald-500/50")}>
      <CardContent className="flex flex-wrap items-center gap-x-8 gap-y-2 py-4 text-sm">
        <div>
          <div className="text-muted-foreground">{t("play.isInputLabel")}</div>
          <div className="font-mono">[{result.input.join(", ")}]</div>
        </div>
        <div>
          <div className="text-muted-foreground">{t("play.isSortedLabel")}</div>
          <div className="font-mono">{done ? `[${result.sorted.join(", ")}]` : "…"}</div>
        </div>
        <div>
          <div className="text-muted-foreground">{t("play.isResultSummary")}</div>
          <div className="tabular-nums">
            {t("play.isResultCounts", {
              comparisons: result.comparisons,
              shifts: result.shifts,
              insertions: result.insertions,
            })}
          </div>
        </div>
        {result.binary && done && saved > 0 && (
          <div className="rounded-md bg-emerald-500/10 px-2 py-1.5 text-xs text-emerald-700 dark:text-emerald-300">
            {t("play.isSaved", { comparisons: result.comparisons, max: result.maxComparisons })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
