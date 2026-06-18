import { ArrowDown, Check, Search, X } from "lucide-react"
import { Panel } from "@/algorithms/shared/playback/Panel"
import { cellRole, type CellRole } from "@/algorithms/linear-search/playback/highlight"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

const CELL_CLASS: Record<CellRole, string> = {
  checking: "border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300",
  match: "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  rejected: "border-border bg-muted/40 text-muted-foreground/50",
  pending: "border-border bg-card text-foreground/80",
}

/** Одна комірка масиву з роллю-кольором (✓ збіг · ✗ відкинуто). */
export function Cell({
  value,
  role,
  size = "md",
}: {
  value: number
  role: CellRole
  size?: "sm" | "md"
}) {
  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center rounded-md border-2 font-mono tabular-nums transition-colors",
        size === "md" ? "min-w-[2.5rem] px-2 py-2.5 text-sm" : "min-w-[1.9rem] px-1 py-1.5 text-xs",
        CELL_CLASS[role],
      )}
    >
      {value}
      {role === "match" && (
        <Check className="absolute -right-1.5 -top-1.5 size-3.5 rounded-full bg-emerald-500 p-0.5 text-white" />
      )}
      {role === "rejected" && (
        <X className="absolute -right-1 -top-1 size-3 text-muted-foreground/50" />
      )}
    </span>
  )
}

export interface CellsProps {
  readonly array: readonly number[]
  readonly cursor: number | null
  readonly checking: boolean
  readonly matches: readonly number[]
  readonly resolvedTo: number
  readonly size?: "sm" | "md"
}

/**
 * Сигнатурний образ розбору: нерухомий ряд комірок із курсором-бігунцем ▼ над
 * коміркою, яку перевіряємо ЗАРАЗ. 🌸 перевіряємо · 🟢 знайдено · 🩶 відкинуто ·
 * ⬜ ще не перевіряли. Спільне для плеєра й навчальних віджетів.
 */
export function CellsView({ array, cursor, checking, matches, resolvedTo, size = "md" }: CellsProps) {
  return (
    <div className="flex flex-wrap items-end justify-center gap-1.5">
      {array.map((v, i) => {
        const role = cellRole(i, { cursor, checking, matches, resolvedTo })
        const isChecking = role === "checking"
        return (
          <span key={i} className="flex flex-col items-center gap-0.5">
            <ArrowDown
              className={cn(
                "size-3.5 text-rose-500 transition-opacity",
                isChecking ? "opacity-100" : "opacity-0",
              )}
            />
            <Cell value={v} role={role} size={size} />
            <span className="text-[10px] tabular-nums text-muted-foreground/60">{i}</span>
          </span>
        )
      })}
    </div>
  )
}

/** Панель плеєра: бейдж «шукаємо: x» + CellsView у рамці + легенда. */
export function ScanPanel({
  className,
  target,
  ...view
}: CellsProps & { className?: string; target: number }) {
  const t = useT()
  return (
    <Panel
      title={t("play.lsScanTitle")}
      className={className}
      bodyClassName="flex flex-col gap-3 p-3"
    >
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-rose-400/50 bg-rose-500/10 px-2.5 py-1 text-sm font-medium text-rose-700 dark:text-rose-300">
          <Search className="size-3.5" />
          {t("play.lsTargetBadge", { target })}
        </span>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto">
        <CellsView {...view} />
      </div>
      <Legend />
    </Panel>
  )
}

function Legend() {
  const t = useT()
  const items: { role: CellRole; label: string }[] = [
    { role: "checking", label: t("learn.lsLegendChecking") },
    { role: "match", label: t("learn.lsLegendMatch") },
    { role: "rejected", label: t("learn.lsLegendRejected") },
    { role: "pending", label: t("learn.lsLegendPending") },
  ]
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
      {items.map((it) => (
        <span key={it.role} className="inline-flex items-center gap-1">
          <span className={cn("inline-block size-2.5 rounded-sm border", CELL_CLASS[it.role])} />
          {it.label}
        </span>
      ))}
    </div>
  )
}
