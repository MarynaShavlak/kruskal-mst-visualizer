import { AlertTriangle, Check } from "lucide-react"
import { useShellSortStore } from "@/store/shell-sort-store"
import { isSorted, countOperations, gapsFor, type GapSequence } from "@/lib/shellSort"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

// Поріг, за яким масив завеликий для плавного плеєра (узгоджено з MAX_SIZE).
const HEAVY_SIZE = 16

const SEQS: readonly { key: GapSequence; label: string }[] = [
  { key: "shell", label: "n//2" },
  { key: "knuth", label: "3k+1" },
  { key: "ciura", label: "Ciura" },
]

/**
 * Зведення масиву + ПОРІВНЯННЯ послідовностей проміжків: для кожної (n//2, Кнут,
 * Ciura) показуємо порівняння / зсуви / фази на ЦИХ даних. Видно, як вибір
 * послідовності змінює ціну (зазвичай Ciura/Кнут < n//2).
 */
export function ShellSummaryPanel({ className }: { className?: string }) {
  const t = useT()
  const values = useShellSortStore((s) => s.values)

  const n = values.length
  const sorted = isSorted(values)
  const rows = SEQS.map((s) => ({
    ...s,
    stats: countOperations(values, gapsFor(s.key, n)),
  }))

  return (
    <div className={cn("rounded-lg border bg-card p-3 text-sm", className)}>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-muted-foreground">{t("editor.shSize")}</span>
        <span className="font-medium tabular-nums">{n}</span>
      </div>

      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b text-right text-muted-foreground">
            <th className="py-1 text-left font-medium">{t("editor.shSeq")}</th>
            <th className="py-1 font-medium">{t("editor.shCmp")}</th>
            <th className="py-1 font-medium">{t("editor.shShifts")}</th>
            <th className="py-1 font-medium">{t("editor.shPhases")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-b last:border-0 text-right tabular-nums">
              <td className="py-1 text-left font-mono">{r.label}</td>
              <td className="py-1">{r.stats.comparisons}</td>
              <td className="py-1">{r.stats.shifts}</td>
              <td className="py-1">{r.stats.gapPhases}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-2 text-xs text-muted-foreground">{t("editor.shSeqNote")}</p>

      <p
        className={cn(
          "mt-3 flex items-center gap-1.5 text-xs",
          sorted ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground",
        )}
      >
        {sorted && <Check className="size-3.5 shrink-0" />}
        {sorted ? t("editor.shSortedYes") : t("editor.shSortedNo")}
      </p>

      {n > HEAVY_SIZE && (
        <p className="mt-2 flex items-start gap-1.5 rounded-md bg-amber-500/10 px-2 py-1.5 text-xs text-amber-700 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          {t("editor.shWarnMany")}
        </p>
      )}
    </div>
  )
}
