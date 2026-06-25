import { useHeapSortStore } from "@/store/heap-sort-store"
import { isSorted, countOperations, type HeapOrder } from "@/lib/heapSort"
import {
  HeavyWarning,
  SortedIndicator,
  SummaryCard,
} from "@/algorithms/shared/editor/summary"
import { useT } from "@/i18n/use-t"

// Поріг, за яким масив завеликий для плавного плеєра (узгоджено з MAX_SIZE).
const HEAVY_SIZE = 16

const ORDERS: readonly { key: HeapOrder; labelKey: "editor.hpOrderAsc" | "editor.hpOrderDesc" }[] = [
  { key: "asc", labelKey: "editor.hpOrderAsc" },
  { key: "desc", labelKey: "editor.hpOrderDesc" },
]

/**
 * Зведення масиву + ПОРІВНЯННЯ напрямів: для max-купи (asc) і min-купи (desc)
 * показуємо порівняння / обміни на ЦИХ даних. На відміну від адаптивних методів,
 * ціна Heap Sort тримається Θ(n·log n) незалежно від «впорядкованості» входу.
 */
export function HeapSummaryPanel({ className }: { className?: string }) {
  const t = useT()
  const values = useHeapSortStore((s) => s.values)

  const n = values.length
  const sorted = isSorted(values)
  const rows = ORDERS.map((o) => ({ ...o, stats: countOperations(values, o.key) }))

  return (
    <SummaryCard className={className}>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-muted-foreground">{t("editor.arrSize")}</span>
        <span className="font-medium tabular-nums">{n}</span>
      </div>

      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b text-right text-muted-foreground">
            <th className="py-1 text-left font-medium">{t("editor.hpOrder")}</th>
            <th className="py-1 font-medium">{t("editor.hpCmp")}</th>
            <th className="py-1 font-medium">{t("editor.hpSwaps")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-b last:border-0 text-right tabular-nums">
              <td className="py-1 text-left font-medium">{t(r.labelKey)}</td>
              <td className="py-1">{r.stats.comparisons}</td>
              <td className="py-1">{r.stats.swaps}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-2 text-xs text-muted-foreground">{t("editor.hpNote")}</p>

      <SortedIndicator
        sorted={sorted}
        yes={t("editor.arrSortedYes")}
        no={t("editor.arrSortedNo")}
      />

      <HeavyWarning show={n > HEAVY_SIZE} text={t("editor.hpWarnMany")} />
    </SummaryCard>
  )
}
