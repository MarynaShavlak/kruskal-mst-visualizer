import { type Node, type NodeProps } from "@xyflow/react"
import { cn } from "@/lib/utils"

export type CityNodeData = { label: string; isStart: boolean }
export type CityNodeType = Node<CityNodeData, "city">

/**
 * Місто на карті TSP — кружок із підписом. БЕЗ ручок з'єднання: граф повний і
 * неявний, ребра не малюються. Стартове місто виділяється кольором (подвійний
 * клік по місту робить його стартом).
 */
export function CityNode({ data, selected }: NodeProps<CityNodeType>) {
  return (
    <div
      title={data.isStart ? "Стартове місто" : "Подвійний клік — зробити стартом"}
      className={cn(
        "flex size-12 select-none items-center justify-center rounded-full border-2 text-base font-semibold shadow-sm transition-colors",
        data.isStart
          ? "border-primary bg-primary text-primary-foreground"
          : "border-foreground/40 bg-card",
        selected && "ring-2 ring-primary/40",
      )}
    >
      {data.label}
    </div>
  )
}
