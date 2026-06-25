import { useMemo, type ReactNode } from "react"
import {
  buildNaiveStringSearchTrace,
  type NaiveFrame,
} from "@/lib/naiveStringSearchTrace"
import { StripView } from "@/algorithms/naive-string-search/playback/StripPanel"
import { CHAR_CLASS, type CharRole } from "@/algorithms/shared/playback/StringStrip"
import { textRole, type NssCellState } from "@/algorithms/naive-string-search/playback/highlight"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { SearchTargetBadge } from "@/algorithms/shared/playback/SearchTargetBadge"
import { MiniPlayerShell } from "@/algorithms/shared/learn/MiniPlayerShell"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { caseAnalysis } from "@/lib/naiveStringSearch"
import { useT } from "@/i18n/use-t"
import type { MessageKey } from "@/i18n/messages"
import type { Translate } from "@/lib/translate"
import { useLangStore } from "@/store/lang-store"
import { cn } from "@/lib/utils"

// Живі навчальні віджети наївного пошуку в рядках на еталонних прикладах. Головний образ
// — СТРІЧКА «текст / шаблон»: зелений збіглий префікс + червона розбіжність, що ковзає
// вирівнювання за вирівнюванням. «Ціна» — кількість ПОРІВНЯНЬ символів.

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

/** Бейдж «шукаємо: pattern». */
function PatternBadge({ pattern }: { pattern: string }) {
  const t = useT()
  return (
    <SearchTargetBadge className="mb-2">{t("play.strTargetBadge", { pattern: pattern || "∅" })}</SearchTargetBadge>
  )
}

function useTrace(text: string, pattern: string, findAll: boolean) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)
  return useMemo(
    () => buildNaiveStringSearchTrace(text, pattern, findAll, tr),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text, pattern, findAll, lang],
  )
}

/** Прокидає поля кадру у StripView. */
function frameView(f: NaiveFrame) {
  return {
    text: f.text,
    pattern: f.pattern,
    offset: f.offset,
    matched: f.matched,
    mismatchJ: f.mismatchJ,
  }
}

/** Статична фігура: стрічка на конкретному кадрі трасування (walkthrough/step_NN). */
export function StepFigure({
  text,
  pattern,
  frameIndex,
  findAll = false,
  caption,
}: {
  text: string
  pattern: string
  frameIndex: number
  findAll?: boolean
  caption?: string
}) {
  const trace = useTrace(text, pattern, findAll)
  const idx = Math.max(0, Math.min(frameIndex, trace.frames.length - 1))
  const frame = trace.frames[idx]
  return (
    <Figure caption={caption}>
      <PatternBadge pattern={pattern} />
      <span className="block">
        <StripView {...frameView(frame)} size="md" />
      </span>
      <span className="mt-2 block text-xs text-muted-foreground">{frame.caption}</span>
    </Figure>
  )
}

/** Міні-плеєр: повне трасування пари (текст, шаблон). */
export function AnimationFigure({
  text,
  pattern,
  findAll = false,
  caption,
}: {
  text: string
  pattern: string
  findAll?: boolean
  caption?: string
}) {
  const trace = useTrace(text, pattern, findAll)
  const player = usePlayer(trace.frames.length, `${text}|${pattern}|${findAll}`)
  const frame = trace.frames[Math.min(player.index, trace.frames.length - 1)]
  return (
    <Figure caption={caption}>
      <MiniPlayerShell player={player} frameCount={trace.frames.length} caption={frame.caption}>
        <PatternBadge pattern={pattern} />
        <span className="block">
          <StripView {...frameView(frame)} size="md" />
        </span>
      </MiniPlayerShell>
    </Figure>
  )
}

/** Інтуїція: пошук слова «вручну» (HELLO WORLD / WORLD) як міні-плеєр. */
export function IntuitionFigure({ caption }: { caption?: string }) {
  return <AnimationFigure text="HELLO WORLD" pattern="WORLD" caption={caption} />
}

/** Код ↔ стрічка: міні-плеєр із панеллю коду поряд зі стрічкою. */
export function CodeWalkthroughFigure({
  text,
  pattern,
  findAll = false,
  caption,
}: {
  text: string
  pattern: string
  findAll?: boolean
  caption?: string
}) {
  const trace = useTrace(text, pattern, findAll)
  const player = usePlayer(trace.frames.length, `cw|${text}|${pattern}|${findAll}`)
  const frame = trace.frames[Math.min(player.index, trace.frames.length - 1)]
  return (
    <Figure caption={caption}>
      <MiniPlayerShell player={player} frameCount={trace.frames.length} caption={frame.caption}>
        <span className="grid gap-2 lg:grid-cols-2">
          <span className="block min-w-0">
            <CodePanel
              code={trace.code}
              activeLines={frame.lines}
              contextLines={frame.contextLines}
            />
          </span>
          <span className="block min-w-0">
            <PatternBadge pattern={pattern} />
            <StripView {...frameView(frame)} size="md" />
          </span>
        </span>
      </MiniPlayerShell>
    </Figure>
  )
}

