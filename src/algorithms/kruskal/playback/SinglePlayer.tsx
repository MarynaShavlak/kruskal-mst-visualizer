import { useMemo, type ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import type { Graph, Vertex } from "@/lib/graph"
import type { Frame, KruskalRun, MstResult } from "@/lib/trace"
import type { XY } from "@/store/graph-store"
import { CodePanel } from "@/algorithms/kruskal/playback/CodePanel"
import { DecisionTable } from "@/algorithms/kruskal/playback/DecisionTable"
import { GraphView } from "@/algorithms/kruskal/playback/GraphView"
import { PlayerControls } from "@/algorithms/kruskal/playback/PlayerControls"
import { usePlayer } from "@/algorithms/kruskal/playback/use-player"

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
    <div className="flex flex-col gap-3">
      {headerExtra}
      <PlayerControls player={player} />

      <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
        <span className="font-medium">
          Крок {player.index + 1}/{trace.frames.length}.
        </span>{" "}
        {frame.caption}
      </div>

      {frame.dsuStats && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 rounded-md border bg-card px-3 py-2 text-xs">
          <span>
            <b>find-кроків:</b>{" "}
            <span className="tabular-nums">{frame.dsuStats.findSteps}</span>
          </span>
          <span>
            <b>об'єднань:</b>{" "}
            <span className="tabular-nums">{frame.dsuStats.unions}</span>
          </span>
          <span>
            <b>стиснень шляху:</b>{" "}
            <span className="tabular-nums">{frame.dsuStats.compressions}</span>
          </span>
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-3">
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
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
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
      </div>
    </div>
  )
}

export function ResultCard({ result }: { result: MstResult }) {
  return (
    <Card>
      <CardContent className="space-y-1 py-4 text-sm">
        <div className="text-muted-foreground">
          Підсумок ({result.algo === "dsu" ? "DSU" : "наївна"})
        </div>
        <div className="text-2xl font-semibold tabular-nums">
          Вага МОД: {result.totalWeight}
        </div>
        <div>
          {result.mstEdgeIds.length} ребер ·{" "}
          {result.isSpanning
            ? "остовне дерево"
            : "остовний ліс (граф незв'язний)"}
        </div>
      </CardContent>
    </Card>
  )
}
