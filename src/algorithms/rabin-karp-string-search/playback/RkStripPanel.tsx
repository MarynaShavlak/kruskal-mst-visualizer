import { ArrowRight, Hash, Search } from "lucide-react"
import { Panel } from "@/algorithms/shared/playback/Panel"
import {
  StringStrip,
  CHAR_CLASS,
  type CharRole,
} from "@/algorithms/shared/playback/StringStrip"
import {
  textRole,
  patternRole,
  pointerIndex,
  hashesEqual,
  type RkCellState,
} from "@/algorithms/rabin-karp-string-search/playback/highlight"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

// СИГНАТУРНА панель ФАЗИ 2 (search) — ковзне вікно як СТРІЧКА «текст / шаблон» + бейджі
// ХЕШІВ: хеш вікна поряд із хешем шаблону. Рівні хеші підсвічуються (кандидат); на КОЛІЗІЇ
// хеші рівні, а символи різні — підсвічуємо це (унікальна перлина). Знизу — rolling-
// оновлення O(1): вийшов лівий символ / зайшов правий, хеш до → після.

export interface RkStripProps {
  readonly text: string
  readonly pattern: string
  readonly offset: number
  readonly verdict: "slide" | "collision" | "match" | null
  readonly matched: number
  readonly mismatchJ: number | null
  readonly windowHash: number
  readonly patternHash: number
  readonly roll: { outChar: string; inChar: string; before: number; after: number } | null
  readonly size?: "sm" | "md"
}

function glyph(ch: string): string {
  return ch === " " ? "␣" : ch
}

/** Стрічка «текст / шаблон» поточного вікна (StringStrip + ролі Рабіна-Карпа). */
export function StripView({
  text,
  pattern,
  offset,
  verdict,
  matched,
  mismatchJ,
  size = "md",
}: Omit<RkStripProps, "windowHash" | "patternHash" | "roll">) {
  const t = useT()
  const state: RkCellState = { offset, patternLen: pattern.length, verdict, matched, mismatchJ }
  return (
    <StringStrip
      text={text}
      pattern={pattern}
      offset={offset}
      textRole={(idx) => textRole(idx, state)}
      patternRole={(j) => patternRole(j, state)}
      pointer={pointerIndex(state)}
      textLabel={t("play.rkText")}
      patternLabel={t("play.rkPattern")}
      size={size}
    />
  )
}

/** Пара бейджів хешів: хеш вікна vs хеш шаблону (рівні підсвічені). */
export function HashBadges({
  windowHash,
  patternHash,
  offset,
}: {
  windowHash: number
  patternHash: number
  offset: number
}) {
  const t = useT()
  const equal = offset >= 0 && hashesEqual(windowHash, patternHash)
  return (
    <span className="inline-flex flex-wrap items-center gap-2 text-sm">
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-md border px-2 py-1 font-mono tabular-nums",
          offset < 0
            ? "border-border bg-muted/30 text-muted-foreground"
            : equal
              ? "border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-300"
              : "border-sky-500/60 bg-sky-500/10 text-sky-700 dark:text-sky-300",
        )}
      >
        <Hash className="size-3.5" />
        {t("play.rkWindowHash")} {offset < 0 ? "—" : windowHash}
      </span>
      <span className="text-muted-foreground">{equal ? "=" : "≠"}</span>
      <span className="inline-flex items-center gap-1 rounded-md border border-violet-500/60 bg-violet-500/10 px-2 py-1 font-mono tabular-nums text-violet-700 dark:text-violet-300">
        <Hash className="size-3.5" />
        {t("play.rkPatternHashBadge")} {patternHash}
      </span>
    </span>
  )
}

/** Панель плеєра фази 2: бейдж «шукаємо», бейджі хешів, стрічка, rolling-оновлення, легенда. */
export function RkStripPanel({ className, ...view }: RkStripProps & { className?: string }) {
  const t = useT()
  return (
    <Panel
      title={t("play.rkStripTitle")}
      className={className}
      bodyClassName="flex flex-col gap-3 p-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-rose-400/50 bg-rose-500/10 px-2.5 py-1 text-sm font-medium text-rose-700 dark:text-rose-300">
          <Search className="size-3.5" />
          {t("play.rkTargetBadge", { pattern: view.pattern || "∅" })}
        </span>
        <HashBadges windowHash={view.windowHash} patternHash={view.patternHash} offset={view.offset} />
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto">
        <StripView
          text={view.text}
          pattern={view.pattern}
          offset={view.offset}
          verdict={view.verdict}
          matched={view.matched}
          mismatchJ={view.mismatchJ}
          size={view.size}
        />
      </div>

      {view.roll && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-sky-500/40 bg-sky-500/5 px-2.5 py-1.5 text-xs">
          <span className="font-medium text-sky-700 dark:text-sky-300">{t("play.rkRollLabel")}</span>
          <span className="font-mono tabular-nums">
            {t("play.rkRollOut", { out: glyph(view.roll.outChar) })}
          </span>
          <span className="font-mono tabular-nums">
            {t("play.rkRollIn", { in: glyph(view.roll.inChar) })}
          </span>
          <span className="inline-flex items-center gap-1 font-mono tabular-nums">
            {view.roll.before} <ArrowRight className="size-3" /> {view.roll.after}
          </span>
        </div>
      )}

      <Legend />
    </Panel>
  )
}

function Legend() {
  const t = useT()
  const items: { role: CharRole; label: string }[] = [
    { role: "window", label: t("learn.rkLegendWindow") },
    { role: "match", label: t("learn.rkLegendMatch") },
    { role: "mismatch", label: t("learn.rkLegendMismatch") },
    { role: "idle", label: t("learn.rkLegendOut") },
  ]
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
      {items.map((it) => (
        <span key={it.role} className="inline-flex items-center gap-1">
          <span className={cn("inline-block size-2.5 rounded-sm border", CHAR_CLASS[it.role])} />
          {it.label}
        </span>
      ))}
    </div>
  )
}
