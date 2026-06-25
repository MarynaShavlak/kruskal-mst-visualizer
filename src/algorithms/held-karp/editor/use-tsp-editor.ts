// Контролер редактора TSP: синхронізація Zustand-стору міст ↔ React Flow. На
// відміну від спільного use-graph-editor — БЕЗ ребер: вузли-міста, drag рухає
// місто, подвійний клік по полю додає місто, подвійний клік по місту робить його
// стартом, Delete видаляє. Import/export/share через tsp-doc. Координати вузлів —
// у пікселях (toCanvas), у стор пишемо математичні зі снапом до сітки.

import {
  useCallback,
  useEffect,
  type ChangeEvent,
  type MouseEvent,
} from "react"
import {
  useNodesState,
  useReactFlow,
  type NodeChange,
  type NodeMouseHandler,
  type OnNodeDrag,
} from "@xyflow/react"
import { readGraphParam } from "@/algorithms/shared/editor/use-graph-editor"
import { useEmbedSnippet } from "@/algorithms/shared/editor/use-embed-snippet"
import { toCanvas, toMathSnapped } from "@/algorithms/held-karp/editor/coords"
import { tspCodec } from "@/algorithms/held-karp/editor/tsp-doc"
import type { CityNodeType } from "@/algorithms/held-karp/editor/CityNode"
import { setHash } from "@/hooks/use-route"
import { tr } from "@/i18n/use-t"
import { toast } from "@/store/toast-store"
import { useTspStore, type TspDoc } from "@/store/tsp-store"
import type { TspCity } from "@/lib/tsp"

const EXPORT_FILENAME = "held-karp-tsp.json"
const ROUTE_PATH = "held-karp/editor"

// Спільний інстанс із URL-хеша вантажимо лише раз за сесію сторінки.
const loadedRoutes = new Set<string>()

export interface TspEditorController {
  /** Поточні міста стору (для діалогу координат). */
  readonly cities: readonly TspCity[]
  /** Індекс стартового міста. */
  readonly start: number
  readonly rfNodes: CityNodeType[]
  readonly onNodesChange: (changes: NodeChange<CityNodeType>[]) => void
  readonly onNodeDragStop: OnNodeDrag<CityNodeType>
  readonly onNodeDoubleClick: NodeMouseHandler<CityNodeType>
  readonly onPaneDoubleClick: (event: MouseEvent) => void
  readonly onAddCity: () => void
  readonly onLoadExample: () => void
  readonly onLoadRandom: () => void
  readonly onClear: () => void
  readonly onExport: () => void
  readonly onImportFile: (event: ChangeEvent<HTMLInputElement>) => void
  readonly onShare: () => void
  /** Копіює `<iframe>`-сніпет embed-режиму поточного редактора. */
  readonly onCopyEmbed: () => void
  /** Застосовує цілий документ (з діалогу координат) і центрує вид. */
  readonly onApplyDoc: (doc: TspDoc) => void
}

/**
 * Зв'язує стор TSP із React Flow. Має викликатись усередині
 * <ReactFlowProvider> (потрібен useReactFlow).
 */
