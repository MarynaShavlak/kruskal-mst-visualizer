import { useMemo, type ReactNode } from "react"
import { buildInsertionSortTrace } from "@/lib/insertionSortTrace"
import { InsertionBars } from "@/algorithms/insertion-sort/playback/InsertionBarsPanel"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { MiniPlayerShell } from "@/algorithms/shared/learn/MiniPlayerShell"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { useT } from "@/i18n/use-t"
import type { MessageKey } from "@/i18n/messages"
import type { Translate } from "@/lib/translate"
import { useLangStore } from "@/store/lang-store"
import { cn } from "@/lib/utils"

// Живі навчальні віджети сортування вставками на еталонних масивах. Замінюють
// статичні фігури README обчисленнями з lib/. Кольори — за легендою README:
// 🟢 відсортований префікс · 🟡 порівняння / key «в руці» · 🔴 щойно зсунули ·
// ⋯ «дірка» · ⬜ несортований суфікс.

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
      <InsertionBars
        array={values}
        prefixLen={0}
        hole={null}
        keyValue={null}
        compareAt={null}
        shiftAt={null}
        height={140}
        size="lg"
      />
    </Figure>
  )
}

// — Один кадр трасування (взяття / порівняння / зсув / вставка) ---------------

export function StepFigure({
  values,
  eventIndex,
  binary,
  caption,
}: {
  values: readonly number[]
  eventIndex: number
  binary?: boolean
  caption?: string
}) {
  const t = useT()
  const { frames } = useMemo(
    () => buildInsertionSortTrace(values, binary ?? false),
    [values, binary],
  )
  const frame = frames[Math.min(eventIndex, frames.length - 1)]

  return (
    <Figure caption={caption}>
      <InsertionBars
        array={frame.array}
        prefixLen={frame.prefixLen}
        hole={frame.hole}
        keyValue={frame.key}
        compareAt={frame.compareAt}
        shiftAt={frame.shiftAt}
        height={150}
        size="lg"
      />
      <span className="mt-1.5 block text-center text-xs tabular-nums text-muted-foreground">
        {t("learn.isCounters", { comparisons: frame.comparisons, shifts: frame.shifts })}
      </span>
    </Figure>
  )
}

// — Відсортований результат + підсумок ---------------------------------------

export function ResultFigure({
  values,
  binary,
  caption,
}: {
  values: readonly number[]
  binary?: boolean
  caption?: string
}) {
  const t = useT()
  const { result } = useMemo(
    () => buildInsertionSortTrace(values, binary ?? false),
    [values, binary],
  )

  return (
    <Figure caption={caption}>
      <InsertionBars
        array={result.sorted}
        prefixLen={result.sorted.length}
        hole={null}
        keyValue={null}
        compareAt={null}
        shiftAt={null}
        height={150}
        size="lg"
      />
      <span className="mt-2 block text-center text-sm tabular-nums">
        {t("learn.isResultSummary", {
          comparisons: result.comparisons,
          shifts: result.shifts,
          insertions: result.insertions,
        })}
      </span>
    </Figure>
  )
}

// — Еволюція по ітераціях (компактна таблиця станів) -------------------------

export function EvolutionFigure({
  values,
  binary,
  caption,
}: {
  values: readonly number[]
  binary?: boolean
  caption?: string
}) {
  const t = useT()
  const { frames } = useMemo(
    () => buildInsertionSortTrace(values, binary ?? false),
    [values, binary],
  )
  // Рядки: стартовий масив (init) + знімок після кожної вставки (prefix виріс).
  const rows = frames.filter((f) => f.sub.kind === "init" || f.sub.kind === "insert")

  return (
    <Figure caption={caption}>
      <table className="border-collapse text-[11px] tabular-nums">
        <tbody>
          {rows.map((f, r) => (
            <tr key={r}>
              <th className="whitespace-nowrap px-2 py-0.5 text-right font-normal text-muted-foreground">
                {f.sub.kind === "init" ? t("learn.isStart") : t("learn.isPass", { i: f.pass ?? 0 })}
              </th>
              {f.array.map((v, i) => (
                <td
                  key={i}
                  className={cn(
                    "min-w-[1.75rem] border border-border/40 px-1.5 py-0.5 text-center",
                    i < f.prefixLen
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
  binary,
  caption,
}: {
  values: readonly number[]
  binary?: boolean
  caption?: string
}) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)

  const frames = useMemo(
    () => buildInsertionSortTrace(values, binary ?? false, tr).frames,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values, binary, lang],
  )
  const player = usePlayer(frames.length, frames)
  const frame = frames[Math.min(player.index, frames.length - 1)]

  return (
    <MiniPlayerShell player={player} frameCount={frames.length} caption={frame.caption}>
      <InsertionBars
        array={frame.array}
        prefixLen={frame.prefixLen}
        hole={frame.hole}
        keyValue={frame.key}
        compareAt={frame.compareAt}
        shiftAt={frame.shiftAt}
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
  binary,
  caption,
}: {
  values: readonly number[]
  binary?: boolean
  caption?: string
}) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)

  const { frames, code } = useMemo(() => {
    const trace = buildInsertionSortTrace(values, binary ?? false, tr)
    return { frames: trace.frames, code: trace.code }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, binary, lang])
  const player = usePlayer(frames.length, frames)
  const frame = frames[Math.min(player.index, frames.length - 1)]

  return (
    <MiniPlayerShell player={player} frameCount={frames.length} caption={frame.caption}>
      <span className="grid gap-3 lg:grid-cols-2">
        <CodePanel
          code={code}
          title={binary ? t("play.codeIsBinary") : t("play.codeIsLinear")}
          activeLines={frame.lines}
          contextLines={frame.contextLines}
          className="h-[320px]"
        />
        <span className="flex h-[320px] flex-col justify-center rounded-lg border bg-card p-3">
          <InsertionBars
            array={frame.array}
            prefixLen={frame.prefixLen}
            hole={frame.hole}
            keyValue={frame.key}
            compareAt={frame.compareAt}
            shiftAt={frame.shiftAt}
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

/** Стабільне сортування вставками мічених елементів (зсув лише за value<value). */
function stableInsertion(input: readonly Tagged[]): Tagged[] {
  const a = input.map((x) => ({ ...x }))
  for (let i = 1; i < a.length; i++) {
    const cur = a[i]
    let j = i - 1
    while (j >= 0 && cur.value < a[j].value) {
      a[j + 1] = a[j]
      j -= 1
    }
    a[j + 1] = cur
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
  const items = phase === "before" ? STABILITY_INPUT : stableInsertion(STABILITY_INPUT)
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
          {t("learn.isStableNote")}
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
      <span className="mt-1.5 block text-xs text-muted-foreground">{t("learn.isGrowthNote")}</span>
    </Figure>
  )
}
