// Спільний контролер редактора графа: уся НЕвізуальна механіка синку
// Zustand-стор ↔ React Flow (вузли, drag, delete, редагування ваги, додавання
// вершини, import/export/share через graph-doc). Алгоритмо-специфічне лишається
// у view й інжектиться: рендер ребер (через повернутий setRfEdges), onConnect
// (правила з'єднання), тулбар/панелі/пресети.
//
// Вузли в усіх графах однакові (кругла вершина з підписом), тож їх будує сам
// хук. Ребра різняться (прямі / напрямлені з кольором), тож їхній ефект-синк
// лишається в caller-і — хук лише віддає setRfEdges.

import {
  useCallback,
  useEffect,
  type ChangeEvent,
  type Dispatch,
  type MouseEvent,
  type SetStateAction,
} from "react"
import {
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type OnNodeDrag,
} from "@xyflow/react"
import { useEmbedSnippet } from "@/algorithms/shared/editor/use-embed-snippet"
import { setHash } from "@/hooks/use-route"
import { tr } from "@/i18n/use-t"
import type {
  GraphLike,
  GraphStoreDoc,
  XY,
} from "@/store/create-graph-store"
import { toast } from "@/store/toast-store"
import type { GraphDocCodec } from "@/algorithms/shared/editor/graph-doc"

/** Тип вузла React Flow, спільний для всіх графів (кругла вершина з підписом). */
export type EditorVertexNode = Node<{ label: string }, "vertex">

