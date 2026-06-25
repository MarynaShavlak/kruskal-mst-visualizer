import { ArrowLeftRight } from "lucide-react"
import { Panel } from "@/algorithms/shared/playback/Panel"
import { LegendRow } from "@/algorithms/shared/playback/LegendRow"
import { KeyedBars } from "@/algorithms/shared/playback/KeyedBars"
import { barRole, type BarRole } from "@/algorithms/selection-sort/playback/highlight"
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
  // Стандартний обмін: обидва кінці задані → показуємо ↔ над парою.
  const showSwapArrow = placedAt !== null && swapAt !== null
  return (
    <KeyedBars
      array={array}
      roleAt={(i) => barRole(i, { sortedTo, minIdx, placedAt, swapAt, hole })}
      classMap={BAR_CLASS}
      hole={hole}
      keyValue={keyValue}
      isActive={(role) => role === "swap" || role === "placed" || role === "min"}
      height={height}
      size={size}
      extraBottom={16}
      keyZoneOverlay={(i) =>
        showSwapArrow && (i === placedAt || i === swapAt) ? (
          <ArrowLeftRight className="size-4 text-rose-600 dark:text-rose-400" />
        ) : null
      }
      renderIndex={(i, idxText) => (
        <>
          <span className={cn("tabular-nums text-muted-foreground/70", idxText)}>{i}</span>
          {/* Курсор j: фіолетовий ▲ під стовпчиком. */}
          <span
            className={cn(
              "leading-none text-violet-600 dark:text-violet-400",
              idxText,
              cursor !== null && i === cursor ? "opacity-100" : "opacity-0",
            )}
          >
            ▲
          </span>
        </>
      )}
    />
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
      title={t("play.arrArrayTitle", { n: bars.array.length })}
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
  const entries = [
    { label: t("learn.ssLegendPrefix"), cls: BAR_CLASS.prefix },
    { label: t("learn.ssLegendMin"), cls: BAR_CLASS.min },
    { label: t("learn.ssLegendSwap"), cls: BAR_CLASS.swap },
    { label: t("learn.ssLegendPlaced"), cls: BAR_CLASS.placed },
    { label: t("learn.ssLegendUnsorted"), cls: BAR_CLASS.idle },
  ]
  return (
    <LegendRow entries={entries} border={false}>
      <span className="inline-flex items-center gap-1">
        <span className="text-violet-600 dark:text-violet-400">▲</span>
        {t("learn.ssLegendCursor")}
      </span>
    </LegendRow>
  )
}
