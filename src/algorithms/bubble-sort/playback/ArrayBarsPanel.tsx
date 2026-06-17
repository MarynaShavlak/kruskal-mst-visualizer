import { Panel } from "@/algorithms/shared/playback/Panel"
import { barRole, barHeightPct, type BarRole } from "@/algorithms/bubble-sort/playback/highlight"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

const BAR_CLASS: Record<BarRole, string> = {
  comparing: "bg-amber-400/80 dark:bg-amber-400/70",
  swapped: "bg-rose-500/80 dark:bg-rose-500/70",
  sorted: "bg-emerald-500/75 dark:bg-emerald-500/65",
  idle: "bg-slate-400/60 dark:bg-slate-500/50",
}

export interface ArrayBarsProps {
  readonly array: readonly number[]
  readonly pair: readonly [number, number] | null
  readonly swapped: boolean
  readonly sortedFrom: number
  /** Висота області стовпчиків (px). За замовч. 220. */
  readonly height?: number
}

/**
 * Стовпчиковий вид масиву (без рамки-панелі): висота стовпчика ∝ значенню, колір —
 * за роллю (🟡 порівняння · 🔴 обмін · 🟢 хвіст · ⬜ ще не впорядковано). Над парою,
 * яку щойно обміняли, малюємо стрілку ↔. Використовується і плеєром, і навчальними
 * віджетами.
 */
export function ArrayBars({
  array,
  pair,
  swapped,
  sortedFrom,
  height = 220,
}: ArrayBarsProps) {
  const max = Math.max(1, ...array)
  return (
    <div className="flex items-end justify-center gap-1.5" style={{ height }}>
      {array.map((v, i) => {
        const role = barRole(i, pair, swapped, sortedFrom)
        const isPair = pair !== null && (i === pair[0] || i === pair[1])
        return (
          <div key={i} className="flex h-full min-w-[1.25rem] flex-1 flex-col items-center justify-end gap-1">
            <span
              className={cn(
                "text-[11px] font-medium tabular-nums leading-none",
                isPair ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {v}
            </span>
            <div
              className={cn("w-full rounded-t transition-all", BAR_CLASS[role])}
              style={{ height: `${barHeightPct(v, max)}%` }}
            />
            <span className="text-[10px] tabular-nums text-muted-foreground/70">{i}</span>
          </div>
        )
      })}
    </div>
  )
}

/** Стовпчикова панель плеєра: ArrayBars у рамці + легенда кольорів. */
export function ArrayBarsPanel({
  array,
  pair,
  swapped,
  sortedFrom,
  className,
}: ArrayBarsProps & { className?: string }) {
  const t = useT()
  return (
    <Panel title={t("play.bsArrayTitle", { n: array.length })} className={className} bodyClassName="flex flex-col gap-2 p-3">
      <div className="min-h-0 flex-1">
        <ArrayBars array={array} pair={pair} swapped={swapped} sortedFrom={sortedFrom} height={260} />
      </div>
      <Legend />
    </Panel>
  )
}

function Legend() {
  const t = useT()
  const items: { role: BarRole; label: string }[] = [
    { role: "comparing", label: t("learn.bsLegendComparing") },
    { role: "swapped", label: t("learn.bsLegendSwapped") },
    { role: "sorted", label: t("learn.bsLegendSorted") },
    { role: "idle", label: t("learn.bsLegendUnsorted") },
  ]
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
      {items.map((it) => (
        <span key={it.role} className="inline-flex items-center gap-1">
          <span className={cn("inline-block size-2.5 rounded-sm", BAR_CLASS[it.role])} />
          {it.label}
        </span>
      ))}
    </div>
  )
}
