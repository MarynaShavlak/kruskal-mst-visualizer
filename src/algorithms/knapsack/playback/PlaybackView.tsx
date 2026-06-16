import { useMemo, useState, type ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { buildKnapsackTrace } from "@/lib/knapsackTrace"
import { buildGreedyTrace, buildBruteTrace } from "@/lib/knapsackAltTrace"
import { knapsackCells } from "@/lib/knapsack"
import { useKnapsackStore } from "@/store/knapsack-store"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { PlayerShell } from "@/algorithms/shared/playback/PlayerShell"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { DpGridPanel } from "@/algorithms/knapsack/playback/DpGridPanel"
import { ItemsPanel } from "@/algorithms/knapsack/playback/ItemsPanel"
import { GreedyPanel } from "@/algorithms/knapsack/playback/GreedyPanel"
import { SubsetsPanel } from "@/algorithms/knapsack/playback/SubsetsPanel"
import type { Translate } from "@/lib/translate"
import { useT } from "@/i18n/use-t"
import type { MessageKey } from "@/i18n/messages"
import { useLangStore } from "@/store/lang-store"
import { cn } from "@/lib/utils"

type Mode = "dp" | "greedy" | "brute"

// Ліміти, щоб плеєр лишався плавним: ДП-таблиця в кадрах = (n+1)·(W+1); перебір —
// 2ⁿ кадрів. Вище — показуємо повідомлення (редактор попереджає ще раніше).
const MAX_CELLS = 4000
const MAX_SUBSETS = 1024

export function PlaybackView() {
  const items = useKnapsackStore((s) => s.items)
  const capacity = useKnapsackStore((s) => s.capacity)
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)
  const [mode, setMode] = useState<Mode>("dp")

  const n = items.length
  // Сигнатура інстансу стабільна щодо мови — курсор плеєра не скидається на UA/EN.
  const sig = `${mode}|${capacity}|${items
    .map((it) => `${it.name},${it.weight},${it.value}`)
    .join(";")}`

  const run = useMemo<Run>(() => {
    const instance = { items, capacity }
    if (n === 0) return { kind: "empty" }
    if (mode === "dp") {
      if (knapsackCells(n, capacity) > MAX_CELLS) return { kind: "too-big-dp" }
      const r = buildKnapsackTrace(instance, tr)
      return { kind: "dp", frames: r.trace.frames, code: r.trace.code, result: r.result }
    }
    if (mode === "greedy") {
      const r = buildGreedyTrace(instance, tr)
      return { kind: "greedy", frames: r.frames, code: r.code, result: r.result }
    }
    if (2 ** n > MAX_SUBSETS) return { kind: "too-big-brute" }
    const r = buildBruteTrace(instance, tr)
    return { kind: "brute", frames: r.frames, code: r.code, result: r.result }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, lang])

  const frameCount = "frames" in run ? run.frames.length : 1
  const player = usePlayer(frameCount, sig)

  const switcher = <ModeSwitch mode={mode} onChange={setMode} />

  if (run.kind === "empty" || run.kind === "too-big-dp" || run.kind === "too-big-brute") {
    return (
      <div className="flex flex-col gap-3">
        {switcher}
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {run.kind === "empty"
              ? t("play.knapEmpty")
              : run.kind === "too-big-dp"
                ? t("play.knapDpTooBig", { max: MAX_CELLS })
                : t("play.knapBruteTooBig")}
          </CardContent>
        </Card>
      </div>
    )
  }

  const index = Math.min(player.index, run.frames.length - 1)

  if (run.kind === "dp") {
    const frame = run.frames[index]
    const done = frame.phase === "done"
    return (
      <PlayerShell
        player={player}
        headerExtra={switcher}
        caption={frame.caption}
        captionBadge={<DpBadge phase={frame.phase} />}
        statsBar={
          <StatsBar>
            <Stat label={t("play.knapStatFilled")} value={`${Math.min(frame.filled, run.result.operations)}/${run.result.operations}`} />
            <Stat label={t("play.knapStatItems")} value={String(run.result.weights.length)} />
            <Stat label={t("play.knapStatCapacity")} value={String(run.result.capacity)} />
          </StatsBar>
        }
        panels={
          <>
            <CodePanel
              code={run.code}
              title={t("play.codeKnapDp")}
              activeLines={frame.lines}
              contextLines={frame.contextLines}
              className="min-h-[320px]"
            />
            <ItemsPanel result={run.result} frame={frame} className="min-h-[320px]" />
            <DpResultCard result={run.result} done={done} />
          </>
        }
        secondRow={
          <DpGridPanel
            result={run.result}
            frame={frame}
            className="max-h-[440px] lg:col-span-3"
          />
        }
      />
    )
  }

  if (run.kind === "greedy") {
    const frame = run.frames[index]
    return (
      <PlayerShell
        player={player}
        headerExtra={switcher}
        caption={frame.caption}
        panels={
          <>
            <GreedyPanel result={run.result} frame={frame} className="min-h-[320px]" />
            <CodePanel
              code={run.code}
              title={t("play.codeKnapGreedy")}
              activeLines={frame.lines}
              contextLines={frame.contextLines}
              className="min-h-[320px]"
            />
            <GreedyResultCard result={run.result} done={frame.sub.kind === "done"} />
          </>
        }
      />
    )
  }

  // brute
  const frame = run.frames[index]
  return (
    <PlayerShell
      player={player}
      headerExtra={switcher}
      caption={frame.caption}
      statsBar={
        <StatsBar>
          <Stat
            label={t("play.knapStatChecked")}
            value={`${frame.index !== null ? frame.index + 1 : frame.sub.kind === "done" ? run.result.subsets.length : 0}/${run.result.subsets.length}`}
          />
          <Stat label={t("play.knapStatBest")} value={String(frame.bestValue)} />
        </StatsBar>
      }
      panels={
        <>
          <SubsetsPanel result={run.result} frame={frame} className="min-h-[320px]" />
          <CodePanel
            code={run.code}
            title={t("play.codeKnapBrute")}
            activeLines={frame.lines}
            contextLines={frame.contextLines}
            className="min-h-[320px]"
          />
          <BruteResultCard result={run.result} done={frame.sub.kind === "done"} />
        </>
      }
    />
  )
}

