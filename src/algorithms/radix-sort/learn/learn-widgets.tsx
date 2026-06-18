import { useMemo, type ReactNode } from "react"
import { countingSortSteps } from "@/lib/radixSort"
import { buildRadixSortTrace } from "@/lib/radixSortTrace"
import { BucketsView, DigitChip } from "@/algorithms/radix-sort/playback/BucketsPanel"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { MiniPlayerShell } from "@/algorithms/shared/learn/MiniPlayerShell"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { useT } from "@/i18n/use-t"
import type { MessageKey } from "@/i18n/messages"
import type { Translate } from "@/lib/translate"
import { useLangStore } from "@/store/lang-store"
import { cn } from "@/lib/utils"

// Живі навчальні віджети порозрядного сортування на еталонних масивах. Головний
// образ — кошики 0–9 і фішки-числа з підсвіченою цифрою поточного розряду (а не
// стовпчики, як у сортуваннях на основі порівнянь).

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

// — Масив як фішки -----------------------------------------------------------

function ChipRow({
  values,
  width,
  gathered,
}: {
  values: readonly number[]
  width: number
  gathered?: boolean
}) {
  return (
    <span className="flex flex-wrap items-end justify-center gap-1.5">
      {values.map((v, i) => (
        <span key={i} className="flex flex-col items-center gap-0.5">
          <DigitChip
            value={v}
            width={width}
            activeDigit={null}
            variant={gathered ? "gathered" : "idle"}
          />
          <span className="text-[10px] tabular-nums text-muted-foreground/60">{i}</span>
        </span>
      ))}
    </span>
  )
}

const digitsOf = (values: readonly number[]): number =>
  Math.max(1, ...values.map((v) => String(Math.trunc(v)).length))

export function ArrayFigure({ values, caption }: { values: readonly number[]; caption?: string }) {
  return (
    <Figure caption={caption}>
      <ChipRow values={values} width={digitsOf(values)} />
    </Figure>
  )
}

export function ResultFigure({ values, caption }: { values: readonly number[]; caption?: string }) {
  const t = useT()
  const { result } = useMemo(() => buildRadixSortTrace(values), [values])
  return (
    <Figure caption={caption}>
      <ChipRow values={result.sorted} width={result.maxDigits} gathered />
      <span className="mt-2 block text-center text-sm tabular-nums">
        {t("learn.rxResultSummary", {
          passes: result.passes,
          distributions: result.distributions,
        })}
      </span>
    </Figure>
  )
}

// — Кошики на конкретному проході (gather або один крок) ----------------------

/** Знаходить кадр gather для проходу `digitIndex` (стан після розкладання). */
function useTraceFrames(values: readonly number[]) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)
  return useMemo(
    () => buildRadixSortTrace(values, tr),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values, lang],
  ).frames
}

/** Кошики на проході `digitIndex` (за замовч. показуємо зібраний стан проходу). */
export function BucketsFigure({
  values,
  digitIndex,
  caption,
}: {
  values: readonly number[]
  digitIndex: number
  caption?: string
}) {
  const frames = useTraceFrames(values)
  // Останній кадр distribute цього проходу — повні кошики перед збиранням.
  const candidates = frames.filter(
    (f) => f.digitIndex === digitIndex && f.phase === "distribute",
  )
  const f = candidates[candidates.length - 1] ?? frames.find((f) => f.digitIndex === digitIndex) ?? frames[0]
  return (
    <Figure caption={caption}>
      <BucketsView
        array={f.array}
        buckets={f.buckets}
        digitIndex={f.digitIndex}
        maxDigits={f.maxDigits}
        activeIndex={null}
        activeBucket={null}
        gathered={false}
      />
      <span className="mt-2 block text-center text-[11px] text-muted-foreground">{f.caption}</span>
    </Figure>
  )
}

/** «Один розряд»: повні кошики на проході одиниць (для radix_idea). */
export function IdeaFigure({ values, caption }: { values: readonly number[]; caption?: string }) {
  return <BucketsFigure values={values} digitIndex={0} caption={caption} />
}

// — Еволюція масиву по розрядних проходах -------------------------------------

