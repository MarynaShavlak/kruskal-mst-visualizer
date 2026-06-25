import { Panel } from "@/algorithms/shared/playback/Panel"
import { LegendRow } from "@/algorithms/shared/playback/LegendRow"
import { KeyedBars } from "@/algorithms/shared/playback/KeyedBars"
import { barRole, type BarRole } from "@/algorithms/insertion-sort/playback/highlight"
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
  return (
    <KeyedBars
      array={array}
      roleAt={(i) => barRole(i, prefixLen, hole, compareAt, shiftAt)}
      classMap={BAR_CLASS}
      hole={hole}
      keyValue={keyValue}
      isActive={(role) => role === "compare" || role === "shift"}
      height={height}
      size={size}
      renderIndex={(i, idxText) => (
        <span className={cn("tabular-nums text-muted-foreground/70", idxText)}>{i}</span>
      )}
    />
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
