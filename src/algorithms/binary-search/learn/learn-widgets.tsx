import { useMemo, type ReactNode } from "react"
import { buildBinarySearchTrace } from "@/lib/binarySearchTrace"
import { binarySearch, lowerBound, upperBound, caseAnalysis } from "@/lib/binarySearch"
import { WindowView } from "@/algorithms/binary-search/playback/WindowPanel"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { SearchTargetBadge } from "@/algorithms/shared/playback/SearchTargetBadge"
import { MiniPlayerShell } from "@/algorithms/shared/learn/MiniPlayerShell"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { useT } from "@/i18n/use-t"
import type { MessageKey } from "@/i18n/messages"
import type { Translate } from "@/lib/translate"
import { useLangStore } from "@/store/lang-store"
import { cn } from "@/lib/utils"
import { BS_INTRO, BS_DUPLICATES } from "@/lib/exampleBinarySearch"

// Живі навчальні віджети двійкового пошуку на еталонних масивах. Головний образ —
// ВІКНО [low..high], що звужується вдвічі (а не стовпчики/кошики). «Ціна» — кроки.

/** Обгортка фігури: рамка-картка + опційний підпис (alt із markdown). */
function Figure({ caption, children }: { caption?: string; children: ReactNode }) {
  return (
    <span className="not-prose my-4 block overflow-x-auto rounded-lg border bg-card p-3">
      {children}
      {caption && (
        <span className="mt-2 block text-center text-xs text-muted-foreground">
          {caption}
        </span>
      )}
    </span>
  )
}

/** Бейдж «шукаємо: x». */
function TargetBadge({ target }: { target: number }) {
  const t = useT()
  return (
    <SearchTargetBadge className="mb-2">{t("play.binTargetBadge", { target })}</SearchTargetBadge>
  )
}

function useTrace(values: readonly number[], target: number, recursive: boolean) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)
  return useMemo(
    () => buildBinarySearchTrace(values, target, recursive, tr),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values, target, recursive, lang],
  )
}

/** Прокидає поля кадру у WindowView (роль/вікно/збіг). */
function frameView(f: ReturnType<typeof useTrace>["frames"][number]) {
  return {
    array: f.array,
    low: f.low,
    high: f.high,
    mid: f.mid,
    probing: f.phase === "probe",
    discardLo: f.discardLo,
    discardHi: f.discardHi,
    result: f.result,
    resolved: f.phase === "found" || f.phase === "done",
  }
}

// — Масив (стартове вікно) ----------------------------------------------------

export function ArrayFigure({
  values,
  target,
  caption,
}: {
  values: readonly number[]
  target: number
  caption?: string
}) {
  return (
    <Figure caption={caption}>
      <span className="block text-center">
        <TargetBadge target={target} />
      </span>
      <WindowView
        array={values}
        low={0}
        high={values.length - 1}
        mid={null}
        probing={false}
        discardLo={null}
        discardHi={null}
        result={-1}
        resolved={false}
      />
    </Figure>
  )
}

// — Один крок трасування ------------------------------------------------------

export function StepFigure({
  values,
  target,
  recursive = false,
  frameIndex,
  caption,
}: {
  values: readonly number[]
  target: number
  recursive?: boolean
  frameIndex: number
  caption?: string
}) {
  const trace = useTrace(values, target, recursive)
  const f = trace.frames[Math.min(Math.max(0, frameIndex), trace.frames.length - 1)]
  return (
    <Figure caption={caption}>
      <span className="block text-center">
        <TargetBadge target={target} />
      </span>
      <WindowView {...frameView(f)} />
      <span className="mt-2 block text-center text-[11px] text-muted-foreground">{f.caption}</span>
    </Figure>
  )
}

// — Результат -----------------------------------------------------------------

export function ResultFigure({
  values,
  target,
  caption,
}: {
  values: readonly number[]
  target: number
  caption?: string
}) {
  const t = useT()
  const trace = useTrace(values, target, false)
  const done = trace.frames[trace.frames.length - 1]
  return (
    <Figure caption={caption}>
      <span className="block text-center">
        <TargetBadge target={target} />
      </span>
      <WindowView {...frameView(done)} />
      <span className="mt-2 block text-center text-sm tabular-nums">
        {trace.result.found
          ? t("learn.binResultFound", { i: trace.result.result, steps: trace.result.steps })
          : t("learn.binResultAbsent", { steps: trace.result.steps })}
      </span>
    </Figure>
  )
}

// — Еволюція вікна (рядок на кожен крок) --------------------------------------

