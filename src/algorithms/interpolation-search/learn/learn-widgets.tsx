import { useMemo, type ReactNode } from "react"
import { Search } from "lucide-react"
import { buildInterpolationSearchTrace } from "@/lib/interpolationSearchTrace"
import { countProbes, countBinaryProbes } from "@/lib/interpolationSearch"
import { WindowView } from "@/algorithms/interpolation-search/playback/WindowPanel"
import { LineModelView } from "@/algorithms/interpolation-search/playback/LineModelPanel"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { MiniPlayerShell } from "@/algorithms/shared/learn/MiniPlayerShell"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { useT } from "@/i18n/use-t"
import type { MessageKey } from "@/i18n/messages"
import type { Translate } from "@/lib/translate"
import { useLangStore } from "@/store/lang-store"
import { cn } from "@/lib/utils"

// Живі навчальні віджети інтерполяційного пошуку на еталонних масивах. Головний образ
// — «ПРЯМА-МОДЕЛЬ»: проєкція ключа на пряму (low,arr[low])→(high,arr[high]) + вікно
// масиву, що звужується НЕсиметрично. «Ціна» — кількість ПРОБ (обчислень index).

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
      {t("play.ipTargetBadge", { target })}
    </span>
  )
}

function useTrace(values: readonly number[], target: number, recursive: boolean) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)
  return useMemo(
    () => buildInterpolationSearchTrace(values, target, recursive, tr),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values, target, recursive, lang],
  )
}

type Frame = ReturnType<typeof useTrace>["frames"][number]

/** Прокидає поля кадру у WindowView (роль/вікно/збіг). */
function frameView(f: Frame) {
  return {
    array: f.array,
    low: f.low,
    high: f.high,
    index: f.index,
    probing: f.phase === "probe",
    discardLo: f.discardLo,
    discardHi: f.discardHi,
    result: f.result,
    resolved: f.phase === "found" || f.phase === "done",
  }
}

/** Прокидає поля кадру у LineModelView (пряма-модель). */
function lineView(f: Frame) {
  return {
    array: f.array,
    target: f.target,
    lineLow: f.lineLow,
    lineHigh: f.lineHigh,
    loVal: f.loVal,
    hiVal: f.hiVal,
    index: f.index,
    probing: f.phase === "probe",
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
        index={null}
        probing={false}
        discardLo={null}
        discardHi={null}
        result={-1}
        resolved={false}
      />
    </Figure>
  )
}

// — Пряма-модель (сигнатурний образ) ------------------------------------------

export function LineModelFigure({
  values,
  target,
  frameIndex,
  caption,
}: {
  values: readonly number[]
  target: number
  frameIndex?: number
  caption?: string
}) {
  const trace = useTrace(values, target, false)
  // За замовчуванням — перша проба (де проєкція найнаочніша).
  const fallback = trace.frames.findIndex((f) => f.phase === "probe" || f.phase === "found")
  const idx = frameIndex ?? (fallback >= 0 ? fallback : 0)
  const f = trace.frames[Math.min(Math.max(0, idx), trace.frames.length - 1)]
  return (
    <Figure caption={caption}>
      <span className="block text-center">
        <TargetBadge target={target} />
      </span>
      <span className="mx-auto block max-w-md">
        <span className="block h-[230px]">
          <LineModelView {...lineView(f)} />
        </span>
      </span>
      <span className="mt-2 block">
        <WindowView {...frameView(f)} size="sm" />
      </span>
      <span className="mt-2 block text-center text-[11px] text-muted-foreground">{f.caption}</span>
    </Figure>
  )
}

// — Один крок трасування (вікно + компактна пряма) ----------------------------

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
      <span className="mx-auto mt-3 block max-w-sm">
        <span className="block h-[200px]">
          <LineModelView {...lineView(f)} />
        </span>
      </span>
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
          ? t("learn.ipResultFound", { i: trace.result.result, probes: trace.result.probes })
          : t("learn.ipResultAbsent", { probes: trace.result.probes })}
      </span>
    </Figure>
  )
}

