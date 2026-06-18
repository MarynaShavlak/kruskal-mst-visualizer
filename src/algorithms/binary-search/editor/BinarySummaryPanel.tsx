import { AlertTriangle, Check, Search, X } from "lucide-react"
import { useBinarySearchStore } from "@/store/binary-search-store"
import { binarySearch, countSteps, isSorted, caseAnalysis } from "@/lib/binarySearch"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

// Поріг, за яким масив завеликий для плавного плеєра (узгоджено з MAX_SIZE).
const HEAVY_SIZE = 64

/**
 * Зведення масиву + ПЕРЕДУМОВА (відсортованість) + АНАЛІЗ ВИПАДКІВ. Найперше —
 * індикатор «масив відсортований?»: без цього двійковий пошук некоректний. Далі —
 * фактичний результат поточної цілі (індекс / -1 + кроки) і контраст складності:
 * найкращий 1, гірший ⌊log₂ n⌋+1 (двійковий) проти n (лінійний).
 */
export function BinarySummaryPanel({ className }: { className?: string }) {
  const t = useT()
  const values = useBinarySearchStore((s) => s.values)
  const target = useBinarySearchStore((s) => s.target)

  const n = values.length
  const sorted = isSorted(values)
  const cases = caseAnalysis(values)
  // Двійковий пошук коректний лише на відсортованому масиві.
  const result = sorted ? binarySearch(values, target) : -1
  const steps = countSteps(values, target)
  const found = result !== -1

  return (
    <div className={cn("rounded-lg border bg-card p-3 text-sm", className)}>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-muted-foreground">{t("editor.binSize")}</span>
        <span className="font-medium tabular-nums">{n}</span>
      </div>

      {/* Передумова: відсортованість. */}
      <p
        className={cn(
          "mb-3 flex items-start gap-1.5 rounded-md px-2 py-1.5 text-xs",
          sorted
            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            : "bg-amber-500/10 text-amber-700 dark:text-amber-300",
        )}
      >
        {sorted ? (
          <Check className="mt-0.5 size-3.5 shrink-0" />
        ) : (
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
        )}
        {sorted ? t("editor.binSortedYes") : t("editor.binSortedNo")}
      </p>

      {/* Фактичний результат для поточної цілі (лише якщо відсортовано). */}
      <div className="mb-3 rounded-md border bg-muted/30 px-2.5 py-2">
        <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Search className="size-3.5" />
          {t("editor.binTargetResult", { target })}
        </div>
        {sorted ? (
          <>
            <div
              className={cn(
                "flex items-center gap-1.5 text-sm font-medium",
                found ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
              )}
            >
              {found ? <Check className="size-4 shrink-0" /> : <X className="size-4 shrink-0" />}
              {found ? t("editor.binFoundAt", { i: result }) : t("editor.binNotFound")}
            </div>
            <div className="mt-1 text-xs tabular-nums text-muted-foreground">
              <b>{t("editor.binSteps")}</b> {steps}
            </div>
          </>
        ) : (
          <div className="text-xs text-amber-700 dark:text-amber-300">
            {t("editor.binNeedSort")}
          </div>
        )}
      </div>

      {/* Аналіз складності: двійковий проти лінійного. */}
      <div className="mb-1 text-xs font-medium text-muted-foreground">{t("editor.binCasesTitle")}</div>
      <table className="w-full border-collapse text-xs">
        <tbody>
          <tr className="border-b text-right tabular-nums">
            <td className="py-1 text-left">{t("editor.binCaseBest")}</td>
            <td className="py-1 font-mono">{cases.best}</td>
            <td className="py-1 font-mono text-muted-foreground">O(1)</td>
          </tr>
          <tr className="border-b text-right tabular-nums">
            <td className="py-1 text-left">{t("editor.binCaseWorst")}</td>
            <td className="py-1 font-mono text-emerald-700 dark:text-emerald-400">{cases.worst}</td>
            <td className="py-1 font-mono text-muted-foreground">O(log n)</td>
          </tr>
          <tr className="text-right tabular-nums">
            <td className="py-1 text-left">{t("editor.binCaseLinear")}</td>
            <td className="py-1 font-mono text-rose-600 dark:text-rose-400">{cases.linear}</td>
            <td className="py-1 font-mono text-muted-foreground">O(n)</td>
          </tr>
        </tbody>
      </table>
      <p className="mt-2 text-xs text-muted-foreground">{t("editor.binCasesNote")}</p>

      {n > HEAVY_SIZE && (
        <p className="mt-2 flex items-start gap-1.5 rounded-md bg-amber-500/10 px-2 py-1.5 text-xs text-amber-700 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          {t("editor.binWarnMany")}
        </p>
      )}
    </div>
  )
}
