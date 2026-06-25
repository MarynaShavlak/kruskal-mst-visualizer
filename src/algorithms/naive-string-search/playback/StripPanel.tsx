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
  type NssCellState,
} from "@/algorithms/naive-string-search/playback/highlight"
import { useT } from "@/i18n/use-t"

export interface StripProps {
  readonly text: string
  readonly pattern: string
  readonly offset: number
  readonly matched: number
  readonly mismatchJ: number | null
  readonly size?: "sm" | "md"
}

/** Стрічка «текст / шаблон» поточного вирівнювання (спільний StringStrip + ролі наївного). */
export function StripView({ text, pattern, offset, matched, mismatchJ, size = "md" }: StripProps) {
  const t = useT()
  const state: NssCellState = { offset, matched, mismatchJ, patternLen: pattern.length }
  return (
    <StringStrip
      text={text}
      pattern={pattern}
      offset={offset}
      textRole={(idx) => textRole(idx, state)}
      patternRole={(j) => patternRole(j, state)}
      pointer={pointerIndex(state)}
      textLabel={t("play.strText")}
      patternLabel={t("play.strPattern")}
      size={size}
    />
  )
}

/** Панель плеєра: бейдж «шукаємо: pattern» + стрічка + легенда. */
export function StripPanel({
  className,
  ...view
}: StripProps & { className?: string }) {
  const t = useT()
  return (
    <Panel
      title={t("play.nssStripTitle")}
      className={className}
      bodyClassName="flex flex-col gap-3 p-3"
    >
      <div>
        <SearchTargetBadge>{t("play.strTargetBadge", { pattern: view.pattern || "∅" })}</SearchTargetBadge>
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
    { label: t("learn.nssLegendMatch"), cls: CHAR_CLASS.match },
    { label: t("learn.nssLegendMismatch"), cls: CHAR_CLASS.mismatch },
    { label: t("learn.nssLegendWindow"), cls: CHAR_CLASS.window },
    { label: t("learn.nssLegendOut"), cls: CHAR_CLASS.idle },
  ]
  return <LegendRow entries={entries} />
}
