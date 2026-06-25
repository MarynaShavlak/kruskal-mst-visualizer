import { useQuickSortStore } from "@/store/quick-sort-store"
import { isSorted, countOperations } from "@/lib/quickSort"
import {
  HeavyWarning,
  SortedIndicator,
  SummaryCard,
  SummaryRow,
} from "@/algorithms/shared/editor/summary"
import { useT } from "@/i18n/use-t"

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
    <SummaryCard className={className}>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        <SummaryRow label={t("editor.arrSize")} value={String(n)} />
        <SummaryRow label={t("editor.qsComparisons")} value={String(stats.comparisons)} mono />
        <SummaryRow label={t("editor.qsCalls")} value={String(stats.calls)} />
        <SummaryRow label={t("editor.qsDepth")} value={String(stats.depth)} />
      </dl>

      <p className="mt-2 text-xs text-muted-foreground">{t("editor.qsPivotNote")}</p>

      <SortedIndicator
        sorted={sorted}
        yes={t("editor.qsSortedYes")}
        no={t("editor.qsSortedNo")}
      />

      <HeavyWarning show={n > HEAVY_SIZE} text={t("editor.qsWarnMany")} />
    </SummaryCard>
  )
}
