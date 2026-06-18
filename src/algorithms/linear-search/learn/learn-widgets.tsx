import { useMemo, type ReactNode } from "react"
import { Search } from "lucide-react"
import { buildLinearSearchTrace } from "@/lib/linearSearchTrace"
import { linearSearch, findAll, caseAnalysis } from "@/lib/linearSearch"
import { CellsView } from "@/algorithms/linear-search/playback/ScanPanel"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { MiniPlayerShell } from "@/algorithms/shared/learn/MiniPlayerShell"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { useT } from "@/i18n/use-t"
import type { MessageKey } from "@/i18n/messages"
import type { Translate } from "@/lib/translate"
import { useLangStore } from "@/store/lang-store"
import { cn } from "@/lib/utils"
import { LS_MAIN, LS_DUPLICATES } from "@/lib/exampleLinearSearch"

// Живі навчальні віджети лінійного пошуку на еталонних масивах. Головний образ —
// нерухомий ряд комірок із курсором-бігунцем (а не стовпчики/кошики, як у
// сортуваннях). «Ціна» — кількість ПЕРЕВІРОК.

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
    <span className="mb-2 inline-flex items-center gap-1.5 rounded-md border border-rose-400/50 bg-rose-500/10 px-2.5 py-1 text-sm font-medium text-rose-700 dark:text-rose-300">
      <Search className="size-3.5" />
      {t("play.lsTargetBadge", { target })}
    </span>
  )
}

/** Журнал кадрів trace з урахуванням мови (як radix useTraceFrames). */
function useTrace(values: readonly number[], target: number, findAll: boolean) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)
  return useMemo(
    () => buildLinearSearchTrace(values, target, findAll, tr),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values, target, findAll, lang],
  )
}

// — Масив як ряд комірок ------------------------------------------------------

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
      <CellsView array={values} cursor={null} checking={false} matches={[]} resolvedTo={-1} />
    </Figure>
  )
}

// — Результат (знайдено / відсутній) ------------------------------------------

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
      <CellsView
        array={done.array}
        cursor={done.cursor}
        checking={false}
        matches={done.matches}
        resolvedTo={done.resolvedTo}
      />
      <span className="mt-2 block text-center text-sm tabular-nums">
        {trace.result.found
          ? t("learn.lsResultFound", { i: trace.result.result, comparisons: trace.result.comparisons })
          : t("learn.lsResultAbsent", { comparisons: trace.result.comparisons })}
      </span>
    </Figure>
  )
}

// — Скан-«драбинка»: курсор повзе праворуч ------------------------------------

export function ScanStaircaseFigure({
  values,
  target,
  caption,
}: {
  values: readonly number[]
  target: number
  caption?: string
}) {
  const match = linearSearch(values, target)
  const last = match >= 0 ? match : values.length - 1
  const rows = Array.from({ length: last + 1 }, (_, r) => r)
  return (
    <Figure caption={caption}>
      <span className="block text-center">
        <TargetBadge target={target} />
      </span>
      <span className="flex flex-col items-center gap-1.5">
        {rows.map((r) => {
          const isMatch = r === match
          return (
            <CellsView
              key={r}
              array={values}
              size="sm"
              cursor={r}
              checking={!isMatch}
              matches={isMatch ? [r] : []}
              resolvedTo={isMatch ? r : r - 1}
            />
          )
        })}
      </span>
    </Figure>
  )
}

// — Один крок трасування (комірки на конкретній події) ------------------------

export function StepFigure({
  values,
  target,
  findAll = false,
  frameIndex,
  caption,
}: {
  values: readonly number[]
  target: number
  findAll?: boolean
  frameIndex: number
  caption?: string
}) {
  const trace = useTrace(values, target, findAll)
  const f = trace.frames[Math.min(Math.max(0, frameIndex), trace.frames.length - 1)]
  return (
    <Figure caption={caption}>
      <span className="block text-center">
        <TargetBadge target={target} />
      </span>
      <CellsView
        array={f.array}
        cursor={f.cursor}
        checking={f.phase === "check"}
        matches={f.matches}
        resolvedTo={f.resolvedTo}
      />
      <span className="mt-2 block text-center text-[11px] text-muted-foreground">{f.caption}</span>
    </Figure>
  )
}

// — Анімація (міні-плеєр над повним trace) ------------------------------------

export function AnimationFigure({
  values,
  target,
  findAll = false,
  caption,
}: {
  values: readonly number[]
  target: number
  findAll?: boolean
  caption?: string
}) {
  const trace = useTrace(values, target, findAll)
  const player = usePlayer(trace.frames.length, `${values.join()}|${target}|${findAll}`)
  const f = trace.frames[Math.min(player.index, trace.frames.length - 1)]
  return (
    <MiniPlayerShell player={player} frameCount={trace.frames.length} caption={f.caption}>
      <span className="block text-center">
        <TargetBadge target={target} />
      </span>
      <span className="block overflow-auto">
        <CellsView
          array={f.array}
          cursor={f.cursor}
          checking={f.phase === "check"}
          matches={f.matches}
          resolvedTo={f.resolvedTo}
        />
      </span>
      {caption && (
        <span className="mt-2 block text-center text-xs text-muted-foreground">{caption}</span>
      )}
    </MiniPlayerShell>
  )
}

