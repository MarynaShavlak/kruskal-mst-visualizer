import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { kruskalDsu } from "@/lib/kruskalDsu"
import { useGraphStore } from "@/store/graph-store"
import { CodePanel } from "@/features/playback/CodePanel"
import { DecisionTable } from "@/features/playback/DecisionTable"
import { DsuForestPanel } from "@/features/playback/DsuForestPanel"
import { GraphView } from "@/features/playback/GraphView"
import { PlayerControls } from "@/features/playback/PlayerControls"
import { usePlayer } from "@/features/playback/use-player"

export function PlaybackView() {
  const graph = useGraphStore((s) => s.graph)
  const positions = useGraphStore((s) => s.positions)

  const { trace, result } = useMemo(() => kruskalDsu(graph), [graph])
  const player = usePlayer(trace.frames.length, trace)
  const frame = trace.frames[Math.min(player.index, trace.frames.length - 1)]

  // Перший кадр кожного ребра — для переходу кліком у таблиці рішень.
  const firstFrameOfEdge = useMemo(() => {
    const map = new Map<string, number>()
    trace.frames.forEach((f, i) => {
      if (f.consideredEdgeId && !map.has(f.consideredEdgeId)) {
        map.set(f.consideredEdgeId, i)
      }
    })
    return map
  }, [trace])

  if (graph.vertices.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Граф порожній — створіть його у вкладці «Редактор».
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <PlayerControls player={player} />

      <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
        <span className="font-medium">
          Крок {player.index + 1}/{trace.frames.length}.
        </span>{" "}
        {frame.caption}
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <GraphView
          graph={graph}
          positions={positions}
          trace={trace}
          frame={frame}
          className="min-h-[360px]"
        />
        <CodePanel code={trace.code} activeLines={frame.lines} className="min-h-[360px]" />
        <DsuForestPanel snapshot={frame.dsu} className="min-h-[360px]" />
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
        <Card>
          <CardContent className="space-y-1 py-4 text-sm">
            <div className="text-muted-foreground">Підсумок (Краскал, DSU)</div>
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
      </div>
    </div>
  )
}
