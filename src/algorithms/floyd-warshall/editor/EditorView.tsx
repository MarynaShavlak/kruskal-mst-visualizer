import "@xyflow/react/dist/style.css"
import { useCallback, useEffect, useRef } from "react"
import {
  Background,
  ConnectionMode,
  Controls,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  type Connection,
  type EdgeTypes,
  type NodeTypes,
} from "@xyflow/react"
import {
  BookOpen,
  Download,
  Minus,
  Plus,
  Repeat,
  Share2,
  Shuffle,
  Trash2,
  Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdjacencyMatrixPanel } from "@/algorithms/floyd-warshall/editor/AdjacencyMatrixPanel"
import {
  DirectedEdge,
  type DirectedEdgeType,
} from "@/algorithms/floyd-warshall/editor/DirectedEdge"
import { DirectedVertexNode } from "@/algorithms/floyd-warshall/editor/DirectedVertexNode"
import { codec } from "@/algorithms/floyd-warshall/editor/graph-doc"
import {
  useWeightPrompt,
  WeightDialog,
} from "@/algorithms/floyd-warshall/editor/WeightDialog"
import { EditorHelp } from "@/algorithms/shared/editor/EditorHelp"
import { useGraphEditor } from "@/algorithms/shared/editor/use-graph-editor"
import { tr, useT } from "@/i18n/use-t"
import { useDirectedGraphStore } from "@/store/directed-graph-store"
import { useThemeStore } from "@/store/theme-store"
import { toast } from "@/store/toast-store"
import type { DirectedGraph } from "@/lib/directedGraph"

const nodeTypes: NodeTypes = { vertex: DirectedVertexNode }
const edgeTypes: EdgeTypes = { directed: DirectedEdge }

function edgeColor(negative: boolean, isDark: boolean): string {
  if (negative) return "#ef4444"
  return isDark ? "#94a3b8" : "#64748b"
}

export function EditorView() {
  return (
    <ReactFlowProvider>
      <EditorCanvas />
    </ReactFlowProvider>
  )
}

function EditorCanvas() {
  const graph = useDirectedGraphStore((s) => s.graph)
  const positions = useDirectedGraphStore((s) => s.positions)
  const addVertexAt = useDirectedGraphStore((s) => s.addVertexAt)
  const connect = useDirectedGraphStore((s) => s.connect)
  const setEdgeWeight = useDirectedGraphStore((s) => s.setEdgeWeight)
  const moveVertex = useDirectedGraphStore((s) => s.moveVertex)
  const removeVertex = useDirectedGraphStore((s) => s.removeVertex)
  const removeEdge = useDirectedGraphStore((s) => s.removeEdge)
  const clear = useDirectedGraphStore((s) => s.clear)
  const loadExample = useDirectedGraphStore((s) => s.loadExample)
  const loadNegativeEdge = useDirectedGraphStore((s) => s.loadNegativeEdge)
  const loadNegativeCycle = useDirectedGraphStore((s) => s.loadNegativeCycle)
  const loadRandom = useDirectedGraphStore((s) => s.loadRandom)
  const loadDoc = useDirectedGraphStore((s) => s.loadDoc)
  const toDoc = useDirectedGraphStore((s) => s.toDoc)

  const isDark = useThemeStore((s) => s.isDark)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { promptWeight, dialogProps } = useWeightPrompt()
  const t = useT()

  const ctrl = useGraphEditor<DirectedEdgeType, DirectedGraph>({
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
    exportFilename: "floyd-warshall-graph.json",
    routePath: "floyd-warshall/editor",
  })
  const { setRfEdges } = ctrl

  // Синк ребер зі стором: напрям, стрілка, вигин для зустрічних пар, колір за
  // знаком ваги/темою (специфіка орієнтованого графа).
  useEffect(() => {
    setRfEdges(
      graph.edges.map((e) => {
        const negative = e.weight < 0
        const curved = graph.edges.some(
          (o) => o.from === e.to && o.to === e.from,
        )
        const color = edgeColor(negative, isDark)
        return {
          id: e.id,
          source: e.from,
          target: e.to,
          type: "directed",
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 16,
            height: 16,
            color,
          },
          style: { stroke: color },
          data: { weight: e.weight, curved, negative },
        }
      }),
    )
  }, [graph.edges, isDark, setRfEdges])

  const onConnect = useCallback(
    async (conn: Connection) => {
      if (!conn.source || !conn.target || conn.source === conn.target) return
      const w = await promptWeight()
      if (w === null) return
      if (!connect(conn.source, conn.target, w)) {
        toast({
          description: tr("editor.fwEdgeExists", {
            from: conn.source,
            to: conn.target,
          }),
          variant: "destructive",
        })
      }
    },
    [connect, promptWeight],
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={loadExample}>
          <BookOpen /> {t("editor.fwExample")}
        </Button>
        <Button size="sm" variant="outline" onClick={loadNegativeEdge}>
          <Minus /> {t("editor.fwNegEdge")}
        </Button>
        <Button size="sm" variant="outline" onClick={loadNegativeCycle}>
          <Repeat /> {t("editor.fwNegCycle")}
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
          className="h-[600px] flex-1 overflow-hidden rounded-lg border bg-muted/20"
          onDoubleClick={ctrl.onPaneDoubleClick}
        >
          <ReactFlow
            nodes={ctrl.rfNodes}
            edges={ctrl.rfEdges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
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
        <AdjacencyMatrixPanel className="lg:w-72" />
      </div>

      <EditorHelp
        items={[
          { action: t("editor.helpDblCanvas"), desc: t("editor.helpAddVertex") },
          {
            action: t("editor.helpDragNodes"),
            desc: t("editor.helpAddDirectedEdge"),
          },
          { action: t("editor.helpDblEdge"), desc: t("editor.helpChangeWeight") },
          { action: "Delete", desc: t("editor.helpRemoveSelection") },
        ]}
      />

      <WeightDialog {...dialogProps} />
    </div>
  )
}
