// Таблиця операцій скрипта ДДП: рядок = операція (вид insert/search/delete + ключ).
// Клон OpsTable хеш-таблиці, але з єдиним числовим полем ключа. Читає й пише стор
// напряму; санітизація — у діях стору.

import { Trash2 } from "lucide-react"
import { useBstStore } from "@/store/bst-store"
import type { BstOpKind } from "@/lib/binarySearchTree"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

const OP_KINDS: readonly BstOpKind[] = ["insert", "search", "delete"]

const INPUT_CLASS =
  "rounded border bg-transparent px-1.5 py-0.5 outline-none focus:ring-2 focus:ring-ring"

export function OpsTable({ className }: { className?: string }) {
  const ops = useBstStore((s) => s.ops)
  const updateOp = useBstStore((s) => s.updateOp)
  const removeOp = useBstStore((s) => s.removeOp)
  const t = useT()

  if (ops.length === 0) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        {t("editor.bstNoOps")}
      </p>
    )
  }

  return (
    <table className={cn("w-full border-collapse text-sm", className)}>
      <thead>
        <tr className="border-b text-left text-xs text-muted-foreground">
          <th className="py-1 pr-2 font-medium">{t("editor.bstColNum")}</th>
          <th className="py-1 pr-2 font-medium">{t("editor.bstColOp")}</th>
          <th className="py-1 pr-2 font-medium">{t("editor.bstKey")}</th>
          <th className="py-1" />
        </tr>
      </thead>
      <tbody>
        {ops.map((op, i) => (
          <tr key={i} className="border-b border-border/50 last:border-0">
            <td className="py-1 pr-2 tabular-nums text-muted-foreground">{i + 1}</td>
            <td className="py-1 pr-2">
              <select
                aria-label={t("editor.bstAriaKind", { n: i + 1 })}
                value={op.kind}
                onChange={(e) => updateOp(i, { kind: e.target.value as BstOpKind })}
                className={cn(INPUT_CLASS, "font-mono")}
              >
                {OP_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {t(`play.bstName_${k}`)}
                  </option>
                ))}
              </select>
            </td>
            <td className="py-1 pr-2">
              <input
                type="number"
                inputMode="numeric"
                aria-label={t("editor.bstAriaKey", { n: i + 1 })}
                defaultValue={op.key}
                key={op.key}
                onBlur={(e) => {
                  const n = Number.parseInt(e.target.value, 10)
                  if (Number.isFinite(n)) updateOp(i, { key: n })
                }}
                className={cn(INPUT_CLASS, "w-20 text-right tabular-nums")}
              />
            </td>
            <td className="py-1">
              <button
                type="button"
                aria-label={t("editor.bstRemoveOp", { n: i + 1 })}
                onClick={() => removeOp(i)}
                className="inline-flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
