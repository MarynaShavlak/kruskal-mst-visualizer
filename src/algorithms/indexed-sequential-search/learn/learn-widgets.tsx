import { useMemo, type ReactNode } from "react"
import { Search } from "lucide-react"
import {
  buildIndexedSequentialSearchTrace,
  type IxsFrame,
} from "@/lib/indexedSequentialSearchTrace"
import {
  createIndexTable,
  countSteps,
  optimalStep,
  indexedSequentialSearchSteps,
  type IxsEvent,
} from "@/lib/indexedSequentialSearch"
import { TwoLevelView, type TwoLevelProps } from "@/algorithms/indexed-sequential-search/playback/TwoLevelPanel"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { MiniPlayerShell } from "@/algorithms/shared/learn/MiniPlayerShell"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { useT } from "@/i18n/use-t"
import type { MessageKey } from "@/i18n/messages"
import type { Translate } from "@/lib/translate"
import { useLangStore } from "@/store/lang-store"
import { cn } from "@/lib/utils"
import { IXS_MAIN } from "@/lib/exampleIndexedSequentialSearch"

// Живі навчальні віджети індексно-послідовного пошуку на еталонному масиві. Головний
// образ — ДВА РІВНІ: 🟪 індексна таблиця згори (фаза 1), ⬜ масив із блоками знизу
// (фаза 2). «Ціна» — два доданки: зондування індексу + порівняння в блоці.

/** Обгортка фігури: рамка-картка + опційний підпис (alt із markdown). */
function Figure({ caption, children }: { caption?: string; children: ReactNode }) {
  return (
    <span className="not-prose my-4 block overflow-x-auto rounded-lg border bg-card p-3">
      {children}
      {caption && (
        <span className="mt-2 block text-center text-xs text-muted-foreground">{caption}</span>
      )}
    </span>
  )
}

/** Бейджі «шукаємо: x» + «крок: s». */
function Badges({ target, step }: { target: number; step: number }) {
  const t = useT()
  return (
    <span className="mb-2 flex flex-wrap justify-center gap-2">
      <span className="inline-flex items-center gap-1.5 rounded-md border border-rose-400/50 bg-rose-500/10 px-2.5 py-1 text-sm font-medium text-rose-700 dark:text-rose-300">
        <Search className="size-3.5" />
        {t("play.issTargetBadge", { target })}
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-md border border-violet-400/50 bg-violet-500/10 px-2.5 py-1 text-sm font-medium text-violet-700 dark:text-violet-300">
        {t("play.issStepBadge", { step })}
      </span>
    </span>
  )
}

function useTrace(values: readonly number[], target: number, step: number, linearIndex = false) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)
  return useMemo(
    () => buildIndexedSequentialSearchTrace(values, target, step, linearIndex, tr),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values, target, step, linearIndex, lang],
  )
}

/** Поля кадру → TwoLevelView. */
function toView(f: IxsFrame, size: "sm" | "md" = "md"): TwoLevelProps {
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
    size,
  }
}

const clampFrame = (n: number, len: number) => Math.min(Math.max(0, n), len - 1)

// — Дворівнева схема (стартовий стан) -----------------------------------------

export function TwoLevelFigure({
  values,
  target,
  step,
  caption,
}: {
  values: readonly number[]
  target: number
  step: number
  caption?: string
}) {
  const trace = useTrace(values, target, step)
  return (
    <Figure caption={caption}>
      <Badges target={target} step={step} />
      <TwoLevelView {...toView(trace.frames[0])} />
    </Figure>
  )
}

// — Один крок трасування ------------------------------------------------------

export function StepFigure({
  values,
  target,
  step,
  frameIndex,
  caption,
}: {
  values: readonly number[]
  target: number
  step: number
  frameIndex: number
  caption?: string
}) {
  const trace = useTrace(values, target, step)
  const f = trace.frames[clampFrame(frameIndex, trace.frames.length)]
  return (
    <Figure caption={caption}>
      <Badges target={target} step={step} />
      <TwoLevelView {...toView(f)} />
      <span className="mt-2 block text-center text-[11px] text-muted-foreground">{f.caption}</span>
    </Figure>
  )
}

