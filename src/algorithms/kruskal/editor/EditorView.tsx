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
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type EdgeChange,
  type NodeChange,
  type NodeTypes,
  type OnNodeDrag,
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
import {
  decodeHash,
  encodeHash,
  fromJSON,
  toJSON,
} from "@/algorithms/kruskal/editor/graph-doc"
import { VertexNode, type VertexNodeType } from "@/algorithms/kruskal/editor/VertexNode"
import { useWeightPrompt, WeightDialog } from "@/algorithms/kruskal/editor/WeightDialog"
import { useGraphStore, type GraphDoc } from "@/store/graph-store"
import { useThemeStore } from "@/store/theme-store"
import { toast } from "@/store/toast-store"
import { setHash } from "@/hooks/use-route"

const nodeTypes: NodeTypes = { vertex: VertexNode }

// Спільний граф із URL-хеша вантажимо лише раз за сесію сторінки.
let sharedLoaded = false

function readSharedDoc(): GraphDoc | null {
  const hash = window.location.hash.replace(/^#/, "")
  const q = hash.indexOf("?")
  if (q < 0) return null
  const g = new URLSearchParams(hash.slice(q + 1)).get("g")
  return g ? decodeHash(g) : null
}

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
  const { screenToFlowPosition } = useReactFlow()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { promptWeight, dialogProps } = useWeightPrompt()

  const [rfNodes, setRfNodes, onNodesChange] = useNodesState<VertexNodeType>([])
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState<Edge>([])

  // Синхронізація вигляду зі стором при структурних змінах
  // (додавання/видалення/пресети/імпорт). Під час перетягування стор не чіпаємо,
  // тож цей ефект не заважає драгу — позиція пишеться лише на onNodeDragStop.
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

  useEffect(() => {
    if (sharedLoaded) return
    sharedLoaded = true
    const doc = readSharedDoc()
    if (doc) loadDoc(doc)
  }, [loadDoc])

  const handleNodesChange = useCallback(
    (changes: NodeChange<VertexNodeType>[]) => {
      onNodesChange(changes)
      for (const ch of changes) {
        if (ch.type === "remove") removeVertex(ch.id)
      }
    },
    [onNodesChange, removeVertex],
  )

  const handleEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => {
      onEdgesChange(changes)
      for (const ch of changes) {
        if (ch.type === "remove") removeEdge(ch.id)
      }
    },
    [onEdgesChange, removeEdge],
  )

  const onConnect = useCallback(
    async (conn: Connection) => {
      if (!conn.source || !conn.target) return
      const w = await promptWeight()
      if (w !== null) connect(conn.source, conn.target, w)
    },
    [connect, promptWeight],
  )

  const onNodeDragStop = useCallback<OnNodeDrag<VertexNodeType>>(
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
    a.download = "kruskal-graph.json"
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
    const route = `kruskal/editor?g=${hash}`
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
          <BookOpen /> Приклад
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
