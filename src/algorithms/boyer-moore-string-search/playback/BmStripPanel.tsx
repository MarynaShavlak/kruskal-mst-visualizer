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
  type BmCellState,
} from "@/algorithms/boyer-moore-string-search/playback/highlight"
import { useT } from "@/i18n/use-t"

export interface StripProps {
  readonly text: string
  readonly pattern: string
  readonly offset: number
  readonly j: number | null
  readonly matchedSuffix: number
  readonly mismatch: boolean
  readonly full: boolean
  readonly skippedNow: readonly number[]
  readonly size?: "sm" | "md"
}

function toState(p: StripProps): BmCellState {
  return {
    offset: p.offset,
    j: p.j,
    matchedSuffix: p.matchedSuffix,
    mismatch: p.mismatch,
    full: p.full,
    patternLen: p.pattern.length,
    skipped: new Set(p.skippedNow),
  }
}

/** Стрічка «текст / шаблон» поточного вікна (спільний StringStrip + ролі Боєра-Мура). */
export function StripView(props: StripProps) {
  const t = useT()
  const state = toState(props)
  return (
    <StringStrip
      text={props.text}
      pattern={props.pattern}
      offset={props.offset}
      textRole={(idx) => textRole(idx, state)}
      patternRole={(j) => patternRole(j, state)}
      pointer={pointerIndex(state)}
      textLabel={t("play.bmText")}
      patternLabel={t("play.bmPattern")}
      size={props.size ?? "md"}
    />
  )
}

/** Панель плеєра ФАЗИ 2: бейдж «шукаємо: pattern» + стрічка (справа наліво) + легенда. */
export function BmStripPanel({
  className,
  ...view
}: StripProps & { className?: string }) {
  const t = useT()
  return (
    <Panel
      title={t("play.bmStripTitle")}
      className={className}
      bodyClassName="flex flex-col gap-3 p-3"
    >
      <div className="flex flex-wrap items-center gap-2">
        <SearchTargetBadge>{t("play.bmTargetBadge", { pattern: view.pattern || "∅" })}</SearchTargetBadge>
        <span className="text-xs text-muted-foreground">{t("play.bmScanHint")}</span>
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
    { label: t("learn.bmLegendMatch"), cls: CHAR_CLASS.match },
    { label: t("learn.bmLegendMismatch"), cls: CHAR_CLASS.mismatch },
    { label: t("learn.bmLegendWindow"), cls: CHAR_CLASS.window },
    { label: t("learn.bmLegendSkipped"), cls: CHAR_CLASS.skipped },
    { label: t("learn.bmLegendOut"), cls: CHAR_CLASS.idle },
  ]
  return <LegendRow entries={entries} />
}
