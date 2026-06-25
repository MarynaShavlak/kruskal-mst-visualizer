import { Check, X } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * Клас рамки картки результату: зелена (знайдено) / червона (відсутнє) — лише після
 * завершення прогону. Спільний для всіх 8 плеєрів пошуку (у масиві + у рядку).
 */
export function resultBorderClass(done: boolean, found: boolean): string {
  return cn(done && (found ? "border-emerald-500/50" : "border-rose-500/40"))
}

/**
 * Кольорова лінія-вердикт «… / ✓ знайдено / ✗ відсутнє» — спільна для 8 плеєрів пошуку.
 * До завершення показує «…»; по завершенні — Check + зелений вміст (індекс / список) або
 * X + червоний підпис «не знайдено». Конкретний вміст інжектиться (`foundContent`/`absentText`).
 */
export function ResultVerdict({
  done,
  found,
  foundContent,
  absentText,
  className,
}: {
  done: boolean
  found: boolean
  foundContent: ReactNode
  absentText: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 font-medium",
        done && (found ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"),
        className,
      )}
    >
      {!done ? (
        "…"
      ) : found ? (
        <>
          <Check className="size-4" />
          {foundContent}
        </>
      ) : (
        <>
          <X className="size-4" />
          {absentText}
        </>
      )}
    </div>
  )
}
