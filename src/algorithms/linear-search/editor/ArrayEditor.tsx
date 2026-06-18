import { useEffect, useState } from "react"
import { Search, X } from "lucide-react"
import { useLinearSearchStore } from "@/store/linear-search-store"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

/**
 * Редагований масив чисел + ЦІЛЬ пошуку. Зверху — поле «шукаємо: x» (виокремлене
 * рамкою). Нижче — горизонтальний ряд «клітинок» (індекс + поле вводу + кнопка
 * видалення). Пише прямо у стор; числові поля тримають локальний рядок для
 * плавного введення й комітять розпарсене ціле (стор санітизує). Лінійний пошук
 * працює з будь-якими цілими — від'ємні теж дозволені.
 */
export function ArrayEditor({ className }: { className?: string }) {
  const t = useT()
  const values = useLinearSearchStore((s) => s.values)
  const target = useLinearSearchStore((s) => s.target)
  const updateValue = useLinearSearchStore((s) => s.updateValue)
  const removeValue = useLinearSearchStore((s) => s.removeValue)
  const setTarget = useLinearSearchStore((s) => s.setTarget)

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Ціль пошуку. */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-rose-400/50 bg-rose-500/10 px-2 py-1 text-sm font-medium text-rose-700 dark:text-rose-300">
          <Search className="size-3.5" />
          {t("editor.lsTargetLabel")}
        </span>
        <NumberField
          value={target}
          aria={t("editor.lsAriaTarget")}
          onCommit={setTarget}
          highlight
        />
      </div>

      {/* Масив. */}
      {values.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("editor.lsNoValues")}</p>
      ) : (
        <div className="flex flex-wrap items-end gap-2">
          {values.map((v, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-[11px] tabular-nums text-muted-foreground">{i}</span>
              <div className="group relative">
                <NumberField
                  value={v}
                  aria={t("editor.lsAriaValue", { i })}
                  onCommit={(n) => updateValue(i, n)}
                />
                <button
                  type="button"
                  aria-label={t("editor.lsDeleteAt", { i })}
                  onClick={() => removeValue(i)}
                  className="absolute -right-1.5 -top-1.5 hidden size-4 items-center justify-center rounded-full bg-destructive text-destructive-foreground group-hover:flex hover:bg-destructive/90"
                >
                  <X className="size-2.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** Числове поле: локальний рядок для плавного введення, комітить розпарсене ціле. */
function NumberField({
  value,
  aria,
  onCommit,
  highlight,
}: {
  value: number
  aria: string
  onCommit: (n: number) => void
  highlight?: boolean
}) {
  const [text, setText] = useState(String(value))
  useEffect(() => setText(String(value)), [value])

  return (
    <input
      type="number"
      inputMode="numeric"
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
      className={cn(
        "w-16 rounded border bg-transparent px-1.5 py-1 text-center text-sm tabular-nums outline-none focus:ring-2 focus:ring-ring",
        highlight && "border-rose-400/60 font-medium text-rose-700 dark:text-rose-300",
      )}
    />
  )
}
