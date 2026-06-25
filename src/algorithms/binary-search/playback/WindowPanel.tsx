import { Search } from "lucide-react"
import { Panel } from "@/algorithms/shared/playback/Panel"
import { LegendRow } from "@/algorithms/shared/playback/LegendRow"
import { SortedWindowView } from "@/algorithms/shared/playback/SortedWindow"
import { cellRole, type CellRole } from "@/algorithms/binary-search/playback/highlight"
import { useT } from "@/i18n/use-t"

const CELL_CLASS: Record<CellRole, string> = {
  active: "border-sky-500/70 bg-sky-500/15 text-sky-700 dark:text-sky-300",
  mid: "border-rose-500 bg-rose-500/20 text-rose-700 dark:text-rose-300",
  discarding: "border-red-400/70 bg-red-500/15 text-red-600/80 line-through dark:text-red-300/80",
  found: "border-emerald-500 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
  out: "border-border bg-muted/30 text-muted-foreground/40",
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
 * Спільний каркас — SortedWindowView; тут лише ролі (cellRole) і підписи.
 */
export function WindowView(props: WindowProps) {
  const t = useT()
  return (
    <SortedWindowView
      array={props.array}
      low={props.low}
      high={props.high}
      probe={props.mid}
      roleAt={(i) => cellRole(i, props)}
      classMap={CELL_CLASS}
      lowHighLabel={t("play.binLowHigh")}
      probeSrLabel="mid"
      size={props.size}
    />
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
