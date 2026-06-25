import { Fragment } from "react"
import { Panel } from "@/algorithms/shared/playback/Panel"
import { LegendRow } from "@/algorithms/shared/playback/LegendRow"
import { heapNodeRole, type HeapNodeRole, type HeapNodeState } from "@/algorithms/heap-sort/playback/highlight"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

// Той самий стан, що й дерево, але як ЛІНІЙНИЙ масив — щоб видно було головну ідею:
// купа НЕ зберігається окремо, це сам масив. Вертикальна межа відділяє купу
// [0..heapSize) від уже відсортованого «хвоста» [heapSize..n), який наростає з кінця.

const CELL_CLASS: Record<HeapNodeRole, string> = {
  heap: "bg-slate-200 text-slate-700 border-slate-400/60 dark:bg-slate-700 dark:text-slate-100",
  root: "bg-indigo-500/20 text-indigo-700 border-indigo-500/60 dark:text-indigo-200",
  sift: "bg-sky-500/20 text-sky-800 border-sky-500 ring-2 ring-sky-400/40 dark:text-sky-100",
  compare: "bg-amber-400 text-amber-950 border-amber-500",
  swap: "bg-rose-500 text-white border-rose-600",
  extract: "bg-violet-500 text-white border-violet-600",
  sorted: "bg-emerald-500/80 text-white border-emerald-600/60",
}

export interface HeapArrayProps {
  readonly array: readonly number[]
  readonly state: HeapNodeState
  readonly size?: "md" | "lg"
}

/** Лінійний масив із кольорами ролей та межею «купа ↔ відсортоване». */
export function HeapArrayCells({ array, state, size = "md" }: HeapArrayProps) {
  const t = useT()
  const cell = size === "lg" ? "size-10 text-base" : "size-9 text-sm"
  const n = array.length
  const heapSize = state.sortedAll ? 0 : state.heapSize
  return (
    <div className="flex items-end justify-center gap-1 overflow-x-auto">
      {array.map((v, i) => {
        const role = heapNodeRole(i, state)
        // Межа між купою та відсортованим хвостом (перед першим відсортованим індексом).
        const divider = i === heapSize && heapSize > 0 && heapSize < n
        return (
          <Fragment key={i}>
            {divider && (
              <span className="mx-0.5 flex flex-col items-center self-stretch">
                <span className="w-px flex-1 bg-emerald-500/60" />
              </span>
            )}
            <span className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  "flex items-center justify-center rounded-md border font-semibold tabular-nums",
                  cell,
                  CELL_CLASS[role],
                )}
              >
                {v}
              </span>
              <span className="text-[10px] tabular-nums text-muted-foreground/70">{i}</span>
            </span>
          </Fragment>
        )
      })}
      {n > 0 && heapSize === 0 && !state.sortedAll && (
        <span className="ml-1 self-center text-[10px] text-muted-foreground">
          {t("play.hpAllSorted")}
        </span>
      )}
    </div>
  )
}

/** Панель лінійного масиву купи: комірки + підпис меж + легенда. */
export function HeapArrayPanel({
  array,
  state,
  className,
}: HeapArrayProps & { className?: string }) {
  const t = useT()
  const heapSize = state.sortedAll ? 0 : state.heapSize
  return (
    <Panel
      title={t("play.hpArrayTitle")}
      className={className}
      bodyClassName="flex flex-col gap-2 p-3"
    >
      <div className="flex flex-wrap gap-x-4 text-[11px] text-muted-foreground">
        <span>
          {t("play.hpHeapRegion")}{" "}
          <b className="tabular-nums text-foreground">
            [0..{Math.max(0, heapSize)})
          </b>
        </span>
        <span>
          {t("play.hpSortedRegion")}{" "}
          <b className="tabular-nums text-emerald-600 dark:text-emerald-400">
            [{Math.max(0, heapSize)}..{array.length})
          </b>
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <HeapArrayCells array={array} state={state} />
      </div>
      <LegendRow
        entries={[
          { label: t("learn.hpLegendHeap"), cls: CELL_CLASS.heap },
          { label: t("learn.hpLegendSorted"), cls: CELL_CLASS.sorted },
        ]}
      />
    </Panel>
  )
}
