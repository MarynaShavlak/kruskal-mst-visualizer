import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { buildPrimTrace } from "@/lib/primTrace"
import type { Translate } from "@/lib/translate"
import type { MessageKey } from "@/i18n/messages"
import { usePrimGraphStore } from "@/store/prim-graph-store"
import { useLangStore } from "@/store/lang-store"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { PlayerShell } from "@/algorithms/shared/playback/PlayerShell"
import { LiveComplexity } from "@/algorithms/shared/playback/LiveComplexity"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { useT } from "@/i18n/use-t"
import { GraphView } from "@/algorithms/prim/playback/GraphView"
import { QueuePanel } from "@/algorithms/prim/playback/QueuePanel"
import { MstEdgesPanel } from "@/algorithms/prim/playback/MstEdgesPanel"

export function PlaybackView() {
  const graph = usePrimGraphStore((s) => s.graph)
  const positions = usePrimGraphStore((s) => s.positions)
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)

  // Нарація перебудовується при зміні мови; resetKey плеєра — граф, тож курсор
  // не скидається при перемиканні UA/EN.
  const { trace, result } = useMemo(
    () => buildPrimTrace(graph, undefined, tr),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [graph, lang],
  )
  const player = usePlayer(trace.frames.length, graph)
  const index = Math.min(player.index, trace.frames.length - 1)
  const frame = trace.frames[index]

  // Жива складність (лічильник — зняття з купи ≈ опрацьовані ребра): орієнтир —
  // РОЗРІДЖЕНИЙ граф (E ≈ V−1, дерево), права межа — ЩІЛЬНИЙ (повний граф,
  // E ≈ V(V−1)/2). Кожне зняття коштує ще й O(log V) у купі → разом O(E·log V).
  const vCount = result.vertexCount
  const refPops = Math.max(1, vCount - 1)
  const worstPops = Math.max(refPops, (vCount * (vCount - 1)) / 2)
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

  return (
    <PlayerShell
      player={player}
      caption={frame.caption}
      statsBar={
        <>
          <div className="flex flex-wrap gap-x-4 gap-y-1 rounded-md border bg-card px-3 py-2 text-xs">
            <span>
              <b>{t("play.primTreeSize")}</b>{" "}
              <span className="tabular-nums">
                {frame.visited.length}/{result.vertexCount}
              </span>
            </span>
            <span>
              <b>{t("play.primQueueSize")}</b>{" "}
              <span className="tabular-nums">{frame.queue.length}</span>
            </span>
            <span>
              <b>{t("play.primPoppedCount")}</b>{" "}
              <span className="tabular-nums">{frame.step}</span>
            </span>
          </div>
          <LiveComplexity
            title={t("play.primLcTitle")}
            n={vCount}
            unit={t("play.primLcUnit")}
            actual={frame.step}
            actualLabel={t("play.primLcActual")}
            reference={{
              value: refPops,
              cls: "O(V)",
              name: t("play.primLcSparse"),
              formula: `V−1 = ${refPops}`,
            }}
            worst={{
              value: worstPops,
              cls: "O(V²)",
              name: t("play.primLcDense"),
              formula: `V(V−1)/2 = ${worstPops}`,
            }}
            verdict={
              atEnd
                ? frame.step <= refPops * 2
                  ? t("play.primLcVerdictGood")
                  : frame.step >= worstPops * 0.7
                    ? t("play.primLcVerdictBad")
                    : t("play.primLcVerdictMid")
                : undefined
            }
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
            title={t("play.primCode")}
            activeLines={frame.lines}
            contextLines={frame.contextLines}
            className="min-h-[360px]"
          />
          <QueuePanel frame={frame} className="min-h-[360px]" />
        </>
      }
      secondRow={
        <>
          <MstEdgesPanel
            graph={graph}
            frame={frame}
            result={result}
            className="lg:col-span-2"
          />
          <ResultCard
            spanning={result.isSpanning}
            weight={result.totalWeight}
            popped={result.poppedCount}
            stale={result.staleCount}
          />
        </>
      }
    />
  )
}

function ResultCard({
  spanning,
  weight,
  popped,
  stale,
}: {
  spanning: boolean
  weight: number
  popped: number
  stale: number
}) {
  const t = useT()
  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-3 text-sm">
      <div className="text-sm font-medium">{t("play.summary")}</div>
      <Row label={t("play.mstWeight")} value={weight} />
      <Row label={t("play.primPoppedCount")} value={popped} />
      <Row label={t("play.primStaleCount")} value={stale} />
      <div className="mt-1 rounded-md bg-primary/10 px-2 py-1.5 text-xs">
        {spanning ? t("play.spanningTree") : t("play.spanningForest")}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  )
}
