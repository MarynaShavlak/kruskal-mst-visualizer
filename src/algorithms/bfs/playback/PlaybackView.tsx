import { TraversalPlayback } from "@/algorithms/shared/traversal/TraversalPlayback"
import { useBfsGraphStore } from "@/store/bfs-graph-store"

/** Плеєр BFS — спільний плеєр обходу зі стратегією «черга». */
export function PlaybackView() {
  const graph = useBfsGraphStore((s) => s.graph)
  const positions = useBfsGraphStore((s) => s.positions)
  return <TraversalPlayback graph={graph} positions={positions} strategy="bfs" />
}
