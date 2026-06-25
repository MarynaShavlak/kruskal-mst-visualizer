import { ArrowDown } from "lucide-react"
import { Panel } from "@/algorithms/shared/playback/Panel"
import { LegendRow } from "@/algorithms/shared/playback/LegendRow"
import { barRole, barHeightPct, type BarRole } from "@/algorithms/insertion-sort/playback/highlight"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

const BAR_CLASS: Record<BarRole, string> = {
  prefix: "bg-emerald-500/75 dark:bg-emerald-500/65",
  compare: "bg-amber-400/80 dark:bg-amber-400/70",
  shift: "bg-rose-500/80 dark:bg-rose-500/70",
  hole: "border-2 border-dashed border-muted-foreground/50 bg-transparent",
  idle: "bg-slate-400/60 dark:bg-slate-500/50",
}

export interface InsertionBarsProps {
  readonly array: readonly number[]
  /** Довжина відсортованого префікса (зелена межа ліворуч). */
  readonly prefixLen: number
  /** Індекс «дірки» (пунктир) або null. */
  readonly hole: number | null
  /** key «в руці» (плаваючий бурштиновий стовпчик) або null. */
  readonly keyValue: number | null
  /** Індекс елемента, який зараз порівнюють (бурштиновий) або null. */
  readonly compareAt: number | null
  /** Індекс елемента, який щойно зсунули (червоний) або null. */
  readonly shiftAt: number | null
  /** Висота області стовпчиків (px). За замовч. 220. */
  readonly height?: number
  /** Розмір тексту значень/індексів: "md" (плеєр) або "lg" (навчання). За замовч. "md". */
  readonly size?: "md" | "lg"
}

/**
 * Стовпчиковий вид масиву для сортування вставками (без рамки-панелі). Над «діркою»
 * висить бурштиновий стовпчик `key` «у руці» (зі стрілкою ↓); у масиві: 🟢 зелений —
 * відсортований префікс, 🟡 бурштиновий — елемент, що порівнюється, 🔴 червоний —
 * щойно зсунутий, ⋯ пунктир — «дірка», ⬜ сіро-синій — несортований суфікс.
 * Використовується і плеєром, і навчальними віджетами.
 */
export function InsertionBars({
  array,
  prefixLen,
  hole,
  keyValue,
  compareAt,
  shiftAt,
  height = 220,
  size = "md",
}: InsertionBarsProps) {
  const max = Math.max(1, ...array, keyValue ?? 0)
  const valueText = size === "lg" ? "text-sm" : "text-[11px]"
  const idxText = size === "lg" ? "text-xs" : "text-[10px]"
  // Зарезервована зона зверху під плаваючий key (≈ 40% висоти стовпчиків).
  const keyZone = Math.round(height * 0.4)
  return (
    <div className="flex items-end justify-center gap-1.5" style={{ height: height + keyZone }}>
      {array.map((v, i) => {
        const role = barRole(i, prefixLen, hole, compareAt, shiftAt)
        const isHole = role === "hole"
        const active = role === "compare" || role === "shift"
        const showKey = hole !== null && i === hole && keyValue !== null
        return (
          <div
            key={i}
            className="flex min-w-[1.5rem] flex-1 flex-col items-center justify-end gap-1"
            style={{ height: height + keyZone }}
          >
            {/* Зона під key «у руці» (висить над «діркою»). */}
            <div className="flex w-full flex-col items-center justify-end gap-0.5" style={{ height: keyZone }}>
              {showKey && (
                <>
                  <span className={cn("font-semibold tabular-nums leading-none text-amber-700 dark:text-amber-300", valueText)}>
                    {keyValue}
                  </span>
                  <div
                    className="w-full rounded-t bg-amber-400/80 dark:bg-amber-400/70"
                    style={{ height: `${Math.max(8, ((keyValue ?? 0) / max) * (keyZone - 28))}px` }}
                  />
                  <ArrowDown className="size-3 text-amber-600 dark:text-amber-400" />
                </>
              )}
            </div>
            {/* Сам стовпчик / порожня «дірка». */}
            <div className="flex w-full flex-col items-center justify-end gap-1" style={{ height }}>
              <span
                className={cn(
                  "font-medium tabular-nums leading-none",
                  valueText,
                  isHole && "opacity-0",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {v}
              </span>
              <div
                className={cn("w-full rounded-t transition-all", BAR_CLASS[role])}
                style={{ height: isHole ? "100%" : `${barHeightPct(v, max)}%` }}
              />
            </div>
            <span className={cn("tabular-nums text-muted-foreground/70", idxText)}>{i}</span>
          </div>
        )
      })}
    </div>
  )
}

/** Стовпчикова панель плеєра: InsertionBars у рамці + легенда кольорів. */
export function InsertionBarsPanel({
  className,
  ...bars
}: InsertionBarsProps & { className?: string }) {
  const t = useT()
  return (
    <Panel
      title={t("play.isArrayTitle", { n: bars.array.length })}
      className={className}
      bodyClassName="flex flex-col gap-2 p-3"
    >
      <div className="min-h-0 flex-1">
        <InsertionBars {...bars} height={230} />
      </div>
      <Legend />
    </Panel>
  )
}

function Legend() {
  const t = useT()
  const entries = [
    { label: t("learn.isLegendPrefix"), cls: BAR_CLASS.prefix },
    { label: t("learn.isLegendCompare"), cls: BAR_CLASS.compare },
    { label: t("learn.isLegendShift"), cls: BAR_CLASS.shift },
    { label: t("learn.isLegendUnsorted"), cls: BAR_CLASS.idle },
  ]
  return (
    <LegendRow entries={entries} border={false}>
      <span className="inline-flex items-center gap-1">
        <span className="inline-block size-2.5 rounded-sm bg-amber-400/80" />
        {t("learn.isLegendKey")}
      </span>
    </LegendRow>
  )
}
