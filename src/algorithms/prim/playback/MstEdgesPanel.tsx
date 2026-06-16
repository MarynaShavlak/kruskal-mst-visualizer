import type { Graph } from "@/lib/graph"
import type { PrimFrame, PrimResult } from "@/lib/primTrace"
import { weightById } from "@/algorithms/prim/playback/highlight"
import { Panel } from "@/algorithms/shared/playback/Panel"
import { useT } from "@/i18n/use-t"

/** Прийняті ребра МОД у порядку додавання + поточна сумарна вага. */
export function MstEdgesPanel({
  graph,
  frame,
  result,
  className,
}: {
  graph: Graph
  frame: PrimFrame
  result: PrimResult
  className?: string
}) {
  const t = useT()
  const w = weightById(graph)
  const need = Math.max(0, result.vertexCount - 1)
  let running = 0

  return (
    <Panel title={t("play.primMstEdges")} className={className} bodyClassName="p-0">
      <div className="flex h-full min-h-0 flex-col">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-muted/60 text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-1.5 text-left font-medium">#</th>
              <th className="px-3 py-1.5 text-left font-medium">{t("play.colEdge")}</th>
              <th className="px-3 py-1.5 text-right font-medium">{t("play.colWeight")}</th>
              <th className="px-3 py-1.5 text-right font-medium">Σ</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {frame.mstEdgeIds.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-3 text-muted-foreground">
                  {t("play.primNoEdgesYet")}
                </td>
              </tr>
            ) : (
              frame.mstEdgeIds.map((id, i) => {
                const weight = w.get(id) ?? 0
                running += weight
                const [u, v] = id.split("|")
                return (
                  <tr key={id} className="border-t">
                    <td className="px-3 py-1 text-muted-foreground">{i + 1}</td>
                    <td className="px-3 py-1 font-medium">
                      {u}–{v}
                    </td>
                    <td className="px-3 py-1 text-right">{weight}</td>
                    <td className="px-3 py-1 text-right text-muted-foreground">{running}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
        <div className="mt-auto flex items-center justify-between border-t px-3 py-2 text-sm">
          <span className="text-muted-foreground">
            {frame.mstEdgeIds.length}/{need} {t("play.primEdgesShort")}
          </span>
          <span className="font-medium tabular-nums">
            {t("play.mstWeight")} {frame.total}
          </span>
        </div>
      </div>
    </Panel>
  )
}
