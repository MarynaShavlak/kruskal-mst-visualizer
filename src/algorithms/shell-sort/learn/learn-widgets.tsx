import { useMemo, type ReactNode } from "react"
import {
  shellSortSteps,
  gapsFor,
  countOperations,
  type GapSequence,
} from "@/lib/shellSort"
import { buildShellSortTrace } from "@/lib/shellSortTrace"
import { ShellBars } from "@/algorithms/shell-sort/playback/ShellBarsPanel"
import { barHeightPct } from "@/algorithms/shell-sort/playback/highlight"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { MiniPlayerShell } from "@/algorithms/shared/learn/MiniPlayerShell"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { useT } from "@/i18n/use-t"
import type { MessageKey } from "@/i18n/messages"
import type { Translate } from "@/lib/translate"
import { useLangStore } from "@/store/lang-store"
import { cn } from "@/lib/utils"

// Живі навчальні віджети сортування Шелла на еталонних масивах. Головні образи —
// стовпчики масиву (як у вставках, але з «дірою»/temp) і ПІДПОСЛІДОВНОСТІ з кроком
// gap (елементи «через крок», що сортуються вставками незалежно).

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

// — Масив як стовпчики --------------------------------------------------------

function ArrayBars({
  values,
  sorted,
  height = 130,
}: {
  values: readonly number[]
  sorted?: boolean
  height?: number
}) {
  const max = Math.max(1, ...values)
  return (
    <div className="flex items-end justify-center gap-1.5" style={{ height }}>
      {values.map((v, i) => (
        <div key={i} className="flex h-full min-w-[1.5rem] flex-1 flex-col items-center justify-end gap-1">
          <span className="text-[11px] font-medium tabular-nums leading-none text-muted-foreground">{v}</span>
          <div
            className={cn("w-full rounded-t", sorted ? "bg-emerald-500/75" : "bg-slate-400/60 dark:bg-slate-500/50")}
            style={{ height: `${barHeightPct(v, max)}%` }}
          />
          <span className="text-[10px] tabular-nums text-muted-foreground/70">{i}</span>
        </div>
      ))}
    </div>
  )
}

export function ArrayFigure({ values, caption }: { values: readonly number[]; caption?: string }) {
  return (
    <Figure caption={caption}>
      <ArrayBars values={values} />
    </Figure>
  )
}

export function ResultFigure({ values, caption }: { values: readonly number[]; caption?: string }) {
  const t = useT()
  const { result } = useMemo(() => buildShellSortTrace(values, "shell"), [values])
  return (
    <Figure caption={caption}>
      <ArrayBars values={result.sorted} sorted height={140} />
      <span className="mt-2 block text-center text-sm tabular-nums">
        {t("learn.shResultSummary", {
          comparisons: result.comparisons,
          shifts: result.shifts,
          gapPhases: result.gapPhases,
        })}
      </span>
    </Figure>
  )
}

// — Підпослідовності з кроком gap (елементи «через крок» — окремими кольорами) --

const GROUP_COLORS = [
  "bg-sky-500/70",
  "bg-orange-400/80",
  "bg-violet-500/70",
  "bg-emerald-500/70",
  "bg-rose-500/70",
  "bg-amber-400/80",
]

export function GapGroupsFigure({
  values,
  gap,
  caption,
}: {
  values: readonly number[]
  gap: number
  caption?: string
}) {
  const t = useT()
  const max = Math.max(1, ...values)
  return (
    <Figure caption={caption}>
      <span className="mb-2 block text-center text-xs text-muted-foreground">
        {t("learn.shGapGroupsNote", { gap, groups: Math.min(gap, values.length) })}
      </span>
      <div className="flex items-end justify-center gap-1.5" style={{ height: 140 }}>
        {values.map((v, i) => (
          <div key={i} className="flex h-full min-w-[1.5rem] flex-1 flex-col items-center justify-end gap-1">
            <span className="text-[11px] font-medium tabular-nums leading-none text-muted-foreground">{v}</span>
            <div
              className={cn("w-full rounded-t", GROUP_COLORS[(i % gap) % GROUP_COLORS.length])}
              style={{ height: `${barHeightPct(v, max)}%` }}
            />
            <span className="rounded bg-muted px-1 text-[10px] font-medium tabular-nums text-muted-foreground">
              {i % gap}
            </span>
          </div>
        ))}
      </div>
      <span className="mt-1 block text-center text-[11px] text-muted-foreground">
        {t("learn.shGapGroupsLegend")}
      </span>
    </Figure>
  )
}

// — Еволюція масиву по фазах gap ---------------------------------------------