// — Еволюція вікна (рядок на кожну пробу) --------------------------------------

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
            <span className="w-28 shrink-0 text-right text-[11px] font-medium text-muted-foreground">
              {t("learn.ipEvolStep", { k: ri + 1, low: f.low, high: f.high, index: f.index ?? 0 })}
            </span>
            <WindowView {...frameView(f)} size="sm" />
          </span>
        ))}
      </span>
    </Figure>
  )
}

// — Анімація (міні-плеєр: вікно + пряма) ---------------------------------------

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
      <span className="grid gap-3 lg:grid-cols-2">
        <span className="block overflow-auto">
          <WindowView {...frameView(f)} size="sm" />
        </span>
        <span className="block h-[210px]">
          <LineModelView {...lineView(f)} />
        </span>
      </span>
      {caption && (
        <span className="mt-2 block text-center text-xs text-muted-foreground">{caption}</span>
      )}
    </MiniPlayerShell>
  )
}

// — Інтуїція: пошук у словнику ------------------------------------------------

export function IntuitionFigure({ caption }: { caption?: string }) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  // Алфавіт як «словник»: шукаємо слово на останню літеру (кінець) — гортаємо одразу
  // в кінець, а не в середину (двійковий). Інтерполяція = «вгадай за значенням».
  const letters = (lang === "ua" ? "АБВГДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ").split("")
  const targetLetter = letters[letters.length - 1]
  const targetPos = letters.length - 1
  const mid = Math.floor((letters.length - 1) / 2)
  return (
    <Figure caption={caption}>
      <span className="mb-2 block text-center text-xs text-muted-foreground">
        {t("learn.ipIntuitionTitle", { letter: targetLetter })}
      </span>
      <span className="flex flex-wrap justify-center gap-0.5">
        {letters.map((ch, i) => {
          const isTarget = i === targetPos
          const isMid = i === mid
          return (
            <span
              key={i}
              className={cn(
                "inline-flex size-6 items-center justify-center rounded text-xs font-medium",
                isTarget
                  ? "bg-violet-500 text-white"
                  : isMid
                    ? "border border-sky-400/60 bg-sky-500/10 text-sky-700 dark:text-sky-300"
                    : "bg-muted/40 text-muted-foreground",
              )}
            >
              {ch}
            </span>
          )
        })}
      </span>
      <span className="mt-3 flex flex-col gap-1 text-xs">
        <span className="text-violet-700 dark:text-violet-300">{t("learn.ipIntuitionInterp", { letter: targetLetter })}</span>
        <span className="text-sky-700 dark:text-sky-300">{t("learn.ipIntuitionBinary")}</span>
      </span>
    </Figure>
  )
}

// — Складність: n vs log n vs log log n ---------------------------------------

export function ComplexityFigure({ caption }: { caption?: string }) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const locale = lang === "ua" ? "uk-UA" : "en-US"
  const fmt = (x: number) => x.toLocaleString(locale)
  const rows = [100, 1000, 10000, 100000, 1000000]
  return (
    <Figure caption={caption}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-right text-xs text-muted-foreground">
            <th className="px-2 py-1 text-left font-medium">n</th>
            <th className="px-2 py-1 font-mono font-medium text-rose-600 dark:text-rose-400">{t("learn.ipCmpLinear")}</th>
            <th className="px-2 py-1 font-mono font-medium text-sky-600 dark:text-sky-400">{t("learn.ipCmpBinary")}</th>
            <th className="px-2 py-1 font-mono font-medium text-violet-600 dark:text-violet-400">{t("learn.ipCmpInterp")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((n) => (
            <tr key={n} className="border-b last:border-0 text-right tabular-nums">
              <td className="px-2 py-1 text-left font-medium">{fmt(n)}</td>
              <td className="px-2 py-1 font-mono text-rose-600 dark:text-rose-400">{fmt(n)}</td>
              <td className="px-2 py-1 font-mono text-sky-600 dark:text-sky-400">{Math.floor(Math.log2(n)) + 1}</td>
              <td className="px-2 py-1 font-mono text-violet-600 dark:text-violet-400">1</td>
            </tr>
          ))}
        </tbody>
      </table>
      <span className="mt-1.5 block text-xs text-muted-foreground">{t("learn.ipCmpNote")}</span>
    </Figure>
  )
}

// — Контраст із двійковим: проби на одному масиві ------------------------------

