import { useMemo } from "react"
import { AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import {
  buildFloydWarshallTrace,
  type FwResult,
} from "@/lib/floydWarshallTrace"
import { useDirectedGraphStore } from "@/store/directed-graph-store"
import { CodePanel } from "@/algorithms/floyd-warshall/playback/CodePanel"
import { GraphView } from "@/algorithms/floyd-warshall/playback/GraphView"
import { relaxationsUpTo } from "@/algorithms/floyd-warshall/playback/highlight"
import { MatrixPanel } from "@/algorithms/floyd-warshall/playback/MatrixPanel"
import { PathExplorer } from "@/algorithms/floyd-warshall/playback/PathExplorer"
import { PlayerControls } from "@/algorithms/shared/playback/PlayerControls"
import { RelaxationLog } from "@/algorithms/floyd-warshall/playback/RelaxationLog"
import { usePlayer } from "@/algorithms/shared/playback/use-player"

export function PlaybackView() {
  const graph = useDirectedGraphStore((s) => s.graph)
  const positions = useDirectedGraphStore((s) => s.positions)

  const { trace, result } = useMemo(
    () => buildFloydWarshallTrace(graph),
    [graph],
  )
  const player = usePlayer(trace.frames.length, trace)
  const index = Math.min(player.index, trace.frames.length - 1)
  const frame = trace.frames[index]
  const relaxations = useMemo(
    () => relaxationsUpTo(trace, index),
    [trace, index],
  )

  if (graph.vertices.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Граф порожній — створіть його у вкладці «Редактор».
        </CardContent>
      </Card>
    )
  }

  const kLabel = frame.k !== null ? result.order[frame.k] : "—"

  return (
    <div className="flex flex-col gap-3">
      <PlayerControls player={player} />

      <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
        <span className="font-medium">
          Крок {index + 1}/{trace.frames.length}.
        </span>{" "}
        {frame.caption}
        {frame.negativeCycle && (
          <span className="ml-2 inline-flex items-center gap-1 rounded bg-destructive/10 px-1.5 py-0.5 text-xs font-medium text-destructive">
            <AlertTriangle className="size-3.5" /> від'ємний цикл
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 rounded-md border bg-card px-3 py-2 text-xs">
        <span>
          <b>проміжна k:</b> <span className="tabular-nums">{kLabel}</span>
        </span>
        <span>
          <b>релаксацій усього:</b>{" "}
          <span className="tabular-nums">{relaxations.length}</span>
        </span>
        <span>
          <b>покращено на цьому k:</b>{" "}
          <span className="tabular-nums">{frame.improvedThisK.length}</span>
        </span>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <MatrixPanel
          order={result.order}
          frame={frame}
          className="min-h-[360px]"
        />
        <CodePanel
          code={trace.code}
          activeLines={frame.lines}
          contextLines={frame.contextLines}
          className="min-h-[360px]"
        />
        <GraphView
          graph={graph}
          positions={positions}
          frame={frame}
          order={result.order}
          className="min-h-[360px]"
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <RelaxationLog
          order={result.order}
          relaxations={relaxations}
          onSeek={(i) => player.dispatch({ type: "seek", index: i })}
          className="lg:col-span-2"
        />
        <div className="flex flex-col gap-3">
          <ResultCard result={result} />
          <PathExplorer result={result} />
        </div>
      </div>
    </div>
  )
}

function ResultCard({ result }: { result: FwResult }) {
  return (
    <Card>
      <CardContent className="space-y-1 py-4 text-sm">
        <div className="text-muted-foreground">Підсумок</div>
        {result.hasNegativeCycle ? (
          <div className="flex items-center gap-1.5 text-lg font-semibold text-destructive">
            <AlertTriangle className="size-5" /> Від'ємний цикл
          </div>
        ) : (
          <div className="text-lg font-semibold">
            Найкоротші відстані між усіма парами знайдено
          </div>
        )}
        <div>
          {result.order.length} вершин · {result.improvedCount} релаксацій
        </div>
      </CardContent>
    </Card>
  )
}