// — Результат -----------------------------------------------------------------

export function ResultFigure({
  values,
  target,
  step,
  caption,
}: {
  values: readonly number[]
  target: number
  step: number
  caption?: string
}) {
  const t = useT()
  const trace = useTrace(values, target, step)
  const done = trace.frames[trace.frames.length - 1]
  const r = trace.result
  return (
    <Figure caption={caption}>
      <Badges target={target} step={step} />
      <TwoLevelView {...toView(done)} />
      <span className="mt-2 block text-center text-sm tabular-nums">
        {r.found
          ? t("learn.issResultFound", { i: r.result, probes: r.indexProbes, seq: r.seqComparisons, total: r.total })
          : t("learn.issResultAbsent", { probes: r.indexProbes, seq: r.seqComparisons, total: r.total })}
      </span>
    </Figure>
  )
}

// — Покрокова еволюція (рядок на кожен розв'язок) ------------------------------

export function EvolutionFigure({
  values,
  target,
  step,
  caption,
}: {
  values: readonly number[]
  target: number
  step: number
  caption?: string
}) {
  const t = useT()
  const trace = useTrace(values, target, step)
  const steps = trace.frames.filter(
    (f) => f.phase === "discard" || f.phase === "block" || f.phase === "reject" || f.phase === "found",
  )
  return (
    <Figure caption={caption}>
      <Badges target={target} step={step} />
      <span className="flex flex-col gap-3">
        {steps.map((f, ri) => (
          <span key={ri} className="block rounded-md border bg-muted/20 p-2">
            <span className="mb-1 block text-[11px] font-medium text-muted-foreground">
              {t("learn.issEvolStep", { k: ri + 1 })}
            </span>
            <TwoLevelView {...toView(f, "sm")} />
          </span>
        ))}
      </span>
    </Figure>
  )
}

// — Анімація (міні-плеєр) -----------------------------------------------------

export function AnimationFigure({
  values,
  target,
  step,
  caption,
}: {
  values: readonly number[]
  target: number
  step: number
  caption?: string
}) {
  const trace = useTrace(values, target, step)
  const player = usePlayer(trace.frames.length, `${values.join()}|${target}|${step}`)
  const f = trace.frames[Math.min(player.index, trace.frames.length - 1)]
  return (
    <MiniPlayerShell player={player} frameCount={trace.frames.length} caption={f.caption}>
      <Badges target={target} step={step} />
      <span className="block overflow-auto">
        <TwoLevelView {...toView(f)} />
      </span>
      {caption && (
        <span className="mt-2 block text-center text-xs text-muted-foreground">{caption}</span>
      )}
    </MiniPlayerShell>
  )
}

// — Код ↔ дані (міні-плеєр) ---------------------------------------------------

export function CodeWalkthroughFigure({
  values,
  target,
  step,
  caption,
}: {
  values: readonly number[]
  target: number
  step: number
  caption?: string
}) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const trace = useTrace(values, target, step)
  const player = usePlayer(trace.frames.length, `${values.join()}|${target}|${step}|${lang}`)
  const f = trace.frames[Math.min(player.index, trace.frames.length - 1)]
  return (
    <MiniPlayerShell player={player} frameCount={trace.frames.length} caption={f.caption}>
      <span className="grid gap-3 lg:grid-cols-2">
        <CodePanel
          code={trace.code}
          title={t("play.issCodeBinary")}
          activeLines={f.lines}
          contextLines={f.contextLines}
          className="h-[360px]"
        />
        <span className="flex h-[360px] flex-col items-center justify-center gap-2 overflow-auto rounded-lg border bg-card p-3">
          <Badges target={target} step={step} />
          <TwoLevelView {...toView(f, "sm")} />
        </span>
      </span>
      {caption && (
        <span className="mt-2 block text-center text-xs text-muted-foreground">{caption}</span>
      )}
    </MiniPlayerShell>
  )
}

// — Інтуїція: книжка з вкладками-роздільниками ---------------------------------