export function EvolutionFigure({ values, caption }: { values: readonly number[]; caption?: string }) {
  const t = useT()
  const rows = useMemo(() => {
    const { events } = shellSortSteps(values, gapsFor("shell", values.length))
    const out: { label: string; array: readonly number[] }[] = [
      { label: t("learn.shEvolStart"), array: events[0].array },
    ]
    for (const e of events) {
      if (e.kind === "gap_end") {
        out.push({ label: t("learn.shEvolAfter", { gap: e.gap ?? 0 }), array: e.array })
      }
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values])

  return (
    <Figure caption={caption}>
      <span className="flex flex-col gap-1.5">
        {rows.map((r, ri) => (
          <span key={ri} className="flex items-center gap-2">
            <span className="w-28 shrink-0 text-right text-[11px] font-medium text-muted-foreground">{r.label}</span>
            <span className="inline-flex gap-1">
              {r.array.map((v, i) => (
                <span
                  key={i}
                  className={cn(
                    "inline-flex size-6 items-center justify-center rounded border text-[11px] font-semibold tabular-nums",
                    ri === rows.length - 1
                      ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                      : "border-border/70 bg-card",
                  )}
                >
                  {v}
                </span>
              ))}
            </span>
          </span>
        ))}
      </span>
    </Figure>
  )
}

// — Анімація сортування (міні-плеєр над повним trace) -------------------------

export function AnimationFigure({
  values,
  sequence = "shell",
  caption,
}: {
  values: readonly number[]
  sequence?: GapSequence
  caption?: string
}) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)
  const { frames } = useMemo(
    () => buildShellSortTrace(values, sequence, tr),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values, sequence, lang],
  )
  const player = usePlayer(frames.length, `${values.join()}|${sequence}|${lang}`)
  const f = frames[Math.min(player.index, frames.length - 1)]
  return (
    <MiniPlayerShell player={player} frameCount={frames.length} caption={f.caption}>
      <span className="block overflow-auto">
        <ShellBars
          array={f.array}
          gap={f.gap}
          groupResidue={f.groupResidue}
          hole={f.hole}
          keyValue={f.key}
          compareAt={f.compareAt}
          shiftAt={f.shiftAt}
          insertAt={f.insertAt}
          sortedAll={f.sortedAll}
          height={180}
        />
      </span>
      {caption && (
        <span className="mt-2 block text-center text-xs text-muted-foreground">{caption}</span>
      )}
    </MiniPlayerShell>
  )
}

// — Один крок трасування (стовпчики на конкретній події) ----------------------

export function StepFigure({
  values,
  eventIndex,
  caption,
}: {
  values: readonly number[]
  eventIndex: number
  caption?: string
}) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)
  const { frames } = useMemo(
    () => buildShellSortTrace(values, "shell", tr),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values, lang],
  )
  const f = frames[Math.min(Math.max(0, eventIndex), frames.length - 1)]
  return (
    <Figure caption={caption}>
      <ShellBars
        array={f.array}
        gap={f.gap}
        groupResidue={f.groupResidue}
        hole={f.hole}
        keyValue={f.key}
        compareAt={f.compareAt}
        shiftAt={f.shiftAt}
        insertAt={f.insertAt}
        sortedAll={f.sortedAll}
        height={170}
      />
      <span className="mt-2 block text-center text-[11px] text-muted-foreground">{f.caption}</span>
    </Figure>
  )
}

// — Порівняння послідовностей проміжків (таблиця) -----------------------------

const SEQS: readonly { key: GapSequence; label: string }[] = [
  { key: "shell", label: "n//2" },
  { key: "knuth", label: "Кнут 3k+1" },
  { key: "ciura", label: "Ciura" },
]

