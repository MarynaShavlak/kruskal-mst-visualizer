import { useInsertionSortStore } from "@/store/insertion-sort-store"
import { isSorted, maxComparisons } from "@/lib/insertionSort"
import {
  HeavyWarning,
  SortedIndicator,
  SummaryCard,
  SummaryRow,
} from "@/algorithms/shared/editor/summary"
import { useT } from "@/i18n/use-t"

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
    <SummaryCard className={className}>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        <SummaryRow label={t("editor.isSize")} value={String(n)} />
        <SummaryRow label={t("editor.isMaxComparisons")} value={String(maxComparisons(n))} mono />
        <SummaryRow label={t("editor.isInsertions")} value={String(Math.max(0, n - 1))} />
      </dl>

      <SortedIndicator
        sorted={sorted}
        yes={t("editor.isSortedYes")}
        no={t("editor.isSortedNo")}
      />

      <HeavyWarning show={n > HEAVY_SIZE} text={t("editor.isWarnMany")} />
    </SummaryCard>
  )
}
