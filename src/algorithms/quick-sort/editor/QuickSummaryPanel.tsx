import { AlertTriangle, Check } from "lucide-react"
import { useQuickSortStore } from "@/store/quick-sort-store"
import { isSorted, countOperations } from "@/lib/quickSort"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

// Поріг, за яким дерево рекурсії стає завеликим для плавного плеєра (узгоджено з
// MAX_SIZE у плеєрі). Вище — показуємо попередження в редакторі.
const HEAVY_SIZE = 14

/**
 * Зведення масиву для опорного-середина: розмір, порівняння, виклики, глибина
 * (форма дерева залежить від опорного — тут показуємо стандартний середній).
 */
export function QuickSummaryPanel({ className }: { className?: string }) {
  const t = useT()
  const values = useQuickSortStore((s) => s.values)

  const n = values.length
  const sorted = isSorted(values)
  const stats = countOperations(values, "middle")

  return (
    <div className={cn("rounded-lg border bg-card p-3 text-sm", className)}>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        <Row label={t("editor.qsSize")} value={String(n)} />
        <Row label={t("editor.qsComparisons")} value={String(stats.comparisons)} mono />
        <Row label={t("editor.qsCalls")} value={String(stats.calls)} />
        <Row label={t("editor.qsDepth")} value={String(stats.depth)} />
      </dl>

      <p className="mt-2 text-xs text-muted-foreground">{t("editor.qsPivotNote")}</p>

      <p
        className={cn(
          "mt-3 flex items-center gap-1.5 text-xs",
          sorted ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground",
        )}
      >
        {sorted && <Check className="size-3.5 shrink-0" />}
        {sorted ? t("editor.qsSortedYes") : t("editor.qsSortedNo")}
      </p>

      {n > HEAVY_SIZE && (
        <p className="mt-2 flex items-start gap-1.5 rounded-md bg-amber-500/10 px-2 py-1.5 text-xs text-amber-700 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          {t("editor.qsWarnMany")}
        </p>
      )}
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("text-right font-medium tabular-nums", mono && "font-mono")}>
        {value}
      </dd>
    </>
  )
}