export function IntuitionFigure({ caption }: { caption?: string }) {
  const t = useT()
  const { values, step } = IXS_MAIN
  const table = createIndexTable(values, step)
  return (
    <Figure caption={caption}>
      {/* вкладки = індекс */}
      <span className="mb-1 block text-center text-[11px] font-medium text-violet-600/80 dark:text-violet-400/80">
        {t("learn.issIntuitionTabs")}
      </span>
      <span className="mb-3 flex flex-wrap justify-center gap-1.5">
        {table.map(([key], j) => (
          <span
            key={j}
            className="inline-flex min-w-[2.2rem] items-center justify-center rounded-t-lg border-2 border-b-0 border-violet-400/60 bg-violet-500/15 px-2 py-2 font-mono text-sm text-violet-700 dark:text-violet-300"
          >
            {key}
          </span>
        ))}
      </span>
      {/* сторінки = масив */}
      <span className="mb-1 block text-center text-[11px] font-medium text-muted-foreground">
        {t("learn.issIntuitionPages")}
      </span>
      <span className="flex flex-wrap justify-center gap-1">
        {values.map((v, i) => (
          <span
            key={i}
            className="inline-flex min-w-[1.7rem] items-center justify-center rounded border bg-muted/30 px-1 py-1.5 font-mono text-xs tabular-nums text-muted-foreground"
          >
            {v}
          </span>
        ))}
      </span>
      <span className="mt-3 block text-center text-xs text-muted-foreground">
        {t("learn.issIntuitionNote")}
      </span>
    </Figure>
  )
}

// — Таблиця кроків (журнал подій) ---------------------------------------------

const cmpSym = (c: IxsEvent["compare"]) => (c === "lt" ? "<" : c === "gt" ? ">" : c === "eq" ? "=" : "")

