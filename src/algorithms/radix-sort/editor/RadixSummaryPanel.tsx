import { useRadixSortStore } from "@/store/radix-sort-store"
import { isSorted, countOperations, maxDigits } from "@/lib/radixSort"
import {
  HeavyWarning,
  SortedIndicator,
  SummaryCard,
} from "@/algorithms/shared/editor/summary"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

// Поріг, за яким масив завеликий для плавного плеєра (узгоджено з MAX_SIZE).
const HEAVY_SIZE = 12

// Основи для порівняння «проходи проти пам'яті» (розділ README про вибір основи).
const BASES: readonly { base: number; label: string }[] = [
  { base: 2, label: "2" },
  { base: 10, label: "10" },
  { base: 256, label: "256" },
]

/**
 * Зведення масиву + порівняння ВИБОРУ ОСНОВИ (проходи проти пам'яті): для основ
 * 2 / 10 / 256 показуємо кількість розрядних проходів d і розмір масиву count (= k).
 * Більша основа → менше проходів, але більший count. Порозрядне НЕ порівнює
 * елементи — 0 порівнянь незалежно від розташування.
 */
export function RadixSummaryPanel({ className }: { className?: string }) {
  const t = useT()
  const values = useRadixSortStore((s) => s.values)

  const n = values.length
  const sorted = isSorted(values)
  const maxVal = n > 0 ? Math.max(...values) : 0
  const base10 = countOperations(values)
  const rows = BASES.map((b) => ({ ...b, passes: maxDigits(values, b.base) }))

  return (
    <SummaryCard className={className}>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-muted-foreground">{t("editor.rxSize")}</span>
        <span className="font-medium tabular-nums">{n}</span>
      </div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-muted-foreground">{t("editor.rxMax")}</span>
        <span className="font-medium tabular-nums">{maxVal}</span>
      </div>

      <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs tabular-nums">
        <span>
          <b>{t("editor.rxPasses")}</b> {base10.passes}
        </span>
        <span>
          <b>{t("editor.rxDistributions")}</b> {base10.distributions}
        </span>
        <span>
          <b>{t("editor.rxComparisons")}</b> 0
        </span>
      </div>

      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b text-right text-muted-foreground">
            <th className="py-1 text-left font-medium">{t("editor.rxBase")}</th>
            <th className="py-1 font-medium">{t("editor.rxBasePasses")}</th>
            <th className="py-1 font-medium">{t("editor.rxBaseCount")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.base}
              className={cn(
                "border-b last:border-0 text-right tabular-nums",
                r.base === 10 && "bg-primary/5 font-medium",
              )}
            >
              <td className="py-1 text-left font-mono">{r.label}</td>
              <td className="py-1">{r.passes}</td>
              <td className="py-1">{r.base}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-2 text-xs text-muted-foreground">{t("editor.rxBaseNote")}</p>

      <SortedIndicator
        sorted={sorted}
        yes={t("editor.rxSortedYes")}
        no={t("editor.rxSortedNo")}
      />

      <HeavyWarning show={n > HEAVY_SIZE} text={t("editor.rxWarnMany")} />
    </SummaryCard>
  )
}