export function EvolutionFigure({
  values,
  target,
  caption,
}: {
  values: readonly number[]
  target: number
  caption?: string
}) {
  const t = useT()
  const trace = useTrace(values, target, false)
  const probes = trace.frames.filter((f) => f.phase === "probe" || f.phase === "found")
  return (
    <Figure caption={caption}>
      <span className="block text-center">
        <TargetBadge target={target} />
      </span>
      <span className="flex flex-col gap-2">
        {probes.map((f, ri) => (
          <span key={ri} className="flex items-center gap-2">
            <span className="w-24 shrink-0 text-right text-[11px] font-medium text-muted-foreground">
              {t("learn.binEvolStep", { k: ri + 1, low: f.low, high: f.high })}
            </span>
            <WindowView {...frameView(f)} size="md" />
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
  caption,
}: {
  values: readonly number[]
  target: number
  caption?: string
}) {
  const trace = useTrace(values, target, false)
  const player = usePlayer(trace.frames.length, `${values.join()}|${target}`)
  const f = trace.frames[Math.min(player.index, trace.frames.length - 1)]
  return (
    <MiniPlayerShell player={player} frameCount={trace.frames.length} caption={f.caption}>
      <span className="block text-center">
        <TargetBadge target={target} />
      </span>
      <span className="block overflow-auto">
        <WindowView {...frameView(f)} />
      </span>
      {caption && (
        <span className="mt-2 block text-center text-xs text-muted-foreground">{caption}</span>
      )}
    </MiniPlayerShell>
  )
}

// — Аналіз випадків (кроки) ---------------------------------------------------

export function CasesFigure({ caption }: { caption?: string }) {
  const t = useT()
  const { values } = BS_INTRO
  const c = caseAnalysis(values)
  const rows: { label: string; steps: number; cls: string }[] = [
    { label: t("learn.binCaseBest"), steps: c.best, cls: "bg-emerald-500/60" },
    { label: t("learn.binCaseWorst"), steps: c.worst, cls: "bg-amber-500/60" },
    { label: t("learn.binCaseLinear"), steps: c.linear, cls: "bg-rose-500/60" },
  ]
  const max = Math.max(...rows.map((r) => r.steps), 1)
  return (
    <Figure caption={caption}>
      <span className="mb-2 block text-center text-xs text-muted-foreground">
        {t("learn.binCasesArray", { arr: `[${values.join(", ")}]` })}
      </span>
      <span className="flex flex-col gap-1.5">
        {rows.map((r) => (
          <span key={r.label} className="flex items-center gap-2">
            <span className="w-40 shrink-0 text-right text-[11px] font-medium text-muted-foreground">
              {r.label}
            </span>
            <span className="flex h-5 flex-1 items-center">
              <span
                className={cn("inline-block h-3.5 rounded-sm", r.cls)}
                style={{ width: `${(r.steps / max) * 100}%` }}
              />
              <span className="ml-2 text-xs font-medium tabular-nums">{r.steps}</span>
            </span>
          </span>
        ))}
      </span>
    </Figure>
  )
}

// — Логарифм: скільки разів поділити навпіл ------------------------------------

export function LogFigure({ caption }: { caption?: string }) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const locale = lang === "ua" ? "uk-UA" : "en-US"
  const fmt = (x: number) => x.toLocaleString(locale)
  const rows = [8, 16, 64, 1024, 1048576]
  return (
    <Figure caption={caption}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-right text-xs text-muted-foreground">
            <th className="px-2 py-1 text-left font-medium">n</th>
            <th className="px-2 py-1 font-mono font-medium">log₂ n</th>
            <th className="px-2 py-1 font-medium">{t("learn.binLogHalvings")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((n) => (
            <tr key={n} className="border-b last:border-0 text-right tabular-nums">
              <td className="px-2 py-1 text-left font-medium">{fmt(n)}</td>
              <td className="px-2 py-1 font-mono text-emerald-700 dark:text-emerald-400">
                {Math.log2(n)}
              </td>
              <td className="px-2 py-1 font-mono text-muted-foreground">2^{Math.log2(n)} = {fmt(n)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <span className="mt-1.5 block text-xs text-muted-foreground">{t("learn.binLogNote")}</span>
    </Figure>
  )
}

// — Лінійний проти двійкового -------------------------------------------------

export function ComparisonFigure({ caption }: { caption?: string }) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const locale = lang === "ua" ? "uk-UA" : "en-US"
  const fmt = (x: number) => Math.round(x).toLocaleString(locale)
  const rows = [10, 100, 1000, 10000, 100000, 1000000]
  return (
    <Figure caption={caption}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-right text-xs text-muted-foreground">
            <th className="px-2 py-1 text-left font-medium">n</th>
            <th className="px-2 py-1 font-mono font-medium">{t("learn.binCmpLinear")}</th>
            <th className="px-2 py-1 font-mono font-medium">{t("learn.binCmpBinary")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((n) => (
            <tr key={n} className="border-b last:border-0 text-right tabular-nums">
              <td className="px-2 py-1 text-left font-medium">{fmt(n)}</td>
              <td className="px-2 py-1 font-mono text-rose-600 dark:text-rose-400">{fmt(n)}</td>
              <td className="px-2 py-1 font-mono text-emerald-700 dark:text-emerald-400">
                {Math.floor(Math.log2(n)) + 1}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <span className="mt-1.5 block text-xs text-muted-foreground">{t("learn.binCmpNote")}</span>
    </Figure>
  )
}

// — Дублікати: lower_bound / upper_bound --------------------------------------

export function DuplicatesFigure({ caption }: { caption?: string }) {
  const t = useT()
  const { values, target } = BS_DUPLICATES
  const some = binarySearch(values, target)
  const lo = lowerBound(values, target)
  const hi = upperBound(values, target)
  return (
    <Figure caption={caption}>
      <span className="block text-center">
        <TargetBadge target={target} />
      </span>
      <span className="flex flex-wrap justify-center gap-1.5">
        {values.map((v, i) => {
          const inRange = i >= lo && i < hi
          return (
            <span key={i} className="flex flex-col items-center gap-0.5">
              <span
                className={cn(
                  "inline-flex min-w-[2rem] items-center justify-center rounded-md border-2 px-1.5 py-2 font-mono text-sm tabular-nums",
                  inRange
                    ? "border-emerald-500/70 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    : "border-border bg-muted/30 text-muted-foreground/60",
                )}
              >
                {v}
              </span>
              <span className="text-[10px] tabular-nums text-muted-foreground/60">{i}</span>
            </span>
          )
        })}
      </span>
      <span className="mt-3 flex flex-col gap-1 text-xs tabular-nums">
        <span>{t("learn.binDupSome", { r: some })}</span>
        <span className="text-emerald-700 dark:text-emerald-300">
          {t("learn.binDupBounds", { lo, hi, count: hi - lo })}
        </span>
      </span>
    </Figure>
  )
}

// — Інтуїція: гра «вгадай число» ----------------------------------------------

export function GuessFigure({ caption }: { caption?: string }) {
  const t = useT()
  // Загадане 73 у діапазоні 1..100 — вгадуємо поділом навпіл.
  const SECRET = 73
  const HI = 100
  const rows: { lo: number; hi: number; mid: number; hint: string }[] = []
  let lo = 1
  let hi = HI
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (mid === SECRET) {
      rows.push({ lo, hi, mid, hint: "eq" })
      break
    } else if (mid < SECRET) {
      rows.push({ lo, hi, mid, hint: "lt" })
      lo = mid + 1
    } else {
      rows.push({ lo, hi, mid, hint: "gt" })
      hi = mid - 1
    }
  }
  const hintText = (h: string) =>
    h === "eq" ? t("learn.binGuessFound") : h === "lt" ? t("learn.binGuessHigher") : t("learn.binGuessLower")
  return (
    <Figure caption={caption}>
      <span className="mb-2 block text-center text-xs text-muted-foreground">
        {t("learn.binGuessTitle", { hi: HI, secret: SECRET })}
      </span>
      <table className="mx-auto border-collapse text-sm">
        <thead>
          <tr className="border-b text-xs text-muted-foreground">
            <th className="px-3 py-1 font-medium">{t("learn.binGuessStep")}</th>
            <th className="px-3 py-1 font-medium">{t("learn.binGuessRange")}</th>
            <th className="px-3 py-1 font-medium">{t("learn.binGuessGuess")}</th>
            <th className="px-3 py-1 font-medium">{t("learn.binGuessHint")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b last:border-0 text-center tabular-nums">
              <td className="px-3 py-1">{i + 1}</td>
              <td className="px-3 py-1 font-mono">[{r.lo}, {r.hi}]</td>
              <td className="px-3 py-1 font-mono font-semibold text-rose-600 dark:text-rose-400">{r.mid}</td>
              <td
                className={cn(
                  "px-3 py-1",
                  r.hint === "eq" && "font-medium text-emerald-700 dark:text-emerald-300",
                )}
              >
                {hintText(r.hint)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <span className="mt-2 block text-center text-xs text-muted-foreground">
        {t("learn.binGuessNote", { steps: rows.length, hi: HI })}
      </span>
    </Figure>
  )
}

// — Код ↔ вікно (міні-плеєр) --------------------------------------------------

export function CodeWalkthroughFigure({
  values,
  target,
  caption,
}: {
  values: readonly number[]
  target: number
  caption?: string
}) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const trace = useTrace(values, target, false)
  const player = usePlayer(trace.frames.length, `${values.join()}|${target}|${lang}`)
  const f = trace.frames[Math.min(player.index, trace.frames.length - 1)]
  return (
    <MiniPlayerShell player={player} frameCount={trace.frames.length} caption={f.caption}>
      <span className="grid gap-3 lg:grid-cols-2">
        <CodePanel
          code={trace.code}
          title={t("play.binCodeIterative")}
          activeLines={f.lines}
          contextLines={f.contextLines}
          className="h-[320px]"
        />
        <span className="flex h-[320px] flex-col items-center justify-center gap-2 overflow-auto rounded-lg border bg-card p-3">
          <TargetBadge target={target} />
          <WindowView {...frameView(f)} />
        </span>
      </span>
      {caption && (
        <span className="mt-2 block text-center text-xs text-muted-foreground">{caption}</span>
      )}
    </MiniPlayerShell>
  )
}

// Інтуїція «перевірили середину → відкинули половину»: один крок-розв'язок.
export function WindowStepFigure({
  values,
  target,
  caption,
}: {
  values: readonly number[]
  target: number
  caption?: string
}) {
  // Кадр 2 = розв'язок першого кроку (відкинули ліву половину).
  return <StepFigure values={values} target={target} frameIndex={2} caption={caption} />
}
