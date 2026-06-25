import type { Graph } from "@/lib/graph"
import type { DijkstraFrame } from "@/lib/dijkstra"
import { Panel } from "@/algorithms/shared/playback/Panel"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

const fmtDist = (d: number | undefined): string =>
  d === undefined || d === Infinity ? "∞" : String(d)

/**
 * Таблиця відстаней «Вершина · Відстань · Перевірено» — як у README. Оновлюється
 * щокроку: поточна вершина підсвічена жовтим, щойно покращені — зеленим.
 */
export function DistanceTablePanel({
  graph,
  frame,
  className,
}: {
  graph: Graph
  frame: DijkstraFrame
  className?: string
}) {
  const t = useT()
  const vertices = [...graph.vertices].sort((a, b) =>
    a < b ? -1 : a > b ? 1 : 0,
  )
  const settled = new Set(frame.visited)
  const updated = new Set(frame.updated)

  return (
    <Panel title={t("play.dijkTableTitle")} className={className} bodyClassName="p-0">
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
              <th className="px-3 py-1.5 text-left font-semibold">
                {t("play.dijkColVertex")}
              </th>
              <th className="px-3 py-1.5 text-left font-semibold">
                {t("play.dijkColDist")}
              </th>
              <th className="px-3 py-1.5 text-left font-semibold">
                {t("play.dijkColChecked")}
              </th>
            </tr>
          </thead>
          <tbody>
            {vertices.map((v) => {
              const isCurrent = frame.current === v
              const isUpdated = updated.has(v)
              const checked = settled.has(v)
              return (
                <tr
                  key={v}
                  className={cn(
                    "border-b last:border-0",
                    isCurrent && "bg-amber-500/15",
                    !isCurrent && isUpdated && "bg-emerald-500/10",
                  )}
                >
                  <td className="px-3 py-1.5 font-medium">{v}</td>
                  <td
                    className={cn(
                      "px-3 py-1.5 font-mono tabular-nums",
                      isUpdated && "font-semibold text-emerald-700 dark:text-emerald-300",
                    )}
                  >
                    {fmtDist(frame.distances[v])}
                  </td>
                  <td className="px-3 py-1.5">
                    {checked ? (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {t("play.dijkYes")}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        {t("play.dijkNo")}
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}