export function useTspEditor(): TspEditorController {
  const cities = useTspStore((s) => s.cities)
  const start = useTspStore((s) => s.start)
  const addCityAt = useTspStore((s) => s.addCityAt)
  const moveCity = useTspStore((s) => s.moveCity)
  const removeCity = useTspStore((s) => s.removeCity)
  const setStart = useTspStore((s) => s.setStart)
  const clear = useTspStore((s) => s.clear)
  const loadExample = useTspStore((s) => s.loadExample)
  const loadRandom = useTspStore((s) => s.loadRandom)
  const loadDoc = useTspStore((s) => s.loadDoc)
  const toDoc = useTspStore((s) => s.toDoc)

  const { screenToFlowPosition, fitView } = useReactFlow()
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState<CityNodeType>([])

  // Синк вузлів зі стором (структурні зміни / зміна старту). Під час драгу стор
  // не чіпаємо (позиція пишеться лише на dragStop), тож ефект не заважає драгу.
  useEffect(() => {
    setRfNodes(
      cities.map((c, i) => ({
        id: c.name,
        type: "city",
        position: toCanvas(c),
        data: { label: c.name, isStart: i === start },
      })),
    )
  }, [cities, start, setRfNodes])

  const scheduleFit = useCallback(() => {
    window.requestAnimationFrame(() => {
      void fitView({ padding: 0.2, duration: 200 })
    })
  }, [fitView])

  // Одноразове завантаження спільного інстансу з URL-хеша (?g=...).
  useEffect(() => {
    if (loadedRoutes.has(ROUTE_PATH)) return
    loadedRoutes.add(ROUTE_PATH)
    const param = readGraphParam(window.location.hash)
    if (!param) return
    const doc = tspCodec.decodeHash(param)
    if (doc) {
      loadDoc(doc)
      scheduleFit()
    }
  }, [loadDoc, scheduleFit])

  const handleNodesChange = useCallback(
    (changes: NodeChange<CityNodeType>[]) => {
      onNodesChange(changes)
      for (const ch of changes) {
        if (ch.type === "remove") {
          // Свіжий стан: попередні видалення цього ж пакета вже зсунули індекси.
          const idx = useTspStore
            .getState()
            .cities.findIndex((c) => c.name === ch.id)
          if (idx >= 0) removeCity(idx)
        }
      }
    },
    [onNodesChange, removeCity],
  )

  const onNodeDragStop = useCallback<OnNodeDrag<CityNodeType>>(
    (_e, node) => {
      const idx = useTspStore
        .getState()
        .cities.findIndex((c) => c.name === node.id)
      if (idx < 0) return
      const m = toMathSnapped(node.position)
      moveCity(idx, m.x, m.y)
    },
    [moveCity],
  )

  const onNodeDoubleClick = useCallback<NodeMouseHandler<CityNodeType>>(
    (_e, node) => {
      const idx = useTspStore
        .getState()
        .cities.findIndex((c) => c.name === node.id)
      if (idx >= 0) setStart(idx)
    },
    [setStart],
  )

  const onPaneDoubleClick = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.classList.contains("react-flow__pane")) return
      const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY })
      const m = toMathSnapped(pos)
      addCityAt(m.x, m.y)
    },
    [screenToFlowPosition, addCityAt],
  )

  const onAddCity = useCallback(() => {
    const n = useTspStore.getState().cities.length
    addCityAt(2 + (n % 5) * 3, 2 + Math.floor(n / 5) * 3)
    scheduleFit()
  }, [addCityAt, scheduleFit])

  const onLoadExample = useCallback(() => {
    loadExample()
    scheduleFit()
  }, [loadExample, scheduleFit])

  const onLoadRandom = useCallback(() => {
    loadRandom(Math.floor(Math.random() * 1e9))
    scheduleFit()
  }, [loadRandom, scheduleFit])

  const onClear = useCallback(() => {
    clear()
  }, [clear])

  const onExport = useCallback(() => {
    const blob = new Blob([tspCodec.toJSON(toDoc())], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = EXPORT_FILENAME
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
        .then((text) => {
          loadDoc(tspCodec.fromJSON(text))
          scheduleFit()
        })
        .catch((err: unknown) => {
          toast({
            title: tr("editor.importFailed"),
            description: err instanceof Error ? err.message : String(err),
            variant: "destructive",
          })
        })
    },
    [loadDoc, scheduleFit],
  )

  const onShare = useCallback(() => {
    const hash = tspCodec.encodeHash(toDoc())
    const route = `${ROUTE_PATH}?g=${hash}`
    const url = `${window.location.origin}${window.location.pathname}#${route}`
    setHash(route)
    void navigator.clipboard?.writeText(url).then(
      () => toast({ description: tr("editor.linkCopied") }),
      () => undefined,
    )
  }, [toDoc])

  const onApplyDoc = useCallback(
    (doc: TspDoc) => {
      loadDoc(doc)
      scheduleFit()
    },
    [loadDoc, scheduleFit],
  )

  const onCopyEmbed = useEmbedSnippet({
    route: ROUTE_PATH,
    title: tr("app.title"),
  })

  return {
    cities,
    start,
    rfNodes,
    onNodesChange: handleNodesChange,
    onNodeDragStop,
    onNodeDoubleClick,
    onPaneDoubleClick,
    onAddCity,
    onLoadExample,
    onLoadRandom,
    onClear,
    onExport,
    onImportFile,
    onShare,
    onCopyEmbed,
    onApplyDoc,
  }
}
