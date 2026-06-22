import { Table2 } from "lucide-react"
import { Panel } from "@/algorithms/shared/playback/Panel"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

export interface ShiftTableViewProps {
  readonly pattern: string
  /** Знімок словника зсувів на цей момент. */
  readonly table: Record<string, number>
  /** Активний символ запису (entry/default) або null. */
  readonly activeChar: string | null
  /** Активний індекс у шаблоні (entry/default) або -1. */
  readonly activeIndex: number
  /** Чи поточний запис — ПЕРЕЗАПИС уже наявного ключа. */
  readonly overwrite: boolean
  /** Попереднє значення при перезаписі (або null). */
  readonly prevShift: number | null
  readonly size?: "sm" | "md"
}

/** Видимий символ: пробіл → «␣». */
function glyph(ch: string): string {
  return ch === " " ? "␣" : ch
}

/**
 * СИГНАТУРНИЙ образ ФАЗИ 1 — таблиця поганого символу, що будується: верхній ряд — символи
 * шаблону (активний індекс акцентовано), нижній — словник «символ → зсув», де щойно
 * записаний/перезаписаний символ виділено (помаранчевий — перезапис).
 */
export function ShiftTableView({
  pattern,
  table,
  activeChar,
  activeIndex,
  overwrite,
  prevShift,
  size = "md",
}: ShiftTableViewProps) {
  const t = useT()
  const m = pattern.length
  const cellSm = size === "md" ? "h-9 w-8 text-sm" : "h-7 w-6 text-xs"
  const entries = Object.entries(table)

  return (
    <span className="inline-flex flex-col gap-3">
      {/* Ряд символів шаблону. */}
      <span className="inline-flex flex-col gap-1">
        <span className="text-[10px] font-medium text-muted-foreground">{t("play.bmPatternRow")}</span>
        <span className="inline-flex items-start gap-0.5">
          {Array.from(pattern).map((ch, p) => {
            const isActive = p === activeIndex
            const isLast = p === m - 1
            return (
              <span key={p} className="inline-flex shrink-0 flex-col items-center gap-0.5">
                <span
                  className={cn(
                    "inline-flex items-center justify-center rounded border-2 font-mono tabular-nums",
                    cellSm,
                    isActive
                      ? "border-amber-500 bg-amber-500/25 text-amber-700 dark:text-amber-300"
                      : p < activeIndex || (activeIndex < 0 && entries.length > 0)
                        ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : "border-border bg-muted/30 text-muted-foreground/70",
                    isLast && "ring-1 ring-violet-400/50",
                  )}
                >
                  {glyph(ch)}
                </span>
                <span className="text-[8px] tabular-nums leading-none text-muted-foreground/50">{p}</span>
              </span>
            )
          })}
        </span>
      </span>

      {/* Словник «символ → зсув». */}
      <span className="inline-flex flex-col gap-1">
        <span className="text-[10px] font-medium text-muted-foreground">{t("play.bmTableRow")}</span>
        {entries.length === 0 ? (
          <span className="text-xs text-muted-foreground">{t("play.bmTableEmpty")}</span>
        ) : (
          <span className="inline-flex flex-wrap gap-1.5">
            {entries.map(([ch, shift]) => {
              const isActive = activeChar != null && ch === activeChar
              return (
                <span
                  key={ch}
                  className={cn(
                    "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-xs",
                    isActive && overwrite
                      ? "border-amber-500 bg-amber-500/20 text-amber-700 dark:text-amber-300"
                      : isActive
                        ? "border-emerald-500 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                        : "border-violet-400/50 bg-violet-500/10 text-violet-700 dark:text-violet-300",
                  )}
                >
                  <b>{glyph(ch)}</b>
                  <span className="opacity-60">→</span>
                  <span className="tabular-nums">
                    {isActive && overwrite && prevShift != null ? (
                      <>
                        <span className="text-muted-foreground/60 line-through">{prevShift}</span>{" "}
                        {shift}
                      </>
                    ) : (
                      shift
                    )}
                  </span>
                </span>
              )
            })}
          </span>
        )}
      </span>
    </span>
  )
}

/** Панель плеєра ФАЗИ 1: бейдж «передобробка» + таблиця, що будується. */
export function ShiftTablePanel({
  className,
  ...view
}: ShiftTableViewProps & { className?: string }) {
  const t = useT()
  return (
    <Panel
      title={t("play.bmTableTitle")}
      className={className}
      bodyClassName="flex flex-col gap-3 p-3"
    >
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-violet-400/50 bg-violet-500/10 px-2.5 py-1 text-sm font-medium text-violet-700 dark:text-violet-300">
          <Table2 className="size-3.5" />
          {t("play.bmTableBadge", { pattern: view.pattern || "∅" })}
        </span>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto">
        <ShiftTableView {...view} />
      </div>
    </Panel>
  )
}
