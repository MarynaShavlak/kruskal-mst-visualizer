import { cn } from "@/lib/utils"

/**
 * Одна комірка відсортованого ряду з роллю-кольором (✓-бейдж на знайденому елементі).
 * Спільна для двійкового та інтерполяційного пошуку — раніше байт-у-байт копія `Cell`
 * у кожній WindowPanel. Роль і мапу кольорів інжектить алгоритм (ключ "found" — бейдж).
 */
export function SortedCell<R extends string>({
  value,
  role,
  classMap,
  size = "md",
}: {
  value: number
  role: R
  classMap: Record<R, string>
  size?: "sm" | "md"
}) {
  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center rounded-md border-2 font-mono tabular-nums transition-colors",
        size === "md" ? "min-w-[2.5rem] px-1.5 py-2.5 text-sm" : "min-w-[1.7rem] px-1 py-1.5 text-xs",
        classMap[role],
      )}
    >
      {value}
      {role === "found" && (
        <span className="absolute -right-1.5 -top-1.5 inline-flex size-3.5 items-center justify-center rounded-full bg-emerald-500 text-[9px] text-white">
          ✓
        </span>
      )}
    </span>
  )
}

/**
 * Сигнатурний образ двійкового/інтерполяційного пошуку: відсортований ряд комірок із
 * ВІКНОМ [low..high], курсором-пробою ▼ над `probe` і дужками low/high під рядом.
 * Логіку ролей (`roleAt`), мапу кольорів, підпис ▼ і підпис злитих low+high інжектить
 * конкретний алгоритм — звужування вікна (симетричне / інтерпольоване) ідентичне.
 */
export function SortedWindowView<R extends string>({
  array,
  low,
  high,
  probe,
  roleAt,
  classMap,
  lowHighLabel,
  probeSrLabel,
  size = "md",
}: {
  array: readonly number[]
  low: number
  high: number
  probe: number | null
  roleAt: (i: number) => R
  classMap: Record<R, string>
  lowHighLabel: string
  probeSrLabel: string
  size?: "sm" | "md"
}) {
  return (
    <div className="flex flex-wrap items-end justify-center gap-1.5">
      {array.map((v, i) => {
        const isProbe = i === probe
        const isLow = i === low && low <= high
        const isHigh = i === high && low <= high
        return (
          <span key={i} className="flex flex-col items-center gap-0.5">
            {/* проба ▼ */}
            <span
              className={cn(
                "text-[10px] font-medium leading-none text-rose-500",
                isProbe ? "opacity-100" : "opacity-0",
              )}
            >
              ▼<span className="sr-only">{probeSrLabel}</span>
            </span>
            <SortedCell value={v} role={roleAt(i)} classMap={classMap} size={size} />
            <span className="text-[10px] tabular-nums text-muted-foreground/60">{i}</span>
            {/* low / high дужки */}
            <span className="h-3 text-[9px] font-semibold leading-none text-sky-600 dark:text-sky-400">
              {isLow && isHigh ? lowHighLabel : isLow ? "low" : isHigh ? "high" : ""}
            </span>
          </span>
        )
      })}
    </div>
  )
}
