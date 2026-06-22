import { useMemo, useState, type ReactNode } from "react"
import { Check, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import {
  buildNaiveStringSearchTrace,
  type NaivePhase,
  type NaiveResult,
} from "@/lib/naiveStringSearchTrace"
import { useNaiveStringSearchStore } from "@/store/naive-string-search-store"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { PlayerShell } from "@/algorithms/shared/playback/PlayerShell"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { StripPanel } from "@/algorithms/naive-string-search/playback/StripPanel"
import type { Translate } from "@/lib/translate"
import { useT } from "@/i18n/use-t"
import type { MessageKey } from "@/i18n/messages"
import { useLangStore } from "@/store/lang-store"
import { cn } from "@/lib/utils"

type Mode = "first" | "all"

// Поріг довжини тексту: стрічка стає завеликою (хоч і прокручується).
const MAX_TEXT = 80

export function PlaybackView() {
  const text = useNaiveStringSearchStore((s) => s.text)
  const pattern = useNaiveStringSearchStore((s) => s.pattern)
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)
  const [mode, setMode] = useState<Mode>("first")
  const findAll = mode === "all"

  const sig = `${mode}|${text}|${pattern}`

  const run = useMemo<Run>(() => {
    if (pattern.length === 0) return { kind: "empty" }
    if (text.length > MAX_TEXT) return { kind: "too-big" }
    const trace = buildNaiveStringSearchTrace(text, pattern, findAll, tr)
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
            {run.kind === "empty" ? t("play.nssEmpty") : t("play.nssTooBig", { max: MAX_TEXT })}
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
          <Stat label={t("play.nssStatComparisons")} value={String(frame.comparisons)} />
          <Stat label={t("play.nssStatAlignments")} value={String(frame.alignments)} />
          <Stat label={t("play.nssStatShifts")} value={String(frame.shifts)} />
          {findAll ? (
            <Stat label={t("play.nssStatMatches")} value={String(frame.matches.length)} />
          ) : (
            <Stat
              label={t("play.nssStatResult")}
              value={frame.result >= 0 ? String(frame.result) : "−1"}
            />
          )}
          <Stat label={t("play.nssStatLen")} value={`${text.length}/${pattern.length}`} />
        </StatsBar>
      }
      panels={
        <>
          <CodePanel
            code={trace.code}
            title={findAll ? t("play.nssCodeAll") : t("play.nssCodeFirst")}
            activeLines={frame.lines}
            contextLines={frame.contextLines}
            className="min-h-[320px]"
          />
          <StripPanel
            text={frame.text}
            pattern={frame.pattern}
            offset={frame.offset}
            matched={frame.matched}
            mismatchJ={frame.mismatchJ}
            className="min-h-[320px] lg:col-span-2"
          />
        </>
      }
      secondRow={<ResultCard result={trace.result} done={done} />}
    />
  )
}

type Run =
  | { kind: "empty" }
  | { kind: "too-big" }
  | { kind: "ok"; trace: ReturnType<typeof buildNaiveStringSearchTrace> }

// — дрібні презентаційні шматки ----------------------------------------------

function ModeSwitch({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  const t = useT()
  const opts: { key: Mode; label: string }[] = [
    { key: "first", label: t("play.nssModeFirst") },
    { key: "all", label: t("play.nssModeAll") },
  ]
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="font-medium text-muted-foreground">{t("play.nssMode")}</span>
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

function PhaseBadge({ phase }: { phase: NaivePhase }) {
  const t = useT()
  const map: Record<NaivePhase, { text: string; cls: string }> = {
    init: { text: t("play.nssPhaseInit"), cls: "bg-slate-500/15 text-slate-700 dark:text-slate-300" },
    align: { text: t("play.nssPhaseAlign"), cls: "bg-red-500/15 text-red-700 dark:text-red-300" },
    found: { text: t("play.nssPhaseFound"), cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
    done: { text: t("play.nssPhaseDone"), cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  }
  const b = map[phase]
  return (
    <span className={cn("ml-2 inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium", b.cls)}>
      {b.text}
    </span>
  )
}

function ResultCard({ result, done }: { result: NaiveResult; done: boolean }) {
  const t = useT()
  const found = result.found
  return (
    <Card className={cn("lg:col-span-3", done && (found ? "border-emerald-500/50" : "border-rose-500/40"))}>
      <CardContent className="flex flex-col gap-2 py-4 text-sm">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <div>
            <div className="text-muted-foreground">{t("play.nssResultLabel")}</div>
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
                  {result.findAll
                    ? t("play.nssResultAll", { list: result.matches.join(", "), count: result.matches.length })
                    : t("play.nssResultIndex", { i: result.result })}
                </>
              ) : (
                <>
                  <X className="size-4" />
                  {t("play.nssResultAbsent")}
                </>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 tabular-nums text-muted-foreground">
            <span>{t("play.nssResultComparisons", { comparisons: result.comparisons })}</span>
            <span>{t("play.nssResultAlignments", { alignments: result.alignments })}</span>
            <span>{t("play.nssResultShifts", { shifts: result.shifts })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
