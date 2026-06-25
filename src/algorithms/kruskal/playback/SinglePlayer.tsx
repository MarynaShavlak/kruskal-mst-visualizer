import { useMemo, type ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import type { Graph, Vertex } from "@/lib/graph"
import type { Frame, KruskalRun, MstResult } from "@/lib/trace"
import type { XY } from "@/store/graph-store"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { PlayerShell } from "@/algorithms/shared/playback/PlayerShell"
import { LiveComplexity } from "@/algorithms/shared/playback/LiveComplexity"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { PredictToggle } from "@/algorithms/shared/playback/PredictToggle"
import { PredictOverlay } from "@/algorithms/shared/playback/PredictOverlay"
import { usePredict } from "@/algorithms/shared/playback/use-predict"
import { kruskalPredictAdapter } from "@/algorithms/shared/playback/predict"
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
  // resetKey = граф (стабільний при зміні мови) — перебудова trace для іншої
  // мови не скидає курсор; зміна графа — скидає.
  const player = usePlayer(trace.frames.length, graph)
  const index = Math.min(player.index, trace.frames.length - 1)
  const frame = trace.frames[index]
  const t = useT()

  // «Вгадай рішення»: на кадрі-`consider` (decision=null) питаємо «додати/відхилити»;
  // правильну відповідь адаптер дістає СКАНОМ УПЕРЕД на той самий consideredEdgeId.
  const predict = usePredict(player, kruskalPredictAdapter(trace.frames, index))

  const firstFrameOfEdge = useMemo(() => {
    const map = new Map<string, number>()
    trace.frames.forEach((f, i) => {
      if (f.consideredEdgeId && !map.has(f.consideredEdgeId)) {
        map.set(f.consideredEdgeId, i)
      }
    })
    return map
  }, [trace])

  // Жива складність DSU (лічильник — find-кроки): орієнтир — ОПТИМІЗОВАНИЙ DSU
  // (стиснення шляху + ранг роблять find майже O(1) → ~2 finds на ребро ≈ 2·E);
  // права межа — вироджений ЛАНЦЮГ без оптимізацій (find іде до V−1) → 2·E·(V−1).
  const vCount = graph.vertices.length
  const eCount = graph.edges.length
  const refSteps = Math.max(1, 2 * eCount)
  const worstSteps = Math.max(refSteps, 2 * eCount * Math.max(1, vCount - 1))

  return (
    <PlayerShell
      player={player}
      caption={frame.caption}
      headerExtra={
        <div className="flex flex-col gap-2">
          {headerExtra}
          <PredictToggle />
        </div>
      }
      predictSlot={<PredictOverlay controller={predict} />}
      statsBar={
        frame.dsuStats && (
          <>
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
            <LiveComplexity
              title={t("play.lcTitle")}
              n={vCount}
              unit={t("play.krLcUnit")}
              actual={frame.dsuStats.findSteps}
              actualLabel={t("play.lcActual")}
              reference={{
                value: refSteps,
                cls: "O(E·α)",
                name: t("play.krLcOpt"),
                formula: `2·E = ${refSteps}`,
              }}
              worst={{
                value: worstSteps,
                cls: "O(E·V)",
                name: t("play.krLcChain"),
                formula: `2·E·(V−1) = ${worstSteps}`,
              }}
              verdict={
                frame.sub.kind === "done"
                  ? frame.dsuStats.findSteps <= refSteps * 1.5
                    ? t("play.krLcVerdictGood")
                    : frame.dsuStats.findSteps >= worstSteps * 0.5
                      ? t("play.krLcVerdictBad")
                      : t("play.krLcVerdictMid")
                  : undefined
              }
            />
          </>
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
