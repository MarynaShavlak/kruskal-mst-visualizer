import { Panel } from "@/algorithms/shared/playback/Panel"
import { LegendRow } from "@/algorithms/shared/playback/LegendRow"
import { KeyedBars } from "@/algorithms/shared/playback/KeyedBars"
import {
  shellBarRole,
  inCurrentGroup,
  type ShellBarRole,
} from "@/algorithms/shell-sort/playback/highlight"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

const BAR_CLASS: Record<ShellBarRole, string> = {
  sorted: "bg-emerald-500/75 dark:bg-emerald-500/65",
  insert: "bg-emerald-500/75 dark:bg-emerald-500/65",
  compare: "bg-amber-400/80 dark:bg-amber-400/70",
  shift: "bg-rose-500/80 dark:bg-rose-500/70",
  hole: "border-2 border-dashed border-muted-foreground/50 bg-transparent",
  idle: "bg-slate-400/60 dark:bg-slate-500/50",
}

export interface ShellBarsProps {
  readonly array: readonly number[]
  /** Поточний проміжок (для підсвітки підпослідовності) або null. */
  readonly gap: number | null
  /** Залишок i % gap — поточна підпослідовність; -1 якщо не підсвічуємо. */
  readonly groupResidue: number
  readonly hole: number | null
  /** temp «у руці» (плаваючий бурштиновий стовпчик) або null. */
  readonly keyValue: number | null
  readonly compareAt: number | null
  readonly shiftAt: number | null
  readonly insertAt: number | null
  readonly sortedAll: boolean
  readonly height?: number
  /** Розмір тексту значень/індексів: "md" (плеєр) або "lg" (навчання). За замовч. "md". */
  readonly size?: "md" | "lg"
}

/**
 * Стовпчиковий вид масиву для сортування Шелла. Над «діркою» висить бурштиновий
 * стовпчик `temp` «у руці» (зі стрілкою ↓); 🟢 — вставлений/відсортований, 🟡 —
 * arr[j−gap], що порівнюється, 🔴 — щойно gap-зсунутий, ⋯ — «дірка», ⬜ — решта.
 * Індекси ПОТОЧНОЇ підпослідовності (крок gap) обведено фіолетовим — видно, що
 * сортуються елементи «через крок». Спільне для плеєра й навчальних віджетів.
 */
export function ShellBars({
  array,
  gap,
  groupResidue,
  hole,
  keyValue,
  compareAt,
  shiftAt,
  insertAt,
  sortedAll,
  height = 220,
  size = "md",
}: ShellBarsProps) {
  return (
    <KeyedBars
      array={array}
      roleAt={(i) => shellBarRole(i, { hole, compareAt, shiftAt, insertAt, sortedAll })}
      classMap={BAR_CLASS}
      hole={hole}
      keyValue={keyValue}
      isActive={(role) => role === "compare" || role === "shift"}
      height={height}
      size={size}
      renderIndex={(i, idxText) => (
        // Індекс: підпослідовність поточного gap — фіолетовий чип.
        <span
          className={cn(
            "rounded px-1 tabular-nums",
            idxText,
            inCurrentGroup(i, gap, groupResidue)
              ? "bg-violet-500/20 font-semibold text-violet-700 dark:text-violet-300 ring-1 ring-violet-400/50"
              : "text-muted-foreground/70",
          )}
        >
          {i}
        </span>
      )}
    />
  )
}

/** Стовпчикова панель плеєра: ShellBars у рамці + рядок gap + легенда. */
export function ShellBarsPanel({
  className,
  ...bars
}: ShellBarsProps & { className?: string }) {
  const t = useT()
  return (
    <Panel
      title={t("play.arrArrayTitle", { n: bars.array.length })}
      className={className}
      bodyClassName="flex flex-col gap-2 p-3"
    >
      <div className="text-xs text-muted-foreground">
        {bars.gap != null ? (
          <span>
            {t("play.shGapLabel")}{" "}
            <b className="text-violet-600 dark:text-violet-400 tabular-nums">{bars.gap}</b>
            {bars.groupResidue >= 0 && (
              <span className="ml-2">
                {t("play.shGroupLabel", { residue: bars.groupResidue })}
              </span>
            )}
          </span>
        ) : (
          <span>{t("play.shNoGap")}</span>
        )}
      </div>
      <div className="min-h-0 flex-1">
        <ShellBars {...bars} height={230} />
      </div>
      <Legend />
    </Panel>
  )
}

function Legend() {
  const t = useT()
  const entries = [
    { label: t("learn.shLegendSorted"), cls: BAR_CLASS.sorted },
    { label: t("learn.shLegendCompare"), cls: BAR_CLASS.compare },
    { label: t("learn.shLegendShift"), cls: BAR_CLASS.shift },
    { label: t("learn.shLegendIdle"), cls: BAR_CLASS.idle },
  ]
  return (
    <LegendRow entries={entries} border={false}>
      <span className="inline-flex items-center gap-1">
        <span className="inline-block size-2.5 rounded-sm bg-amber-400/80" />
        {t("learn.shLegendTemp")}
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="inline-block size-2.5 rounded-sm bg-violet-500/30 ring-1 ring-violet-400/50" />
        {t("learn.shLegendGroup")}
      </span>
    </LegendRow>
  )
}
