import { useEffect, useRef } from "react"
import { Crown } from "lucide-react"
import { Panel } from "@/algorithms/shared/playback/Panel"
import { fmt } from "@/algorithms/knapsack/playback/highlight"
import type { BruteResult, BruteFrame } from "@/lib/knapsackAltTrace"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

/**
 * Панель повного перебору: підмножини в порядку перебору, що відкриваються по
 * одній. Поточну підсвічено; лідер (найкраща з тих, що влазять) позначений
 * короною. Видно ціну 2ⁿ: рядків стільки ж, скільки підмножин.
 */
export function SubsetsPanel({
  result,
  frame,
  className,
}: {
  result: BruteResult
  frame: BruteFrame
  className?: string
}) {
  const t = useT()
  const { subsets, itemNames } = result

  const revealed =
    frame.index !== null
      ? frame.index + 1
      : frame.sub.kind === "done"
        ? subsets.length
        : 0

  const setLabel = (combo: readonly number[]): string =>
    combo.length === 0 ? "∅" : combo.map((i) => itemNames[i] ?? `#${i}`).join("")

  const activeRef = useRef<HTMLTableRowElement>(null)
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" })
  }, [frame.i])

  return (
    <Panel
      title={t("play.knapSubsetsTitle")}
      className={className}
      bodyClassName="overflow-auto p-2"
    >
      <div className="mb-1 px-1 text-[11px] text-muted-foreground tabular-nums">
        {t("play.knapSubsetsProgress", { n: revealed, total: subsets.length })}
      </div>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="px-2 py-1 font-medium">{t("play.knapColSubset")}</th>
            <th className="px-2 py-1 text-right font-medium">{t("editor.knapColWeight")}</th>
            <th className="px-2 py-1 text-right font-medium">{t("editor.knapColValue")}</th>
            <th className="w-10 px-2 py-1 text-center font-medium">{t("play.knapColFits")}</th>
          </tr>
        </thead>
        <tbody>
          {subsets.slice(0, revealed).map((s, idx) => {
            const isCurrent = idx === frame.index
            const isLeader = idx === frame.bestIndex
            return (
              <tr
                key={idx}
                ref={isCurrent ? activeRef : undefined}
                className={cn(
                  "border-b last:border-0 transition-colors",
                  isCurrent && "bg-sky-500/10",
                  isLeader && "bg-emerald-500/10",
                  !s.fits && "text-muted-foreground",
                )}
              >
                <td className="px-2 py-1 font-mono">
                  <span className="inline-flex items-center gap-1">
                    {isLeader && <Crown className="size-3.5 text-emerald-600" />}
                    {setLabel(s.combo)}
                  </span>
                </td>
                <td className="px-2 py-1 text-right tabular-nums">{fmt(s.weight)}</td>
                <td className="px-2 py-1 text-right tabular-nums">{fmt(s.value)}</td>
                <td className="px-2 py-1 text-center">
                  {s.fits ? (
                    <span className="text-emerald-600">✓</span>
                  ) : (
                    <span className="text-destructive">✗</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Panel>
  )
}
