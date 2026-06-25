import { useMemo, type ReactNode } from "react"
import { ArrowRight, Table2 } from "lucide-react"
import {
  buildKmpStringSearchTrace,
  type KmpFrame,
} from "@/lib/kmpStringSearchTrace"
import { LpsTable } from "@/algorithms/kmp-string-search/playback/LpsTablePanel"
import { StripView } from "@/algorithms/kmp-string-search/playback/KmpStripPanel"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { SearchTargetBadge } from "@/algorithms/shared/playback/SearchTargetBadge"
import { MiniPlayerShell } from "@/algorithms/shared/learn/MiniPlayerShell"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import {
  countKmpComparisons,
  countNaiveComparisons,
} from "@/lib/kmpStringSearch"
import { useT } from "@/i18n/use-t"
import type { MessageKey } from "@/i18n/messages"
import type { Translate } from "@/lib/translate"
import { useLangStore } from "@/store/lang-store"
import { cn } from "@/lib/utils"

// Живі навчальні віджети KMP на еталонних прикладах. Два образи: ТАБЛИЦЯ LPS (фаза 1) і
// СТРІЧКА «текст / шаблон» зі стрибками шаблону + інваріантом «i лише вперед» (фаза 2).

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

function LpsBadge({ pattern }: { pattern: string }) {
  const t = useT()
  return (
    <span className="mb-2 inline-flex items-center gap-1.5 rounded-md border border-sky-400/50 bg-sky-500/10 px-2.5 py-1 text-sm font-medium text-sky-700 dark:text-sky-300">
      <Table2 className="size-3.5" />
      {t("play.kmpLpsBadge", { pattern: pattern || "∅" })}
    </span>
  )
}

function SearchBadge({ pattern, monotonic, i }: { pattern: string; monotonic: boolean; i: number }) {
  const t = useT()
  return (
    <span className="mb-2 flex flex-wrap items-center gap-2">
      <SearchTargetBadge>{t("play.strTargetBadge", { pattern: pattern || "∅" })}</SearchTargetBadge>
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium",
          monotonic
            ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            : "border-rose-400/50 bg-rose-500/10 text-rose-700 dark:text-rose-300",
        )}
      >
        <ArrowRight className="size-3.5" />
        {t("play.kmpMonotonic", { i })}
      </span>
    </span>
  )
}

function useTrace(text: string, pattern: string) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)
  return useMemo(
    () => buildKmpStringSearchTrace(text, pattern, tr),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text, pattern, lang],
  )
}

/** Лише lps-кадри trace (включно з init→першим lps-кадром). */
function lpsFrames(frames: readonly KmpFrame[]): KmpFrame[] {
  return frames.filter((f) => f.lpsState != null || f.phase === "init")
}

/** Лише search-кадри trace. */
function searchFrames(frames: readonly KmpFrame[]): KmpFrame[] {
  return frames.filter((f) => f.searchState != null)
}

// ---------------------------------------------------------------------------
// Статична ТАБЛИЦЯ lps готового шаблону (lps_table_*).
// ---------------------------------------------------------------------------
export function LpsTableFigure({ pattern, caption }: { pattern: string; caption?: string }) {
  const trace = useTrace(pattern, pattern)
  const finalFrame = trace.frames.find((f) => f.lpsState?.kind === "final")
  if (!finalFrame?.lpsState) return <Figure caption={caption}>—</Figure>
  return (
    <Figure caption={caption}>
      <LpsBadge pattern={pattern} />
      <span className="block">
        <LpsTable state={finalFrame.lpsState} size="md" />
      </span>
    </Figure>
  )
}

