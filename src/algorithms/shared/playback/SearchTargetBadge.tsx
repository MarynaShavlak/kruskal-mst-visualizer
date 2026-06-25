import { Search } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * Рожевий бейдж «що шукаємо» з лупою — спільний для родин пошуку в масиві та в рядку
 * (ціль / шаблон). Раніше той самий span дублювався у 17 місцях (плеєр + навчання +
 * редактор text/pattern). Конкретний підпис передається як children; дрібні відмінності
 * відступів (напр. `mb-2` у навчанні, `w-fit px-2` у редакторі) — через className.
 */
export function SearchTargetBadge({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-rose-400/50 bg-rose-500/10 px-2.5 py-1 text-sm font-medium text-rose-700 dark:text-rose-300",
        className,
      )}
    >
      <Search className="size-3.5" />
      {children}
    </span>
  )
}