export function VsBinaryFigure({
  values,
  target,
  caption,
}: {
  values: readonly number[]
  target: number
  caption?: string
}) {
  const t = useT()
  const ip = countProbes(values, target)
  const bin = countBinaryProbes(values, target)
  const max = Math.max(ip, bin, 1)
  const ipWins = ip < bin
  const rows: { label: string; probes: number; cls: string }[] = [
    { label: t("learn.ipVsInterp"), probes: ip, cls: "bg-violet-500/70" },
    { label: t("learn.ipVsBinary"), probes: bin, cls: "bg-sky-500/70" },
  ]
  return (
    <Figure caption={caption}>
      <span className="block text-center">
        <TargetBadge target={target} />
      </span>
      <span className="mb-2 block text-center text-[11px] text-muted-foreground">
        {t("learn.ipVsArray", { arr: `[${values.join(", ")}]` })}
      </span>
      <span className="flex flex-col gap-1.5">
        {rows.map((r) => (
          <span key={r.label} className="flex items-center gap-2">
            <span className="w-32 shrink-0 text-right text-[11px] font-medium text-muted-foreground">
              {r.label}
            </span>
            <span className="flex h-5 flex-1 items-center">
              <span
                className={cn("inline-block h-3.5 rounded-sm", r.cls)}
                style={{ width: `${(r.probes / max) * 100}%` }}
              />
              <span className="ml-2 text-xs font-medium tabular-nums">{r.probes}</span>
            </span>
          </span>
        ))}
      </span>
      <span
        className={cn(
          "mt-2 block text-center text-xs font-medium",
          ipWins ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300",
        )}
      >
        {ipWins ? t("learn.ipVsWin") : t("learn.ipVsLose")}
      </span>
    </Figure>
  )
}

// — Деградація: скупчені дані з викидом ----------------------------------------

export function DegradationFigure({ caption }: { caption?: string }) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const locale = lang === "ua" ? "uk-UA" : "en-US"
  const fmt = (x: number) => x.toLocaleString(locale)
  // Масив [1, 2, …, n-1, BIG]: один викид збиває пряму → інтерполяційний повзе O(n).
  const sizes = [10, 20, 50, 100]
  const rows = useMemo(
    () =>
      sizes.map((n) => {
        const arr: number[] = []
        for (let i = 1; i < n; i++) arr.push(i)
        arr.push(1_000_000_000)
        const target = n - 1
        return { n, ip: countProbes(arr, target), bin: countBinaryProbes(arr, target) }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  return (
    <Figure caption={caption}>
      <span className="mb-2 block text-center text-xs text-muted-foreground">
        {t("learn.ipDegradeTitle")}
      </span>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-right text-xs text-muted-foreground">
            <th className="px-2 py-1 text-left font-medium">n</th>
            <th className="px-2 py-1 font-mono font-medium text-violet-600 dark:text-violet-400">{t("learn.ipVsInterp")}</th>
            <th className="px-2 py-1 font-mono font-medium text-sky-600 dark:text-sky-400">{t("learn.ipVsBinary")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.n} className="border-b last:border-0 text-right tabular-nums">
              <td className="px-2 py-1 text-left font-medium">{fmt(r.n)}</td>
              <td className="px-2 py-1 font-mono text-rose-600 dark:text-rose-400">{r.ip}</td>
              <td className="px-2 py-1 font-mono text-sky-600 dark:text-sky-400">{r.bin}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <span className="mt-1.5 block text-xs text-muted-foreground">{t("learn.ipDegradeNote")}</span>
    </Figure>
  )
}

// — Код ↔ дані (міні-плеєр) ----------------------------------------------------

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
          title={t("play.ipCodeIterative")}
          activeLines={f.lines}
          contextLines={f.contextLines}
          className="h-[320px]"
        />
        <span className="flex h-[320px] flex-col items-center justify-center gap-2 overflow-auto rounded-lg border bg-card p-3">
          <TargetBadge target={target} />
          <WindowView {...frameView(f)} size="sm" />
          <span className="block h-[170px] w-full">
            <LineModelView {...lineView(f)} />
          </span>
        </span>
      </span>
      {caption && (
        <span className="mt-2 block text-center text-xs text-muted-foreground">{caption}</span>
      )}
    </MiniPlayerShell>
  )
}