/** «Драбина»: усі вирівнювання одне під одним (статично) — наочний зсув шаблону. */
export function EvolutionFigure({
  text,
  pattern,
  findAll = false,
  caption,
}: {
  text: string
  pattern: string
  findAll?: boolean
  caption?: string
}) {
  const trace = useTrace(text, pattern, findAll)
  const rows = trace.frames.filter((f) => f.phase === "align" || f.phase === "found")
  return (
    <Figure caption={caption}>
      <PatternBadge pattern={pattern} />
      <span className="flex flex-col gap-2">
        {rows.map((f) => (
          <span key={f.i} className="block">
            <StripView {...frameView(f)} size="md" />
          </span>
        ))}
      </span>
    </Figure>
  )
}

/** Сітка вирівнювань «з висоти»: рядок на вирівнювання, лише ряд тексту (компактно). */
export function GridFigure({
  text,
  pattern,
  findAll = false,
  caption,
}: {
  text: string
  pattern: string
  findAll?: boolean
  caption?: string
}) {
  const trace = useTrace(text, pattern, findAll)
  const rows = trace.frames.filter((f) => f.phase === "align" || f.phase === "found")
  return (
    <Figure caption={caption}>
      <span className="inline-flex flex-col gap-1 overflow-x-auto">
        {rows.map((f) => {
          const state: NssCellState = {
            offset: f.offset,
            matched: f.matched,
            mismatchJ: f.mismatchJ,
            patternLen: pattern.length,
          }
          return (
            <span key={f.i} className="inline-flex items-center gap-0.5">
              <span className="mr-1 w-8 shrink-0 text-right text-[10px] tabular-nums text-muted-foreground">
                i={f.offset}
              </span>
              {Array.from(text).map((ch, idx) => {
                const role: CharRole = textRole(idx, state)
                return (
                  <span
                    key={idx}
                    className={cn(
                      "inline-flex size-5 shrink-0 items-center justify-center rounded-sm border font-mono text-[10px]",
                      CHAR_CLASS[role],
                    )}
                  >
                    {ch === " " ? "␣" : ch}
                  </span>
                )
              })}
            </span>
          )
        })}
      </span>
    </Figure>
  )
}

/** Марна робота: повторне звіряння префікса між сусідніми вирівнюваннями (= GridFigure). */
export function WastedWorkFigure({ caption }: { caption?: string }) {
  return <GridFigure text="ABABDABACDABABCABAB" pattern="ABABCABAB" caption={caption} />
}

/** Складність: найкращий ≈ N−M+1 проти найгіршого (N−M+1)·M на еталонних розмірах. */
export function ComplexityFigure({ caption }: { caption?: string }) {
  const t = useT()
  const samples: { text: string; pattern: string }[] = [
    { text: "x".repeat(10), pattern: "x".repeat(3) },
    { text: "x".repeat(20), pattern: "x".repeat(5) },
    { text: "x".repeat(40), pattern: "x".repeat(8) },
  ]
  const data = samples.map((s) => {
    const c = caseAnalysis(s.text, s.pattern)
    return { n: s.text.length, m: s.pattern.length, best: c.best, worst: c.worst }
  })
  const max = Math.max(...data.map((d) => d.worst), 1)
  return (
    <Figure caption={caption}>
      <span className="flex flex-col gap-2">
        {data.map((d) => (
          <span key={`${d.n}-${d.m}`} className="block text-xs">
            <span className="mb-0.5 block tabular-nums text-muted-foreground">
              n={d.n}, m={d.m}
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-flex h-3 items-center rounded bg-emerald-500/60" style={{ width: `${(d.best / max) * 100}%` }} />
              <span className="tabular-nums text-emerald-700 dark:text-emerald-400">{t("learn.nssCmpBest", { v: d.best })}</span>
            </span>
            <span className="mt-0.5 flex items-center gap-2">
              <span className="inline-flex h-3 items-center rounded bg-rose-500/60" style={{ width: `${(d.worst / max) * 100}%` }} />
              <span className="tabular-nums text-rose-700 dark:text-rose-400">{t("learn.nssCmpWorst", { v: d.worst })}</span>
            </span>
          </span>
        ))}
      </span>
      <span className="mt-2 block text-xs text-muted-foreground">{t("learn.nssCmpNote")}</span>
    </Figure>
  )
}
