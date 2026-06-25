import { GraphEditorScreen } from "@/algorithms/shared/editor/GraphEditorScreen"
import { undirectedGraphCodec } from "@/algorithms/shared/editor/undirected-codec"
import { useBfsGraphStore } from "@/store/bfs-graph-store"

/** Редактор графа для BFS — спільний екран редактора + BFS-стор. */
export function EditorView() {
  return (
    <GraphEditorScreen
      useStore={useBfsGraphStore}
      codec={undirectedGraphCodec}
      exportFilename="bfs-graph.json"
      routePath="bfs/editor"
    />
  )
}
