import { useMergeSortStore } from "@/store/merge-sort-store"
import { isSorted, countOperations } from "@/lib/mergeSort"
import {
  HeavyWarning,
  SortedIndicator,
  SummaryCard,
  SummaryRow,
} from "@/algorithms/shared/editor/summary"
import { useT } from "@/i18n/use-t"

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
    <SummaryCard className={className}>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        <SummaryRow label={t("editor.arrSize")} value={String(n)} />
        <SummaryRow label={t("editor.msDepth")} value={String(td.depth)} />
        <SummaryRow label={t("editor.msComparisonsTd")} value={String(td.comparisons)} mono />
        <SummaryRow label={t("editor.msComparisonsBu")} value={String(bu.comparisons)} mono />
        <SummaryRow label={t("editor.msAppends")} value={String(td.appends)} />
        <SummaryRow label={t("editor.msMerges")} value={String(td.merges)} />
      </dl>

      <p className="mt-2 text-xs text-muted-foreground">{t("editor.msGuaranteeNote")}</p>

      <SortedIndicator
        sorted={sorted}
        yes={t("editor.arrSortedYes")}
        no={t("editor.arrSortedNo")}
      />

      <HeavyWarning show={n > HEAVY_SIZE} text={t("editor.msWarnMany")} />
    </SummaryCard>
  )
}
