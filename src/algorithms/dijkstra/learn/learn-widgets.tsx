// Живі віджети навчальної вкладки Дейкстри. Будуються з реального trace
// (buildDijkstraTrace) на демо-графах і перевикористовують панелі плеєра
// (GraphView/DistanceTablePanel/CodePanel) у спільному MiniPlayerShell.

import { useMemo } from "react"
import { buildDijkstraTrace, type DijkstraTrace } from "@/lib/dijkstra"
import type { Graph } from "@/lib/graph"
import type { Translate } from "@/lib/translate"
import type { MessageKey } from "@/i18n/messages"
import { GraphView } from "@/algorithms/dijkstra/playback/GraphView"
import { DistanceTablePanel } from "@/algorithms/dijkstra/playback/DistanceTablePanel"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { MiniPlayerShell } from "@/algorithms/shared/learn/MiniPlayerShell"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { useT } from "@/i18n/use-t"
import { useLangStore } from "@/store/lang-store"
import { dijkDemo, type DijkDemo } from "@/algorithms/dijkstra/learn/learn-data"

function useTrace(graph: Graph): DijkstraTrace {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)
  return useMemo(
    () => buildDijkstraTrace(graph, undefined, tr).trace,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [graph, lang],
  )
}

/**
 * Інтерактивний міні-плеєр Дейкстри. `variant="full"` — граф + код + таблиця
 * відстаней; `variant="compact"` — граф + таблиця (для випадків/корнер-кейсів).
 */
export function DijkstraWalkthrough({
  demo,
  variant = "full",
}: {
  demo: DijkDemo
  variant?: "full" | "compact"
}) {
  const { graph, positions } = dijkDemo(demo)
  const trace = useTrace(graph)
  const t = useT()
  const player = usePlayer(trace.frames.length, trace)
  const frame = trace.frames[Math.min(player.index, trace.frames.length - 1)]

  return (
    <MiniPlayerShell
      player={player}
      frameCount={trace.frames.length}
      caption={frame.caption}
    >
      <span
        className={
          variant === "full"
            ? "grid gap-3 lg:grid-cols-3"
            : "grid gap-3 sm:grid-cols-2"
        }
      >
        <GraphView
          graph={graph}
          positions={positions}
          frame={frame}
          className="h-[280px]"
        />
        {variant === "full" && (
          <CodePanel
            code={trace.code}
            title={t("play.dijkCode")}
            activeLines={frame.lines}
            contextLines={frame.contextLines}
            className="h-[280px]"
          />
        )}
        <DistanceTablePanel graph={graph} frame={frame} className="h-[280px]" />
      </span>
    </MiniPlayerShell>
  )
}
