import { useMemo, useState, type ReactNode } from "react"
import { Check, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import {
  buildRabinKarpStringSearchTrace,
  type RkPhase,
  type RkResult,
} from "@/lib/rabinKarpStringSearchTrace"
import { useRabinKarpStringSearchStore } from "@/store/rabin-karp-string-search-store"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { PlayerShell } from "@/algorithms/shared/playback/PlayerShell"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { HashBuildPanel } from "@/algorithms/rabin-karp-string-search/playback/HashBuildPanel"
import { RkStripPanel } from "@/algorithms/rabin-karp-string-search/playback/RkStripPanel"
import type { Translate } from "@/lib/translate"
import { useT } from "@/i18n/use-t"
import type { MessageKey } from "@/i18n/messages"
import { useLangStore } from "@/store/lang-store"
import { cn } from "@/lib/utils"

type Mode = "rolling" | "recompute"

// Поріг довжини тексту: стрічка стає завеликою (хоч і прокручується).
const MAX_TEXT = 80

export function PlaybackView() {
  const text = useRabinKarpStringSearchStore((s) => s.text)
  const pattern = useRabinKarpStringSearchStore((s) => s.pattern)
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)
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

  const switcher = <ModeSwitch mode={mode} onChange={setMode} />

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

  return (
    <PlayerShell
      player={player}
      headerExtra={switcher}
      caption={frame.caption}
      captionBadge={<PhaseBadge phase={frame.phase} />}
      statsBar={
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
            label={t("play.rkStatResult")}
            value={frame.result >= 0 ? String(frame.result) : "−1"}
          />
        </StatsBar>
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

function ModeSwitch({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  const t = useT()
  const opts: { key: Mode; label: string }[] = [
    { key: "rolling", label: t("play.rkModeRollingShort") },
    { key: "recompute", label: t("play.rkModeRecomputeShort") },
  ]
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="font-medium text-muted-foreground">{t("play.rkMode")}</span>
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

function PhaseBadge({ phase }: { phase: RkPhase }) {
  const t = useT()
  const map: Record<RkPhase, { text: string; cls: string }> = {
    hashInit: { text: t("play.rkPhaseHash"), cls: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
    hashTerm: { text: t("play.rkPhaseHash"), cls: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
    hashDone: { text: t("play.rkPhaseHashDone"), cls: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
    searchInit: { text: t("play.rkPhaseSearch"), cls: "bg-slate-500/15 text-slate-700 dark:text-slate-300" },
    window: { text: t("play.rkPhaseWindow"), cls: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
    collision: { text: t("play.rkPhaseCollision"), cls: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
    found: { text: t("play.rkPhaseFound"), cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
    done: { text: t("play.rkPhaseDone"), cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  }
  const b = map[phase]
  return (
    <span className={cn("ml-2 inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium", b.cls)}>
      {b.text}
    </span>
  )
}

function ResultCard({ result, done }: { result: RkResult; done: boolean }) {
  const t = useT()
  const found = result.found
  return (
    <Card className={cn("lg:col-span-3", done && (found ? "border-emerald-500/50" : "border-rose-500/40"))}>
      <CardContent className="flex flex-col gap-2 py-4 text-sm">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <div>
            <div className="text-muted-foreground">{t("play.rkResultLabel")}</div>
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
                  {t("play.rkResultIndex", { i: result.result })}
                </>
              ) : (
                <>
                  <X className="size-4" />
                  {t("play.rkResultAbsent")}
                </>
              )}
            </div>
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
