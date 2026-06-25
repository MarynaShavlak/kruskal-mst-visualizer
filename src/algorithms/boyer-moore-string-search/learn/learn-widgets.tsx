import { useMemo, type ReactNode } from "react"
import { Table2 } from "lucide-react"
import {
  buildBoyerMooreStringSearchTrace,
  type BmFrame,
} from "@/lib/boyerMooreStringSearchTrace"
import { StripView } from "@/algorithms/boyer-moore-string-search/playback/BmStripPanel"
import { ShiftTableView } from "@/algorithms/boyer-moore-string-search/playback/ShiftTablePanel"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { SearchTargetBadge } from "@/algorithms/shared/playback/SearchTargetBadge"
import { MiniPlayerShell } from "@/algorithms/shared/learn/MiniPlayerShell"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import {
  bmMetrics,
  countNaiveComparisons,
  countKmpComparisons,
} from "@/lib/boyerMooreStringSearch"
import { useT } from "@/i18n/use-t"
import type { MessageKey } from "@/i18n/messages"
import type { Translate } from "@/lib/translate"
import { useLangStore } from "@/store/lang-store"

// Живі навчальні віджети пошуку Боєра-Мура на еталонних прикладах. Два сигнатурні образи:
// (1) ТАБЛИЦЯ ПОГАНОГО СИМВОЛУ, що будується (фаза 1, з акцентом на перезаписі); (2) СТРІЧКА
// «текст / шаблон» зі скануванням СПРАВА НАЛІВО, зеленим суфіксом і ВЕЛИКИМИ стрибками з
// пропущеними символами (фаза 2). «Ціна» — порівняння, але часто МЕНШЕ за довжину тексту.

/** Обгортка фігури: рамка-картка + опційний підпис (alt із markdown). */
function Figure({ caption, children }: { caption?: string; children: ReactNode }) {
  return (
    <span className="not-prose my-4 block overflow-x-auto rounded-lg border bg-card p-3">
      {children}
      {caption && (
        <span className="mt-2 block text-center text-xs text-muted-foreground">{caption}</span>
      )}
    </span>
  )
}

/** Бейдж «шукаємо: pattern». */
function PatternBadge({ pattern }: { pattern: string }) {
  const t = useT()
  return (
    <SearchTargetBadge className="mb-2">{t("play.bmTargetBadge", { pattern: pattern || "∅" })}</SearchTargetBadge>
  )
}

/** Бейдж «передобробка: pattern». */
function TableBadge({ pattern }: { pattern: string }) {
  const t = useT()
  return (
    <span className="mb-2 inline-flex items-center gap-1.5 rounded-md border border-violet-400/50 bg-violet-500/10 px-2.5 py-1 text-sm font-medium text-violet-700 dark:text-violet-300">
      <Table2 className="size-3.5" />
      {t("play.bmTableBadge", { pattern: pattern || "∅" })}
    </span>
  )
}

function useTrace(text: string, pattern: string) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)
  return useMemo(
    () => buildBoyerMooreStringSearchTrace(text, pattern, tr),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text, pattern, lang],
  )
}

/** Поля кадру → StripView (фаза пошуку). */
function stripView(f: BmFrame) {
  return {
    text: f.text,
    pattern: f.pattern,
    offset: f.offset,
    j: f.j,
    matchedSuffix: f.matchedSuffix,
    mismatch: f.compareMatch === false,
    full: f.full,
    skippedNow: f.skippedNow,
  }
}

/** Поля кадру → ShiftTableView (фаза таблиці). */
function tableView(f: BmFrame) {
  return {
    pattern: f.pattern,
    table: f.table,
    activeChar: f.tableChar,
    activeIndex: f.tableIndex,
    overwrite: f.overwrite,
    prevShift: f.prevShift,
  }
}

