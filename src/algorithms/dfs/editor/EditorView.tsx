import { GraphEditorScreen } from "@/algorithms/shared/editor/GraphEditorScreen"
import { undirectedGraphCodec } from "@/algorithms/shared/editor/undirected-codec"
import { useDfsGraphStore } from "@/store/dfs-graph-store"

/** Редактор графа для DFS — спільний екран редактора + DFS-стор. */
export function EditorView() {
  return (
    <GraphEditorScreen
      useStore={useDfsGraphStore}
      codec={undirectedGraphCodec}
      exportFilename="dfs-graph.json"
      routePath="dfs/editor"
    />
  )
}
