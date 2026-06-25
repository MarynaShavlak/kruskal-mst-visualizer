import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { buildDijkstraTrace } from "@/lib/dijkstra"
import { useDijkstraGraphStore } from "@/store/dijkstra-graph-store"
import { useLangStore } from "@/store/lang-store"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { PlayerShell } from "@/algorithms/shared/playback/PlayerShell"
import { LiveComplexity } from "@/algorithms/shared/playback/LiveComplexity"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { useT, useTr } from "@/i18n/use-t"
import { GraphView } from "@/algorithms/dijkstra/playback/GraphView"
import { DistanceTablePanel } from "@/algorithms/dijkstra/playback/DistanceTablePanel"

const fmtDist = (d: number): string => (d === Infinity ? "∞" : String(d))

export function PlaybackView() {
  const graph = useDijkstraGraphStore((s) => s.graph)
  const positions = useDijkstraGraphStore((s) => s.positions)
  const t = useT()
  const tr = useTr()
  const lang = useLangStore((s) => s.lang)

  const { trace, result } = useMemo(
    () => buildDijkstraTrace(graph, undefined, tr),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [graph, lang],
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

  // Жива складність: проста Дейкстра витрачає O(V²) порівнянь на лінійний вибір
  // мінімуму. Після опрацювання k вершин сумарно зроблено k·V − k(k−1)/2 порівнянь.
  const v = result.vertexCount
  const k = frame.visited.length
  const comparisons = k * v - (k * (k - 1)) / 2
  const worstCmp = (v * (v + 1)) / 2

  return (
    <PlayerShell
      player={player}
      caption={frame.caption}
      statsBar={
        <>
          <div className="flex flex-wrap gap-x-4 gap-y-1 rounded-md border bg-card px-3 py-2 text-xs">
            <span>
              <b>{t("play.dijkSettledCount")}</b>{" "}
              <span className="tabular-nums">
                {frame.visited.length}/{v}
              </span>
            </span>
            <span>
              <b>{t("play.dijkStepCount")}</b>{" "}
              <span className="tabular-nums">{frame.step}</span>
            </span>
            {frame.current && (
              <span>
                <b>{t("play.dijkCurrent")}</b>{" "}
                <span className="font-mono">{frame.current}</span>
              </span>
            )}
          </div>
          <LiveComplexity
            title={t("play.lcTitle")}
            n={v}
            unit={t("play.dijkLcUnit")}
            actual={comparisons}
            actualLabel={t("play.lcActual")}
            reference={{
              value: v,
              cls: "O(V)",
              name: t("play.dijkLcPick"),
              formula: `V = ${v}`,
            }}
            worst={{
              value: worstCmp,
              cls: "O(V²)",
              name: t("play.dijkLcLinear"),
              formula: `V(V+1)/2 = ${worstCmp}`,
            }}
            verdict={atEnd ? t("play.dijkLcVerdict") : undefined}
          />
        </>
      }
      panels={
        <>
          <GraphView
            graph={graph}
            positions={positions}
            frame={frame}
            className="min-h-[380px]"
          />
          <CodePanel
            code={trace.code}
            title={t("play.dijkCode")}
            activeLines={frame.lines}
            contextLines={frame.contextLines}
            className="min-h-[380px]"
          />
          <DistanceTablePanel
            graph={graph}
            frame={frame}
            className="min-h-[380px]"
          />
        </>
      }
      secondRow={
        <ResultCard
          start={result.start}
          distances={result.distances}
          reached={result.reachedCount}
          total={result.vertexCount}
          relaxations={result.relaxations}
        />
      }
    />
  )
}

function ResultCard({
  start,
  distances,
  reached,
  total,
  relaxations,
}: {
  start: string
  distances: Record<string, number>
  reached: number
  total: number
  relaxations: number
}) {
  const t = useT()
  const entries = Object.keys(distances)
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
    .map((vx) => ({ v: vx, d: distances[vx] }))
  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-3 text-sm lg:col-span-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium">
          {t("play.dijkResultTitle", { start })}
        </span>
        <span className="text-xs text-muted-foreground">
          {t("play.dijkReached")}{" "}
          <span className="tabular-nums">
            {reached}/{total}
          </span>
          {" · "}
          {t("play.dijkRelaxations")}{" "}
          <span className="tabular-nums">{relaxations}</span>
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {entries.map(({ v, d }) => (
          <span
            key={v}
            className="inline-flex items-center gap-1.5 rounded-md border bg-muted/40 px-2 py-1 text-xs"
          >
            <span className="font-semibold">{v}</span>
            <span className="font-mono tabular-nums">{fmtDist(d)}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