export function GapComparisonFigure({ values, caption }: { values: readonly number[]; caption?: string }) {
  const t = useT()
  const n = values.length
  const rows = SEQS.map((s) => {
    const gaps = gapsFor(s.key, n)
    return { ...s, gaps, stats: countOperations(values, gaps) }
  })
  return (
    <Figure caption={caption}>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b text-right text-muted-foreground">
            <th className="px-2 py-1 text-left font-medium">{t("learn.shCompSeq")}</th>
            <th className="px-2 py-1 text-left font-mono font-medium">gaps</th>
            <th className="px-2 py-1 font-medium">{t("learn.shCompCmp")}</th>
            <th className="px-2 py-1 font-medium">{t("learn.shCompShifts")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-b last:border-0 text-right tabular-nums">
              <td className="px-2 py-1 text-left font-medium">{r.label}</td>
              <td className="px-2 py-1 text-left font-mono text-muted-foreground">[{r.gaps.join(", ")}]</td>
              <td className="px-2 py-1">{r.stats.comparisons}</td>
              <td className="px-2 py-1">{r.stats.shifts}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <span className="mt-1.5 block text-xs text-muted-foreground">{t("learn.shCompNote")}</span>
    </Figure>
  )
}

// — Зростання складності ------------------------------------------------------

export function GrowthFigure({ caption }: { caption?: string }) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const locale = lang === "ua" ? "uk-UA" : "en-US"
  const rows = [10, 100, 1000, 10000]
  const fmt = (x: number) => Math.round(x).toLocaleString(locale)
  return (
    <Figure caption={caption}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-right text-xs text-muted-foreground">
            <th className="px-2 py-1 text-left font-medium">n</th>
            <th className="px-2 py-1 font-mono font-medium">n²/2</th>
            <th className="px-2 py-1 font-mono font-medium">n^1.5</th>
            <th className="px-2 py-1 font-mono font-medium">n·log₂n</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((n) => (
            <tr key={n} className="border-b last:border-0 text-right tabular-nums">
              <td className="px-2 py-1 text-left font-medium">{fmt(n)}</td>
              <td className="px-2 py-1 font-mono text-rose-600 dark:text-rose-400">{fmt((n * n) / 2)}</td>
              <td className="px-2 py-1 font-mono text-amber-600 dark:text-amber-400">{fmt(n ** 1.5)}</td>
              <td className="px-2 py-1 font-mono text-emerald-700 dark:text-emerald-400">{fmt(n * Math.log2(n))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <span className="mt-1.5 block text-xs text-muted-foreground">{t("learn.shGrowthNote")}</span>
    </Figure>
  )
}

// — Нестабільність: мічені дублікати ------------------------------------------

interface Tagged {
  readonly value: number
  readonly tag: number
}

/** Мічені дублікати з README: 3₁,2₁,4₁,2₂,4₂,3₂ (база [3,2,4,2,4,3]). */
const STABILITY_INPUT: readonly Tagged[] = (() => {
  const base = [3, 2, 4, 2, 4, 3]
  const seen = new Map<number, number>()
  return base.map((value) => {
    const tag = (seen.get(value) ?? 0) + 1
    seen.set(value, tag)
    return { value, tag }
  })
})()

/** Сортування Шелла за значенням (gap = n//2) — НЕстабільне. */
function shellTagged(input: readonly Tagged[]): Tagged[] {
  const a = input.map((x) => ({ ...x }))
  const n = a.length
  let gap = Math.floor(n / 2)
  while (gap > 0) {
    for (let i = gap; i < n; i++) {
      const temp = a[i]
      let j = i
      while (j >= gap && a[j - gap].value > temp.value) {
        a[j] = a[j - gap]
        j -= gap
      }
      a[j] = temp
    }
    gap = Math.floor(gap / 2)
  }
  return a
}

function TaggedRow({ items }: { items: readonly Tagged[] }) {
  const max = Math.max(...items.map((x) => x.value))
  return (
    <div className="flex items-end justify-center gap-2" style={{ height: 110 }}>
      {items.map((it, i) => (
        <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
          <span className="text-[11px] font-medium leading-none">
            {it.value}
            <sub className="text-[9px] text-muted-foreground">{it.tag}</sub>
          </span>
          <div className="w-full rounded-t bg-rose-500/60" style={{ height: `${Math.max(12, (it.value / max) * 100)}%` }} />
        </div>
      ))}
    </div>
  )
}

export function StabilityFigure({ caption }: { caption?: string }) {
  const t = useT()
  const sorted = shellTagged(STABILITY_INPUT)
  return (
    <Figure caption={caption}>
      <div className="flex flex-col gap-3">
        <div>
          <span className="mb-1 block text-xs font-medium text-muted-foreground">{t("learn.shStableInput")}</span>
          <TaggedRow items={STABILITY_INPUT} />
        </div>
        <div>
          <span className="mb-1 block text-xs font-medium text-rose-700 dark:text-rose-300">{t("learn.shUnstableLabel")}</span>
          <TaggedRow items={sorted} />
        </div>
        <span className="block text-center text-xs text-muted-foreground">{t("learn.shStableNote")}</span>
      </div>
    </Figure>
  )
}

// — Код ↔ масив (міні-плеєр) --------------------------------------------------

export function CodeWalkthroughFigure({ values, caption }: { values: readonly number[]; caption?: string }) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)
  const { frames, code } = useMemo(
    () => buildShellSortTrace(values, "shell", tr),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values, lang],
  )
  const player = usePlayer(frames.length, `${values.join()}|${lang}`)
  const f = frames[Math.min(player.index, frames.length - 1)]
  return (
    <MiniPlayerShell player={player} frameCount={frames.length} caption={f.caption}>
      <span className="grid gap-3 lg:grid-cols-2">
        <CodePanel
          code={code}
          title={t("play.shCodeTitle")}
          activeLines={f.lines}
          contextLines={f.contextLines}
          className="h-[320px]"
        />
        <span className="flex h-[320px] flex-col justify-center overflow-auto rounded-lg border bg-card p-3">
          <ShellBars
            array={f.array}
            gap={f.gap}
            groupResidue={f.groupResidue}
            hole={f.hole}
            keyValue={f.key}
            compareAt={f.compareAt}
            shiftAt={f.shiftAt}
            insertAt={f.insertAt}
            sortedAll={f.sortedAll}
            height={150}
          />
        </span>
      </span>
      {caption && (
        <span className="mt-2 block text-center text-xs text-muted-foreground">{caption}</span>
      )}
    </MiniPlayerShell>
  )
}
