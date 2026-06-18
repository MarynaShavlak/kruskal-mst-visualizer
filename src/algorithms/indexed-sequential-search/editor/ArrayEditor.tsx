import { useEffect, useState } from "react"
import { Search, X } from "lucide-react"
import { useIndexedSequentialSearchStore } from "@/store/indexed-sequential-search-store"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

/**
 * Редагований масив чисел + ЦІЛЬ пошуку + КРОК індексу. Зверху — поля «шукаємо: x» і
 * «крок індексу». Нижче — горизонтальний ряд «клітинок» (індекс + поле + кнопка
 * видалення). Пише прямо у стор. ПЕРЕДУМОВА — масив відсортований (стан показує панель
 * збоку; є кнопка «Відсортувати»). Нове число вставляється зі збереженням порядку.
 */
export function ArrayEditor({ className }: { className?: string }) {
  const t = useT()
  const values = useIndexedSequentialSearchStore((s) => s.values)
  const target = useIndexedSequentialSearchStore((s) => s.target)
  const step = useIndexedSequentialSearchStore((s) => s.step)
  const updateValue = useIndexedSequentialSearchStore((s) => s.updateValue)
  const removeValue = useIndexedSequentialSearchStore((s) => s.removeValue)
  const setTarget = useIndexedSequentialSearchStore((s) => s.setTarget)
  const setStep = useIndexedSequentialSearchStore((s) => s.setStep)

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Ціль пошуку + крок індексу. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-rose-400/50 bg-rose-500/10 px-2 py-1 text-sm font-medium text-rose-700 dark:text-rose-300">
            <Search className="size-3.5" />
            {t("editor.issTargetLabel")}
          </span>
          <NumberField value={target} aria={t("editor.issAriaTarget")} onCommit={setTarget} tone="rose" />
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-violet-400/50 bg-violet-500/10 px-2 py-1 text-sm font-medium text-violet-700 dark:text-violet-300">
            {t("editor.issStepLabel")}
          </span>
          <NumberField value={step} aria={t("editor.issAriaStep")} onCommit={setStep} tone="violet" min={1} />
        </div>
      </div>

      {/* Масив. */}
      {values.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("editor.issNoValues")}</p>
      ) : (
        <div className="flex flex-wrap items-end gap-2">
          {values.map((v, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-[11px] tabular-nums text-muted-foreground">{i}</span>
              <div className="group relative">
                <NumberField
                  value={v}
                  aria={t("editor.issAriaValue", { i })}
                  onCommit={(n) => updateValue(i, n)}
                />
                <button
                  type="button"
                  aria-label={t("editor.issDeleteAt", { i })}
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
  tone,
  min,
}: {
  value: number
  aria: string
  onCommit: (n: number) => void
  tone?: "rose" | "violet"
  min?: number
}) {
  const [text, setText] = useState(String(value))
  useEffect(() => setText(String(value)), [value])

  const commit = (n: number) => onCommit(min != null ? Math.max(min, n) : n)

  return (
    <input
      type="number"
      inputMode="numeric"
      value={text}
      aria-label={aria}
      onChange={(e) => {
        setText(e.target.value)
        const n = Number.parseInt(e.target.value, 10)
        if (Number.isFinite(n)) commit(n)
      }}
      onBlur={() => {
        const n = Number.parseInt(text, 10)
        commit(Number.isFinite(n) ? n : min ?? 0)
      }}
      className={cn(
        "w-16 rounded border bg-transparent px-1.5 py-1 text-center text-sm tabular-nums outline-none focus:ring-2 focus:ring-ring",
        tone === "rose" && "border-rose-400/60 font-medium text-rose-700 dark:text-rose-300",
        tone === "violet" && "border-violet-400/60 font-medium text-violet-700 dark:text-violet-300",
      )}
    />
  )
}
