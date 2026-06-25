import { GraphEditorScreen } from "@/algorithms/shared/editor/GraphEditorScreen"
import { undirectedGraphCodec } from "@/algorithms/shared/editor/undirected-codec"
import { useDijkstraGraphStore } from "@/store/dijkstra-graph-store"

/** Редактор графа для Дейкстри — спільний екран редактора + Дейкстра-стор (ваги ребер). */
export function EditorView() {
  return (
    <GraphEditorScreen
      useStore={useDijkstraGraphStore}
      codec={undirectedGraphCodec}
      exportFilename="dijkstra-graph.json"
      routePath="dijkstra/editor"
    />
  )
}
