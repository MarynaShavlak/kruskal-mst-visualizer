import { ArrowDown, ArrowLeftRight } from "lucide-react"
import { Panel } from "@/algorithms/shared/playback/Panel"
import {
  barRole,
  barHeightPct,
  type BarRole,
} from "@/algorithms/selection-sort/playback/highlight"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

const BAR_CLASS: Record<BarRole, string> = {
  prefix: "bg-emerald-500/75 dark:bg-emerald-500/65",
  min: "bg-amber-400/80 dark:bg-amber-400/70",
  swap: "bg-rose-500/80 dark:bg-rose-500/70",
  placed: "bg-sky-500/80 dark:bg-sky-500/70",
  hole: "border-2 border-dashed border-muted-foreground/50 bg-transparent",
  idle: "bg-slate-400/60 dark:bg-slate-500/50",
}

export interface SelectionBarsProps {
  readonly array: readonly number[]
  /** Межа відсортованого префікса (зелена межа ліворуч). */
  readonly sortedTo: number
  /** Індекс «біжучого мінімуму» (бурштиновий) або null. */
  readonly minIdx: number | null
  /** Індекс курсора j, що сканує суфікс (фіолетовий ▲) або null. */
  readonly cursor: number | null
  /** Індекс елемента, що став на місце (синій) або null. */
  readonly placedAt: number | null
  /** Індекс елемента пари обміну / щойно зсунутого (червоний) або null. */
  readonly swapAt: number | null
  /** Індекс «дірки» (пунктир, стабільна версія) або null. */
  readonly hole: number | null
  /** Значення мінімуму «в руці» (плаваючий бурштиновий, стабільна версія) або null. */
  readonly keyValue: number | null
  /** Висота області стовпчиків (px). За замовч. 220. */
  readonly height?: number
  /** Розмір тексту значень/індексів: "md" (плеєр) або "lg" (навчання). За замовч. "md". */
  readonly size?: "md" | "lg"
}

/**
 * Стовпчиковий вид масиву для сортування прямим вибором (без рамки-панелі).
 * Кольори за легендою README: 🟢 зелений — відсортований префікс, 🟡 бурштиновий —
 * «біжучий мінімум», 🟣 ▲ під стовпчиком — курсор `j`, що сканує суфікс, 🔴 червоний —
 * пара обміну / щойно зсунутий, 🔵 синій — елемент, що став на місце, ⋯ пунктир —
 * «дірка», ⬜ сіро-синій — несортований суфікс. У стабільній версії над «діркою»
 * висить вийнятий мінімум «у руці» (зі стрілкою ↓). Використовується і плеєром, і
 * навчальними віджетами.
 */
export function SelectionBars({
  array,
  sortedTo,
  minIdx,
  cursor,
  placedAt,
  swapAt,
  hole,
  keyValue,
  height = 220,
  size = "md",
}: SelectionBarsProps) {
  const max = Math.max(1, ...array, keyValue ?? 0)
  const valueText = size === "lg" ? "text-sm" : "text-[11px]"
  const idxText = size === "lg" ? "text-xs" : "text-[10px]"
  // Зарезервована зона зверху під плаваючий мінімум / стрілку обміну (≈ 40%).
  const keyZone = Math.round(height * 0.4)
  // Стандартний обмін: обидва кінці задані → показуємо ↔ над парою.
  const showSwapArrow = placedAt !== null && swapAt !== null
  return (
    <div className="flex items-end justify-center gap-1.5" style={{ height: height + keyZone + 16 }}>
      {array.map((v, i) => {
        const role = barRole(i, { sortedTo, minIdx, placedAt, swapAt, hole })
        const isHole = role === "hole"
        const active = role === "swap" || role === "placed" || role === "min"
        const showKey = hole !== null && i === hole && keyValue !== null
        const isSwapEnd = showSwapArrow && (i === placedAt || i === swapAt)
        const isCursor = cursor !== null && i === cursor
        return (
          <div
            key={i}
            className="flex min-w-[1.5rem] flex-1 flex-col items-center justify-end gap-1"
            style={{ height: height + keyZone + 16 }}
          >
            {/* Зона зверху: вийнятий мінімум «у руці» або стрілка обміну ↔. */}
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
              {!showKey && isSwapEnd && (
                <ArrowLeftRight className="size-4 text-rose-600 dark:text-rose-400" />
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
            {/* Курсор j: фіолетовий ▲ під стовпчиком. */}
            <span
              className={cn(
                "leading-none text-violet-600 dark:text-violet-400",
                idxText,
                isCursor ? "opacity-100" : "opacity-0",
              )}
            >
              ▲
            </span>
          </div>
        )
      })}
    </div>
  )
}

/** Стовпчикова панель плеєра: SelectionBars у рамці + легенда кольорів. */
export function SelectionBarsPanel({
  className,
  ...bars
}: SelectionBarsProps & { className?: string }) {
  const t = useT()
  return (
    <Panel
      title={t("play.ssArrayTitle", { n: bars.array.length })}
      className={className}
      bodyClassName="flex flex-col gap-2 p-3"
    >
      <div className="min-h-0 flex-1">
        <SelectionBars {...bars} height={220} />
      </div>
      <Legend />
    </Panel>
  )
}

function Legend() {
  const t = useT()
  const items: { role: BarRole; label: string }[] = [
    { role: "prefix", label: t("learn.ssLegendPrefix") },
    { role: "min", label: t("learn.ssLegendMin") },
    { role: "swap", label: t("learn.ssLegendSwap") },
    { role: "placed", label: t("learn.ssLegendPlaced") },
    { role: "idle", label: t("learn.ssLegendUnsorted") },
  ]
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
      {items.map((it) => (
        <span key={it.role} className="inline-flex items-center gap-1">
          <span className={cn("inline-block size-2.5 rounded-sm", BAR_CLASS[it.role])} />
          {it.label}
        </span>
      ))}
      <span className="inline-flex items-center gap-1">
        <span className="text-violet-600 dark:text-violet-400">▲</span>
        {t("learn.ssLegendCursor")}
      </span>
    </div>
  )
}
