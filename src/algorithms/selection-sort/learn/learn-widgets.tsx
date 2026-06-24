import { useMemo, type ReactNode } from "react"
import { buildSelectionSortTrace } from "@/lib/selectionSortTrace"
import { SelectionBars } from "@/algorithms/selection-sort/playback/SelectionBarsPanel"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { MiniPlayerShell } from "@/algorithms/shared/learn/MiniPlayerShell"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { useT } from "@/i18n/use-t"
import type { MessageKey } from "@/i18n/messages"
import type { Translate } from "@/lib/translate"
import { useLangStore } from "@/store/lang-store"
import { cn } from "@/lib/utils"

// Живі навчальні віджети сортування прямим вибором на еталонних масивах.
// Замінюють статичні фігури README обчисленнями з lib/. Кольори — за легендою
// README: 🟢 відсортований префікс · 🟡 «біжучий мінімум» · 🟣 ▲ курсор j ·
// 🔴 пара обміну / зсув · 🔵 елемент, що став на місце · ⬜ несортований суфікс.

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

// — Статичний масив стовпчиків (вхід) ----------------------------------------

export function ArrayFigure({
  values,
  caption,
}: {
  values: readonly number[]
  caption?: string
}) {
  return (
    <Figure caption={caption}>
      <SelectionBars
        array={values}
        sortedTo={0}
        minIdx={null}
        cursor={null}
        placedAt={null}
        swapAt={null}
        hole={null}
        keyValue={null}
        height={140}
        size="lg"
      />
    </Figure>
  )
}

// — Один кадр трасування (пошук / порівняння / обмін) ------------------------

export function StepFigure({
  values,
  eventIndex,
  stable,
  caption,
}: {
  values: readonly number[]
  eventIndex: number
  stable?: boolean
  caption?: string
}) {
  const t = useT()
  const { frames } = useMemo(
    () => buildSelectionSortTrace(values, stable ?? false),
    [values, stable],
  )
  const frame = frames[Math.min(eventIndex, frames.length - 1)]

  return (
    <Figure caption={caption}>
      <SelectionBars
        array={frame.array}
        sortedTo={frame.sortedTo}
        minIdx={frame.minIdx}
        cursor={frame.cursor}
        placedAt={frame.placedAt}
        swapAt={frame.swapAt}
        hole={frame.hole}
        keyValue={frame.keyValue}
        height={150}
        size="lg"
      />
      <span className="mt-1.5 block text-center text-xs tabular-nums text-muted-foreground">
        {t("learn.ssCounters", { comparisons: frame.comparisons, swaps: frame.swaps })}
      </span>
    </Figure>
  )
}

// — Відсортований результат + підсумок ---------------------------------------

export function ResultFigure({
  values,
  stable,
  caption,
}: {
  values: readonly number[]
  stable?: boolean
  caption?: string
}) {
  const t = useT()
  const { result } = useMemo(
    () => buildSelectionSortTrace(values, stable ?? false),
    [values, stable],
  )

  return (
    <Figure caption={caption}>
      <SelectionBars
        array={result.sorted}
        sortedTo={result.sorted.length}
        minIdx={null}
        cursor={null}
        placedAt={null}
        swapAt={null}
        hole={null}
        keyValue={null}
        height={150}
        size="lg"
      />
      <span className="mt-2 block text-center text-sm tabular-nums">
        {t("learn.ssResultSummary", {
          comparisons: result.comparisons,
          swaps: result.swaps,
          passes: result.passes,
        })}
      </span>
    </Figure>
  )
}

// — Еволюція по проходах (компактна таблиця станів) --------------------------

