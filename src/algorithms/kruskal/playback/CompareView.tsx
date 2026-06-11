import { useMemo } from "react"
import type { Graph, Vertex } from "@/lib/graph"
import type { KruskalRun } from "@/lib/trace"
import type { XY } from "@/store/graph-store"
import { DecisionTable } from "@/algorithms/kruskal/playback/DecisionTable"
import { GraphView } from "@/algorithms/kruskal/playback/GraphView"
import { PlayerControls } from "@/algorithms/shared/playback/PlayerControls"
import { ResultCard } from "@/algorithms/kruskal/playback/SinglePlayer"
import { decisionFrameIndices } from "@/algorithms/kruskal/playback/highlight"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { useT } from "@/i18n/use-t"

export function CompareView({
  graph,
  positions,
  dsuRun,
  naiveRun,
}: {
  graph: Graph
  positions: Record<Vertex, XY>
  dsuRun: KruskalRun
  naiveRun: KruskalRun
}) {
  const dsuDecisions = useMemo(() => decisionFrameIndices(dsuRun.trace), [dsuRun])
  const naiveDecisions = useMemo(
    () => decisionFrameIndices(naiveRun.trace),
    [naiveRun],
  )

  const t = useT()
  const stepCount = dsuDecisions.length + 1 // 0 = старт, далі по одному ребру
  const player = usePlayer(stepCount, dsuRun.trace)
  const step = Math.min(player.index, stepCount - 1)

  const dsuIdx = step === 0 ? 0 : (dsuDecisions[step - 1] ?? 0)
  const naiveIdx = step === 0 ? 0 : (naiveDecisions[step - 1] ?? 0)
  const dsuFrame = dsuRun.trace.frames[dsuIdx]
  const naiveFrame = naiveRun.trace.frames[naiveIdx]

  return (
    <div className="flex flex-col gap-3">
      <PlayerControls player={player} />

      <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
        {step === 0 ? (
          t("play.cmpStart")
        ) : (
          <>
            <span className="font-medium">
              {t("play.edgeStep")} {step}/{stepCount - 1}.
            </span>{" "}
            <b>DSU:</b> {dsuFrame.caption}{" "}
            <span className="text-muted-foreground">·</span>{" "}
            <b>{t("play.cmpNaive")}:</b> {naiveFrame.caption}
          </>
        )}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <GraphView
          graph={graph}
          positions={positions}
          trace={dsuRun.trace}
          frame={dsuFrame}
          title={t("play.cmpGraphDsu")}
          className="min-h-[340px]"
        />
        <GraphView
          graph={graph}
          positions={positions}
          trace={naiveRun.trace}
          frame={naiveFrame}
          title={t("play.cmpGraphNaive")}
          className="min-h-[340px]"
        />
      </div>

      <div className="rounded-md border bg-primary/5 px-3 py-2 text-center text-sm">
        {t("play.cmpNote")}
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <DecisionTable
          graph={graph}
          trace={dsuRun.trace}
          frame={dsuFrame}
          className="lg:col-span-2"
        />
        <ResultCard result={dsuRun.result} />
      </div>
    </div>
  )
}
