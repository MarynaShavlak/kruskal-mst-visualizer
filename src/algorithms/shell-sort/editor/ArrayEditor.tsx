import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { useShellSortStore } from "@/store/shell-sort-store"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

/**
 * Редагований масив чисел: горизонтальний ряд «клітинок» (індекс + поле вводу +
 * кнопка видалення). Пише прямо у стор; числове поле тримає локальний рядок для
 * плавного введення й комітить розпарсене ціле (стор санітизує до ≥0).
 */
export function ArrayEditor({ className }: { className?: string }) {
  const t = useT()
  const values = useShellSortStore((s) => s.values)
  const updateValue = useShellSortStore((s) => s.updateValue)
  const removeValue = useShellSortStore((s) => s.removeValue)

  if (values.length === 0) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        {t("editor.shNoValues")}
      </p>
    )
  }

  return (
    <div className={cn("flex flex-wrap items-end gap-2", className)}>
      {values.map((v, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <span className="text-[11px] tabular-nums text-muted-foreground">{i}</span>
          <div className="group relative">
            <NumberField
              value={v}
              aria={t("editor.shAriaValue", { i })}
              onCommit={(n) => updateValue(i, n)}
            />
            <button
              type="button"
              aria-label={t("editor.shDeleteAt", { i })}
              onClick={() => removeValue(i)}
              className="absolute -right-1.5 -top-1.5 hidden size-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground group-hover:flex hover:bg-destructive/90"
            >
              <X className="size-2.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

/** Числове поле: локальний рядок для плавного введення, комітить розпарсене ціле. */
function NumberField({
  value,
  aria,
  onCommit,
}: {
  value: number
  aria: string
  onCommit: (n: number) => void
}) {
  const [text, setText] = useState(String(value))
  useEffect(() => setText(String(value)), [value])

  return (
    <input
      type="number"
      inputMode="numeric"
      min={0}
      value={text}
      aria-label={aria}
      onChange={(e) => {
        setText(e.target.value)
        const n = Number.parseInt(e.target.value, 10)
        if (Number.isFinite(n)) onCommit(n)
      }}
      onBlur={() => {
        const n = Number.parseInt(text, 10)
        onCommit(Number.isFinite(n) ? n : 0)
      }}
      className="w-14 rounded border bg-transparent px-1.5 py-1 text-center text-sm tabular-nums outline-none focus:ring-2 focus:ring-ring"
    />
  )
}
