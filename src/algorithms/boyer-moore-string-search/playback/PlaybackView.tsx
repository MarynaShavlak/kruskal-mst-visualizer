import { useMemo, type ReactNode } from "react"
import { Check, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import {
  buildBoyerMooreStringSearchTrace,
  type BmPhase,
  type BmResult,
} from "@/lib/boyerMooreStringSearchTrace"
import { useBoyerMooreStringSearchStore } from "@/store/boyer-moore-string-search-store"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { PlayerShell } from "@/algorithms/shared/playback/PlayerShell"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { ShiftTablePanel } from "@/algorithms/boyer-moore-string-search/playback/ShiftTablePanel"
import { BmStripPanel } from "@/algorithms/boyer-moore-string-search/playback/BmStripPanel"
import type { Translate } from "@/lib/translate"
import { useT } from "@/i18n/use-t"
import type { MessageKey } from "@/i18n/messages"
import { useLangStore } from "@/store/lang-store"
import { cn } from "@/lib/utils"

// Поріг довжини тексту: стрічка стає завеликою (хоч і прокручується).
const MAX_TEXT = 80

export function PlaybackView() {
  const text = useBoyerMooreStringSearchStore((s) => s.text)
  const pattern = useBoyerMooreStringSearchStore((s) => s.pattern)
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)

  const sig = `${text}|${pattern}`

  const run = useMemo<Run>(() => {
    if (pattern.length === 0) return { kind: "empty" }
    if (text.length > MAX_TEXT) return { kind: "too-big" }
    const trace = buildBoyerMooreStringSearchTrace(text, pattern, tr)
    return { kind: "ok", trace }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, lang])

  const frameCount = run.kind === "ok" ? run.trace.frames.length : 1
  const player = usePlayer(frameCount, sig)

  if (run.kind !== "ok") {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          {run.kind === "empty" ? t("play.bmEmpty") : t("play.bmTooBig", { max: MAX_TEXT })}
        </CardContent>
      </Card>
    )
  }

  const { trace } = run
  const index = Math.min(player.index, trace.frames.length - 1)
  const frame = trace.frames[index]
  const done = frame.step === "done"
  const isTable = frame.phase === "table"

  const codePanel = (
    <CodePanel
      code={isTable ? trace.tableCode : trace.searchCode}
      title={isTable ? t("play.bmCodeTable") : t("play.bmCodeSearch")}
      activeLines={frame.lines}
      contextLines={frame.contextLines}
      className="min-h-[320px]"
    />
  )

  const dataPanel = isTable ? (
    <ShiftTablePanel
      pattern={frame.pattern}
      table={frame.table}
      activeChar={frame.tableChar}
      activeIndex={frame.tableIndex}
      overwrite={frame.overwrite}
      prevShift={frame.prevShift}
      className="min-h-[320px] lg:col-span-2"
    />
  ) : (
    <BmStripPanel
      text={frame.text}
      pattern={frame.pattern}
      offset={frame.offset}
      j={frame.j}
      matchedSuffix={frame.matchedSuffix}
      mismatch={frame.compareMatch === false}
      full={frame.full}
      skippedNow={frame.skippedNow}
      className="min-h-[320px] lg:col-span-2"
    />
  )

  return (
    <PlayerShell
      player={player}
      caption={frame.caption}
      captionBadge={<PhaseBadge phase={frame.phase} />}
      statsBar={
        <StatsBar>
          <Stat label={t("play.bmStatPhase")} value={isTable ? t("play.bmPhaseTableShort") : t("play.bmPhaseSearchShort")} />
          <Stat label={t("play.bmStatComparisons")} value={String(frame.comparisons)} />
          <Stat label={t("play.bmStatJumps")} value={String(frame.jumps)} />
          <Stat label={t("play.bmStatSkipped")} value={String(frame.skipped)} />
          <Stat label={t("play.bmStatResult")} value={frame.result >= 0 ? String(frame.result) : "−1"} />
          <Stat label={t("play.bmStatLen")} value={`${text.length}/${pattern.length}`} />
        </StatsBar>
      }
      panels={
        <>
          {codePanel}
          {dataPanel}
        </>
      }
      secondRow={<ResultCard result={trace.result} done={done} />}
    />
  )
}

type Run =
  | { kind: "empty" }
  | { kind: "too-big" }
  | { kind: "ok"; trace: ReturnType<typeof buildBoyerMooreStringSearchTrace> }

// — дрібні презентаційні шматки ----------------------------------------------

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

function PhaseBadge({ phase }: { phase: BmPhase }) {
  const t = useT()
  const map: Record<BmPhase, { text: string; cls: string }> = {
    table: { text: t("play.bmPhaseTable"), cls: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
    search: { text: t("play.bmPhaseSearch"), cls: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
  }
  const b = map[phase]
  return (
    <span className={cn("ml-2 inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium", b.cls)}>
      {b.text}
    </span>
  )
}

function ResultCard({ result, done }: { result: BmResult; done: boolean }) {
  const t = useT()
  const found = result.found
  return (
    <Card className={cn("lg:col-span-3", done && (found ? "border-emerald-500/50" : "border-rose-500/40"))}>
      <CardContent className="flex flex-col gap-2 py-4 text-sm">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <div>
            <div className="text-muted-foreground">{t("play.bmResultLabel")}</div>
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
                  {t("play.bmResultIndex", { i: result.result })}
                </>
              ) : (
                <>
                  <X className="size-4" />
                  {t("play.bmResultAbsent")}
                </>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 tabular-nums text-muted-foreground">
            <span>{t("play.bmResultComparisons", { comparisons: result.comparisons })}</span>
            <span>{t("play.bmResultJumps", { jumps: result.jumps })}</span>
            <span>{t("play.bmResultSkipped", { skipped: result.skipped })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
