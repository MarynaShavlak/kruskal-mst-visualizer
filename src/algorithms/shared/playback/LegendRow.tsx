import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/** Один запис легенди: підпис + уже вирішені класи кольору/рамки свотча. */
export interface LegendEntry {
  readonly label: string
  /** Класи свотча (викликач бере їх зі свого map ролей, напр. CELL_CLASS[role]). */
  readonly cls: string
}

/**
 * Спільний ряд легенди плеєра: свотч + підпис, з перенесенням рядків. Раніше
 * дублювався як приватний `Legend()` у ~13 панелях (однаковий JSX, різнилися лише
 * записи й наявність рамки свотча). Панелі-стовпчики (бари) — без рамки → border={false}.
 * Додаткові нестандартні свотчі (напр. «поточна цифра» у radix) передаються як children.
 */
export function LegendRow({
  entries,
  border = true,
  className,
  children,
}: {
  entries: readonly LegendEntry[]
  border?: boolean
  className?: string
  children?: ReactNode
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground",
        className,
      )}
    >
      {entries.map((e) => (
        <span key={e.label} className="inline-flex items-center gap-1">
          <span className={cn("inline-block size-2.5 rounded-sm", border && "border", e.cls)} />
          {e.label}
        </span>
      ))}
      {children}
    </div>
  )
}
