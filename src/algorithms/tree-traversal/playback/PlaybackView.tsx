// Плеєр обходу дерева: будує trace (buildTreeTraversalTrace) для вибраного порядку й
// рухає курсор по кадрах (виклик → відвідування → база → повернення). Розкладка як у
// hash-table/radix: код + сигнатурне SVG-дерево у першому ряду, стек рекурсії + вивід —
// другим рядом. Перемикач — порядок обходу (прямий / центровий / зворотний): той самий
// вхід, різний МОМЕНТ відвідування кореня → різна послідовність.

import { useMemo } from "react"
import { buildTree, type TraversalOrder } from "@/lib/treeTraversal"
import { buildTreeTraversalTrace } from "@/lib/treeTraversalTrace"
import { useTreeTraversalStore } from "@/store/tree-traversal-store"
import { treeTraversalCodec } from "@/algorithms/tree-traversal/editor/tree-traversal-doc"
import { usePlaybackDeeplink } from "@/algorithms/shared/playback/use-playback-deeplink"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { PlayerShell } from "@/algorithms/shared/playback/PlayerShell"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { StatsBar, Stat } from "@/algorithms/shared/playback/Stats"
import { LiveComplexity } from "@/algorithms/shared/playback/LiveComplexity"
import { ModeSwitch } from "@/algorithms/shared/playback/ModeSwitch"
import { useTraceRun, TraceFallback } from "@/algorithms/shared/playback/use-trace-run"
import { TreeView } from "@/algorithms/tree-traversal/playback/TreeView"
import { RecursionStackPanel } from "@/algorithms/tree-traversal/playback/RecursionStackPanel"
import { OutputPanel } from "@/algorithms/tree-traversal/playback/OutputPanel"
import { useT, useTr } from "@/i18n/use-t"
import { useLangStore } from "@/store/lang-store"

/** Стеля розміру дерева — щоб кількість кадрів не вибухала. */
const MAX_NODES = 31

const ORDER_KEYS: readonly TraversalOrder[] = ["preorder", "inorder", "postorder"]

export function PlaybackView() {
  const levels = useTreeTraversalStore((s) => s.levels)
  const order = useTreeTraversalStore((s) => s.order)
  const setOrder = useTreeTraversalStore((s) => s.setOrder)
  const loadDoc = useTreeTraversalStore((s) => s.loadDoc)
  const toDoc = useTreeTraversalStore((s) => s.toDoc)
  const t = useT()
  const tr = useTr()
  const lang = useLangStore((s) => s.lang)

  const tree = useMemo(() => buildTree(levels), [levels])
  const nodeTotal = tree.nodes.length

  const sig = `${order}|${levels.map((v) => (v === null ? "-" : v)).join(",")}`

  const run = useTraceRun(
    () => buildTreeTraversalTrace(levels, order, tr),
    { empty: tree.root === null, tooBig: nodeTotal > MAX_NODES, sig, lang },
  )

  const frameCount = run.kind === "ok" ? run.trace.frames.length : 1
  const player = usePlayer(frameCount, sig)

  usePlaybackDeeplink({
    player,
    codec: treeTraversalCodec,
    loadDoc,
    toDoc,
    mode: order,
    setMode: setOrder,
    modeKeys: ORDER_KEYS,
    routePath: "tree-traversal/playback",
  })

  const switcher = (
    <ModeSwitch
      label={t("play.btModeLabel")}
      value={order}
      onChange={setOrder}
      options={[
        { key: "preorder", label: t("play.btModePre") },
        { key: "inorder", label: t("play.btModeIn") },
        { key: "postorder", label: t("play.btModePost") },
      ]}
      wrapButtons
    />
  )

  if (run.kind !== "ok") {
    return (
      <TraceFallback
        headerExtra={switcher}
        message={run.kind === "empty" ? t("play.btEmpty") : t("play.btTooBig", { max: MAX_NODES })}
      />
    )
  }

  const { trace } = run
  const index = Math.min(player.index, trace.frames.length - 1)
  const frame = trace.frames[index]
  const nodes = trace.result.nodes

  return (
    <PlayerShell
      player={player}
      headerExtra={switcher}
      caption={frame.caption}
      statsBar={
        <>
          <StatsBar>
            <Stat label={t("play.btStatNodes")} value={String(nodes)} />
            <Stat label={t("play.btStatVisited")} value={String(frame.visits)} />
            <Stat label={t("play.btStatCalls")} value={String(frame.calls)} />
            <Stat label={t("play.btStatDepth")} value={String(frame.stack.length)} />
            <Stat label={t("play.btStatHeight")} value={String(trace.result.height)} />
          </StatsBar>
          <LiveComplexity
            title={t("play.lcTitle")}
            n={nodes}
            unit={t("play.btLcUnit")}
            actual={frame.calls}
            actualLabel={t("play.lcActual")}
            reference={{
              value: Math.max(1, nodes),
              cls: "O(n)",
              name: t("play.btLcTypical"),
              formula: `n = ${nodes}`,
            }}
            worst={{
              value: Math.max(1, 2 * nodes + 1),
              cls: "O(n)",
              name: t("play.btLcWorst"),
              formula: `2n+1 = ${2 * nodes + 1}`,
            }}
            verdict={
              frame.kind === "done"
                ? t("play.btLcVerdict", { nodes })
                : undefined
            }
          />
        </>
      }
      panels={
        <>
          <CodePanel
            title={t("play.btCodeTitle", { order: t(`play.btName_${order}`) })}
            code={trace.code}
            activeLines={frame.lines}
            contextLines={frame.contextLines}
          />
          <TreeView tree={tree} frame={frame} className="min-h-[360px] lg:col-span-2" />
        </>
      }
      secondRow={
        <>
          <RecursionStackPanel tree={tree} frame={frame} />
          <OutputPanel frame={frame} total={nodes} className="lg:col-span-2" />
        </>
      }
    />
  )
}
