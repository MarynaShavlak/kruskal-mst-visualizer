import { Handle, Position, type Node, type NodeProps } from "@xyflow/react"
import { cn } from "@/lib/utils"

export type DirectedVertexNodeData = { label: string }
export type DirectedVertexNodeType = Node<DirectedVertexNodeData, "vertex">

/**
 * Кругла вершина орієнтованого графа. Ручки source (праворуч) і target
 * (ліворуч); напрям ребра визначається перетягуванням (source → target).
 */
export function DirectedVertexNode({
  data,
  selected,
}: NodeProps<DirectedVertexNodeType>) {
  return (
    <div
      className={cn(
        "flex size-12 select-none items-center justify-center rounded-full border-2 bg-card text-base font-semibold shadow-sm transition-colors",
        selected ? "border-primary ring-2 ring-primary/40" : "border-foreground/40",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!size-2 !border-0 !bg-foreground/50"
      />
      {data.label}
      <Handle
        type="source"
        position={Position.Right}
        className="!size-2 !border-0 !bg-foreground/50"
      />
    </div>
  )
}
