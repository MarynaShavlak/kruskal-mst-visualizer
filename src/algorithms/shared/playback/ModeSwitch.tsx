import { cn } from "@/lib/utils"

// Перемикач режимів плеєра — спільний для всіх не-графових плеєрів із кількома
// реалізаціями (наївна/оптимізована, ітеративний/рекурсивний, перший/усі, …). Раніше
// копіювався в кожен PlaybackView; тепер один generic-екземпляр, параметризований
// ключем режиму, підписом і списком опцій.

/** Опція перемикача режимів. */
export interface ModeOption<K extends string> {
  readonly key: K
  readonly label: string
}

/**
 * Підпис + сегментована група кнопок-режимів. `wrapButtons` додає flex-wrap на групу
 * (для довгих підписів — як у сортуванні злиттям).
 */
export function ModeSwitch<K extends string>({
  label,
  value,
  onChange,
  options,
  wrapButtons,
}: {
  label: string
  value: K
  onChange: (key: K) => void
  options: readonly ModeOption<K>[]
  wrapButtons?: boolean
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="font-medium text-muted-foreground">{label}</span>
      <div className={cn("inline-flex rounded-md border p-0.5", wrapButtons && "flex-wrap")}>
        {options.map((o) => (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            className={cn(
              "rounded px-3 py-1 transition-colors",
              value === o.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