export function EvolutionFigure({ values, caption }: { values: readonly number[]; caption?: string }) {
  const t = useT()
  const frames = useTraceFrames(values)
  const width = frames[0]?.maxDigits ?? digitsOf(values)
  const rows = useMemo(() => {
    const out: { label: string; array: readonly number[]; digit: number | null }[] = [
      { label: t("learn.rxEvolStart"), array: frames[0]?.array ?? values, digit: null },
    ]
    for (const f of frames) {
      if (f.phase === "gather") {
        out.push({
          label: t("learn.rxEvolAfter", { position: f.position ?? 1 }),
          array: f.array,
          digit: f.digitIndex,
        })
      }
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frames, values])

  return (
    <Figure caption={caption}>
      <span className="flex flex-col gap-2">
        {rows.map((r, ri) => (
          <span key={ri} className="flex items-center gap-2">
            <span className="w-28 shrink-0 text-right text-[11px] font-medium text-muted-foreground">{r.label}</span>
            <span className="inline-flex flex-wrap gap-1">
              {r.array.map((v, i) => (
                <DigitChip
                  key={i}
                  value={v}
                  width={width}
                  activeDigit={ri === rows.length - 1 ? null : r.digit}
                  variant={ri === rows.length - 1 ? "gathered" : "idle"}
                  size="sm"
                />
              ))}
            </span>
          </span>
        ))}
      </span>
    </Figure>
  )
}

// — Анімація (міні-плеєр над повним trace кошиків) ----------------------------

export function AnimationFigure({ values, caption }: { values: readonly number[]; caption?: string }) {
  const frames = useTraceFrames(values)
  const player = usePlayer(frames.length, `${values.join()}`)
  const f = frames[Math.min(player.index, frames.length - 1)]
  return (
    <MiniPlayerShell player={player} frameCount={frames.length} caption={f.caption}>
      <span className="block overflow-auto">
        <BucketsView
          array={f.array}
          buckets={f.buckets}
          digitIndex={f.digitIndex}
          maxDigits={f.maxDigits}
          activeIndex={f.activeIndex}
          activeBucket={f.activeBucket}
          gathered={f.gathered}
        />
      </span>
      {caption && (
        <span className="mt-2 block text-center text-xs text-muted-foreground">{caption}</span>
      )}
    </MiniPlayerShell>
  )
}

// — Один крок трасування (кошики на конкретній події) -------------------------

export function StepFigure({
  values,
  eventIndex,
  caption,
}: {
  values: readonly number[]
  eventIndex: number
  caption?: string
}) {
  const frames = useTraceFrames(values)
  const f = frames[Math.min(Math.max(0, eventIndex), frames.length - 1)]
  return (
    <Figure caption={caption}>
      <BucketsView
        array={f.array}
        buckets={f.buckets}
        digitIndex={f.digitIndex}
        maxDigits={f.maxDigits}
        activeIndex={f.activeIndex}
        activeBucket={f.activeBucket}
        gathered={f.gathered}
      />
      <span className="mt-2 block text-center text-[11px] text-muted-foreground">{f.caption}</span>
    </Figure>
  )
}

// — Сортування підрахунком: внутрішня кухня (count → префікс → output) ---------

export function CountingFigure({
  values,
  position,
  caption,
}: {
  values: readonly number[]
  position: number
  caption?: string
}) {
  const t = useT()
  const cs = useMemo(() => countingSortSteps(values, position), [values, position])
  const digitsHeader = Array.from({ length: 10 }, (_, i) => i)
  return (
    <Figure caption={caption}>
      <span className="block overflow-x-auto">
        <table className="w-full border-collapse text-center text-xs tabular-nums">
          <thead>
            <tr className="border-b text-muted-foreground">
              <th className="px-2 py-1 text-left font-medium">{t("learn.rxCountRow")}</th>
              {digitsHeader.map((d) => (
                <th key={d} className="px-1.5 py-1 font-mono font-medium">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-2 py-1 text-left font-medium text-muted-foreground">{t("learn.rxCountFreq")}</td>
              {cs.freq.map((c, d) => (
                <td key={d} className={cn("px-1.5 py-1 font-mono", c > 0 && "font-semibold text-foreground")}>{c}</td>
              ))}
            </tr>
            <tr>
              <td className="px-2 py-1 text-left font-medium text-muted-foreground">{t("learn.rxCountPrefix")}</td>
              {cs.prefix.map((c, d) => (
                <td key={d} className="px-1.5 py-1 font-mono text-sky-600 dark:text-sky-400">{c}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </span>
      <span className="mt-3 block">
        <span className="mb-1 block text-[11px] font-medium text-muted-foreground">{t("learn.rxCountDigits")}</span>
        <span className="flex flex-wrap justify-center gap-1">
          {cs.array.map((v, i) => (
            <span key={i} className="inline-flex flex-col items-center">
              <span className="font-mono text-sm tabular-nums">{v}</span>
              <span className="font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400">{cs.digits[i]}</span>
            </span>
          ))}
        </span>
      </span>
      <span className="mt-3 block">
        <span className="mb-1 block text-[11px] font-medium text-emerald-700 dark:text-emerald-300">{t("learn.rxCountOutput")}</span>
        <span className="flex flex-wrap justify-center gap-1">
          {cs.output.map((v, i) => (
            <span
              key={i}
              className="inline-flex size-7 items-center justify-center rounded border border-emerald-500/40 bg-emerald-500/10 font-mono text-xs tabular-nums text-emerald-700 dark:text-emerald-300"
            >
              {v}
            </span>
          ))}
        </span>
      </span>
    </Figure>
  )
}

// — Стабільність: мічені дублікати --------------------------------------------

interface Tagged {
  readonly value: number
  readonly tag: number
}

/** Мічені дублікати з README: 52₁,12₁,52₂,31₁,12₂,41₁ (база [52,12,52,31,12,41]). */
const STABILITY_INPUT: readonly Tagged[] = (() => {
  const base = [52, 12, 52, 31, 12, 41]
  const seen = new Map<number, number>()
  return base.map((value) => {
    const tag = (seen.get(value) ?? 0) + 1
    seen.set(value, tag)
    return { value, tag }
  })
})()

/** Стабільне порозрядне сортування «мічених» елементів за числовим ключем. */
function radixTagged(input: readonly Tagged[]): Tagged[] {
  let a = [...input]
  const maxNum = Math.max(...a.map((x) => x.value))
  let position = 1
  while (Math.floor(maxNum / position) > 0) {
    const buckets: Tagged[][] = Array.from({ length: 10 }, () => [])
    for (const x of a) buckets[Math.floor(x.value / position) % 10].push(x)
    a = buckets.flat()
    position *= 10
  }
  return a
}

function TaggedRow({ items }: { items: readonly Tagged[] }) {
  return (
    <span className="flex flex-wrap justify-center gap-1.5">
      {items.map((it, i) => (
        <span
          key={i}
          className="inline-flex items-baseline rounded border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-1 font-mono text-sm tabular-nums"
        >
          {it.value}
          <sub className="text-[9px] text-muted-foreground">{it.tag}</sub>
        </span>
      ))}
    </span>
  )
}

export function StabilityFigure({ caption }: { caption?: string }) {
  const t = useT()
  const sorted = radixTagged(STABILITY_INPUT)
  return (
    <Figure caption={caption}>
      <span className="flex flex-col gap-3">
        <span className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">{t("learn.rxStableInput")}</span>
          <TaggedRow items={STABILITY_INPUT} />
        </span>
        <span className="block">
          <span className="mb-1 block text-xs font-medium text-emerald-700 dark:text-emerald-300">{t("learn.rxStableLabel")}</span>
          <TaggedRow items={sorted} />
        </span>
        <span className="block text-center text-xs text-muted-foreground">{t("learn.rxStableNote")}</span>
      </span>
    </Figure>
  )
}

// — Зростання складності ------------------------------------------------------

export function GrowthFigure({ caption }: { caption?: string }) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const locale = lang === "ua" ? "uk-UA" : "en-US"
  const rows = [10, 100, 1000, 10000, 100000]
  const fmt = (x: number) => Math.round(x).toLocaleString(locale)
  // d·(n+k) для радикса: d ≈ кількість розрядів числа n (умовно log10), k = 10.
  const radix = (n: number) => Math.ceil(Math.log10(n + 1)) * (n + 10)
  return (
    <Figure caption={caption}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-right text-xs text-muted-foreground">
            <th className="px-2 py-1 text-left font-medium">n</th>
            <th className="px-2 py-1 font-mono font-medium">d·(n+k)</th>
            <th className="px-2 py-1 font-mono font-medium">n·log₂n</th>
            <th className="px-2 py-1 font-mono font-medium">n²</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((n) => (
            <tr key={n} className="border-b last:border-0 text-right tabular-nums">
              <td className="px-2 py-1 text-left font-medium">{fmt(n)}</td>
              <td className="px-2 py-1 font-mono text-emerald-700 dark:text-emerald-400">{fmt(radix(n))}</td>
              <td className="px-2 py-1 font-mono text-amber-600 dark:text-amber-400">{fmt(n * Math.log2(n))}</td>
              <td className="px-2 py-1 font-mono text-rose-600 dark:text-rose-400">{fmt(n * n)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <span className="mt-1.5 block text-xs text-muted-foreground">{t("learn.rxGrowthNote")}</span>
    </Figure>
  )
}

// — Код ↔ кошики (міні-плеєр) -------------------------------------------------

export function CodeWalkthroughFigure({ values, caption }: { values: readonly number[]; caption?: string }) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)
  const { frames, code } = useMemo(
    () => buildRadixSortTrace(values, tr),
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
          title={t("play.rxCodeTitle")}
          activeLines={f.lines}
          contextLines={f.contextLines}
          className="h-[340px]"
        />
        <span className="flex h-[340px] flex-col justify-center overflow-auto rounded-lg border bg-card p-3">
          <BucketsView
            array={f.array}
            buckets={f.buckets}
            digitIndex={f.digitIndex}
            maxDigits={f.maxDigits}
            activeIndex={f.activeIndex}
            activeBucket={f.activeBucket}
            gathered={f.gathered}
          />
        </span>
      </span>
      {caption && (
        <span className="mt-2 block text-center text-xs text-muted-foreground">{caption}</span>
      )}
    </MiniPlayerShell>
  )
}
