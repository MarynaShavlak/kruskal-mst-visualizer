import { Search } from "lucide-react"
import { Panel } from "@/algorithms/shared/playback/Panel"
import { LegendRow } from "@/algorithms/shared/playback/LegendRow"
import { cellRole, type CellRole } from "@/algorithms/binary-search/playback/highlight"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

const CELL_CLASS: Record<CellRole, string> = {
  active: "border-sky-500/70 bg-sky-500/15 text-sky-700 dark:text-sky-300",
  mid: "border-rose-500 bg-rose-500/20 text-rose-700 dark:text-rose-300",
  discarding: "border-red-400/70 bg-red-500/15 text-red-600/80 line-through dark:text-red-300/80",
  found: "border-emerald-500 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
  out: "border-border bg-muted/30 text-muted-foreground/40",
}

/** Одна комірка масиву з роллю-кольором. */
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
        size === "md" ? "min-w-[2.5rem] px-1.5 py-2.5 text-sm" : "min-w-[1.7rem] px-1 py-1.5 text-xs",
        CELL_CLASS[role],
      )}
    >
      {value}
      {role === "found" && (
        <span className="absolute -right-1.5 -top-1.5 inline-flex size-3.5 items-center justify-center rounded-full bg-emerald-500 text-[9px] text-white">
          ✓
        </span>
      )}
    </span>
  )
}

export interface WindowProps {
  readonly array: readonly number[]
  readonly low: number
  readonly high: number
  readonly mid: number | null
  readonly probing: boolean
  readonly discardLo: number | null
  readonly discardHi: number | null
  readonly result: number
  readonly resolved: boolean
  readonly size?: "sm" | "md"
}

/**
 * Сигнатурний образ розбору: відсортований ряд комірок із ВІКНОМ [low..high], що
 * звужується вдвічі. Над `mid` — рожевий курсор ▼; під рядом — дужки `low`/`high`.
 * 🟦 активне вікно · 🌸 mid · 🟥 половина, яку відкидаємо · 🟢 збіг · 🩶 поза вікном.
 * Спільне для плеєра й навчальних віджетів.
 */
export function WindowView({
  array,
  low,
  high,
  mid,
  probing,
  discardLo,
  discardHi,
  result,
  resolved,
  size = "md",
}: WindowProps) {
  const t = useT()
  return (
    <div className="flex flex-wrap items-end justify-center gap-1.5">
      {array.map((v, i) => {
        const role = cellRole(i, { low, high, mid, probing, discardLo, discardHi, result, resolved })
        const isMid = i === mid
        const isLow = i === low && low <= high
        const isHigh = i === high && low <= high
        return (
          <span key={i} className="flex flex-col items-center gap-0.5">
            {/* mid ▼ */}
            <span className={cn("text-[10px] font-medium leading-none text-rose-500", isMid ? "opacity-100" : "opacity-0")}>
              ▼<span className="sr-only">mid</span>
            </span>
            <Cell value={v} role={role} size={size} />
            <span className="text-[10px] tabular-nums text-muted-foreground/60">{i}</span>
            {/* low / high дужки */}
            <span className="h-3 text-[9px] font-semibold leading-none text-sky-600 dark:text-sky-400">
              {isLow && isHigh ? t("play.binLowHigh") : isLow ? "low" : isHigh ? "high" : ""}
            </span>
          </span>
        )
      })}
    </div>
  )
}

/** Панель плеєра: бейдж «шукаємо: x» + WindowView у рамці + легенда. */
export function WindowPanel({
  className,
  target,
  ...view
}: WindowProps & { className?: string; target: number }) {
  const t = useT()
  return (
    <Panel
      title={t("play.binWindowTitle")}
      className={className}
      bodyClassName="flex flex-col gap-3 p-3"
    >
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-rose-400/50 bg-rose-500/10 px-2.5 py-1 text-sm font-medium text-rose-700 dark:text-rose-300">
          <Search className="size-3.5" />
          {t("play.binTargetBadge", { target })}
        </span>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto">
        <WindowView {...view} />
      </div>
      <Legend />
    </Panel>
  )
}

function Legend() {
  const t = useT()
  const entries = [
    { label: t("learn.binLegendActive"), cls: CELL_CLASS.active },
    { label: t("learn.binLegendMid"), cls: CELL_CLASS.mid },
    { label: t("learn.binLegendDiscard"), cls: CELL_CLASS.discarding },
    { label: t("learn.binLegendFound"), cls: CELL_CLASS.found },
    { label: t("learn.binLegendOut"), cls: CELL_CLASS.out },
  ]
  return <LegendRow entries={entries} />
}
