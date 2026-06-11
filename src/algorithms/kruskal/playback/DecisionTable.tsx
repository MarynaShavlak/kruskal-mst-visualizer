import { ArrowRight, Check, X } from "lucide-react"
import type { Graph } from "@/lib/graph"
import type { Frame, Trace } from "@/lib/trace"
import { edgeStatuses, type EdgeStatus } from "@/algorithms/kruskal/playback/highlight"
import { Panel } from "@/algorithms/shared/playback/Panel"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

export function DecisionTable({
  graph,
  trace,
  frame,
  onSeekEdge,
  className,
}: {
  graph: Graph
  trace: Trace
  frame: Frame
  onSeekEdge?: (edgeId: string) => void
  className?: string
}) {
  const byId = new Map(graph.edges.map((e) => [e.id, e]))
  const statuses = edgeStatuses(trace, frame)
  const t = useT()

  return (
    <Panel title={t("play.decisionTable")} className={className} bodyClassName="p-0">
      <div className="max-h-[280px] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-muted/70 text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-1.5 text-left font-medium">{t("play.colEdge")}</th>
              <th className="px-2 py-1.5 text-right font-medium">{t("play.colWeight")}</th>
              <th className="px-3 py-1.5 text-left font-medium">{t("play.colDecision")}</th>
            </tr>
          </thead>
          <tbody>
            {trace.sortedEdgeIds.map((id) => {
              const e = byId.get(id)
              if (!e) return null
              const st = statuses.get(id) ?? "pending"
              return (
                <tr
                  key={id}
                  onClick={() => onSeekEdge?.(id)}
                  className={cn(
                    "cursor-pointer border-t hover:bg-muted/40",
                    st === "current" && "bg-amber-100",
                  )}
                >
                  <td className="px-3 py-1.5 font-medium">
                    {e.u}–{e.v}
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums">
                    {e.weight}
                  </td>
                  <td className="px-3 py-1.5">
                    <StatusBadge status={st} />
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

function StatusBadge({ status }: { status: EdgeStatus }) {
  const t = useT()
  switch (status) {
    case "accepted":
      return (
        <span className="inline-flex items-center gap-1 text-green-700">
          <Check className="size-3.5" /> {t("play.stInMst")}
        </span>
      )
    case "rejected":
      return (
        <span className="inline-flex items-center gap-1 text-red-600">
          <X className="size-3.5" /> {t("play.stCycle")}
        </span>
      )
    case "current":
      return (
        <span className="inline-flex items-center gap-1 text-amber-700">
          <ArrowRight className="size-3.5" /> {t("play.stConsider")}
        </span>
      )
    default:
      return <span className="text-muted-foreground">—</span>
  }
}
