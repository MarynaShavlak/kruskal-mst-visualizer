import { Check, Search, X } from "lucide-react"
import { useNaiveStringSearchStore } from "@/store/naive-string-search-store"
import {
  naiveSearch,
  naiveSearchAll,
  countComparisons,
  caseAnalysis,
} from "@/lib/naiveStringSearch"
import { SummaryCard } from "@/algorithms/shared/editor/summary"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

/**
 * Зведення пари (текст, шаблон): фактичний результат (перший індекс / -1 + усі входження)
 * + ГОЛОВНЕ для наївного методу — «ціна» в ПОРІВНЯННЯХ для цих даних і АНАЛІЗ ВИПАДКІВ
 * (найкращий ≈ N-M+1 проти найгіршого (N-M+1)·M). Саме розрив best/worst мотивує перехід
 * до KMP / Боєра-Мура / Рабіна-Карпа.
 */
export function NssSummaryPanel({ className }: { className?: string }) {
  const t = useT()
  const text = useNaiveStringSearchStore((s) => s.text)
  const pattern = useNaiveStringSearchStore((s) => s.pattern)

  const m = pattern.length
  const result = m === 0 ? 0 : naiveSearch(text, pattern)
  const all = m === 0 ? [] : naiveSearchAll(text, pattern)
  const comparisons = countComparisons(text, pattern)
  const cases = caseAnalysis(text, pattern)
  const found = result !== -1
  const tooLong = m > text.length

  return (
    <SummaryCard className={className}>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-muted-foreground">{t("editor.strLen")}</span>
        <span className="font-medium tabular-nums">{t("editor.strLenVal", { n: text.length, m })}</span>
      </div>

      {/* Фактичний результат. */}
      <div className="mb-3 rounded-md border bg-muted/30 px-2.5 py-2">
        <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Search className="size-3.5" />
          {t("editor.strTargetResult")}
        </div>
        {m === 0 ? (
          <div className="text-xs text-amber-700 dark:text-amber-300">{t("editor.nssEmptyPattern")}</div>
        ) : tooLong ? (
          <div className="text-xs text-amber-700 dark:text-amber-300">{t("editor.strTooLong")}</div>
        ) : (
          <>
            <div
              className={cn(
                "flex items-center gap-1.5 text-sm font-medium",
                found ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
              )}
            >
              {found ? <Check className="size-4 shrink-0" /> : <X className="size-4 shrink-0" />}
              {found ? t("editor.nssFoundAt", { i: result }) : t("editor.nssNotFound")}
            </div>
            <div className="mt-1 text-xs tabular-nums text-muted-foreground">
              <b>{t("editor.nssComparisons")}</b> {comparisons}
            </div>
            {all.length > 1 && (
              <div className="mt-1 text-xs tabular-nums text-muted-foreground">
                <b>{t("editor.nssAllAt")}</b> [{all.join(", ")}]
              </div>
            )}
          </>
        )}
      </div>

      {/* Аналіз випадків. */}
      <div className="mb-1 text-xs font-medium text-muted-foreground">{t("editor.nssCasesTitle")}</div>
      <table className="w-full border-collapse text-xs">
        <tbody>
          <tr className="border-b text-right tabular-nums">
            <td className="py-1 text-left">{t("editor.nssCaseAlignments")}</td>
            <td className="py-1 font-mono">{cases.alignments}</td>
            <td className="py-1 font-mono text-muted-foreground">N−M+1</td>
          </tr>
          <tr className="border-b text-right tabular-nums">
            <td className="py-1 text-left">{t("editor.nssCaseBest")}</td>
            <td className="py-1 font-mono text-emerald-700 dark:text-emerald-400">{cases.best}</td>
            <td className="py-1 font-mono text-muted-foreground">O(n)</td>
          </tr>
          <tr className="text-right tabular-nums">
            <td className="py-1 text-left">{t("editor.nssCaseWorst")}</td>
            <td className="py-1 font-mono text-rose-600 dark:text-rose-400">{cases.worst}</td>
            <td className="py-1 font-mono text-muted-foreground">O(n·m)</td>
          </tr>
        </tbody>
      </table>
      <p className="mt-2 text-xs text-muted-foreground">{t("editor.nssCasesNote")}</p>
    </SummaryCard>
  )
}