// ---------------------------------------------------------------------------
// Один lps-крок (walkthrough/lps_NN та lps_build_*).
// ---------------------------------------------------------------------------
export function LpsStepFigure({
  pattern,
  frameIndex,
  caption,
}: {
  pattern: string
  frameIndex: number
  caption?: string
}) {
  const trace = useTrace(pattern, pattern)
  const frames = lpsFrames(trace.frames)
  const idx = Math.max(0, Math.min(frameIndex, frames.length - 1))
  const frame = frames[idx]
  const state = frame.lpsState
  return (
    <Figure caption={caption}>
      <LpsBadge pattern={pattern} />
      {state ? (
        <span className="block">
          <LpsTable state={state} size="md" />
        </span>
      ) : (
        <span className="block text-xs text-muted-foreground">lps[0] = 0</span>
      )}
      <span className="mt-2 block text-xs text-muted-foreground">{frame.caption}</span>
    </Figure>
  )
}

// ---------------------------------------------------------------------------
// Міні-плеєр побудови lps (lps_build.gif).
// ---------------------------------------------------------------------------
export function LpsAnimationFigure({ pattern, caption }: { pattern: string; caption?: string }) {
  const trace = useTrace(pattern, pattern)
  const frames = lpsFrames(trace.frames)
  const player = usePlayer(frames.length, `lps|${pattern}`)
  const frame = frames[Math.min(player.index, frames.length - 1)]
  return (
    <Figure caption={caption}>
      <MiniPlayerShell player={player} frameCount={frames.length} caption={frame.caption}>
        <LpsBadge pattern={pattern} />
        <span className="block">
          {frame.lpsState ? <LpsTable state={frame.lpsState} size="md" /> : <span className="text-xs text-muted-foreground">lps[0] = 0</span>}
        </span>
      </MiniPlayerShell>
    </Figure>
  )
}

// ---------------------------------------------------------------------------
// Один search-крок (walkthrough/search_NN, search_konspekt_match, i_monotonic).
// ---------------------------------------------------------------------------
export function SearchStepFigure({
  text,
  pattern,
  frameIndex,
  caption,
}: {
  text: string
  pattern: string
  frameIndex: number
  caption?: string
}) {
  const trace = useTrace(text, pattern)
  const frames = searchFrames(trace.frames)
  const idx = Math.max(0, Math.min(frameIndex, frames.length - 1))
  const frame = frames[idx]
  const state = frame.searchState!
  return (
    <Figure caption={caption}>
      <SearchBadge pattern={pattern} monotonic={frame.iMonotonic} i={state.i} />
      <span className="block">
        <StripView text={text} pattern={pattern} state={state} size="md" />
      </span>
      <span className="mt-2 block text-xs text-muted-foreground">{frame.caption}</span>
    </Figure>
  )
}

// ---------------------------------------------------------------------------
// Міні-плеєр пошуку (search_konspekt.gif).
// ---------------------------------------------------------------------------
export function SearchAnimationFigure({
  text,
  pattern,
  caption,
}: {
  text: string
  pattern: string
  caption?: string
}) {
  const trace = useTrace(text, pattern)
  const frames = searchFrames(trace.frames)
  const player = usePlayer(frames.length, `search|${text}|${pattern}`)
  const frame = frames[Math.min(player.index, frames.length - 1)]
  const state = frame.searchState!
  return (
    <Figure caption={caption}>
      <MiniPlayerShell player={player} frameCount={frames.length} caption={frame.caption}>
        <SearchBadge pattern={pattern} monotonic={frame.iMonotonic} i={state.i} />
        <span className="block">
          <StripView text={text} pattern={pattern} state={state} size="md" />
        </span>
      </MiniPlayerShell>
    </Figure>
  )
}

