import { Panel } from "@/algorithms/shared/playback/Panel"
import { LegendRow } from "@/algorithms/shared/playback/LegendRow"
import { SearchTargetBadge } from "@/algorithms/shared/playback/SearchTargetBadge"
import {
  indexRole,
  cellRole,
  type IndexRole,
  type CellRole,
  type CellPhase,
} from "@/algorithms/indexed-sequential-search/playback/highlight"
import type { IndexEntry } from "@/lib/indexedSequentialSearch"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

const INDEX_CLASS: Record<IndexRole, string> = {
  probe: "border-rose-500 bg-rose-500/20 text-rose-700 dark:text-rose-300",
  window: "border-sky-500/70 bg-sky-500/15 text-sky-700 dark:text-sky-300",
  discarding: "border-red-400/70 bg-red-500/15 text-red-600/80 line-through dark:text-red-300/80",
  found: "border-emerald-500 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
  boundary: "border-sky-500/60 bg-sky-500/5 text-sky-700 dark:text-sky-300",
  out: "border-border bg-muted/30 text-muted-foreground/40",
}

const CELL_CLASS: Record<CellRole, string> = {
  idle: "border-border bg-card text-foreground",
  block: "border-sky-500/70 bg-sky-500/15 text-sky-700 dark:text-sky-300",
  cursor: "border-rose-500 bg-rose-500/20 text-rose-700 dark:text-rose-300",
  rejected: "border-red-400/60 bg-red-500/10 text-red-600/70 line-through dark:text-red-300/70",
  found: "border-emerald-500 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
  out: "border-border bg-muted/30 text-muted-foreground/40",
}

export interface TwoLevelProps {
  readonly array: readonly number[]
  readonly indexTable: readonly IndexEntry[]
  readonly target: number
  readonly step: number
  // — рівень індексу —
  readonly idxLow: number | null
  readonly idxHigh: number | null
  readonly idxMid: number | null
  readonly idxDiscardLo: number | null
  readonly idxDiscardHi: number | null
  readonly probing: boolean
  readonly indexFound: boolean
  // — рівень масиву —
  readonly blockLo: number | null
  readonly blockHi: number | null
  readonly cursor: number | null
  readonly phase: CellPhase
  readonly result: number
  readonly resolved: boolean
  readonly size?: "sm" | "md"
}

/** Один сигнальний стовп індексу (верхній рівень). */
function IndexPillar({
  entry,
  role,
  isProbe,
  edge,
  size,
}: {
  entry: IndexEntry
  role: IndexRole
  isProbe: boolean
  edge: "start" | "end" | "both" | null
  size: "sm" | "md"
}) {
  const edgeLabel = edge === "both" ? "s·e" : edge === "start" ? "start" : edge === "end" ? "end" : ""
  return (
    <span className="flex flex-col items-center gap-0.5">
      <span className={cn("text-[10px] font-medium leading-none text-rose-500", isProbe ? "opacity-100" : "opacity-0")}>
        ▼<span className="sr-only">mid</span>
      </span>
      <span
        className={cn(
          "relative inline-flex items-center justify-center rounded-md border-2 font-mono tabular-nums transition-colors",
          size === "md" ? "min-w-[2.2rem] px-1.5 py-2 text-sm" : "min-w-[1.6rem] px-1 py-1 text-xs",
          INDEX_CLASS[role],
        )}
      >
        {entry[0]}
        {role === "found" && (
          <span className="absolute -right-1.5 -top-1.5 inline-flex size-3.5 items-center justify-center rounded-full bg-emerald-500 text-[9px] text-white">
            ✓
          </span>
        )}
      </span>
      {/* позиція в масиві (зв'язок «стовп → позиція») */}
      <span className="text-[9px] leading-none text-violet-500/80">↘{entry[1]}</span>
      <span className="h-3 text-[9px] font-semibold leading-none text-sky-600 dark:text-sky-400">
        {edgeLabel}
      </span>
    </span>
  )
}

