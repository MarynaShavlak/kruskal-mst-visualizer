import { AlertTriangle, Check } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

// Спільні примітиви панелей-підсумків редактора (*SummaryPanel). Раніше дублювалися
// як локальні Row / індикатор «відсортовано» / бурштинове попередження у ~11 файлах.
// Поріг «масив завеликий» (HEAVY_SIZE) НЕ спільний — він свій у кожного алгоритму
// (різна вартість кадрів), тож HeavyWarning приймає готовий прапорець `show`.

/** Картка-обгортка панелі-підсумку. */
export function SummaryCard({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return <div className={cn("rounded-lg border bg-card p-3 text-sm", className)}>{children}</div>
}

/** Рядок «підпис → значення» у сітці <dl> (`mono` — моноширинне число). */
export function SummaryRow({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("text-right font-medium tabular-nums", mono && "font-mono")}>{value}</dd>
    </>
  )
}

/** Індикатор «масив відсортований ✓ / ще ні» (зелений при `sorted`). */
export function SortedIndicator({
  sorted,
  yes,
  no,
}: {
  sorted: boolean
  yes: string
  no: string
}) {
  return (
    <p
      className={cn(
        "mt-3 flex items-center gap-1.5 text-xs",
        sorted ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground",
      )}
    >
      {sorted && <Check className="size-3.5 shrink-0" />}
      {sorted ? yes : no}
    </p>
  )
}

/** Бурштинове попередження «масив завеликий для плавного плеєра» (рендериться лише коли `show`). */
export function HeavyWarning({ show, text }: { show: boolean; text: string }) {
  if (!show) return null
  return (
    <p className="mt-2 flex items-start gap-1.5 rounded-md bg-amber-500/10 px-2 py-1.5 text-xs text-amber-700 dark:text-amber-300">
      <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
      {text}
    </p>
  )
}