// — допоміжні типи run-union ------------------------------------------------
type DpRun = {
  kind: "dp"
  frames: ReturnType<typeof buildKnapsackTrace>["trace"]["frames"]
  code: readonly string[]
  result: ReturnType<typeof buildKnapsackTrace>["result"]
}
type GreedyRunT = {
  kind: "greedy"
  frames: ReturnType<typeof buildGreedyTrace>["frames"]
  code: readonly string[]
  result: ReturnType<typeof buildGreedyTrace>["result"]
}
type BruteRunT = {
  kind: "brute"
  frames: ReturnType<typeof buildBruteTrace>["frames"]
  code: readonly string[]
  result: ReturnType<typeof buildBruteTrace>["result"]
}
type Run =
  | { kind: "empty" }
  | { kind: "too-big-dp" }
  | { kind: "too-big-brute" }
  | DpRun
  | GreedyRunT
  | BruteRunT

// — дрібні презентаційні шматки ----------------------------------------------

function ModeSwitch({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  const t = useT()
  const opts: { key: Mode; label: string }[] = [
    { key: "dp", label: t("play.knapModeDp") },
    { key: "greedy", label: t("play.knapModeGreedy") },
    { key: "brute", label: t("play.knapModeBrute") },
  ]
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="font-medium text-muted-foreground">{t("play.knapMethod")}</span>
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

function DpBadge({ phase }: { phase: "fill" | "backtrack" | "done" }) {
  const t = useT()
  const map = {
    fill: { text: t("play.knapPhaseFill"), cls: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
    backtrack: { text: t("play.knapPhaseBacktrack"), cls: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
    done: { text: t("play.knapPhaseDone"), cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  }
  const b = map[phase]
  return (
    <span className={cn("ml-2 inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium", b.cls)}>
      {b.text}
    </span>
  )
}

function DpResultCard({ result, done }: { result: DpRun["result"]; done: boolean }) {
  const t = useT()
  const set = result.chosen.map((i) => result.itemNames[i]).join(", ") || "∅"
  const weight = result.chosen.reduce((acc, i) => acc + result.weights[i], 0)
  return (
    <Card className={cn("min-h-[320px]", done && "border-emerald-500/50")}>
      <CardContent className="space-y-1 py-4 text-sm">
        <div className="text-muted-foreground">{t("play.knapOptimum")}</div>
        <div className="text-3xl font-semibold tabular-nums">{result.best}</div>
        <div className="pt-1 text-muted-foreground">{t("play.knapChosenSet")}</div>
        <div className="font-mono">{done ? set : "…"}</div>
        {done && (
          <div className="text-xs text-muted-foreground">
            {t("play.knapSetWeight", { w: weight, cap: result.capacity })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function GreedyResultCard({ result, done }: { result: GreedyRunT["result"]; done: boolean }) {
  const t = useT()
  const gap = result.optimal - result.greedyValue
  const loses = gap > 0
  return (
    <Card className={cn("min-h-[320px]", done && (loses ? "border-amber-500/50" : "border-emerald-500/50"))}>
      <CardContent className="space-y-1 py-4 text-sm">
        <div className="text-muted-foreground">{t("play.knapGreedyValue")}</div>
        <div className="text-3xl font-semibold tabular-nums">{result.greedyValue}</div>
        <div className="pt-1 text-muted-foreground">
          {t("play.knapVsOptimal", { optimal: result.optimal })}
        </div>
        {done && loses && (
          <div className="rounded-md bg-amber-500/10 px-2 py-1.5 text-xs text-amber-700 dark:text-amber-300">
            {t("play.knapGreedyLoses", { gap })}
          </div>
        )}
        {done && !loses && (
          <div className="text-xs text-emerald-600 dark:text-emerald-400">
            {t("play.knapGreedyMatches")}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function BruteResultCard({ result, done }: { result: BruteRunT["result"]; done: boolean }) {
  const t = useT()
  const set = result.bestCombo.map((i) => result.itemNames[i]).join(", ") || "∅"
  return (
    <Card className={cn("min-h-[320px]", done && "border-emerald-500/50")}>
      <CardContent className="space-y-1 py-4 text-sm">
        <div className="text-muted-foreground">{t("play.knapBest")}</div>
        <div className="text-3xl font-semibold tabular-nums">{result.bestValue}</div>
        <div className="pt-1 font-mono">{`{${set}}`}</div>
        <div className="text-xs text-muted-foreground">
          {t("play.knapChecked", { n: result.subsets.length })}
        </div>
      </CardContent>
    </Card>
  )
}
