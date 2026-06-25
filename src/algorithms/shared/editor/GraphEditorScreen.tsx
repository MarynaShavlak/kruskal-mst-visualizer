// Спільний екран редактора неорієнтованого зваженого графа. Винесено з per-algorithm
// EditorView (Прим/Краскал ідентичні), щоб BFS/DFS/Дейкстра не дублювали ~180 рядків:
// сам стор інжектиться як хук `useStore`, решта (кодек/ім'я файлу/маршрут) — пропсами.

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
import { ConnectivityPanel } from "@/algorithms/shared/editor/ConnectivityPanel"
import { VertexNode } from "@/algorithms/shared/editor/VertexNode"
import { useWeightPrompt, WeightDialog } from "@/algorithms/shared/editor/WeightDialog"
import { EditorHelp } from "@/algorithms/shared/editor/EditorHelp"
import { useGraphEditor } from "@/algorithms/shared/editor/use-graph-editor"
import type { GraphDocCodec } from "@/algorithms/shared/editor/graph-doc"
import { useT } from "@/i18n/use-t"
import { useThemeStore } from "@/store/theme-store"
import type { GraphSearchStore } from "@/store/graph-search-store"
import type { Graph } from "@/lib/graph"

const nodeTypes: NodeTypes = { vertex: VertexNode }

export interface GraphEditorScreenProps {
  /** Zustand-хук пошукового стору (BFS/DFS/Дейкстра). */
  readonly useStore: <T>(sel: (s: GraphSearchStore) => T) => T
  readonly codec: GraphDocCodec<Graph>
  readonly exportFilename: string
  readonly routePath: string
}

export function GraphEditorScreen(props: GraphEditorScreenProps) {
  return (
    <ReactFlowProvider>
      <EditorCanvas {...props} />
    </ReactFlowProvider>
  )
}

function EditorCanvas({
  useStore,
  codec,
  exportFilename,
  routePath,
}: GraphEditorScreenProps) {
  const graph = useStore((s) => s.graph)
  const positions = useStore((s) => s.positions)
  const addVertexAt = useStore((s) => s.addVertexAt)
  const connect = useStore((s) => s.connect)
  const setEdgeWeight = useStore((s) => s.setEdgeWeight)
  const moveVertex = useStore((s) => s.moveVertex)
  const removeVertex = useStore((s) => s.removeVertex)
  const removeEdge = useStore((s) => s.removeEdge)
  const clear = useStore((s) => s.clear)
  const loadExample = useStore((s) => s.loadExample)
  const loadRandom = useStore((s) => s.loadRandom)
  const loadDoc = useStore((s) => s.loadDoc)
  const toDoc = useStore((s) => s.toDoc)

  const isDark = useThemeStore((s) => s.isDark)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { promptWeight, dialogProps } = useWeightPrompt()
  const t = useT()

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
    exportFilename,
    routePath,
  })
  const { setRfEdges } = ctrl

  // Синк ребер зі стором — прямі лінії з підписом ваги (неорієнтований граф).
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
          <BookOpen /> {t("editor.example")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => loadRandom(Math.floor(Math.random() * 1e9))}
        >
          <Shuffle /> {t("editor.random")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onAddVertex}>
          <Plus /> {t("editor.vertex")}
        </Button>
        <Button size="sm" variant="outline" onClick={clear}>
          <Trash2 /> {t("editor.clear")}
        </Button>
        <div className="mx-1 h-5 w-px bg-border" />
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload /> {t("editor.import")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onExport}>
          <Download /> {t("editor.export")}
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onShare}>
          <Share2 /> {t("editor.share")}
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
          className="h-[600px] lg:flex-1 overflow-hidden rounded-lg border bg-muted/20"
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
        <ConnectivityPanel graph={graph} className="lg:w-72" />
      </div>

      <EditorHelp
        items={[
          { action: t("editor.helpDblCanvas"), desc: t("editor.helpAddVertex") },
          { action: t("editor.helpDragNodes"), desc: t("editor.helpAddEdge") },
          { action: t("editor.helpDblEdge"), desc: t("editor.helpChangeWeight") },
          { action: "Delete", desc: t("editor.helpRemoveSelection") },
        ]}
      />

      <WeightDialog {...dialogProps} />
    </div>
  )
}
