import { AlertTriangle, Check } from "lucide-react"
import { useInsertionSortStore } from "@/store/insertion-sort-store"
import { isSorted, maxComparisons } from "@/lib/insertionSort"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

// Поріг, за яким масив дає забагато кадрів для плавного плеєра (узгоджено з
// MAX_SIZE у плеєрі). Вище — показуємо попередження в редакторі.
const HEAVY_SIZE = 40

/** Зведення масиву: розмір, ціна (гірший випадок), чи вже відсортовано. */
export function InsertionSummaryPanel({ className }: { className?: string }) {
  const t = useT()
  const values = useInsertionSortStore((s) => s.values)

  const n = values.length
  const sorted = isSorted(values)

  return (
    <div className={cn("rounded-lg border bg-card p-3 text-sm", className)}>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        <Row label={t("editor.isSize")} value={String(n)} />
        <Row label={t("editor.isMaxComparisons")} value={String(maxComparisons(n))} mono />
        <Row label={t("editor.isInsertions")} value={String(Math.max(0, n - 1))} />
      </dl>

      <p
        className={cn(
          "mt-3 flex items-center gap-1.5 text-xs",
          sorted ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground",
        )}
      >
        {sorted && <Check className="size-3.5 shrink-0" />}
        {sorted ? t("editor.isSortedYes") : t("editor.isSortedNo")}
      </p>

      {n > HEAVY_SIZE && (
        <p className="mt-2 flex items-start gap-1.5 rounded-md bg-amber-500/10 px-2 py-1.5 text-xs text-amber-700 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          {t("editor.isWarnMany")}
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
