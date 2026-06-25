// Живі віджети навчальних вкладок BFS/DFS. Усе будується з реального trace
// (buildTraversalTrace) на демо-графах, тож «картинки» завжди узгоджені з кодом.
// Покрокові віджети перевикористовують панелі плеєра (GraphView/FrontierPanel/
// CodePanel) і спільний MiniPlayerShell; порівняння BFS↔DFS — власний степер.

import { useMemo, useState, type ReactNode } from "react"
import { StepBack, StepForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  buildTraversalTrace,
  type TraversalFrame,
  type TraversalStrategy,
  type TraversalTrace,
} from "@/lib/graphTraversal"
import type { Graph, Vertex } from "@/lib/graph"
import type { Translate } from "@/lib/translate"
import type { MessageKey } from "@/i18n/messages"
import { cn } from "@/lib/utils"
import { GraphView } from "@/algorithms/shared/traversal/GraphView"
import {
  FrontierPanel,
  VisitOrderPanel,
} from "@/algorithms/shared/traversal/FrontierPanel"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { MiniPlayerShell } from "@/algorithms/shared/learn/MiniPlayerShell"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { useT } from "@/i18n/use-t"
import { useLangStore } from "@/store/lang-store"
import { travDemo, type TravDemo } from "@/algorithms/shared/traversal/learn-data"

/** Обгортка фігури в потоці markdown. */
function FigureBox({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn("not-prose my-4 block rounded-lg border bg-card p-3", className)}
    >
      {children}
    </span>
  )
}

/** Двомовний текст без походу в messages (внутрішні підписи віджетів). */
function useL(): (ua: string, en: string) => string {
  const lang = useLangStore((s) => s.lang)
  return (ua, en) => (lang === "ua" ? ua : en)
}

function useTrace(graph: Graph, strategy: TraversalStrategy): TraversalTrace {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)
  return useMemo(
    () => buildTraversalTrace(graph, strategy, undefined, tr).trace,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [graph, strategy, lang],
  )
}

/**
 * Інтерактивний міні-плеєр обходу. `variant="full"` — граф + код + фронтир +
 * порядок; `variant="compact"` — лише граф + порядок (для випадків/корнер-кейсів).
 */
export function TraversalWalkthrough({
  demo,
  strategy,
  variant = "full",
}: {
  demo: TravDemo
  strategy: TraversalStrategy
  variant?: "full" | "compact"
}) {
  const { graph, positions } = travDemo(demo)
  const trace = useTrace(graph, strategy)
  const t = useT()
  const player = usePlayer(trace.frames.length, trace)
  const frame = trace.frames[Math.min(player.index, trace.frames.length - 1)]

  return (
    <MiniPlayerShell
      player={player}
      frameCount={trace.frames.length}
      caption={frame.caption}
    >
      {variant === "full" ? (
        <>
          <span className="grid gap-3 lg:grid-cols-2">
            <GraphView
              graph={graph}
              positions={positions}
              frame={frame}
              className="h-[260px]"
            />
            <CodePanel
              code={trace.code}
              title={strategy === "bfs" ? t("play.travCodeBfs") : t("play.travCodeDfs")}
              activeLines={frame.lines}
              contextLines={frame.contextLines}
              className="h-[260px]"
            />
          </span>
          <span className="mt-3 grid gap-3 sm:grid-cols-2">
            <FrontierPanel frame={frame} className="h-[120px]" />
            <VisitOrderPanel frame={frame} className="h-[120px]" />
          </span>
        </>
      ) : (
        <span className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <GraphView
            graph={graph}
            positions={positions}
            frame={frame}
            className="h-[240px]"
          />
          <span className="flex flex-col gap-3">
            <FrontierPanel frame={frame} className="h-[112px]" />
            <VisitOrderPanel frame={frame} className="h-[112px]" />
          </span>
        </span>
      )}
    </MiniPlayerShell>
  )
}

/** Кадри обходу, проіндексовані за кількістю відвіданих вершин (0 = старт). */
function visitFramesByK(trace: TraversalTrace): TraversalFrame[] {
  const byK: TraversalFrame[] = [trace.frames[0]]
  for (const f of trace.frames) {
    if (f.sub === "visit") byK[f.order.length] = f
  }
  return byK
}

function OrderChips({
  order,
  className,
}: {
  order: readonly Vertex[]
  className?: string
}) {
  return (
    <span className={cn("flex flex-wrap items-center gap-1", className)}>
      {order.length === 0 ? (
        <span className="text-xs text-muted-foreground">—</span>
      ) : (
        order.map((v, i) => (
          <span key={`${v}:${i}`} className="flex items-center gap-1">
            <span className="inline-flex size-6 items-center justify-center rounded-full border border-emerald-500 bg-emerald-500/15 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              {v}
            </span>
            {i < order.length - 1 && (
              <span className="text-muted-foreground">→</span>
            )}
          </span>
        ))
      )}
    </span>
  )
}

/**
 * Порівняння BFS ↔ DFS на ОДНОМУ графі: спільний степер за кількістю відвіданих
 * вершин. Видно, як BFS розходиться рівнями (вшир), а DFS занурюється гілкою (вглиб).
 */
export function TraversalCompareWidget({ demo = "main" }: { demo?: TravDemo }) {
  const { graph, positions } = travDemo(demo)
  const L = useL()
  const bfs = useTrace(graph, "bfs")
  const dfs = useTrace(graph, "dfs")
  const bfsByK = useMemo(() => visitFramesByK(bfs), [bfs])
  const dfsByK = useMemo(() => visitFramesByK(dfs), [dfs])
  const n = Math.max(bfsByK.length, dfsByK.length) - 1
  const [k, setK] = useState(0)

  const bf = bfsByK[Math.min(k, bfsByK.length - 1)]
  const df = dfsByK[Math.min(k, dfsByK.length - 1)]

  return (
    <FigureBox>
      <span className="mb-2 flex flex-wrap items-center gap-2">
        <Button
          size="icon-sm"
          variant="outline"
          onClick={() => setK((x) => Math.max(0, x - 1))}
          disabled={k <= 0}
        >
          <StepBack />
        </Button>
        <Button
          size="icon-sm"
          variant="outline"
          onClick={() => setK((x) => Math.min(n, x + 1))}
          disabled={k >= n}
        >
          <StepForward />
        </Button>
        <span className="text-xs tabular-nums text-muted-foreground">
          {L("відвідано", "visited")} {k}/{n}
        </span>
      </span>
      <span className="mb-3 block text-xs text-muted-foreground">
        {L(
          "Той самий граф, два обходи. BFS розходиться рівнями (вшир) — дерево «кущисте»; DFS занурюється однією гілкою до кінця (вглиб) — дерево «довге».",
          "The same graph, two traversals. BFS spreads level by level (wide) — a bushy tree; DFS dives down one branch to the end (deep) — a long tree.",
        )}
      </span>
      <span className="grid gap-3 sm:grid-cols-2">
        <span className="block">
          <GraphView
            graph={graph}
            positions={positions}
            frame={bf}
            title="BFS"
            className="h-[240px]"
          />
          <OrderChips order={bf.order} className="mt-2" />
        </span>
        <span className="block">
          <GraphView
            graph={graph}
            positions={positions}
            frame={df}
            title="DFS"
            className="h-[240px]"
          />
          <OrderChips order={df.order} className="mt-2" />
        </span>
      </span>
    </FigureBox>
  )
}
