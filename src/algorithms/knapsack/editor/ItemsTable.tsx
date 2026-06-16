import { useEffect, useState } from "react"
import { Trash2 } from "lucide-react"
import { useKnapsackStore } from "@/store/knapsack-store"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

/**
 * Редагована таблиця предметів рюкзака: назва (текст), вага й вартість (цілі),
 * похідна питома цінність value/weight. Пише прямо у стор. Числове поле тримає
 * локальний рядок (плавне введення), комітить розпарсене значення (стор санітизує).
 */
export function ItemsTable({ className }: { className?: string }) {
  const t = useT()
  const items = useKnapsackStore((s) => s.items)
  const updateItem = useKnapsackStore((s) => s.updateItem)
  const removeItem = useKnapsackStore((s) => s.removeItem)

  if (items.length === 0) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        {t("editor.knapNoItems")}
      </p>
    )
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="w-8 px-2 py-1.5 font-medium">{t("editor.hkColNum")}</th>
            <th className="px-2 py-1.5 font-medium">{t("editor.knapColName")}</th>
            <th className="px-2 py-1.5 text-right font-medium">
              {t("editor.knapColWeight")}
            </th>
            <th className="px-2 py-1.5 text-right font-medium">
              {t("editor.knapColValue")}
            </th>
            <th className="px-2 py-1.5 text-right font-medium">
              {t("editor.knapColRatio")}
            </th>
            <th className="w-9 px-2 py-1.5" />
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={i} className="border-b last:border-0">
              <td className="px-2 py-1 text-xs text-muted-foreground tabular-nums">
                {i + 1}
              </td>
              <td className="px-2 py-1">
                <input
                  type="text"
                  value={it.name}
                  aria-label={t("editor.knapAriaName", { name: it.name })}
                  onChange={(e) => updateItem(i, { name: e.target.value })}
                  className="w-24 rounded border bg-transparent px-1.5 py-0.5 outline-none focus:ring-2 focus:ring-ring"
                />
              </td>
              <td className="px-2 py-1 text-right">
                <NumberField
                  value={it.weight}
                  min={1}
                  aria={t("editor.knapAriaWeight", { name: it.name })}
                  onCommit={(weight) => updateItem(i, { weight })}
                />
              </td>
              <td className="px-2 py-1 text-right">
                <NumberField
                  value={it.value}
                  min={0}
                  aria={t("editor.knapAriaValue", { name: it.name })}
                  onCommit={(value) => updateItem(i, { value })}
                />
              </td>
              <td className="px-2 py-1 text-right tabular-nums text-muted-foreground">
                {(it.value / it.weight).toFixed(2)}
              </td>
              <td className="px-2 py-1 text-right">
                <button
                  type="button"
                  aria-label={t("editor.knapDeleteOf", { name: it.name })}
                  onClick={() => removeItem(i)}
                  className="inline-flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Числове поле: локальний рядок для плавного введення, комітить розпарсене ціле. */
function NumberField({
  value,
  min,
  aria,
  onCommit,
}: {
  value: number
  min: number
  aria: string
  onCommit: (n: number) => void
}) {
  const [text, setText] = useState(String(value))
  useEffect(() => setText(String(value)), [value])

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
        if (Number.isFinite(n)) onCommit(n)
      }}
      onBlur={() => {
        const n = Number.parseInt(text, 10)
        onCommit(Number.isFinite(n) ? n : min)
      }}
      className="w-16 rounded border bg-transparent px-1.5 py-0.5 text-right tabular-nums outline-none focus:ring-2 focus:ring-ring"
    />
  )
}