// ---------------------------------------------------------------------------
// Інтуїція + повний контраст: міні-плеєр повного trace (код ↔ дані обох фаз).
// ---------------------------------------------------------------------------
export function FullWalkthroughFigure({
  text,
  pattern,
  caption,
}: {
  text: string
  pattern: string
  caption?: string
}) {
  const trace = useTrace(text, pattern)
  const player = usePlayer(trace.frames.length, `full|${text}|${pattern}`)
  const frame = trace.frames[Math.min(player.index, trace.frames.length - 1)]
  return (
    <Figure caption={caption}>
      <MiniPlayerShell player={player} frameCount={trace.frames.length} caption={frame.caption}>
        <span className="grid gap-2 lg:grid-cols-2">
          <span className="block min-w-0">
            <CodePanel
              code={frame.code === "lps" ? trace.lpsCode : trace.searchCode}
              activeLines={frame.lines}
              contextLines={frame.contextLines}
            />
          </span>
          <span className="block min-w-0">
            {frame.lpsState ? (
              <>
                <LpsBadge pattern={pattern} />
                <LpsTable state={frame.lpsState} size="md" />
              </>
            ) : (
              <>
                <SearchBadge pattern={pattern} monotonic={frame.iMonotonic} i={frame.searchState?.i ?? 0} />
                {frame.searchState && <StripView text={text} pattern={pattern} state={frame.searchState} size="md" />}
              </>
            )}
          </span>
        </span>
      </MiniPlayerShell>
    </Figure>
  )
}

// ---------------------------------------------------------------------------
// Контраст KMP проти наївного: «ціна» в порівняннях на найгіршому вході.
// ---------------------------------------------------------------------------
export function VsNaiveFigure({
  text,
  pattern,
  caption,
}: {
  text: string
  pattern: string
  caption?: string
}) {
  const t = useT()
  const kmp = countKmpComparisons(text, pattern)
  const naive = countNaiveComparisons(text, pattern)
  const max = Math.max(kmp.total, naive, 1)
  return (
    <Figure caption={caption}>
      <span className="block text-xs">
        <span className="mb-0.5 block tabular-nums text-muted-foreground">
          text="{text}", pattern="{pattern}"
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-flex h-3 items-center rounded bg-emerald-500/60" style={{ width: `${(kmp.total / max) * 100}%` }} />
          <span className="tabular-nums text-emerald-700 dark:text-emerald-400">{t("learn.kmpCmpKmp", { v: kmp.total })}</span>
        </span>
        <span className="mt-0.5 flex items-center gap-2">
          <span className="inline-flex h-3 items-center rounded bg-rose-500/60" style={{ width: `${(naive / max) * 100}%` }} />
          <span className="tabular-nums text-rose-700 dark:text-rose-400">{t("learn.kmpCmpNaive", { v: naive })}</span>
        </span>
      </span>
      <span className="mt-2 block text-xs text-muted-foreground">{t("learn.kmpCmpNote")}</span>
    </Figure>
  )
}

// ---------------------------------------------------------------------------
// Складність: O(n+m) проти O(n·m) на зростаючих патологічних входах.
// ---------------------------------------------------------------------------
export function ComplexityFigure({ caption }: { caption?: string }) {
  const t = useT()
  const samples = [16, 32, 64].map((n) => {
    const text = "A".repeat(n)
    const pattern = "A".repeat(Math.floor(n / 2) - 1) + "B"
    return {
      n,
      kmp: countKmpComparisons(text, pattern).total,
      naive: countNaiveComparisons(text, pattern),
    }
  })
  const max = Math.max(...samples.map((s) => s.naive), 1)
  return (
    <Figure caption={caption}>
      <span className="flex flex-col gap-2">
        {samples.map((s) => (
          <span key={s.n} className="block text-xs">
            <span className="mb-0.5 block tabular-nums text-muted-foreground">n={s.n}</span>
            <span className="flex items-center gap-2">
              <span className="inline-flex h-3 items-center rounded bg-emerald-500/60" style={{ width: `${(s.kmp / max) * 100}%` }} />
              <span className="tabular-nums text-emerald-700 dark:text-emerald-400">{t("learn.kmpCmpKmp", { v: s.kmp })}</span>
            </span>
            <span className="mt-0.5 flex items-center gap-2">
              <span className="inline-flex h-3 items-center rounded bg-rose-500/60" style={{ width: `${(s.naive / max) * 100}%` }} />
              <span className="tabular-nums text-rose-700 dark:text-rose-400">{t("learn.kmpCmpNaive", { v: s.naive })}</span>
            </span>
          </span>
        ))}
      </span>
      <span className="mt-2 block text-xs text-muted-foreground">{t("learn.kmpComplexityNote")}</span>
    </Figure>
  )
}
