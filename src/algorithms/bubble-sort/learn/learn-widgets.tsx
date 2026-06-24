import { useMemo, type ReactNode } from "react"
import { bubbleSortSteps } from "@/lib/bubbleSort"
import { buildBubbleSortTrace } from "@/lib/bubbleSortTrace"
import { ArrayBars } from "@/algorithms/bubble-sort/playback/ArrayBarsPanel"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { MiniPlayerShell } from "@/algorithms/shared/learn/MiniPlayerShell"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { useT } from "@/i18n/use-t"
import type { MessageKey } from "@/i18n/messages"
import type { Translate } from "@/lib/translate"
import { useLangStore } from "@/store/lang-store"
import { cn } from "@/lib/utils"

// Живі навчальні віджети бульбашкового сортування на еталонних масивах. Замінюють
// статичні фігури README обчисленнями з lib/. Кольори — за легендою README:
// 🟡 порівняння · 🔴 обмін · 🟢 відсортований «хвіст» · ⬜ ще не впорядковано.

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

// — Статичний масив стовпчиків -----------------------------------------------

export function ArrayFigure({
  values,
  caption,
}: {
  values: readonly number[]
  caption?: string
}) {
  return (
    <Figure caption={caption}>
      <ArrayBars array={values} pair={null} swapped={false} sortedFrom={values.length} height={160} size="lg" />
    </Figure>
  )
}

// — Один кадр трасування (порівняння / кінець проходу) -----------------------

export function StepFigure({
  values,
  eventIndex,
  optimized,
  caption,
}: {
  values: readonly number[]
  eventIndex: number
  optimized?: boolean
  caption?: string
}) {
  const t = useT()
  const { events } = useMemo(
    () => bubbleSortSteps(values, optimized ?? false),
    [values, optimized],
  )
  const ev = events[Math.min(eventIndex, events.length - 1)]
  const pair =
    ev.kind === "compare" ? ([ev.j ?? 0, (ev.j ?? 0) + 1] as [number, number]) : null
  const swapped = ev.kind === "compare" ? ev.swapped : false

  return (
    <Figure caption={caption}>
      <ArrayBars array={ev.array} pair={pair} swapped={swapped} sortedFrom={ev.sortedFrom} height={150} size="lg" />
      {ev.kind === "compare" && (
        <span className="mt-1.5 block text-center text-xs">
          <span
            className={cn(
              "font-medium",
              ev.swapped ? "text-rose-600 dark:text-rose-400" : "text-amber-700 dark:text-amber-300",
            )}
          >
            {t(ev.swapped ? "learn.bsVerdictSwap" : "learn.bsVerdictKeep", {
              left: ev.left,
              right: ev.right,
            })}
          </span>
          <span className="ml-2 text-muted-foreground tabular-nums">
            {t("learn.bsCounters", { comparisons: ev.comparisons, swaps: ev.swaps })}
          </span>
        </span>
      )}
    </Figure>
  )
}

// — Відсортований результат + підсумок ---------------------------------------

export function ResultFigure({
  values,
  optimized,
  caption,
}: {
  values: readonly number[]
  optimized?: boolean
  caption?: string
}) {
  const t = useT()
  const { sorted, events } = useMemo(
    () => bubbleSortSteps(values, optimized ?? false),
    [values, optimized],
  )
  const last = events[events.length - 1]
  const passes = events.filter((e) => e.kind === "pass-end").length

  return (
    <Figure caption={caption}>
      <ArrayBars array={sorted} pair={null} swapped={false} sortedFrom={0} height={150} size="lg" />
      <span className="mt-2 block text-center text-sm tabular-nums">
        {t("learn.bsResultSummary", {
          comparisons: last.comparisons,
          swaps: last.swaps,
          passes,
        })}
      </span>
    </Figure>
  )
}

// — Еволюція по проходах (компактна таблиця станів) --------------------------

