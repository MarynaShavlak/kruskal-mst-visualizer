import { ArrowRight } from "lucide-react"
import { Panel } from "@/algorithms/shared/playback/Panel"
import type { Relaxation } from "@/algorithms/floyd-warshall/playback/highlight"
import { useT } from "@/i18n/use-t"
import { INF } from "@/lib/floydWarshall"
import type { Vertex } from "@/lib/directedGraph"
import { cn } from "@/lib/utils"

const fmt = (x: number): string => (x === INF ? "∞" : String(x))

/**
 * Журнал релаксацій до поточного кадру: кожен рядок — покращення відстані
 * D[i][j] через проміжну вершину k. Клік по рядку перемотує плеєр на той кадр.
 */
export function RelaxationLog({
  order,
  relaxations,
  onSeek,
  className,
}: {
  order: readonly Vertex[]
  relaxations: readonly Relaxation[]
  onSeek?: (frameIndex: number) => void
  className?: string
}) {
  const lastIdx = relaxations.length - 1
  const t = useT()

  return (
    <Panel
      title={t("play.relaxLog", { n: relaxations.length })}
      className={className}
      bodyClassName="p-0"
    >
      <div className="max-h-[280px] overflow-auto">
        {relaxations.length === 0 ? (
          <p className="px-3 py-4 text-sm text-muted-foreground">
            {t("play.relaxEmpty")}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted/70 text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-1.5 text-left font-medium">{t("play.colViaK")}</th>
                <th className="px-3 py-1.5 text-left font-medium">{t("play.colPath")}</th>
                <th className="px-3 py-1.5 text-right font-medium">{t("play.colBeforeAfter")}</th>
              </tr>
            </thead>
            <tbody>
              {relaxations.map((r, idx) => (
                <tr
                  key={r.frameIndex}
                  onClick={() => onSeek?.(r.frameIndex)}
                  className={cn(
                    "cursor-pointer border-t hover:bg-muted/40",
                    idx === lastIdx && "bg-emerald-100 dark:bg-emerald-500/15",
                  )}
                >
                  <td className="px-3 py-1.5 font-medium">{order[r.k]}</td>
                  <td className="px-3 py-1.5">
                    <span className="inline-flex items-center gap-1">
                      {order[r.i]}
                      <ArrowRight className="size-3.5 text-muted-foreground" />
                      {order[r.j]}
                    </span>
                  </td>
                  <td className="px-3 py-1.5 text-right tabular-nums">
                    <span className="text-muted-foreground">{fmt(r.from)}</span>
                    {" → "}
                    <b className="text-emerald-700 dark:text-emerald-400">
                      {fmt(r.to)}
                    </b>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Panel>
  )
}
