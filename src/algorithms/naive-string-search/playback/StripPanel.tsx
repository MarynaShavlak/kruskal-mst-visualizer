import { Search } from "lucide-react"
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
  type NssCellState,
} from "@/algorithms/naive-string-search/playback/highlight"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

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
      textLabel={t("play.nssText")}
      patternLabel={t("play.nssPattern")}
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
        <span className="inline-flex items-center gap-1.5 rounded-md border border-rose-400/50 bg-rose-500/10 px-2.5 py-1 text-sm font-medium text-rose-700 dark:text-rose-300">
          <Search className="size-3.5" />
          {t("play.nssTargetBadge", { pattern: view.pattern || "∅" })}
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
  const items: { role: CharRole; label: string }[] = [
    { role: "match", label: t("learn.nssLegendMatch") },
    { role: "mismatch", label: t("learn.nssLegendMismatch") },
    { role: "window", label: t("learn.nssLegendWindow") },
    { role: "idle", label: t("learn.nssLegendOut") },
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
