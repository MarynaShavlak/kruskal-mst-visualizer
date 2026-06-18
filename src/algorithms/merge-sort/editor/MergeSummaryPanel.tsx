import { AlertTriangle, Check } from "lucide-react"
import { useMergeSortStore } from "@/store/merge-sort-store"
import { isSorted, countOperations } from "@/lib/mergeSort"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

// Поріг, за яким дерево рекурсії стає завеликим для плавного плеєра (узгоджено з
// MAX_SIZE у плеєрі). Вище — показуємо попередження в редакторі.
const HEAVY_SIZE = 16

/**
 * Зведення масиву: розмір, порівняння/додавання/злиття обох реалізацій (низхідна
 * та вихідна) і глибина. Глибина = ⌈log₂n⌉ ЗАВЖДИ (поділ строго навпіл), тож
 * складність O(n·log n) гарантована для будь-якого входу.
 */
export function MergeSummaryPanel({ className }: { className?: string }) {
  const t = useT()
  const values = useMergeSortStore((s) => s.values)

  const n = values.length
  const sorted = isSorted(values)
  const td = countOperations(values, "topDown")
  const bu = countOperations(values, "bottomUp")

  return (
    <div className={cn("rounded-lg border bg-card p-3 text-sm", className)}>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        <Row label={t("editor.msSize")} value={String(n)} />
        <Row label={t("editor.msDepth")} value={String(td.depth)} />
        <Row label={t("editor.msComparisonsTd")} value={String(td.comparisons)} mono />
        <Row label={t("editor.msComparisonsBu")} value={String(bu.comparisons)} mono />
        <Row label={t("editor.msAppends")} value={String(td.appends)} />
        <Row label={t("editor.msMerges")} value={String(td.merges)} />
      </dl>

      <p className="mt-2 text-xs text-muted-foreground">{t("editor.msGuaranteeNote")}</p>

      <p
        className={cn(
          "mt-3 flex items-center gap-1.5 text-xs",
          sorted ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground",
        )}
      >
        {sorted && <Check className="size-3.5 shrink-0" />}
        {sorted ? t("editor.msSortedYes") : t("editor.msSortedNo")}
      </p>

      {n > HEAVY_SIZE && (
        <p className="mt-2 flex items-start gap-1.5 rounded-md bg-amber-500/10 px-2 py-1.5 text-xs text-amber-700 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          {t("editor.msWarnMany")}
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
