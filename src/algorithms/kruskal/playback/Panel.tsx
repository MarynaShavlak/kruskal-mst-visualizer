import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function Panel({
  title,
  children,
  className,
  bodyClassName,
}: {
  title: string
  children: ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-lg border bg-card",
        className,
      )}
    >
      <div className="shrink-0 border-b px-3 py-2 text-sm font-medium">
        {title}
      </div>
      <div className={cn("min-h-0 flex-1 p-3", bodyClassName)}>{children}</div>
    </div>
  )
}
