import { Check, Search, X } from "lucide-react"
import { useLinearSearchStore } from "@/store/linear-search-store"
import { linearSearch, findAll, countComparisons, caseAnalysis } from "@/lib/linearSearch"
import { SummaryCard } from "@/algorithms/shared/editor/summary"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

// Поріг, за яким масив завеликий для плавного плеєра (узгоджено з MAX_SIZE).
const HEAVY_SIZE = 60

/**
 * Зведення масиву + АНАЛІЗ ВИПАДКІВ (головний акцент README): для поточного масиву
 * показуємо кількість перевірок у найкращому (елемент спереду, O(1)), гіршому
 * (елемент у кінці, O(n)), відсутньому (повний скан, O(n)) і середньому (≈ n/2)
 * випадках, а також фактичний результат для ПОТОЧНОЇ цілі (індекс / -1 + перевірки
 * + кількість входжень). Лінійний пошук не змінює масив — «ціна» це лише перевірки.
 */
export function CasesSummaryPanel({ className }: { className?: string }) {
  const t = useT()
  const values = useLinearSearchStore((s) => s.values)
  const target = useLinearSearchStore((s) => s.target)

  const n = values.length
  const cases = caseAnalysis(values)
  const result = linearSearch(values, target)
  const occurrences = findAll(values, target).length
  const comparisons = countComparisons(values, target)
  const found = result !== -1

  const rows: { label: string; checks: string; note: string }[] = [
    { label: t("editor.lsCaseBest"), checks: String(cases.best), note: "O(1)" },
    { label: t("editor.lsCaseAvg"), checks: n > 0 ? String(cases.average) : "0", note: "≈ n/2" },
    { label: t("editor.lsCaseWorst"), checks: String(cases.worst), note: "O(n)" },
    { label: t("editor.lsCaseAbsent"), checks: String(cases.absent), note: "O(n)" },
  ]

  return (
    <SummaryCard className={className}>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-muted-foreground">{t("editor.lsSize")}</span>
        <span className="font-medium tabular-nums">{n}</span>
      </div>

      {/* Фактичний результат для поточної цілі. */}
      <div className="mb-3 rounded-md border bg-muted/30 px-2.5 py-2">
        <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Search className="size-3.5" />
          {t("editor.lsTargetResult", { target })}
        </div>
        <div
          className={cn(
            "flex items-center gap-1.5 text-sm font-medium",
            found ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
          )}
        >
          {found ? <Check className="size-4 shrink-0" /> : <X className="size-4 shrink-0" />}
          {found
            ? t("editor.lsFoundAt", { i: result })
            : t("editor.lsNotFound")}
        </div>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs tabular-nums text-muted-foreground">
          <span>
            <b>{t("editor.lsChecks")}</b> {comparisons}
          </span>
          <span>
            <b>{t("editor.lsOccurrences")}</b> {occurrences}
          </span>
        </div>
      </div>

      {/* Аналіз випадків. */}
      <div className="mb-1 text-xs font-medium text-muted-foreground">{t("editor.lsCasesTitle")}</div>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b text-right text-muted-foreground">
            <th className="py-1 text-left font-medium">{t("editor.lsCaseCol")}</th>
            <th className="py-1 font-medium">{t("editor.lsChecksCol")}</th>
            <th className="py-1 font-medium">{t("editor.lsClassCol")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-b last:border-0 text-right tabular-nums">
              <td className="py-1 text-left">{r.label}</td>
              <td className="py-1 font-mono">{r.checks}</td>
              <td className="py-1 font-mono text-muted-foreground">{r.note}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-2 text-xs text-muted-foreground">{t("editor.lsCasesNote")}</p>

      {n > HEAVY_SIZE && (
        <p className="mt-2 flex items-start gap-1.5 rounded-md bg-amber-500/10 px-2 py-1.5 text-xs text-amber-700 dark:text-amber-300">
          {t("editor.lsWarnMany")}
        </p>
      )}
    </SummaryCard>
  )
}