/** Один кадр фази ПОШУКУ (walkthrough/search_NN → кадр 11+NN). */
export function SearchStepFigure({
  text,
  pattern,
  searchStep,
  caption,
}: {
  text: string
  pattern: string
  searchStep: number
  caption?: string
}) {
  const trace = useTrace(text, pattern)
  const searchFrames = trace.frames.filter((f) => f.phase === "search")
  const idx = Math.max(0, Math.min(searchStep, searchFrames.length - 1))
  const frame = searchFrames[idx]
  return (
    <Figure caption={caption}>
      <PatternBadge pattern={pattern} />
      <span className="block">
        <StripView {...stripView(frame)} size="md" />
      </span>
      <span className="mt-2 block text-xs text-muted-foreground">{frame.caption}</span>
    </Figure>
  )
}

/** Один кадр фази ТАБЛИЦІ (walkthrough/table_NN → кадр NN). */
export function TableStepFigure({
  pattern,
  tableStep,
  caption,
}: {
  pattern: string
  tableStep: number
  caption?: string
}) {
  const trace = useTrace("", pattern)
  const tableFrames = trace.frames.filter((f) => f.phase === "table")
  const idx = Math.max(0, Math.min(tableStep, tableFrames.length - 1))
  const frame = tableFrames[idx]
  return (
    <Figure caption={caption}>
      <TableBadge pattern={pattern} />
      <span className="block">
        <ShiftTableView {...tableView(frame)} size="md" />
      </span>
      <span className="mt-2 block text-xs text-muted-foreground">{frame.caption}</span>
    </Figure>
  )
}

/** Статична таблиця зсувів готова (кінцевий кадр фази таблиці). */
export function ShiftTableFigure({ pattern, caption }: { pattern: string; caption?: string }) {
  const trace = useTrace("", pattern)
  const tableFrames = trace.frames.filter((f) => f.phase === "table")
  const frame = tableFrames[tableFrames.length - 1]
  return (
    <Figure caption={caption}>
      <TableBadge pattern={pattern} />
      <span className="block">
        <ShiftTableView {...tableView(frame)} size="md" />
      </span>
    </Figure>
  )
}

/** Міні-плеєр повного трасування (обидві фази). */
export function AnimationFigure({
  text,
  pattern,
  caption,
}: {
  text: string
  pattern: string
  caption?: string
}) {
  const trace = useTrace(text, pattern)
  const player = usePlayer(trace.frames.length, `${text}|${pattern}`)
  const frame = trace.frames[Math.min(player.index, trace.frames.length - 1)]
  const isTable = frame.phase === "table"
  return (
    <Figure caption={caption}>
      <MiniPlayerShell player={player} frameCount={trace.frames.length} caption={frame.caption}>
        {isTable ? (
          <>
            <TableBadge pattern={pattern} />
            <span className="block">
              <ShiftTableView {...tableView(frame)} size="md" />
            </span>
          </>
        ) : (
          <>
            <PatternBadge pattern={pattern} />
            <span className="block">
              <StripView {...stripView(frame)} size="md" />
            </span>
          </>
        )}
      </MiniPlayerShell>
    </Figure>
  )
}

/** Лише фаза таблиці як міні-плеєр. */
export function TableAnimationFigure({ pattern, caption }: { pattern: string; caption?: string }) {
  const trace = useTrace("", pattern)
  const frames = trace.frames.filter((f) => f.phase === "table")
  const player = usePlayer(frames.length, `tbl|${pattern}`)
  const frame = frames[Math.min(player.index, frames.length - 1)]
  return (
    <Figure caption={caption}>
      <MiniPlayerShell player={player} frameCount={frames.length} caption={frame.caption}>
        <TableBadge pattern={pattern} />
        <span className="block">
          <ShiftTableView {...tableView(frame)} size="md" />
        </span>
      </MiniPlayerShell>
    </Figure>
  )
}