export function StepTableFigure({
  values,
  target,
  step,
  caption,
}: {
  values: readonly number[]
  target: number
  step: number
  caption?: string
}) {
  const t = useT()
  const { events } = indexedSequentialSearchSteps(values, target, step)
  const rows = events.filter((e) => e.kind !== "init" && e.kind !== "final" && e.kind !== "not_found")
  const cell = "border px-2 py-1 text-center"
  return (
    <Figure caption={caption}>
      <table className="mx-auto border-collapse text-xs tabular-nums">
        <thead>
          <tr className="bg-muted/40 text-muted-foreground">
            <th className={cell}>{t("learn.issTblPhase")}</th>
            <th className={cell}>{t("learn.issTblWindow")}</th>
            <th className={cell}>{t("learn.issTblMid")}</th>
            <th className={cell}>{t("learn.issTblCompare")}</th>
            <th className={cell}>{t("learn.issTblBlock")}</th>
            <th className={cell}>{t("learn.issTblCursor")}</th>
            <th className={cell}>{t("learn.issTblMatch")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((e, i) => {
            const isIndex = e.phase === "index"
            const isBlockSel = e.kind === "block_selected"
            const phaseLabel = isBlockSel ? "→" : isIndex ? t("learn.issTblP1") : t("learn.issTblP2")
            const window = isIndex ? `[${e.start}..${e.end}]` : "—"
            const mid = isIndex && e.mid != null ? `${e.mid} (${e.key})` : "—"
            const compare =
              isBlockSel
                ? String(e.branch)
                : isIndex
                  ? `${e.key} ${cmpSym(e.compare)} ${target}`
                  : `${e.value} ${e.match ? "=" : "≠"} ${target}`
            const block = e.searchRange ? `[${e.searchRange[0]},${e.searchRange[1]})` : "—"
            const cursor = e.i != null ? String(e.i) : "—"
            const match = isBlockSel ? "—" : e.kind === "found" ? t("learn.issTblYes") : t("learn.issTblNo")
            return (
              <tr
                key={i}
                className={cn(
                  e.kind === "found" && "bg-emerald-500/10 font-medium text-emerald-700 dark:text-emerald-300",
                  isBlockSel && "bg-violet-500/10 text-violet-700 dark:text-violet-300",
                )}
              >
                <td className={cell}>{phaseLabel}</td>
                <td className={cn(cell, "font-mono")}>{window}</td>
                <td className={cn(cell, "font-mono")}>{mid}</td>
                <td className={cn(cell, "font-mono")}>{compare}</td>
                <td className={cn(cell, "font-mono")}>{block}</td>
                <td className={cn(cell, "font-mono")}>{cursor}</td>
                <td className={cell}>{match}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <span className="mt-2 block text-center text-xs text-muted-foreground">{t("learn.issTblCaption")}</span>
    </Figure>
  )
}

// — Контраст складності: де лежить гібрид --------------------------------------

export function ComplexityFigure({ caption }: { caption?: string }) {
  const t = useT()
  const { values, target, step } = IXS_MAIN
  const n = values.length
  const linear = n
  const binary = Math.floor(Math.log2(n)) + 1
  const hybrid = countSteps(values, target, step).total
  const rows = [
    { label: t("learn.issCmpLinear"), v: linear, cls: "bg-rose-500/60" },
    { label: t("learn.issCmpHybrid"), v: hybrid, cls: "bg-emerald-500/60" },
    { label: t("learn.issCmpBinary"), v: binary, cls: "bg-sky-500/60" },
  ]
  const max = Math.max(...rows.map((r) => r.v), 1)
  return (
    <Figure caption={caption}>
      <span className="mb-2 block text-center text-xs text-muted-foreground">
        {t("learn.issCmpArray", { n, step })}
      </span>
      <span className="flex flex-col gap-1.5">
        {rows.map((r) => (
          <span key={r.label} className="flex items-center gap-2">
            <span className="w-40 shrink-0 text-right text-[11px] font-medium text-muted-foreground">{r.label}</span>
            <span className="flex h-5 flex-1 items-center">
              <span className={cn("inline-block h-3.5 rounded-sm", r.cls)} style={{ width: `${(r.v / max) * 100}%` }} />
              <span className="ml-2 text-xs font-medium tabular-nums">{r.v}</span>
            </span>
          </span>
        ))}
      </span>
      <span className="mt-2 block text-xs text-muted-foreground">{t("learn.issCmpNote")}</span>
    </Figure>
  )
}

// — Вибір кроку: порівнянь проти step (мінімум ≈ √n) ---------------------------

export function StepTradeoffFigure({ caption }: { caption?: string }) {
  const t = useT()
  const N = 100
  const opt = optimalStep(N)
  const steps = [2, 5, 10, 20, 50]
  const rows = steps.map((s) => {
    const index = Math.ceil(N / s)
    const block = s
    return { step: s, index, block, total: index + block }
  })
  const min = Math.min(...rows.map((r) => r.total))
  const cell = "border px-2 py-1 text-center"
  return (
    <Figure caption={caption}>
      <span className="mb-2 block text-center text-xs text-muted-foreground">
        {t("learn.issTradeTitle", { n: N })}
      </span>
      <table className="mx-auto border-collapse text-xs tabular-nums">
        <thead>
          <tr className="bg-muted/40 text-muted-foreground">
            <th className={cell}>{t("learn.issTradeStep")}</th>
            <th className={cell}>{t("learn.issTradeIndex")}</th>
            <th className={cell}>{t("learn.issTradeBlock")}</th>
            <th className={cell}>{t("learn.issTradeTotal")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.step}
              className={cn(r.total === min && "bg-emerald-500/10 font-medium text-emerald-700 dark:text-emerald-300")}
            >
              <td className={cn(cell, "font-mono")}>{r.step}</td>
              <td className={cn(cell, "font-mono text-rose-600 dark:text-rose-400")}>{r.index}</td>
              <td className={cn(cell, "font-mono text-sky-600 dark:text-sky-400")}>{r.block}</td>
              <td className={cn(cell, "font-mono")}>{r.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <span className="mt-2 block text-center text-xs font-medium text-emerald-700 dark:text-emerald-300">
        {t("learn.issTradeOptimal", { n: N, opt })}
      </span>
      <span className="mt-1 block text-xs text-muted-foreground">{t("learn.issTradeNote")}</span>
    </Figure>
  )
}