export function EvolutionFigure({
  values,
  caption,
}: {
  values: readonly number[]
  caption?: string
}) {
  const t = useT()
  const { frames } = useMemo(() => buildSelectionSortTrace(values), [values])
  // Рядки: стартовий масив (init) + знімок після кожного проходу (swap).
  const rows = frames.filter((f) => f.sub.kind === "init" || f.sub.kind === "swap")

  return (
    <Figure caption={caption}>
      <table className="border-collapse text-[11px] tabular-nums">
        <tbody>
          {rows.map((f, r) => (
            <tr key={r}>
              <th className="whitespace-nowrap px-2 py-0.5 text-right font-normal text-muted-foreground">
                {f.sub.kind === "init" ? t("learn.ssStart") : t("learn.ssPass", { i: f.pass ?? 0 })}
              </th>
              {f.array.map((v, i) => (
                <td
                  key={i}
                  className={cn(
                    "min-w-[1.75rem] border border-border/40 px-1.5 py-0.5 text-center",
                    i === f.placedAt
                      ? "bg-sky-500/25 font-medium text-sky-700 dark:text-sky-300"
                      : i < f.sortedTo
                        ? "bg-emerald-500/20 font-medium text-emerald-700 dark:text-emerald-300"
                        : "text-foreground",
                  )}
                >
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Figure>
  )
}

// — Анімація сортування (міні-плеєр стовпчиків) ------------------------------

export function SortAnimationFigure({
  values,
  stable,
  caption,
}: {
  values: readonly number[]
  stable?: boolean
  caption?: string
}) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)

  const frames = useMemo(
    () => buildSelectionSortTrace(values, stable ?? false, tr).frames,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values, stable, lang],
  )
  const player = usePlayer(frames.length, frames)
  const frame = frames[Math.min(player.index, frames.length - 1)]

  return (
    <MiniPlayerShell player={player} frameCount={frames.length} caption={frame.caption}>
      <SelectionBars
        array={frame.array}
        sortedTo={frame.sortedTo}
        minIdx={frame.minIdx}
        cursor={frame.cursor}
        placedAt={frame.placedAt}
        swapAt={frame.swapAt}
        hole={frame.hole}
        keyValue={frame.keyValue}
        height={170}
        size="lg"
      />
      {caption && (
        <span className="mt-2 block text-center text-xs text-muted-foreground">{caption}</span>
      )}
    </MiniPlayerShell>
  )
}

// — Покрокове виконання коду: міні-плеєр «код ↔ масив» -----------------------

export function CodeWalkthroughFigure({
  values,
  stable,
  caption,
}: {
  values: readonly number[]
  stable?: boolean
  caption?: string
}) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)

  const { frames, code } = useMemo(() => {
    const trace = buildSelectionSortTrace(values, stable ?? false, tr)
    return { frames: trace.frames, code: trace.code }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, stable, lang])
  const player = usePlayer(frames.length, frames)
  const frame = frames[Math.min(player.index, frames.length - 1)]

  return (
    <MiniPlayerShell player={player} frameCount={frames.length} caption={frame.caption}>
      <span className="grid gap-3 lg:grid-cols-2">
        <CodePanel
          code={code}
          title={stable ? t("play.codeSsStable") : t("play.codeSsStandard")}
          activeLines={frame.lines}
          contextLines={frame.contextLines}
          className="h-[320px]"
        />
        <span className="flex h-[320px] flex-col justify-center rounded-lg border bg-card p-3">
          <SelectionBars
            array={frame.array}
            sortedTo={frame.sortedTo}
            minIdx={frame.minIdx}
            cursor={frame.cursor}
            placedAt={frame.placedAt}
            swapAt={frame.swapAt}
            hole={frame.hole}
            keyValue={frame.keyValue}
            height={210}
            size="lg"
          />
        </span>
      </span>
      {caption && (
        <span className="mt-2 block text-center text-xs text-muted-foreground">{caption}</span>
      )}
    </MiniPlayerShell>
  )
}

// — Стабільність: мічені дублікати --------------------------------------------

interface Tagged {
  readonly value: number
  readonly tag: number
}

// Масив із README: 5₁, 2₁, 5₂, 2₂, 1₁ (підпис tag = початковий порядок рівних).
const STABILITY_INPUT: readonly Tagged[] = [
  { value: 5, tag: 1 },
  { value: 2, tag: 1 },
  { value: 5, tag: 2 },
  { value: 2, tag: 2 },
  { value: 1, tag: 1 },
]

/** Стандартний (нестабільний) прямий вибір мічених елементів: обмін. */
function standardSelection(input: readonly Tagged[]): {
  result: Tagged[]
  rows: { array: Tagged[]; placed: number | null }[]
} {
  const a = input.map((x) => ({ ...x }))
  const n = a.length
  const rows: { array: Tagged[]; placed: number | null }[] = [
    { array: a.map((x) => ({ ...x })), placed: null },
  ]
  for (let i = 0; i < n; i++) {
    let minIdx = i
    for (let j = i + 1; j < n; j++) {
      if (a[j].value < a[minIdx].value) minIdx = j
    }
    const tmp = a[i]
    a[i] = a[minIdx]
    a[minIdx] = tmp
    rows.push({ array: a.map((x) => ({ ...x })), placed: i })
  }
  return { result: a, rows }
}

/** Стабільний прямий вибір мічених елементів: зсув блоку замість обміну. */
function stableSelection(input: readonly Tagged[]): Tagged[] {
  const a = input.map((x) => ({ ...x }))
  const n = a.length
  for (let i = 0; i < n; i++) {
    let minIdx = i
    for (let j = i + 1; j < n; j++) {
      if (a[j].value < a[minIdx].value) minIdx = j
    }
    const minVal = a[minIdx]
    while (minIdx > i) {
      a[minIdx] = a[minIdx - 1]
      minIdx -= 1
    }
    a[i] = minVal
  }
  return a
}

function TaggedBars({ items, max }: { items: readonly Tagged[]; max: number }) {
  return (
    <div className="flex items-end justify-center gap-2" style={{ height: 130 }}>
      {items.map((it, i) => (
        <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
          <span className="text-sm font-medium leading-none">
            {it.value}
            <sub className="text-[9px] text-muted-foreground">{it.tag}</sub>
          </span>
          <div
            className="w-full rounded-t bg-sky-500/60"
            style={{ height: `${Math.max(10, (it.value / max) * 100)}%` }}
          />
        </div>
      ))}
    </div>
  )
}

export function StabilityFigure({
  phase,
  caption,
}: {
  phase: "input" | "evolution" | "compare"
  caption?: string
}) {
  const t = useT()
  const max = Math.max(...STABILITY_INPUT.map((x) => x.value))

  if (phase === "input") {
    return (
      <Figure caption={caption}>
        <TaggedBars items={STABILITY_INPUT} max={max} />
      </Figure>
    )
  }

  if (phase === "evolution") {
    const { rows } = standardSelection(STABILITY_INPUT)
    return (
      <Figure caption={caption}>
        <table className="border-collapse text-[11px]">
          <tbody>
            {rows.map((row, r) => (
              <tr key={r}>
                <th className="whitespace-nowrap px-2 py-0.5 text-right font-normal text-muted-foreground">
                  {r === 0 ? t("learn.ssStart") : t("learn.ssPass", { i: r - 1 })}
                </th>
                {row.array.map((it, i) => (
                  <td
                    key={i}
                    className={cn(
                      "min-w-[2rem] border border-border/40 px-1.5 py-0.5 text-center tabular-nums",
                      i === row.placed
                        ? "bg-sky-500/25 font-medium text-sky-700 dark:text-sky-300"
                        : row.placed !== null && i < row.placed
                          ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                          : "text-foreground",
                    )}
                  >
                    {it.value}
                    <sub className="text-[9px] text-muted-foreground">{it.tag}</sub>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Figure>
    )
  }

  // phase === "compare"
  const standard = standardSelection(STABILITY_INPUT).result
  const stable = stableSelection(STABILITY_INPUT)
  return (
    <Figure caption={caption}>
      <div className="flex flex-col gap-3">
        <div>
          <span className="mb-1 block text-xs font-medium text-rose-700 dark:text-rose-300">
            {t("learn.ssUnstableLabel")}
          </span>
          <TaggedBars items={standard} max={max} />
        </div>
        <div>
          <span className="mb-1 block text-xs font-medium text-emerald-700 dark:text-emerald-300">
            {t("learn.ssStableLabel")}
          </span>
          <TaggedBars items={stable} max={max} />
        </div>
        <span className="block text-center text-xs text-muted-foreground">
          {t("learn.ssStableNote")}
        </span>
      </div>
    </Figure>
  )
}

// — Зростання складності n² проти n·log₂n ------------------------------------

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
            <th className="px-2 py-1 font-medium font-mono">n²/2</th>
            <th className="px-2 py-1 font-medium font-mono">n·log₂n</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((n) => (
            <tr key={n} className="border-b last:border-0 text-right tabular-nums">
              <td className="px-2 py-1 text-left font-medium">{fmt(n)}</td>
              <td className="px-2 py-1 font-mono text-rose-600 dark:text-rose-400">
                {fmt((n * (n - 1)) / 2)}
              </td>
              <td className="px-2 py-1 font-mono text-emerald-700 dark:text-emerald-400">
                {fmt(n * Math.log2(n))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <span className="mt-1.5 block text-xs text-muted-foreground">{t("learn.ssGrowthNote")}</span>
    </Figure>
  )
}
