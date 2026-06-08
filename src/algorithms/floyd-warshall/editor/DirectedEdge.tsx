import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  type Edge,
  type EdgeProps,
} from "@xyflow/react"
import { cn } from "@/lib/utils"

export type DirectedEdgeData = {
  readonly weight: number
  /** Чи є зустрічне ребро (тоді обидва вигинаємо у протилежні боки). */
  readonly curved: boolean
  readonly negative: boolean
}
export type DirectedEdgeType = Edge<DirectedEdgeData, "directed">

/**
 * Напрямлене ребро зі стрілкою й підписом ваги. Прямі ребра — пряма лінія;
 * пара зустрічних ребер (A→B і B→A) вигинається у протилежні боки, щоб не
 * накладатись. Від'ємна вага підсвічується червоним.
 */
export function DirectedEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerEnd,
  style,
  selected,
  data,
}: EdgeProps<DirectedEdgeType>) {
  const weight = data?.weight ?? 0
  const negative = data?.negative ?? false

  let path: string
  let labelX: number
  let labelY: number

  if (data?.curved) {
    const mx = (sourceX + targetX) / 2
    const my = (sourceY + targetY) / 2
    const dx = targetX - sourceX
    const dy = targetY - sourceY
    const len = Math.hypot(dx, dy) || 1
    const off = 38
    const cx = mx + (-dy / len) * off
    const cy = my + (dx / len) * off
    path = `M${sourceX},${sourceY} Q${cx},${cy} ${targetX},${targetY}`
    labelX = 0.25 * sourceX + 0.5 * cx + 0.25 * targetX
    labelY = 0.25 * sourceY + 0.5 * cy + 0.25 * targetY
  } else {
    ;[path, labelX, labelY] = getStraightPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
    })
  }

  return (
    <>
      <BaseEdge
        path={path}
        markerEnd={markerEnd}
        style={{ ...style, strokeWidth: selected ? 2.5 : 1.5 }}
        interactionWidth={24}
      />
      <EdgeLabelRenderer>
        <div
          className={cn(
            "pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-md border bg-background px-1.5 py-0.5 text-xs font-semibold tabular-nums shadow-sm",
            negative
              ? "border-destructive/50 text-destructive"
              : "border-border text-foreground",
          )}
          style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
        >
          {weight}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
