import { useMemo, type ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import type { Graph, Vertex } from "@/lib/graph"
import type { Frame, KruskalRun, MstResult } from "@/lib/trace"
import type { XY } from "@/store/graph-store"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { PlayerShell } from "@/algorithms/shared/playback/PlayerShell"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { DecisionTable } from "@/algorithms/kruskal/playback/DecisionTable"
import { GraphView } from "@/algorithms/kruskal/playback/GraphView"
import { useT } from "@/i18n/use-t"

export function SinglePlayer({
  graph,
  positions,
  run,
  codeTitle,
  graphTitle,
  headerExtra,
  thirdPanel,
}: {
  graph: Graph
  positions: Record<Vertex, XY>
  run: KruskalRun
  codeTitle: string
  graphTitle?: string
  headerExtra?: ReactNode
  thirdPanel: (frame: Frame) => ReactNode
}) {
  const { trace, result } = run
  const player = usePlayer(trace.frames.length, trace)
  const frame = trace.frames[Math.min(player.index, trace.frames.length - 1)]
  const t = useT()

  const firstFrameOfEdge = useMemo(() => {
    const map = new Map<string, number>()
    trace.frames.forEach((f, i) => {
      if (f.consideredEdgeId && !map.has(f.consideredEdgeId)) {
        map.set(f.consideredEdgeId, i)
      }
    })
    return map
  }, [trace])

  return (
    <PlayerShell
      player={player}
      caption={frame.caption}
      headerExtra={headerExtra}
      statsBar={
        frame.dsuStats && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 rounded-md border bg-card px-3 py-2 text-xs">
            <span>
              <b>{t("play.findSteps")}</b>{" "}
              <span className="tabular-nums">{frame.dsuStats.findSteps}</span>
            </span>
            <span>
              <b>{t("play.unions")}</b>{" "}
              <span className="tabular-nums">{frame.dsuStats.unions}</span>
            </span>
            <span>
              <b>{t("play.compressions")}</b>{" "}
              <span className="tabular-nums">{frame.dsuStats.compressions}</span>
            </span>
          </div>
        )
      }
      panels={
        <>
          <GraphView
            graph={graph}
            positions={positions}
            trace={trace}
            frame={frame}
            title={graphTitle}
            className="min-h-[360px]"
          />
          <CodePanel
            code={trace.code}
            activeLines={frame.lines}
            title={codeTitle}
            className="min-h-[360px]"
          />
          {thirdPanel(frame)}
        </>
      }
      secondRow={
        <>
          <DecisionTable
            graph={graph}
            trace={trace}
            frame={frame}
            className="lg:col-span-2"
            onSeekEdge={(id) => {
              const i = firstFrameOfEdge.get(id)
              if (i != null) player.dispatch({ type: "seek", index: i })
            }}
          />
          <ResultCard result={result} />
        </>
      }
    />
  )
}

export function ResultCard({ result }: { result: MstResult }) {
  const t = useT()
  return (
    <Card>
      <CardContent className="space-y-1 py-4 text-sm">
        <div className="text-muted-foreground">
          {t("play.summary")} (
          {result.algo === "dsu" ? "DSU" : t("play.naiveLower")})
        </div>
        <div className="text-2xl font-semibold tabular-nums">
          {t("play.mstWeight")} {result.totalWeight}
        </div>
        <div>
          {t("play.edgesCount", { n: result.mstEdgeIds.length })} ·{" "}
          {result.isSpanning
            ? t("play.spanningTree")
            : t("play.spanningForest")}
        </div>
      </CardContent>
    </Card>
  )
}
