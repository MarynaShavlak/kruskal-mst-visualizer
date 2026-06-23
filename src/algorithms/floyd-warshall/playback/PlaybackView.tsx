import { useMemo } from "react"
import { AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import {
  buildFloydWarshallTrace,
  type FwResult,
} from "@/lib/floydWarshallTrace"
import type { Translate } from "@/lib/translate"
import type { MessageKey } from "@/i18n/messages"
import { useDirectedGraphStore } from "@/store/directed-graph-store"
import { useLangStore } from "@/store/lang-store"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { PlayerShell } from "@/algorithms/shared/playback/PlayerShell"
import { LiveComplexity } from "@/algorithms/shared/playback/LiveComplexity"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { useT } from "@/i18n/use-t"
import { GraphView } from "@/algorithms/floyd-warshall/playback/GraphView"
import { relaxationsUpTo } from "@/algorithms/floyd-warshall/playback/highlight"
import { MatrixPanel } from "@/algorithms/floyd-warshall/playback/MatrixPanel"
import { PathExplorer } from "@/algorithms/floyd-warshall/playback/PathExplorer"
import { RelaxationLog } from "@/algorithms/floyd-warshall/playback/RelaxationLog"

export function PlaybackView() {
  const graph = useDirectedGraphStore((s) => s.graph)
  const positions = useDirectedGraphStore((s) => s.positions)
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)

  // Нарація перебудовується при зміні мови; resetKey плеєра — граф, тож курсор
  // не скидається при перемиканні UA/EN.
  const { trace, result } = useMemo(
    () => buildFloydWarshallTrace(graph, tr),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [graph, lang],
  )
  const player = usePlayer(trace.frames.length, graph)
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
          {t("play.emptyGraph")}
        </CardContent>
      </Card>
    )
  }

  const kLabel = frame.k !== null ? result.order[frame.k] : "—"

  // Жива складність (лічильник — спроби релаксації (i,j,k)): Флойд ЗАВЖДИ робить V³ —
  // потрійний цикл без раннього виходу, незалежно від ребер. Орієнтир — ОДИН шар k
  // (прохід матриці V×V = V²); права межа — куб V³ (усі V шарів). Лічимо за шарами.
  const vCount = result.order.length
  const layerCost = vCount * vCount
  const cubeCost = layerCost * vCount
  const atEnd = index === trace.frames.length - 1
  // frame.k === null і на СТАРТІ (ще не обрано k), і на фініші. Розрізняємо: старт → 0
  // спроб, фініш → повний куб V³; під час шару k завершено k·V² спроб.
  const attemptsSoFar =
    frame.k === null ? (atEnd ? cubeCost : 0) : frame.k * layerCost

  return (
    <PlayerShell
      player={player}
      caption={frame.caption}
      captionBadge={
        frame.negativeCycle && (
          <span className="ml-2 inline-flex items-center gap-1 rounded bg-destructive/10 px-1.5 py-0.5 text-xs font-medium text-destructive">
            <AlertTriangle className="size-3.5" /> {t("play.negCycle")}
          </span>
        )
      }
      statsBar={
        <>
          <div className="flex flex-wrap gap-x-4 gap-y-1 rounded-md border bg-card px-3 py-2 text-xs">
            <span>
              <b>{t("play.intermediateK")}</b>{" "}
              <span className="tabular-nums">{kLabel}</span>
            </span>
            <span>
              <b>{t("play.relaxTotal")}</b>{" "}
              <span className="tabular-nums">{relaxations.length}</span>
            </span>
            <span>
              <b>{t("play.improvedThisK")}</b>{" "}
              <span className="tabular-nums">{frame.improvedThisK.length}</span>
            </span>
          </div>
          <LiveComplexity
            title={t("play.fwLcTitle")}
            n={vCount}
            unit={t("play.fwLcUnit")}
            actual={attemptsSoFar}
            actualLabel={t("play.fwLcActual")}
            reference={{
              value: layerCost,
              cls: "O(V²)",
              name: t("play.fwLcLayer"),
              formula: `V² = ${layerCost}`,
            }}
            worst={{
              value: cubeCost,
              cls: "O(V³)",
              name: t("play.fwLcCube"),
              formula: `V³ = ${cubeCost}`,
            }}
            verdict={
              atEnd
                ? t("play.fwLcVerdict", {
                    improved: result.improvedCount,
                    total: cubeCost,
                  })
                : undefined
            }
          />
        </>
      }
      panels={
        <>
          <MatrixPanel
            order={result.order}
            frame={frame}
            className="min-h-[360px]"
          />
          <CodePanel
            code={trace.code}
            title={t("play.codeFw")}
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
        </>
      }
      secondRow={
        <>
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
        </>
      }
    />
  )
}

function ResultCard({ result }: { result: FwResult }) {
  const t = useT()
  return (
    <Card>
      <CardContent className="space-y-1 py-4 text-sm">
        <div className="text-muted-foreground">{t("play.summary")}</div>
        {result.hasNegativeCycle ? (
          <div className="flex items-center gap-1.5 text-lg font-semibold text-destructive">
            <AlertTriangle className="size-5" /> {t("play.fwNegCycleCap")}
          </div>
        ) : (
          <div className="text-lg font-semibold">{t("play.fwAllPairs")}</div>
        )}
        <div>
          {t("play.fwResultStats", {
            n: result.order.length,
            m: result.improvedCount,
          })}
        </div>
      </CardContent>
    </Card>
  )
}