/** Одна комірка масиву (нижній рівень). */
function ArrayCell({
  value,
  index,
  role,
  pillarKey,
  size,
}: {
  value: number
  index: number
  role: CellRole
  pillarKey: number | null
  size: "sm" | "md"
}) {
  const t = useT()
  return (
    <span className="flex flex-col items-center gap-0.5">
      {/* шапка-стовп: позначає позиції, що є сигнальними стовпами індексу (🟪) */}
      <span
        className={cn(
          "h-1.5 w-4 rounded-sm",
          pillarKey != null ? "bg-violet-500/70" : "bg-transparent",
        )}
        title={pillarKey != null ? t("play.issPillarTitle", { key: pillarKey }) : undefined}
      />
      <span
        className={cn(
          "relative inline-flex items-center justify-center rounded-md border-2 font-mono tabular-nums transition-colors",
          size === "md" ? "min-w-[2.2rem] px-1.5 py-2 text-sm" : "min-w-[1.6rem] px-1 py-1 text-xs",
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
      <span className="text-[10px] tabular-nums text-muted-foreground/60">{index}</span>
    </span>
  )
}

/**
 * Сигнатурний дворівневий образ: 🟪 розріджена ІНДЕКСНА таблиця згори (фаза 1,
 * вікно [start..end] звужується), ⬜ повний масив із БЛОКАМИ знизу (фаза 2, курсор у
 * блоці). Фіолетові шапки на комірках масиву — позиції сигнальних стовпів («стовп →
 * позиція»). Спільне для плеєра й навчальних віджетів.
 */
export function TwoLevelView(props: TwoLevelProps) {
  const t = useT()
  const { array, indexTable, size = "md" } = props
  const pillarKey = new Map<number, number>()
  for (const [k, p] of indexTable) pillarKey.set(p, k)

  const idxState = {
    idxLow: props.idxLow, idxHigh: props.idxHigh, idxMid: props.idxMid,
    probing: props.probing, idxDiscardLo: props.idxDiscardLo, idxDiscardHi: props.idxDiscardHi,
    indexFound: props.indexFound, blockLo: props.blockLo, blockHi: props.blockHi,
  }
  const cellState = {
    blockLo: props.blockLo, blockHi: props.blockHi, cursor: props.cursor,
    phase: props.phase, result: props.result, resolved: props.resolved,
  }

  return (
    <span className="flex flex-col gap-3">
      {/* — рівень індексу — */}
      <span className="block">
        <span className="mb-1 block text-center text-[11px] font-medium uppercase tracking-wide text-violet-600/80 dark:text-violet-400/80">
          🟪 {t("play.issIndexLabel")}
        </span>
        <span className="flex flex-wrap items-end justify-center gap-1.5">
          {indexTable.length === 0 ? (
            <span className="text-xs text-muted-foreground">{t("editor.issIndexEmpty")}</span>
          ) : (
            indexTable.map((entry, j) => {
              const isLow = props.idxLow != null && j === props.idxLow
              const isHigh = props.idxHigh != null && j === props.idxHigh
              const edge =
                props.idxLow == null ? null : isLow && isHigh ? "both" : isLow ? "start" : isHigh ? "end" : null
              return (
                <IndexPillar
                  key={j}
                  entry={entry}
                  role={indexRole(j, entry[1], idxState)}
                  isProbe={props.probing && j === props.idxMid}
                  edge={edge}
                  size={size}
                />
              )
            })
          )}
        </span>
      </span>

      {/* — рівень масиву — */}
      <span className="block">
        <span className="mb-1 block text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          ⬜ {t("play.issArrayLabel")}
        </span>
        <span className="flex flex-wrap items-start justify-center gap-1.5">
          {array.map((v, i) => (
            <ArrayCell
              key={i}
              value={v}
              index={i}
              role={cellRole(i, cellState)}
              pillarKey={pillarKey.has(i) ? pillarKey.get(i)! : null}
              size={size}
            />
          ))}
        </span>
      </span>
    </span>
  )
}

/** Панель плеєра: бейджі «шукаємо» + «крок» + TwoLevelView у рамці + легенда. */
export function TwoLevelPanel({
  className,
  ...view
}: TwoLevelProps & { className?: string }) {
  const t = useT()
  return (
    <Panel
      title={t("play.issTwoLevelTitle")}
      className={className}
      bodyClassName="flex flex-col gap-3 p-3"
    >
      <div className="flex flex-wrap gap-2">
        <SearchTargetBadge>{t("play.issTargetBadge", { target: view.target })}</SearchTargetBadge>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-violet-400/50 bg-violet-500/10 px-2.5 py-1 text-sm font-medium text-violet-700 dark:text-violet-300">
          {t("play.issStepBadge", { step: view.step })}
        </span>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto">
        <TwoLevelView {...view} />
      </div>
      <Legend />
    </Panel>
  )
}

function Legend() {
  const t = useT()
  const entries: { cls: string; label: string }[] = [
    { cls: "bg-violet-500/70 border-violet-500/70", label: t("learn.issLegPillar") },
    { cls: INDEX_CLASS.window, label: t("learn.issLegWindow") },
    { cls: INDEX_CLASS.probe, label: t("learn.issLegProbe") },
    { cls: INDEX_CLASS.discarding, label: t("learn.issLegDiscard") },
    { cls: CELL_CLASS.block, label: t("learn.issLegBlock") },
    { cls: CELL_CLASS.cursor, label: t("learn.issLegCursor") },
    { cls: CELL_CLASS.found, label: t("learn.issLegFound") },
    { cls: CELL_CLASS.out, label: t("learn.issLegOut") },
  ]
  return <LegendRow entries={entries} />
}
