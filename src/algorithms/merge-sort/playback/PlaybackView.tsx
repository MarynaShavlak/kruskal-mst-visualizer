import { useMemo, useState, type ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  buildMergeSortTrace,
  type MsPhase,
  type MsResult,
} from "@/lib/mergeSortTrace"
import type { MergeMode } from "@/lib/mergeSort"
import { useMergeSortStore } from "@/store/merge-sort-store"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { PlayerShell } from "@/algorithms/shared/playback/PlayerShell"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { MergeTreePanel } from "@/algorithms/merge-sort/playback/MergeTreePanel"
import { PassesPanel } from "@/algorithms/merge-sort/playback/PassesPanel"
import { MergeDetailPanel } from "@/algorithms/merge-sort/playback/MergeStatePanel"
import type { Translate } from "@/lib/translate"
import { useT } from "@/i18n/use-t"
import type { MessageKey } from "@/i18n/messages"
import { useLangStore } from "@/store/lang-store"
import { cn } from "@/lib/utils"

// Поріг розміру масиву: дерево рекурсії / проходи стають завеликими для плавного
// плеєра (редактор попереджає вже від 16).
const MAX_SIZE = 16

const MODES: readonly MergeMode[] = ["topDown", "bottomUp"]

export function PlaybackView() {
  const values = useMergeSortStore((s) => s.values)
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)
  const [mode, setMode] = useState<MergeMode>("topDown")

  // Сигнатура стабільна щодо мови — курсор плеєра не скидається на UA/EN.
  const sig = `${mode}|${values.join(",")}`

  const run = useMemo<Run>(() => {
    if (values.length === 0) return { kind: "empty" }
    if (values.length > MAX_SIZE) return { kind: "too-big" }
    const trace = buildMergeSortTrace(values, mode, tr)
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
            {run.kind === "empty" ? t("play.msEmpty") : t("play.msTooBig", { max: MAX_SIZE })}
          </CardContent>
        </Card>
      </div>
    )
  }

  const { trace } = run
  const index = Math.min(player.index, trace.frames.length - 1)
  const frame = trace.frames[index]
  const node = frame.currentId >= 0 ? trace.tree.nodes[frame.currentId] ?? null : null
  const done = frame.phase === "final"

  return (
    <PlayerShell
      player={player}
      headerExtra={switcher}
      caption={frame.caption}
      captionBadge={<PhaseBadge phase={frame.phase} />}
      statsBar={
        <StatsBar>
          <Stat label={t("play.msStatComparisons")} value={String(frame.comparisons)} />
          <Stat label={t("play.msStatAppends")} value={String(frame.appends)} />
          <Stat label={t("play.msStatMerges")} value={String(frame.merges)} />
          <Stat label={t("play.msStatDepth")} value={String(trace.result.depth)} />
          <Stat label={t("play.msStatSize")} value={String(trace.result.size)} />
        </StatsBar>
      }
      panels={
        <>
          <CodePanel
            code={trace.code}
            title={mode === "bottomUp" ? t("play.msCodeTitleBu") : t("play.msCodeTitleTd")}
            activeLines={frame.lines}
            contextLines={frame.contextLines}
            className="min-h-[360px]"
          />
          {mode === "topDown" ? (
            <MergeTreePanel
              tree={trace.tree}
              revealedMax={frame.revealedMax}
              currentId={done ? null : frame.currentId}
              mergedIds={frame.mergedIds}
              className="min-h-[360px] lg:col-span-2"
            />
          ) : (
            <PassesPanel
              passes={trace.passes}
              currentPass={frame.passIndex}
              mergeLo={frame.mergeLo}
              mergeHi={frame.mergeHi}
              done={done}
              className="min-h-[360px] lg:col-span-2"
            />
          )}
        </>
      }
      secondRow={
        <>
          <MergeDetailPanel
            phase={frame.phase}
            node={node}
            mergeLeft={frame.mergeLeft}
            mergeRight={frame.mergeRight}
            mergeStep={frame.mergeStep}
            input={trace.result.input}
            sorted={trace.result.sorted}
            className="lg:col-span-2"
          />
          <ResultCard result={trace.result} done={done} />
        </>
      }
    />
  )
}

type Run =
  | { kind: "empty" }
  | { kind: "too-big" }
  | { kind: "ok"; trace: ReturnType<typeof buildMergeSortTrace> }

// — дрібні презентаційні шматки ----------------------------------------------

function ModeSwitch({
  mode,
  onChange,
}: {
  mode: MergeMode
  onChange: (m: MergeMode) => void
}) {
  const t = useT()
  const label: Record<MergeMode, string> = {
    topDown: t("play.msModeTopDown"),
    bottomUp: t("play.msModeBottomUp"),
  }
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="font-medium text-muted-foreground">{t("play.msMode")}</span>
      <div className="inline-flex flex-wrap rounded-md border p-0.5">
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            className={cn(
              "rounded px-3 py-1 transition-colors",
              mode === m
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label[m]}
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

function PhaseBadge({ phase }: { phase: MsPhase }) {
  const t = useT()
  const map: Record<MsPhase, { text: string; cls: string }> = {
    init: { text: t("play.msPhaseInit"), cls: "bg-slate-500/15 text-slate-700 dark:text-slate-300" },
    split: { text: t("play.msPhaseSplit"), cls: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
    base: { text: t("play.msPhaseBase"), cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
    merge: { text: t("play.msPhaseMerge"), cls: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
    final: { text: t("play.msPhaseFinal"), cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
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
  result: MsResult
  done: boolean
  className?: string
}) {
  const t = useT()
  return (
    <Card className={cn(className, done && "border-emerald-500/50")}>
      <CardContent className="flex flex-col gap-2 py-4 text-sm">
        <div>
          <div className="text-muted-foreground">{t("play.msInputLabel")}</div>
          <div className="font-mono text-xs">[{result.input.join(", ")}]</div>
        </div>
        <div>
          <div className="text-muted-foreground">{t("play.msSortedLabel")}</div>
          <div className="font-mono text-xs">{done ? `[${result.sorted.join(", ")}]` : "…"}</div>
        </div>
        <div className="tabular-nums text-xs">
          {t("play.msResultCounts", {
            comparisons: result.comparisons,
            appends: result.appends,
            merges: result.merges,
            depth: result.depth,
          })}
        </div>
      </CardContent>
    </Card>
  )
}
