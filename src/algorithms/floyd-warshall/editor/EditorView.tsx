import "@xyflow/react/dist/style.css"
import {
  useCallback,
  useEffect,
  useRef,
  type ChangeEvent,
  type MouseEvent,
} from "react"
import {
  Background,
  ConnectionMode,
  Controls,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type EdgeChange,
  type EdgeTypes,
  type NodeChange,
  type NodeTypes,
  type OnNodeDrag,
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
import {
  DirectedVertexNode,
  type DirectedVertexNodeType,
} from "@/algorithms/floyd-warshall/editor/DirectedVertexNode"
import {
  decodeHash,
  encodeHash,
  fromJSON,
  toJSON,
} from "@/algorithms/floyd-warshall/editor/graph-doc"
import {
  useWeightPrompt,
  WeightDialog,
} from "@/algorithms/floyd-warshall/editor/WeightDialog"
import {
  useDirectedGraphStore,
  type DirectedGraphDoc,
} from "@/store/directed-graph-store"
import { useThemeStore } from "@/store/theme-store"
import { toast } from "@/store/toast-store"
import { setHash } from "@/hooks/use-route"

const nodeTypes: NodeTypes = { vertex: DirectedVertexNode }
const edgeTypes: EdgeTypes = { directed: DirectedEdge }

// Спільний граф із URL-хеша вантажимо лише раз за сесію сторінки.
let sharedLoaded = false

function readSharedDoc(): DirectedGraphDoc | null {
  const hash = window.location.hash.replace(/^#/, "")
  const q = hash.indexOf("?")
  if (q < 0) return null
  const g = new URLSearchParams(hash.slice(q + 1)).get("g")
  return g ? decodeHash(g) : null
}

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
  const { screenToFlowPosition } = useReactFlow()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { promptWeight, dialogProps } = useWeightPrompt()

  const [rfNodes, setRfNodes, onNodesChange] =
    useNodesState<DirectedVertexNodeType>([])
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState<DirectedEdgeType>([])

  // Синхронізація вузлів зі стором при структурних змінах.
  useEffect(() => {
    setRfNodes(
      graph.vertices.map((v) => ({
        id: v,
        type: "vertex",
        position: positions[v] ?? { x: 0, y: 0 },
        data: { label: v },
      })),
    )
  }, [graph.vertices, positions, setRfNodes])

  // Ребра: напрям, стрілка, вигин для зустрічних пар, колір за знаком ваги/темою.
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

  useEffect(() => {
    if (sharedLoaded) return
    sharedLoaded = true
    const doc = readSharedDoc()
    if (doc) loadDoc(doc)
  }, [loadDoc])

  const handleNodesChange = useCallback(
    (changes: NodeChange<DirectedVertexNodeType>[]) => {
      onNodesChange(changes)
      for (const ch of changes) {
        if (ch.type === "remove") removeVertex(ch.id)
      }
    },
    [onNodesChange, removeVertex],
  )

  const handleEdgesChange = useCallback(
    (changes: EdgeChange<DirectedEdgeType>[]) => {
      onEdgesChange(changes)
      for (const ch of changes) {
        if (ch.type === "remove") removeEdge(ch.id)
      }
    },
    [onEdgesChange, removeEdge],
  )

  const onConnect = useCallback(
    async (conn: Connection) => {
      if (!conn.source || !conn.target || conn.source === conn.target) return
      const w = await promptWeight()
      if (w === null) return
      if (!connect(conn.source, conn.target, w)) {
        toast({
          description: `Ребро ${conn.source}→${conn.target} вже існує.`,
          variant: "destructive",
        })
      }
    },
    [connect, promptWeight],
  )

  const onNodeDragStop = useCallback<OnNodeDrag<DirectedVertexNodeType>>(
    (_e, node) => {
      moveVertex(node.id, node.position.x, node.position.y)
    },
    [moveVertex],
  )

  const onEdgeDoubleClick = useCallback(
    async (_e: MouseEvent, edge: Edge) => {
      const current =
        edge.data && typeof edge.data.weight === "number"
          ? edge.data.weight
          : undefined
      const w = await promptWeight(current)
      if (w !== null) setEdgeWeight(edge.id, w)
    },
    [setEdgeWeight, promptWeight],
  )

  const onPaneDoubleClick = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.classList.contains("react-flow__pane")) return
      const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY })
      addVertexAt(pos.x, pos.y)
    },
    [screenToFlowPosition, addVertexAt],
  )

  const onAddVertex = useCallback(() => {
    const n = graph.vertices.length
    addVertexAt(120 + (n % 6) * 90, 120 + Math.floor(n / 6) * 90)
  }, [graph.vertices.length, addVertexAt])

  const onExport = useCallback(() => {
    const blob = new Blob([toJSON(toDoc())], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "floyd-warshall-graph.json"
    a.click()
    URL.revokeObjectURL(url)
  }, [toDoc])

  const onImportFile = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      e.target.value = ""
      if (!file) return
      file
        .text()
        .then((text) => loadDoc(fromJSON(text)))
        .catch((err: unknown) => {
          toast({
            title: "Не вдалося імпортувати",
            description: err instanceof Error ? err.message : String(err),
            variant: "destructive",
          })
        })
    },
    [loadDoc],
  )

  const onShare = useCallback(() => {
    const hash = encodeHash(toDoc())
    const route = `floyd-warshall/editor?g=${hash}`
    const url = `${window.location.origin}${window.location.pathname}#${route}`
    setHash(route)
    void navigator.clipboard?.writeText(url).then(
      () => {
        toast({ description: "Посилання скопійовано в буфер обміну." })
      },
      () => undefined,
    )
  }, [toDoc])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={loadExample}>
          <BookOpen /> Приклад A–F
        </Button>
        <Button size="sm" variant="outline" onClick={loadNegativeEdge}>
          <Minus /> Від'ємне ребро
        </Button>
        <Button size="sm" variant="outline" onClick={loadNegativeCycle}>
          <Repeat /> Від'ємний цикл
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => loadRandom(Math.floor(Math.random() * 1e9))}
        >
          <Shuffle /> Випадковий
        </Button>
        <Button size="sm" variant="outline" onClick={onAddVertex}>
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
        <Button size="sm" variant="outline" onClick={onExport}>
          <Download /> Експорт
        </Button>
        <Button size="sm" variant="outline" onClick={onShare}>
          <Share2 /> Поділитися
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={onImportFile}
        />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row">
        <div
          className="h-[600px] flex-1 overflow-hidden rounded-lg border bg-muted/20"
          onDoubleClick={onPaneDoubleClick}
        >
          <ReactFlow
            nodes={rfNodes}
            edges={rfEdges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            onNodeDragStop={onNodeDragStop}
            onEdgeDoubleClick={onEdgeDoubleClick}
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

      <p className="text-xs text-muted-foreground">
        Подвійний клік по полю — додати вершину; перетягни від вузла до вузла —
        напрямлене ребро (із запитом ваги, можна від'ємну); подвійний клік по
        ребру — змінити вагу; Delete — видалити виділене.
      </p>

      <WeightDialog {...dialogProps} />
    </div>
  )
}
