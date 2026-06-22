import { useEffect, useState } from "react"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

// Спільний презентаційний редактор масиву чисел для НЕ-графових алгоритмів
// (сортування + пошуки в масиві). Чистий компонент: жодного стору й i18n — усе
// інжектиться пропсами тонкою обгорткою `<id>/editor/ArrayEditor.tsx`, яка читає свій
// стор і ключі. Сортування дають лише масив; пошуки додають верхній ряд полів
// (`fields`: ціль 🌹, у індексно-послідовного ще крок 🟣). Рядкові алгоритми
// користуються окремим TextPatternEditor.

/** Колір бейджа-підпису поля у верхньому ряду (ціль / крок індексу). */
const LABEL_TONE: Record<"rose" | "violet", string> = {
  rose: "border-rose-400/50 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  violet: "border-violet-400/50 bg-violet-500/10 text-violet-700 dark:text-violet-300",
}

/** Поле верхнього ряду пошукових редакторів (ціль пошуку / крок індексу). */
export interface ArrayEditorField {
  readonly value: number
  readonly onCommit: (n: number) => void
  /** Підпис бейджа, напр. t("editor.lsTargetLabel"). */
  readonly label: string
  readonly aria: string
  readonly tone: "rose" | "violet"
  /** Іконка лупи перед підписом (ціль — так; крок — ні). */
  readonly icon?: boolean
  /** Нижня межа значення (крок індексу: 1). */
  readonly min?: number
}

export interface ArrayEditorProps {
  readonly className?: string
  readonly values: readonly number[]
  readonly updateValue: (index: number, value: number) => void
  readonly removeValue: (index: number) => void
  /** Текст порожнього стану. */
  readonly emptyText: string
  /** aria-підпис поля значення за індексом. */
  readonly ariaValue: (index: number) => string
  /** aria-підпис кнопки видалення за індексом. */
  readonly deleteAt: (index: number) => string
  /** HTML-межа `min` для клітинок значень (сортування: 0; пошуки: без межі). */
  readonly cellMin?: number
  /** Ширина клітинки значення (Tailwind). Дефолт w-14; пошуки/radix — w-16. */
  readonly cellWidthClass?: string
  /** Верхній ряд полів (ціль/крок) — для пошуків; порожньо/відсутнє для сортувань. */
  readonly fields?: readonly ArrayEditorField[]
}

/**
 * Редагований масив чисел: горизонтальний ряд «клітинок» (індекс + поле вводу + кнопка
 * видалення). Пише через інжектовані `updateValue`/`removeValue`. Для пошуків зверху —
 * ряд полів `fields` (ціль, крок). Числові поля тримають локальний рядок для плавного
 * введення й комітять розпарсене ціле (стор санітизує).
 */
export function ArrayEditor({
  className,
  values,
  updateValue,
  removeValue,
  emptyText,
  ariaValue,
  deleteAt,
  cellMin,
  cellWidthClass = "w-14",
  fields,
}: ArrayEditorProps) {
  const grid =
    values.length === 0 ? (
      <p
        className={cn(
          "text-sm text-muted-foreground",
          fields ? undefined : className,
        )}
      >
        {emptyText}
      </p>
    ) : (
      <div
        className={cn("flex flex-wrap items-end gap-2", fields ? undefined : className)}
      >
        {values.map((v, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="text-[11px] tabular-nums text-muted-foreground">{i}</span>
            <div className="group relative">
              <NumberField
                value={v}
                aria={ariaValue(i)}
                onCommit={(n) => updateValue(i, n)}
                min={cellMin}
                className={cellWidthClass}
              />
              <button
                type="button"
                aria-label={deleteAt(i)}
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

  if (!fields) return grid

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {fields.map((f, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-sm font-medium",
                LABEL_TONE[f.tone],
              )}
            >
              {f.icon && <Search className="size-3.5" />}
              {f.label}
            </span>
            <NumberField
              value={f.value}
              aria={f.aria}
              onCommit={f.onCommit}
              tone={f.tone}
              min={f.min}
            />
          </div>
        ))}
      </div>
      {grid}
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
  className,
}: {
  value: number
  aria: string
  onCommit: (n: number) => void
  tone?: "rose" | "violet"
  min?: number
  className?: string
}) {
  const [text, setText] = useState(String(value))
  useEffect(() => setText(String(value)), [value])

  const commit = (n: number) => onCommit(min != null ? Math.max(min, n) : n)

  return (
    <input
      type="number"
      inputMode="numeric"
      min={min}
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
        className,
      )}
    />
  )
}
