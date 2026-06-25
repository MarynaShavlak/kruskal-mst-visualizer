import { TraversalPlayback } from "@/algorithms/shared/traversal/TraversalPlayback"
import { useDfsGraphStore } from "@/store/dfs-graph-store"

/** Плеєр DFS — спільний плеєр обходу зі стратегією «стек». */
export function PlaybackView() {
  const graph = useDfsGraphStore((s) => s.graph)
  const positions = useDfsGraphStore((s) => s.positions)
  return <TraversalPlayback graph={graph} positions={positions} strategy="dfs" />
}
