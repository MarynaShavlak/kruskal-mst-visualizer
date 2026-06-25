import { cn } from "@/lib/utils"

/**
 * Чип-перемикач фасети (фільтра): підпис + опційна формула класу складності +
 * лічильник. Спільний для каталогу (`HomeView`) і матриці складності
 * (`ComplexityMatrix`), щоб вигляд фільтрів не дрейфував між екранами.
 */
export function FilterChip({
  active,
  label,
  formula,
  count,
  disabled,
  onClick,
}: {
  active: boolean
  label: string
  formula?: string
  count: number
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground",
        disabled && "pointer-events-none opacity-40",
      )}
    >
      {label}
      {formula && (
        <span
          className={cn(
            "font-mono text-xs",
            active ? "text-background/70" : "text-muted-foreground/70",
          )}
        >
          {formula}
        </span>
      )}
      <span
        className={cn(
          "text-xs tabular-nums",
          active ? "text-background/70" : "text-muted-foreground/70",
        )}
      >
        {count}
      </span>
    </button>
  )
}
