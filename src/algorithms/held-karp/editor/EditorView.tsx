import "@xyflow/react/dist/style.css"
import { useRef, useState } from "react"
import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type NodeTypes,
} from "@xyflow/react"
import {
  BookOpen,
  Download,
  MapPin,
  Plus,
  Share2,
  Shuffle,
  Trash2,
  Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { CityNode } from "@/algorithms/held-karp/editor/CityNode"
import { CoordinatesDialog } from "@/algorithms/held-karp/editor/CoordinatesDialog"
import { DistanceMatrixPanel } from "@/algorithms/held-karp/editor/DistanceMatrixPanel"
import { useTspEditor } from "@/algorithms/held-karp/editor/use-tsp-editor"
import { useThemeStore } from "@/store/theme-store"

const nodeTypes: NodeTypes = { city: CityNode }
// Граф повний і неявний — ребра не малюються. Стабільне посилання, щоб React Flow
// не переобробляв порожній масив щорендеру.
const NO_EDGES: Edge[] = []

export function EditorView() {
  return (
    <ReactFlowProvider>
      <EditorCanvas />
    </ReactFlowProvider>
  )
}

function EditorCanvas() {
  const isDark = useThemeStore((s) => s.isDark)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [coordsOpen, setCoordsOpen] = useState(false)
  const ctrl = useTspEditor()

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={ctrl.onLoadExample}>
          <BookOpen /> Приклад A–E
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onLoadRandom}>
          <Shuffle /> Випадковий
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onAddCity}>
          <Plus /> Місто
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setCoordsOpen(true)}
        >
          <MapPin /> Координати
        </Button>
        <Button size="sm" variant="outline" onClick={ctrl.onClear}>
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
            edges={NO_EDGES}
            nodeTypes={nodeTypes}
            onNodesChange={ctrl.onNodesChange}
            onNodeDragStop={ctrl.onNodeDragStop}
            onNodeDoubleClick={ctrl.onNodeDoubleClick}
            deleteKeyCode={["Delete", "Backspace"]}
            zoomOnDoubleClick={false}
            colorMode={isDark ? "dark" : "light"}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
        <DistanceMatrixPanel className="lg:w-80" />
      </div>

      <p className="text-xs text-muted-foreground">
        Подвійний клік по полю — додати місто; перетягни місто — змінити
        координати (зі снапом до сітки); подвійний клік по місту — зробити його
        стартом; Delete — видалити виділене. Кнопка «Координати» — ввести точні
        x/y кожного міста вручну. Відстані в матриці — евклідові, перераховуються
        автоматично.
      </p>

      <CoordinatesDialog
        open={coordsOpen}
        initialCities={ctrl.cities}
        initialStart={ctrl.start}
        onSettle={(doc) => {
          setCoordsOpen(false)
          if (doc) ctrl.onApplyDoc(doc)
        }}
      />
    </div>
  )
}
