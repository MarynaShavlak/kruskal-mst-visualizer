import { useSelectionSortStore } from "@/store/selection-sort-store"
import { isSorted, maxComparisons } from "@/lib/selectionSort"
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

/** Зведення масиву: розмір, ціна (порівняння — завжди n(n−1)/2), межа обмінів. */
export function SelectionSummaryPanel({ className }: { className?: string }) {
  const t = useT()
  const values = useSelectionSortStore((s) => s.values)

  const n = values.length
  const sorted = isSorted(values)

  return (
    <SummaryCard className={className}>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        <SummaryRow label={t("editor.ssSize")} value={String(n)} />
        <SummaryRow label={t("editor.ssComparisons")} value={String(maxComparisons(n))} mono />
        <SummaryRow label={t("editor.ssMaxSwaps")} value={String(Math.max(0, n - 1))} />
      </dl>

      <p className="mt-2 text-xs text-muted-foreground">{t("editor.ssNonAdaptiveNote")}</p>

      <SortedIndicator
        sorted={sorted}
        yes={t("editor.ssSortedYes")}
        no={t("editor.ssSortedNo")}
      />

      <HeavyWarning show={n > HEAVY_SIZE} text={t("editor.ssWarnMany")} />
    </SummaryCard>
  )
}