/** Код ↔ дані: міні-плеєр із панеллю коду поряд (код перемикається з фазою). */
export function CodeWalkthroughFigure({
  text,
  pattern,
  caption,
}: {
  text: string
  pattern: string
  caption?: string
}) {
  const trace = useTrace(text, pattern)
  const player = usePlayer(trace.frames.length, `cw|${text}|${pattern}`)
  const frame = trace.frames[Math.min(player.index, trace.frames.length - 1)]
  const isTable = frame.phase === "table"
  return (
    <Figure caption={caption}>
      <MiniPlayerShell player={player} frameCount={trace.frames.length} caption={frame.caption}>
        <span className="grid gap-2 lg:grid-cols-2">
          <span className="block min-w-0">
            <CodePanel
              code={isTable ? trace.tableCode : trace.searchCode}
              activeLines={frame.lines}
              contextLines={frame.contextLines}
            />
          </span>
          <span className="block min-w-0">
            {isTable ? (
              <>
                <TableBadge pattern={pattern} />
                <ShiftTableView {...tableView(frame)} size="md" />
              </>
            ) : (
              <>
                <PatternBadge pattern={pattern} />
                <StripView {...stripView(frame)} size="md" />
              </>
            )}
          </span>
        </span>
      </MiniPlayerShell>
    </Figure>
  )
}

/** Контраст «Боєра-Мура проти наївного й KMP» (порівнянь) на еталонних парах. */
export function ContrastFigure({ caption }: { caption?: string }) {
  const t = useT()
  const cases: { text: string; pattern: string; key: string }[] = [
    { text: "the quick brown fox jumps over the lazy dog", pattern: "jumps", key: "jumps" },
    { text: "AAAAAAAAAA", pattern: "CAAAA", key: "CAAAA" },
  ]
  const data = cases.map((c) => ({
    label: c.pattern,
    bm: bmMetrics(c.text, c.pattern).comparisons,
    naive: countNaiveComparisons(c.text, c.pattern),
    kmp: countKmpComparisons(c.text, c.pattern).total,
  }))
  const max = Math.max(...data.flatMap((d) => [d.bm, d.naive, d.kmp]), 1)
  const Bar = ({ v, cls, lbl }: { v: number; cls: string; lbl: string }) => (
    <span className="flex items-center gap-2">
      <span className={`inline-flex h-3 items-center rounded ${cls}`} style={{ width: `${(v / max) * 100}%` }} />
      <span className="tabular-nums text-muted-foreground">{lbl}: {v}</span>
    </span>
  )
  return (
    <Figure caption={caption}>
      <span className="flex flex-col gap-3">
        {data.map((d) => (
          <span key={d.label} className="block text-xs">
            <span className="mb-0.5 block font-mono text-muted-foreground">«{d.label}»</span>
            <Bar v={d.bm} cls="bg-emerald-500/60" lbl={t("learn.bmContrastBm")} />
            <span className="mt-0.5 block"><Bar v={d.naive} cls="bg-rose-500/60" lbl={t("learn.bmContrastNaive")} /></span>
            <span className="mt-0.5 block"><Bar v={d.kmp} cls="bg-sky-500/60" lbl={t("learn.bmContrastKmp")} /></span>
          </span>
        ))}
      </span>
      <span className="mt-2 block text-xs text-muted-foreground">{t("learn.bmContrastNote")}</span>
    </Figure>
  )
}

/** Пропущений текст: скільки символів конспект-приклад жодного разу не порівняв. */
export function SkippedFigure({
  text,
  pattern,
  caption,
}: {
  text: string
  pattern: string
  caption?: string
}) {
  const t = useT()
  const metrics = bmMetrics(text, pattern)
  return (
    <Figure caption={caption}>
      <AnimationFigure text={text} pattern={pattern} />
      <span className="mt-1 block text-xs text-muted-foreground">
        {t("learn.bmSkippedNote", {
          skipped: metrics.skipped,
          comparisons: metrics.comparisons,
          n: text.length,
        })}
      </span>
    </Figure>
  )
}
