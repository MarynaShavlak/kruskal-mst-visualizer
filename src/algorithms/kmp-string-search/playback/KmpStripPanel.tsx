import { ArrowRight } from "lucide-react"
import { Panel } from "@/algorithms/shared/playback/Panel"
import { LegendRow } from "@/algorithms/shared/playback/LegendRow"
import { SearchTargetBadge } from "@/algorithms/shared/playback/SearchTargetBadge"
import {
  StringStrip,
  CHAR_CLASS,
} from "@/algorithms/shared/playback/StringStrip"
import {
  textRole,
  patternRole,
  pointerIndex,
  type KmpCellState,
} from "@/algorithms/kmp-string-search/playback/highlight"
import type { KmpSearchState } from "@/lib/kmpStringSearchTrace"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

export interface StripProps {
  readonly text: string
  readonly pattern: string
  readonly state: KmpSearchState
  readonly iMonotonic: boolean
  readonly size?: "sm" | "md"
}

/** Стрічка «текст / шаблон» фази пошуку (спільний StringStrip + ролі KMP). */
export function StripView({ text, pattern, state, size = "md" }: Omit<StripProps, "iMonotonic">) {
  const t = useT()
  const cell: KmpCellState = {
    offset: state.offset,
    i: state.i,
    j: state.j,
    kind: state.kind,
    match: state.match,
    patternLen: pattern.length,
  }
  return (
    <StringStrip
      text={text}
      pattern={pattern}
      offset={state.offset >= 0 ? state.offset : -1}
      textRole={(idx) => textRole(idx, cell)}
      patternRole={(j) => patternRole(j, cell)}
      pointer={pointerIndex(cell)}
      textLabel={t("play.kmpText")}
      patternLabel={t("play.kmpPattern")}
      size={size}
    />
  )
}

/** Панель плеєра фази 2: бейдж «шукаємо: pattern» + стрічка + індикатор «i лише вперед» + легенда. */
export function KmpStripPanel({
  className,
  iMonotonic,
  ...view
}: StripProps & { className?: string }) {
  const t = useT()
  return (
    <Panel
      title={t("play.kmpStripTitle")}
      className={className}
      bodyClassName="flex flex-col gap-3 p-3"
    >
      <div className="flex flex-wrap items-center gap-2">
        <SearchTargetBadge>{t("play.kmpTargetBadge", { pattern: view.pattern || "∅" })}</SearchTargetBadge>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium",
            iMonotonic
              ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-rose-400/50 bg-rose-500/10 text-rose-700 dark:text-rose-300",
          )}
        >
          <ArrowRight className="size-3.5" />
          {t("play.kmpMonotonic", { i: view.state.i })}
        </span>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto">
        <StripView {...view} />
      </div>
      <Legend />
    </Panel>
  )
}

function Legend() {
  const t = useT()
  const entries = [
    { label: t("play.kmpLegendMatched"), cls: CHAR_CLASS.match },
    { label: t("play.kmpLegendActive"), cls: CHAR_CLASS.active },
    { label: t("play.kmpLegendMismatch"), cls: CHAR_CLASS.mismatch },
    { label: t("play.kmpLegendWindow"), cls: CHAR_CLASS.window },
    { label: t("play.kmpLegendOut"), cls: CHAR_CLASS.idle },
  ]
  return <LegendRow entries={entries} />
}
