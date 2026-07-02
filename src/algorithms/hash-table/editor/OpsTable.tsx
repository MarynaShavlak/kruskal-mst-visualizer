// Таблиця операцій скрипта хеш-таблиці: рядок = операція (тип insert/get/delete +
// ключ + значення). Клон ItemsTable рюкзака, але з <select> для типу операції.
// Значення редагується лише для insert (get/delete його не мають). Читає й пише
// стор напряму; санітизація — у діях стору.

import { Trash2 } from "lucide-react"
import { useHashTableStore } from "@/store/hash-table-store"
import type { HtOp } from "@/lib/hashTable"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

const OP_KINDS: readonly HtOp["kind"][] = ["insert", "get", "delete"]

const INPUT_CLASS =
  "rounded border bg-transparent px-1.5 py-0.5 outline-none focus:ring-2 focus:ring-ring"

/** Числове поле зі значенням: локальний стан для плавного набору, коміт цілого. */
function ValueField({
  value,
  aria,
  onCommit,
}: {
  value: number
  aria: string
  onCommit: (n: number) => void
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      aria-label={aria}
      defaultValue={value}
      onBlur={(e) => {
        const n = Number.parseInt(e.target.value, 10)
        if (Number.isFinite(n)) onCommit(n)
      }}
      className={cn(INPUT_CLASS, "w-20 text-right tabular-nums")}
    />
  )
}

export function OpsTable({ className }: { className?: string }) {
  const ops = useHashTableStore((s) => s.ops)
  const updateOp = useHashTableStore((s) => s.updateOp)
  const removeOp = useHashTableStore((s) => s.removeOp)
  const t = useT()

  if (ops.length === 0) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        {t("editor.htNoOps")}
      </p>
    )
  }

  return (
    <table className={cn("w-full border-collapse text-sm", className)}>
      <thead>
        <tr className="border-b text-left text-xs text-muted-foreground">
          <th className="py-1 pr-2 font-medium">{t("editor.hkColNum")}</th>
          <th className="py-1 pr-2 font-medium">{t("editor.htColKind")}</th>
          <th className="py-1 pr-2 font-medium">{t("editor.htColKey")}</th>
          <th className="py-1 pr-2 font-medium">{t("editor.htColValue")}</th>
          <th className="py-1" />
        </tr>
      </thead>
      <tbody>
        {ops.map((op, i) => (
          <tr key={i} className="border-b border-border/50 last:border-0">
            <td className="py-1 pr-2 tabular-nums text-muted-foreground">{i + 1}</td>
            <td className="py-1 pr-2">
              <select
                aria-label={t("editor.htAriaKind", { n: i + 1 })}
                value={op.kind}
                onChange={(e) => updateOp(i, { kind: e.target.value as HtOp["kind"] })}
                className={cn(INPUT_CLASS, "font-mono")}
              >
                {OP_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </td>
            <td className="py-1 pr-2">
              <input
                type="text"
                aria-label={t("editor.htAriaKey", { n: i + 1 })}
                value={op.key}
                onChange={(e) => updateOp(i, { key: e.target.value })}
                className={cn(INPUT_CLASS, "w-28 font-mono")}
              />
            </td>
            <td className="py-1 pr-2">
              {op.kind === "insert" ? (
                <ValueField
                  value={op.value ?? 0}
                  aria={t("editor.htAriaValue", { n: i + 1 })}
                  onCommit={(n) => updateOp(i, { value: n })}
                />
              ) : (
                <span className="text-muted-foreground/50">—</span>
              )}
            </td>
            <td className="py-1">
              <button
                type="button"
                aria-label={t("editor.htDeleteOf", { n: i + 1 })}
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
