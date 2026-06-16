import { Panel } from "@/algorithms/shared/playback/Panel"
import { fmt } from "@/algorithms/knapsack/playback/highlight"
import type { GreedyResult, GreedyFrame } from "@/lib/knapsackAltTrace"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

/**
 * Панель жадібного методу: предмети в порядку спадання питомої цінності, з
 * позначкою «взято / пропущено / попереду» і смугою заповнення рюкзака. Поточний
 * предмет підсвічено.
 */
export function GreedyPanel({
  result,
  frame,
  className,
}: {
  result: GreedyResult
  frame: GreedyFrame
  className?: string
}) {
  const t = useT()
  const { steps, itemNames, capacity } = result
  const used = capacity - frame.free
  const pct = capacity > 0 ? Math.round((used / capacity) * 100) : 0
  const current = frame.step
  // На фінальному кадрі (done) frame.step = null, але всі предмети вже вирішено —
  // показуємо їхні підсумкові статуси, а не «попереду».
  const done = frame.sub.kind === "done"

  return (
    <Panel
      title={t("play.knapGreedyTitle")}
      className={className}
      bodyClassName="space-y-2 p-2"
    >
      <div>
        <div className="mb-0.5 flex justify-between text-[11px] text-muted-foreground tabular-nums">
          <span>{t("play.knapFilled", { used, cap: capacity })}</span>
          <span>{t("play.knapValue", { v: frame.total })}</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded bg-muted">
          <div
            className="h-full rounded bg-emerald-500/70 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="px-2 py-1 font-medium">{t("editor.knapColName")}</th>
            <th className="px-2 py-1 text-right font-medium">{t("editor.knapColRatio")}</th>
            <th className="px-2 py-1 text-right font-medium">{t("editor.knapColWeight")}</th>
            <th className="px-2 py-1 text-right font-medium">{t("editor.knapColValue")}</th>
            <th className="px-2 py-1 text-right font-medium">{t("play.knapColStatus")}</th>
          </tr>
        </thead>
        <tbody>
          {steps.map((s, idx) => {
            const decided = done || (current !== null && idx <= current)
            const isCurrent = !done && idx === current
            const status = !decided
              ? t("play.knapPending")
              : s.taken
                ? t("play.knapTaken")
                : t("play.knapSkipped")
            return (
              <tr
                key={idx}
                className={cn(
                  "border-b last:border-0 transition-colors",
                  isCurrent && "bg-sky-500/10",
                  decided && s.taken && "bg-emerald-500/10",
                  decided && !s.taken && "text-muted-foreground",
                )}
              >
                <td className="px-2 py-1 font-medium">{itemNames[s.index]}</td>
                <td className="px-2 py-1 text-right tabular-nums">{s.ratio.toFixed(2)}</td>
                <td className="px-2 py-1 text-right tabular-nums">{fmt(s.weight)}</td>
                <td className="px-2 py-1 text-right tabular-nums">{fmt(s.value)}</td>
                <td
                  className={cn(
                    "px-2 py-1 text-right text-xs",
                    decided && s.taken && "text-emerald-600 dark:text-emerald-400",
                  )}
                >
                  {status}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Panel>
  )
}