// — Дублікати: перший збіг vs усі входження -----------------------------------

export function DuplicatesFigure({
  findAll: all,
  caption,
}: {
  findAll: boolean
  caption?: string
}) {
  const t = useT()
  const { values, target } = LS_DUPLICATES
  const trace = useTrace(values, target, all)
  const done = trace.frames[trace.frames.length - 1]
  const allIdx = findAll(values, target)
  return (
    <Figure caption={caption}>
      <span className="block text-center">
        <TargetBadge target={target} />
      </span>
      <CellsView
        array={done.array}
        cursor={done.cursor}
        checking={false}
        matches={done.matches}
        resolvedTo={done.resolvedTo}
      />
      <span className="mt-2 block text-center text-sm tabular-nums">
        {all
          ? t("learn.lsDupAll", { matches: `[${allIdx.join(", ")}]`, comparisons: trace.result.comparisons })
          : t("learn.lsDupFirst", { i: trace.result.result, comparisons: trace.result.comparisons })}
      </span>
    </Figure>
  )
}

// — Аналіз випадків (головний акцент) -----------------------------------------

export function CasesFigure({ caption }: { caption?: string }) {
  const t = useT()
  const { values } = LS_MAIN
  const c = caseAnalysis(values)
  const rows: { label: string; checks: number; cls: string }[] = [
    { label: t("learn.lsCaseBest"), checks: c.best, cls: "bg-emerald-500/60" },
    { label: t("learn.lsCaseAvg"), checks: c.average, cls: "bg-sky-500/60" },
    { label: t("learn.lsCaseWorst"), checks: c.worst, cls: "bg-amber-500/60" },
    { label: t("learn.lsCaseAbsent"), checks: c.absent, cls: "bg-rose-500/60" },
  ]
  const max = Math.max(...rows.map((r) => r.checks), 1)
  return (
    <Figure caption={caption}>
      <span className="mb-2 block text-center text-xs text-muted-foreground">
        {t("learn.lsCasesArray", { arr: `[${values.join(", ")}]` })}
      </span>
      <span className="flex flex-col gap-1.5">
        {rows.map((r) => (
          <span key={r.label} className="flex items-center gap-2">
            <span className="w-36 shrink-0 text-right text-[11px] font-medium text-muted-foreground">
              {r.label}
            </span>
            <span className="flex h-5 flex-1 items-center">
              <span
                className={cn("inline-block h-3.5 rounded-sm", r.cls)}
                style={{ width: `${(r.checks / max) * 100}%` }}
              />
              <span className="ml-2 text-xs font-medium tabular-nums">{r.checks}</span>
            </span>
          </span>
        ))}
      </span>
    </Figure>
  )
}

// — Зростання: лінійний O(n) проти двійкового O(log n) ------------------------

export function GrowthFigure({ caption }: { caption?: string }) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const locale = lang === "ua" ? "uk-UA" : "en-US"
  const rows = [10, 100, 1000, 1000000]
  const fmt = (x: number) => Math.round(x).toLocaleString(locale)
  return (
    <Figure caption={caption}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-right text-xs text-muted-foreground">
            <th className="px-2 py-1 text-left font-medium">n</th>
            <th className="px-2 py-1 font-mono font-medium">{t("learn.lsGrowthLinear")}</th>
            <th className="px-2 py-1 font-mono font-medium">{t("learn.lsGrowthBinary")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((n) => (
            <tr key={n} className="border-b last:border-0 text-right tabular-nums">
              <td className="px-2 py-1 text-left font-medium">{fmt(n)}</td>
              <td className="px-2 py-1 font-mono text-rose-600 dark:text-rose-400">{fmt(n)}</td>
              <td className="px-2 py-1 font-mono text-emerald-700 dark:text-emerald-400">
                ≈ {fmt(Math.ceil(Math.log2(n)))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <span className="mt-1.5 block text-xs text-muted-foreground">{t("learn.lsGrowthNote")}</span>
    </Figure>
  )
}

// — Код ↔ комірки (міні-плеєр) ------------------------------------------------

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
          title={t("play.lsCodeFirst")}
          activeLines={f.lines}
          contextLines={f.contextLines}
          className="h-[300px]"
        />
        <span className="flex h-[300px] flex-col items-center justify-center gap-2 overflow-auto rounded-lg border bg-card p-3">
          <TargetBadge target={target} />
          <CellsView
            array={f.array}
            cursor={f.cursor}
            checking={f.phase === "check"}
            matches={f.matches}
            resolvedTo={f.resolvedTo}
          />
        </span>
      </span>
      {caption && (
        <span className="mt-2 block text-center text-xs text-muted-foreground">{caption}</span>
      )}
    </MiniPlayerShell>
  )
}

// IntuitionFigure — інтуїція «полиці книжок»: жива анімація скану.
export function IntuitionFigure({
  values,
  target,
  caption,
}: {
  values: readonly number[]
  target: number
  caption?: string
}) {
  return <AnimationFigure values={values} target={target} caption={caption} />
}