/** Дістає значення параметра query-частини hash (з/без ведучого '#'); null — немає. */
function readHashParam(hash: string, key: string): string | null {
  const h = hash.replace(/^#/, "")
  const q = h.indexOf("?")
  if (q < 0) return null
  return new URLSearchParams(h.slice(q + 1)).get(key)
}

/** Дістає значення параметра `g` із рядка hash (з/без ведучого '#'); null — немає. */
export function readGraphParam(hash: string): string | null {
  return readHashParam(hash, "g")
}

/**
 * Дістає `?step=` із рядка hash як невід'ємне ціле; null — немає/невалідне.
 * Використовується дип-лінком плеєра для стартового індексу кадру.
 */
export function readStepParam(hash: string): number | null {
  const raw = readHashParam(hash, "step")
  if (raw === null) return null
  const n = Number(raw)
  return Number.isInteger(n) && n >= 0 ? n : null
}

/** Дістає `?mode=` із рядка hash (непорожній рядок); null — немає. */
export function readModeParam(hash: string): string | null {
  const raw = readHashParam(hash, "mode")
  return raw === null || raw === "" ? null : raw
}

// Спільний граф із URL-хеша вантажимо лише раз за сесію сторінки — окремо на
// кожен маршрут редактора (ключ = routePath), щоб алгоритми не блокували один
// одного.
const loadedRoutes = new Set<string>()

export interface UseGraphEditorOptions<G extends GraphLike> {
  // Ядро стору (спільні мутації з graphCore).
  readonly graph: G
  readonly positions: Record<string, XY>
  readonly addVertexAt: (x: number, y: number) => void
  readonly setEdgeWeight: (id: string, weight: number) => void
  readonly moveVertex: (id: string, x: number, y: number) => void
  readonly removeVertex: (id: string) => void
  readonly removeEdge: (id: string) => void
  readonly loadDoc: (doc: GraphStoreDoc<G>) => void
  readonly toDoc: () => GraphStoreDoc<G>
  // Серіалізація + ввід ваги.
  readonly codec: GraphDocCodec<G>
  readonly promptWeight: (current?: number) => Promise<number | null>
  // Алгоритмо-специфічні константи.
  readonly exportFilename: string
  readonly routePath: string
}

export interface GraphEditorController<E extends Edge> {
  readonly rfNodes: EditorVertexNode[]
  readonly rfEdges: E[]
  /** Сеттер ребер — caller тримає власний (специфічний) ефект-синк ребер. */
  readonly setRfEdges: Dispatch<SetStateAction<E[]>>
  readonly onNodesChange: (changes: NodeChange<EditorVertexNode>[]) => void
  readonly onEdgesChange: (changes: EdgeChange<E>[]) => void
  readonly onNodeDragStop: OnNodeDrag<EditorVertexNode>
  readonly onEdgeDoubleClick: (event: MouseEvent, edge: Edge) => void
  readonly onPaneDoubleClick: (event: MouseEvent) => void
  readonly onAddVertex: () => void
  readonly onExport: () => void
  readonly onImportFile: (event: ChangeEvent<HTMLInputElement>) => void
  readonly onShare: () => void
  /** Копіює `<iframe>`-сніпет embed-режиму поточного граф-редактора. */
  readonly onCopyEmbed: () => void
}

/**
 * Зв'язує Zustand-стор графа з React Flow. Має викликатись усередині
 * <ReactFlowProvider> (потрібен useReactFlow). Повертає вузли/ребра й набір
 * хендлерів для прокидання у <ReactFlow>; onConnect та синк ребер caller додає
 * сам (вони алгоритмо-специфічні).
 */
export function useGraphEditor<E extends Edge, G extends GraphLike>(
  opts: UseGraphEditorOptions<G>,
): GraphEditorController<E> {
  const {
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
  } = opts

  const { screenToFlowPosition } = useReactFlow()
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState<EditorVertexNode>([])
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState<E>([])

  // Синхронізація вузлів зі стором при структурних змінах (додавання/видалення/
  // пресети/імпорт). Під час перетягування стор не чіпаємо, тож цей ефект не
  // заважає драгу — позиція пишеться лише на onNodeDragStop.
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

  // Одноразове завантаження спільного графа з URL-хеша (?g=...).
  useEffect(() => {
    if (loadedRoutes.has(routePath)) return
    loadedRoutes.add(routePath)
    const param = readGraphParam(window.location.hash)
    if (!param) return
    const doc = codec.decodeHash(param)
    if (doc) loadDoc(doc)
  }, [routePath, codec, loadDoc])

  const handleNodesChange = useCallback(
    (changes: NodeChange<EditorVertexNode>[]) => {
      onNodesChange(changes)
      for (const ch of changes) {
        if (ch.type === "remove") removeVertex(ch.id)
      }
    },
    [onNodesChange, removeVertex],
  )

  const handleEdgesChange = useCallback(
    (changes: EdgeChange<E>[]) => {
      onEdgesChange(changes)
      for (const ch of changes) {
        if (ch.type === "remove") removeEdge(ch.id)
      }
    },
    [onEdgesChange, removeEdge],
  )

  const onNodeDragStop = useCallback<OnNodeDrag<EditorVertexNode>>(
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
    const blob = new Blob([codec.toJSON(toDoc())], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = exportFilename
    a.click()
    URL.revokeObjectURL(url)
  }, [codec, toDoc, exportFilename])

  const onImportFile = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      e.target.value = ""
      if (!file) return
      file
        .text()
        .then((text) => loadDoc(codec.fromJSON(text)))
        .catch((err: unknown) => {
          toast({
            title: tr("editor.importFailed"),
            description: err instanceof Error ? err.message : String(err),
            variant: "destructive",
          })
        })
    },
    [codec, loadDoc],
  )

  const onShare = useCallback(() => {
    const hash = codec.encodeHash(toDoc())
    const route = `${routePath}?g=${hash}`
    const url = `${window.location.origin}${window.location.pathname}#${route}`
    setHash(route)
    void navigator.clipboard?.writeText(url).then(
      () => {
        toast({ description: tr("editor.linkCopied") })
      },
      () => undefined,
    )
  }, [codec, toDoc, routePath])

  const onCopyEmbed = useEmbedSnippet({
    route: routePath,
    title: tr("app.title"),
  })

  return {
    rfNodes,
    rfEdges,
    setRfEdges,
    onNodesChange: handleNodesChange,
    onEdgesChange: handleEdgesChange,
    onNodeDragStop,
    onEdgeDoubleClick,
    onPaneDoubleClick,
    onAddVertex,
    onExport,
    onImportFile,
    onShare,
    onCopyEmbed,
  }
}
