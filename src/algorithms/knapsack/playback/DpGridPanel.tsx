import { useEffect, useMemo, useRef } from "react"
import { Panel } from "@/algorithms/shared/playback/Panel"
import {
  backtrackPath,
  cellSources,
  dpLinear,
  fmt,
} from "@/algorithms/knapsack/playback/highlight"
import type { KnResult, KnFrame } from "@/lib/knapsackTrace"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

/**
 * Серце ДП-версії: жива сітка K[i][w] (рядок = перші i предметів, стовпець =
 * місткість w). У фазі заповнення відкриваємо клітинки зліва направо, активну
 * підсвічуємо за гілкою (взяти/не брати/база/не вміщається) і обводимо дві
 * клітинки-джерела. У фазі відновлення підсвічуємо зворотний шлях по таблиці.
 */
export function DpGridPanel({
  result,
  frame,
  className,
}: {
  result: KnResult
  frame: KnFrame
  className?: string
}) {
  const t = useT()
  const { table, weights, itemNames, capacity } = result
  const cols = capacity + 1

  const isFill = frame.phase === "fill"
  const activeRow = frame.row
  const activeCol = frame.col
  const cellActive = frame.sub.kind === "cell"
  const activeKind = frame.sub.kind === "cell" ? frame.sub.cellKind : null
  const sources =
    cellActive && activeRow !== null && activeCol !== null
      ? cellSources(activeRow, activeCol, weights)
      : { skip: null, take: null }

  // Зворотний шлях (для фази backtrack/done): які клітинки відвідано і чи взято.
  const path = useMemo(
    () => backtrackPath(table, weights, capacity),
    [table, weights, capacity],
  )
  const visited = useMemo(() => {
    if (isFill) return new Map<number, boolean>()
    const m = new Map<number, boolean>()
    for (const s of path) {
      // Під час backtrack показуємо лише вже пройдені рядки (i ≥ поточного).
      if (frame.phase === "done" || (activeRow !== null && s.i >= activeRow)) {
        m.set(dpLinear(s.i, s.w, cols), s.taken)
      }
    }
    return m
  }, [isFill, frame.phase, activeRow, path, cols])

  const activeRef = useRef<HTMLTableCellElement>(null)
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" })
  }, [frame.i])

  const isSource = (i: number, w: number): "take" | "skip" | null => {
    if (sources.take && sources.take[0] === i && sources.take[1] === w) return "take"
    if (sources.skip && sources.skip[0] === i && sources.skip[1] === w) return "skip"
    return null
  }

  return (
    <Panel
      title={t("play.knapDpTitle")}
      className={className}
      bodyClassName="overflow-auto p-2"
    >
      <table className="border-collapse text-[11px] tabular-nums">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-card px-1.5 py-0.5 text-muted-foreground">
              i\w
            </th>
            {Array.from({ length: cols }, (_, w) => (
              <th
                key={w}
                className={cn(
                  "min-w-[1.75rem] px-1 py-0.5 text-center font-normal text-muted-foreground",
                  activeCol === w && "text-foreground font-semibold",
                )}
              >
                {w}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.map((row, i) => (
            <tr key={i}>
              <th
                className={cn(
                  "sticky left-0 z-10 whitespace-nowrap bg-card px-1.5 py-0.5 text-left font-normal text-muted-foreground",
                  activeRow === i && "text-foreground font-semibold",
                )}
              >
                {i === 0 ? "∅" : `${i} ${itemNames[i - 1] ?? ""}`}
              </th>
              {row.map((val, w) => {
                const linear = dpLinear(i, w, cols)
                const shown = !isFill || linear < frame.filled
                const isActive =
                  cellActive && i === activeRow && w === activeCol
                const src = isSource(i, w)
                const bt = visited.get(linear)
                const isBtCurrent =
                  !isFill && i === activeRow && w === activeCol

                return (
                  <td
                    key={w}
                    ref={isActive || isBtCurrent ? activeRef : undefined}
                    className={cn(
                      "min-w-[1.75rem] border border-border/40 px-1 py-0.5 text-center transition-colors",
                      !shown && !isActive && "text-transparent",
                      shown && !isActive && "text-foreground",
                      isActive && activeKind === "take" && "bg-emerald-500/20 ring-2 ring-emerald-500/70 font-semibold",
                      isActive && activeKind === "skip" && "bg-sky-500/20 ring-2 ring-sky-500/70 font-semibold",
                      isActive && activeKind === "nofit" && "bg-slate-500/15 ring-2 ring-slate-400/60 font-semibold",
                      isActive && activeKind === "base" && "bg-muted ring-2 ring-muted-foreground/40 font-semibold",
                      src === "take" && "outline-dashed outline-2 outline-emerald-500/60",
                      src === "skip" && "outline-dashed outline-2 outline-sky-500/60",
                      bt !== undefined && (bt
                        ? "bg-amber-500/25 font-semibold"
                        : "bg-amber-500/10"),
                      isBtCurrent && "ring-2 ring-amber-500/70",
                    )}
                  >
                    {shown || isActive ? fmt(val) : "·"}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-1.5 px-1 text-[11px] text-muted-foreground">
        {t("play.knapDpProgress", {
          n: Math.min(frame.filled, result.operations),
          total: result.operations,
        })}
      </p>
    </Panel>
  )
}
