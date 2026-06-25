import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  buildTraversalTrace,
  type TraversalStrategy,
} from "@/lib/graphTraversal"
import type { Graph, Vertex } from "@/lib/graph"
import { useLangStore } from "@/store/lang-store"
import type { XY } from "@/store/create-graph-store"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { PlayerShell } from "@/algorithms/shared/playback/PlayerShell"
import { LiveComplexity } from "@/algorithms/shared/playback/LiveComplexity"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { useT, useTr } from "@/i18n/use-t"
import { GraphView } from "@/algorithms/shared/traversal/GraphView"
import {
  FrontierPanel,
  VisitOrderPanel,
} from "@/algorithms/shared/traversal/FrontierPanel"

/** Спільний плеєр обходу (BFS/DFS); відрізняється лише стратегією. */
export function TraversalPlayback({
  graph,
  positions,
  strategy,
}: {
  graph: Graph
  positions: Record<Vertex, XY>
  strategy: TraversalStrategy
}) {
  const t = useT()
  const tr = useTr()
  const lang = useLangStore((s) => s.lang)

  const { trace, result } = useMemo(
    () => buildTraversalTrace(graph, strategy, undefined, tr),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [graph, strategy, lang],
  )
  const player = usePlayer(trace.frames.length, graph)
  const index = Math.min(player.index, trace.frames.length - 1)
  const frame = trace.frames[index]
  const atEnd = index === trace.frames.length - 1

  if (graph.vertices.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          {t("play.emptyGraph")}
        </CardContent>
      </Card>
    )
  }

  const v = result.vertexCount
  const e = graph.edges.length
  const isBfs = strategy === "bfs"

  return (
    <PlayerShell
      player={player}
      caption={frame.caption}
      statsBar={
        <>
          <div className="flex flex-wrap gap-x-4 gap-y-1 rounded-md border bg-card px-3 py-2 text-xs">
            <span>
              <b>{t("play.travVisitedCount")}</b>{" "}
              <span className="tabular-nums">
                {frame.visited.length}/{v}
              </span>
            </span>
            <span>
              <b>{t("play.travFrontierCount")}</b>{" "}
              <span className="tabular-nums">{frame.frontier.length}</span>
            </span>
            <span>
              <b>{t("play.travPoppedCount")}</b>{" "}
              <span className="tabular-nums">{frame.step}</span>
            </span>
          </div>
          <LiveComplexity
            title={t("play.lcTitle")}
            n={v}
            unit={t("play.travLcUnit")}
            actual={frame.step}
            actualLabel={t("play.lcActual")}
            reference={{
              value: v,
              cls: "O(V)",
              name: t("play.travLcVertices"),
              formula: `V = ${v}`,
            }}
            worst={{
              value: v + e,
              cls: "O(V+E)",
              name: t("play.travLcVE"),
              formula: `V+E = ${v + e}`,
            }}
            verdict={atEnd ? t("play.travLcVerdict") : undefined}
          />
        </>
      }
      panels={
        <>
          <GraphView
            graph={graph}
            positions={positions}
            frame={frame}
            className="min-h-[360px]"
          />
          <CodePanel
            code={trace.code}
            title={isBfs ? t("play.travCodeBfs") : t("play.travCodeDfs")}
            activeLines={frame.lines}
            contextLines={frame.contextLines}
            className="min-h-[360px]"
          />
          <FrontierPanel frame={frame} className="min-h-[360px]" />
        </>
      }
      secondRow={
        <>
          <VisitOrderPanel frame={frame} className="lg:col-span-2" />
          <ResultCard
            connected={result.isConnected}
            order={result.order}
            visited={result.visitedCount}
            total={result.vertexCount}
          />
        </>
      }
    />
  )
}

function ResultCard({
  connected,
  order,
  visited,
  total,
}: {
  connected: boolean
  order: readonly Vertex[]
  visited: number
  total: number
}) {
  const t = useT()
  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-3 text-sm">
      <div className="text-sm font-medium">{t("play.summary")}</div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground">{t("play.travOrderResult")}</span>
        <span className="font-mono font-medium">{order.join(" ")}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">{t("play.travVisitedCount")}</span>
        <span className="font-medium tabular-nums">
          {visited}/{total}
        </span>
      </div>
      <div className="mt-1 rounded-md bg-primary/10 px-2 py-1.5 text-xs">
        {connected ? t("play.travConnected") : t("play.travDisconnected")}
      </div>
    </div>
  )
}
