import "@xyflow/react/dist/style.css"
import { useCallback, useEffect, useRef } from "react"
import {
  Background,
  ConnectionMode,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  type Connection,
  type Edge,
  type NodeTypes,
} from "@xyflow/react"
import {
  BookOpen,
  Download,
  Plus,
  Share2,
  Shuffle,
  Trash2,
  Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConnectivityPanel } from "@/algorithms/kruskal/editor/ConnectivityPanel"
import { codec } from "@/algorithms/kruskal/editor/graph-doc"
import { VertexNode } from "@/algorithms/kruskal/editor/VertexNode"
import { useWeightPrompt, WeightDialog } from "@/algorithms/kruskal/editor/WeightDialog"
import { useGraphEditor } from "@/algorithms/shared/editor/use-graph-editor"
import { useGraphStore } from "@/store/graph-store"
import { useThemeStore } from "@/store/theme-store"
import type { Graph } from "@/lib/graph"

const nodeTypes: NodeTypes = { vertex: VertexNode }

export function EditorView() {
  return (
    <ReactFlowProvider>
      <EditorCanvas />
    </ReactFlowProvider>
  )
}

function EditorCanvas() {
  const graph = useGraphStore((s) => s.graph)
  const positions = useGraphStore((s) => s.positions)
  const addVertexAt = useGraphStore((s) => s.addVertexAt)
  const connect = useGraphStore((s) => s.connect)
  const setEdgeWeight = useGraphStore((s) => s.setEdgeWeight)
  const moveVertex = useGraphStore((s) => s.moveVertex)
  const removeVertex = useGraphStore((s) => s.removeVertex)
  const removeEdge = useGraphStore((s) => s.removeEdge)
  const clear = useGraphStore((s) => s.clear)
  const loadExample = useGraphStore((s) => s.loadExample)
  const loadRandom = useGraphStore((s) => s.loadRandom)
  const loadDoc = useGraphStore((s) => s.loadDoc)
  const toDoc = useGraphStore((s) => s.toDoc)

  const isDark = useThemeStore((s) => s.isDark)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { promptWeight, dialogProps } = useWeightPrompt()

  const ctrl = useGraphEditor<Edge, Graph>({
    graph,
    positions,
    addVertexAt,
    setEdgeWeight,
    moveVertex,
    removeVertex,
    removeEdge,
    loadDoc,
    toDoc,
    codec,
    promptWeight,
    exportFilename: "kruskal-graph.json",
    routePath: "kruskal/editor",
  })
  const { setRfEdges } = ctrl

  // Синк ребер зі стором — прямі лінії з підписом ваги (специфіка Краскала).
  useEffect(() => {
    setRfEdges(
      graph.edges.map((e) => ({
        id: e.id,
        source: e.u,
        target: e.v,
        type: "straight",
        label: String(e.weight),
        data: { weight: e.weight },
      })),
    )
  }, [graph.edges, setRfEdges])

  const onConnect = useCallback(
    async (conn: Connection) => {
      if (!conn.source || !conn.target) return
      const w = await promptWeight()
      if (w !== null) connect(conn.source, conn.target, w)
    },
    [connect, promptWeight],
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={loadExample}>
          <BookOpen /> Приклад
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => loadRandom(Math.floor(Math.random() * 1e9))}
        >
          <Shuffle /> Випадковий
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onAddVertex}>
          <Plus /> Вершина
        </Button>
        <Button size="sm" variant="outline" onClick={clear}>
          <Trash2 /> Очистити
        </Button>
        <div className="mx-1 h-5 w-px bg-border" />
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload /> Імпорт
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onExport}>
          <Download /> Експорт
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onShare}>
          <Share2 /> Поділитися
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={ctrl.onImportFile}
        />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row">
        <div
          className="h-[600px] flex-1 overflow-hidden rounded-lg border bg-muted/20"
          onDoubleClick={ctrl.onPaneDoubleClick}
        >
          <ReactFlow
            nodes={ctrl.rfNodes}
            edges={ctrl.rfEdges}
            nodeTypes={nodeTypes}
            onNodesChange={ctrl.onNodesChange}
            onEdgesChange={ctrl.onEdgesChange}
            onConnect={onConnect}
            onNodeDragStop={ctrl.onNodeDragStop}
            onEdgeDoubleClick={ctrl.onEdgeDoubleClick}
            connectionMode={ConnectionMode.Loose}
            deleteKeyCode={["Delete", "Backspace"]}
            zoomOnDoubleClick={false}
            colorMode={isDark ? "dark" : "light"}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
        <ConnectivityPanel className="lg:w-72" />
      </div>

      <p className="text-xs text-muted-foreground">
        Подвійний клік по полю — додати вершину; перетягни від вузла до вузла —
        ребро (із запитом ваги); подвійний клік по ребру — змінити вагу; Delete —
        видалити виділене.
      </p>

      <WeightDialog {...dialogProps} />
    </div>
  )
}
