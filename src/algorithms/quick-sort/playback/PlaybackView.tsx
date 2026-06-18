import { useMemo, useState, type ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  buildQuickSortTrace,
  type QsPhase,
  type QsResult,
} from "@/lib/quickSortTrace"
import type { PivotStrategy } from "@/lib/quickSort"
import { useQuickSortStore } from "@/store/quick-sort-store"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { PlayerShell } from "@/algorithms/shared/playback/PlayerShell"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { QuickTreePanel } from "@/algorithms/quick-sort/playback/QuickTreePanel"
import { QuickPartitionPanel } from "@/algorithms/quick-sort/playback/QuickPartitionPanel"
import type { Translate } from "@/lib/translate"
import { useT } from "@/i18n/use-t"
import type { MessageKey } from "@/i18n/messages"
import { useLangStore } from "@/store/lang-store"
import { cn } from "@/lib/utils"

// Поріг розміру масиву: дерево рекурсії (вузлів O(n), глибина до n у виродженому
// випадку) стає завеликим для плавного плеєра — редактор попереджає вже від 14.
const MAX_SIZE = 16

const STRATEGIES: readonly PivotStrategy[] = ["middle", "first", "last", "median3"]

export function PlaybackView() {
  const values = useQuickSortStore((s) => s.values)
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)
  const [strategy, setStrategy] = useState<PivotStrategy>("middle")

  // Сигнатура стабільна щодо мови — курсор плеєра не скидається на UA/EN.
  const sig = `${strategy}|${values.join(",")}`

  const run = useMemo<Run>(() => {
    if (values.length === 0) return { kind: "empty" }
    if (values.length > MAX_SIZE) return { kind: "too-big" }
    const trace = buildQuickSortTrace(values, strategy, tr)
    return { kind: "ok", trace }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, lang])

  const frameCount = run.kind === "ok" ? run.trace.frames.length : 1
  const player = usePlayer(frameCount, sig)

  const switcher = <PivotSwitch strategy={strategy} onChange={setStrategy} />

  if (run.kind !== "ok") {
    return (
      <div className="flex flex-col gap-3">
        {switcher}
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {run.kind === "empty" ? t("play.qsEmpty") : t("play.qsTooBig", { max: MAX_SIZE })}
          </CardContent>
        </Card>
      </div>
    )
  }

  const { trace } = run
  const index = Math.min(player.index, trace.frames.length - 1)
  const frame = trace.frames[index]
  const node = trace.tree.nodes[frame.currentId]

  return (
    <PlayerShell
      player={player}
      headerExtra={switcher}
      caption={frame.caption}
      captionBadge={<PhaseBadge phase={frame.phase} />}
      statsBar={
        <StatsBar>
          <Stat label={t("play.qsStatComparisons")} value={String(frame.comparisons)} />
          <Stat label={t("play.qsStatCalls")} value={String(frame.calls)} />
          <Stat label={t("play.qsStatDepth")} value={String(trace.result.depth)} />
          <Stat label={t("play.qsStatSize")} value={String(trace.result.size)} />
        </StatsBar>
      }
      panels={
        <>
          <CodePanel
            code={trace.code}
            title={t("play.qsCodeTitle")}
            activeLines={frame.lines}
            contextLines={frame.contextLines}
            className="min-h-[340px]"
          />
          <QuickTreePanel
            tree={trace.tree}
            revealedMax={frame.revealedMax}
            currentId={frame.phase === "done" ? null : frame.currentId}
            className="min-h-[340px] lg:col-span-2"
          />
        </>
      }
      secondRow={
        <>
          <QuickPartitionPanel
            node={node}
            phase={frame.phase}
            sorted={trace.result.sorted}
            className="lg:col-span-2"
          />
          <ResultCard result={trace.result} done={frame.phase === "done"} />
        </>
      }
    />
  )
}

type Run =
  | { kind: "empty" }
  | { kind: "too-big" }
  | { kind: "ok"; trace: ReturnType<typeof buildQuickSortTrace> }

// — дрібні презентаційні шматки ----------------------------------------------

function PivotSwitch({
  strategy,
  onChange,
}: {
  strategy: PivotStrategy
  onChange: (s: PivotStrategy) => void
}) {
  const t = useT()
  const label: Record<PivotStrategy, string> = {
    middle: t("play.qsPivotMiddle"),
    first: t("play.qsPivotFirst"),
    last: t("play.qsPivotLast"),
    median3: t("play.qsPivotMedian3"),
  }
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="font-medium text-muted-foreground">{t("play.qsPivot")}</span>
      <div className="inline-flex flex-wrap rounded-md border p-0.5">
        {STRATEGIES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={cn(
              "rounded px-3 py-1 transition-colors",
              strategy === s
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

function PhaseBadge({ phase }: { phase: QsPhase }) {
  const t = useT()
  const map = {
    partition: { text: t("play.qsPhasePartition"), cls: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
    base: { text: t("play.qsPhaseBase"), cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
    done: { text: t("play.qsPhaseDone"), cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
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
  result: QsResult
  done: boolean
  className?: string
}) {
  const t = useT()
  return (
    <Card className={cn(className, done && "border-emerald-500/50")}>
      <CardContent className="flex flex-col gap-2 py-4 text-sm">
        <div>
          <div className="text-muted-foreground">{t("play.qsInputLabel")}</div>
          <div className="font-mono text-xs">[{result.input.join(", ")}]</div>
        </div>
        <div>
          <div className="text-muted-foreground">{t("play.qsSortedLabel")}</div>
          <div className="font-mono text-xs">{done ? `[${result.sorted.join(", ")}]` : "…"}</div>
        </div>
        <div className="tabular-nums text-xs">
          {t("play.qsResultCounts", {
            comparisons: result.comparisons,
            calls: result.calls,
            depth: result.depth,
          })}
        </div>
      </CardContent>
    </Card>
  )
}