export function EvolutionFigure({
  values,
  optimized,
  caption,
}: {
  values: readonly number[]
  optimized?: boolean
  caption?: string
}) {
  const t = useT()
  const { events } = useMemo(
    () => bubbleSortSteps(values, optimized ?? false),
    [values, optimized],
  )
  // Рядки: стартовий масив (init) + знімок після кожного проходу (pass-end).
  const rows = events.filter((e) => e.kind === "init" || e.kind === "pass-end")

  return (
    <Figure caption={caption}>
      <table className="border-collapse text-[11px] tabular-nums">
        <tbody>
          {rows.map((e, r) => (
            <tr key={r}>
              <th className="whitespace-nowrap px-2 py-0.5 text-right font-normal text-muted-foreground">
                {e.kind === "init" ? t("learn.bsStart") : t("learn.bsPass", { i: e.i ?? 0 })}
              </th>
              {e.array.map((v, i) => (
                <td
                  key={i}
                  className={cn(
                    "min-w-[1.75rem] border border-border/40 px-1.5 py-0.5 text-center",
                    i >= e.sortedFrom
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
  optimized,
  caption,
}: {
  values: readonly number[]
  optimized?: boolean
  caption?: string
}) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)

  const frames = useMemo(
    () => buildBubbleSortTrace(values, optimized ?? false, tr).frames,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values, optimized, lang],
  )
  const player = usePlayer(frames.length, frames)
  const frame = frames[Math.min(player.index, frames.length - 1)]

  return (
    <MiniPlayerShell player={player} frameCount={frames.length} caption={frame.caption}>
      <ArrayBars
        array={frame.array}
        pair={frame.pair}
        swapped={frame.swapped}
        sortedFrom={frame.sortedFrom}
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
  optimized,
  caption,
}: {
  values: readonly number[]
  optimized?: boolean
  caption?: string
}) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)

  const { frames, code } = useMemo(() => {
    const trace = buildBubbleSortTrace(values, optimized ?? false, tr)
    return { frames: trace.frames, code: trace.code }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, optimized, lang])
  const player = usePlayer(frames.length, frames)
  const frame = frames[Math.min(player.index, frames.length - 1)]

  return (
    <MiniPlayerShell player={player} frameCount={frames.length} caption={frame.caption}>
      <span className="grid gap-3 lg:grid-cols-2">
        <CodePanel
          code={code}
          title={optimized ? t("play.codeBsOptimized") : t("play.codeBsNaive")}
          activeLines={frame.lines}
          contextLines={frame.contextLines}
          className="h-[300px]"
        />
        <span className="flex h-[300px] flex-col justify-center rounded-lg border bg-card p-3">
          <ArrayBars
            array={frame.array}
            pair={frame.pair}
            swapped={frame.swapped}
            sortedFrom={frame.sortedFrom}
            height={230}
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

// Масив із README: 3₁, 1₁, 3₂, 2₁, 1₂, 3₃ (підпис tag = початковий порядок рівних).
const STABILITY_INPUT: readonly Tagged[] = [
  { value: 3, tag: 1 },
  { value: 1, tag: 1 },
  { value: 3, tag: 2 },
  { value: 2, tag: 1 },
  { value: 1, tag: 2 },
  { value: 3, tag: 3 },
]

/** Стабільне бульбашкове сортування мічених елементів (обмін лише за value>value). */
function stableBubble(input: readonly Tagged[]): Tagged[] {
  const a = input.map((x) => ({ ...x }))
  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      if (a[j].value > a[j + 1].value) {
        ;[a[j], a[j + 1]] = [a[j + 1], a[j]]
      }
    }
  }
  return a
}

export function StabilityFigure({
  phase,
  caption,
}: {
  phase: "before" | "after"
  caption?: string
}) {
  const t = useT()
  const items = phase === "before" ? STABILITY_INPUT : stableBubble(STABILITY_INPUT)
  const max = Math.max(...items.map((x) => x.value))

  return (
    <Figure caption={caption}>
      <div className="flex items-end justify-center gap-2" style={{ height: 150 }}>
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
      {phase === "after" && (
        <span className="mt-2 block text-center text-xs text-emerald-700 dark:text-emerald-300">
          {t("learn.bsStableNote")}
        </span>
      )}
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
      <span className="mt-1.5 block text-xs text-muted-foreground">{t("learn.bsGrowthNote")}</span>
    </Figure>
  )
}
