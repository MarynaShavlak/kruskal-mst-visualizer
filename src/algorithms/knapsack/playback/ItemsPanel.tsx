import { Check } from "lucide-react"
import { Panel } from "@/algorithms/shared/playback/Panel"
import { fmt } from "@/algorithms/knapsack/playback/highlight"
import type { KnResult, KnFrame } from "@/lib/knapsackTrace"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

/**
 * Список предметів для ДП-режиму: вага, вартість, питома цінність. Активний
 * предмет (рядок i таблиці) підсвічено; обрані у фінальному наборі — позначено.
 */
export function ItemsPanel({
  result,
  frame,
  className,
}: {
  result: KnResult
  frame: KnFrame
  className?: string
}) {
  const t = useT()
  const { itemNames, weights, values, capacity } = result
  const activeItem = frame.row !== null && frame.row >= 1 ? frame.row - 1 : null
  const chosen = new Set(frame.chosen)

  return (
    <Panel
      title={t("play.knapItemsTitle", { w: capacity })}
      className={className}
      bodyClassName="overflow-auto p-2"
    >
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="px-2 py-1 font-medium">{t("editor.knapColName")}</th>
            <th className="px-2 py-1 text-right font-medium">{t("editor.knapColWeight")}</th>
            <th className="px-2 py-1 text-right font-medium">{t("editor.knapColValue")}</th>
            <th className="px-2 py-1 text-right font-medium">{t("editor.knapColRatio")}</th>
          </tr>
        </thead>
        <tbody>
          {itemNames.map((name, idx) => {
            const isActive = idx === activeItem
            const isChosen = chosen.has(idx)
            return (
              <tr
                key={idx}
                className={cn(
                  "border-b last:border-0 transition-colors",
                  isActive && "bg-sky-500/10",
                  isChosen && "bg-emerald-500/10",
                )}
              >
                <td className="px-2 py-1 font-medium">
                  <span className="inline-flex items-center gap-1">
                    {isChosen && <Check className="size-3.5 text-emerald-600" />}
                    {name}
                  </span>
                </td>
                <td className="px-2 py-1 text-right tabular-nums">{fmt(weights[idx])}</td>
                <td className="px-2 py-1 text-right tabular-nums">{fmt(values[idx])}</td>
                <td className="px-2 py-1 text-right tabular-nums text-muted-foreground">
                  {(values[idx] / weights[idx]).toFixed(2)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Panel>
  )
}
