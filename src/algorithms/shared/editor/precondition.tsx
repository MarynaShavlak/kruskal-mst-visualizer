import { AlertTriangle, Check } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

// Спільні презентаційні примітиви ПЕРЕДУМОВИ коректності. Раніше байт-ідентична
// emerald/amber-стрічка «масив відсортований ✓ / ще ні» дублювалася у трьох
// пошукових панелях (BinarySummaryPanel / IxsSummaryPanel / IpSummaryPanel).
// Тут вона винесена як `PreconditionStrip`; `PreconditionCard` — крупніша картка
// для шапки розділу (заголовок + складність + статус + нота «не блокує»).
// Чисто презентаційні: приймають `ok:boolean` + готові двомовні тексти, без
// прив'язки до конкретного стору чи алгоритму.

/**
 * Компактна стрічка-індикатор передумови (emerald коли виконана / amber коли ні).
 * Дедуплікат локальних `<p>`-стрічок у *SummaryPanel редактора.
 */
export function PreconditionStrip({
  ok,
  okText,
  badText,
  className,
}: {
  ok: boolean
  okText: ReactNode
  badText: ReactNode
  className?: string
}) {
  return (
    <p
      className={cn(
        "flex items-start gap-1.5 rounded-md px-2 py-1.5 text-xs",
        ok
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "bg-amber-500/10 text-amber-700 dark:text-amber-300",
        className,
      )}
    >
      {ok ? (
        <Check className="mt-0.5 size-3.5 shrink-0" />
      ) : (
        <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
      )}
      {ok ? okText : badText}
    </p>
  )
}

/**
 * Картка передумов і складності для ШАПКИ розділу (видна під час програвання —
 * «момент дії»). Показує: заголовок + типову/найгіршу складність + живий статус
 * передумови (ОК / попередження) + нотатку, що детектор лише інформує, а не блокує.
 */
export function PreconditionCard({
  title,
  typical,
  worst,
  typicalLabel,
  worstLabel,
  ok,
  okText,
  badText,
  note,
  className,
}: {
  title: string
  typical: string
  worst: string
  typicalLabel: string
  worstLabel: string
  ok: boolean
  okText: ReactNode
  badText: ReactNode
  note: string
  className?: string
}) {
  return (
    <section
      className={cn(
        "rounded-lg border bg-card p-3 text-sm",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
        <span className="font-medium">{title}</span>
        <span className="flex items-center gap-3 text-xs">
          <span className="flex items-baseline gap-1">
            <span className="text-muted-foreground">{typicalLabel}</span>
            <span className="font-mono font-medium tabular-nums">{typical}</span>
          </span>
          <span className="flex items-baseline gap-1">
            <span className="text-muted-foreground">{worstLabel}</span>
            <span className="font-mono font-medium tabular-nums">{worst}</span>
          </span>
        </span>
      </div>

      <PreconditionStrip
        ok={ok}
        okText={okText}
        badText={badText}
        className="mt-2.5"
      />

      <p className="mt-2 text-xs text-muted-foreground">{note}</p>
    </section>
  )
}
