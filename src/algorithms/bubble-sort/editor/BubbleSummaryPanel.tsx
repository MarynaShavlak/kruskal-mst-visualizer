import { useBubbleSortStore } from "@/store/bubble-sort-store"
import { isSorted, maxComparisons } from "@/lib/bubbleSort"
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

/** Зведення масиву: розмір, ціна наївної версії, чи вже відсортовано. */
export function BubbleSummaryPanel({ className }: { className?: string }) {
  const t = useT()
  const values = useBubbleSortStore((s) => s.values)

  const n = values.length
  const sorted = isSorted(values)

  return (
    <SummaryCard className={className}>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        <SummaryRow label={t("editor.arrSize")} value={String(n)} />
        <SummaryRow label={t("editor.bsMaxComparisons")} value={String(maxComparisons(n))} mono />
        <SummaryRow label={t("editor.bsMaxPasses")} value={String(Math.max(0, n - 1))} />
      </dl>

      <SortedIndicator
        sorted={sorted}
        yes={t("editor.arrSortedYes")}
        no={t("editor.arrSortedNo")}
      />

      <HeavyWarning show={n > HEAVY_SIZE} text={t("editor.bsWarnMany")} />
    </SummaryCard>
  )
}
