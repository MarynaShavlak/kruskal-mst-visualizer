import { Check, Hash, Search, X } from "lucide-react"
import { useRabinKarpStringSearchStore } from "@/store/rabin-karp-string-search-store"
import {
  rabinKarpSearch,
  rabinKarpSearchAll,
  polynomialHash,
  rabinKarpMetrics,
  countHashCharOps,
} from "@/lib/rabinKarpStringSearch"
import { SummaryCard } from "@/algorithms/shared/editor/summary"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

/**
 * Зведення пари (текст, шаблон) для Рабіна-Карпа: фактичний результат (перший індекс / -1
 * + усі входження), ХЕШ шаблону (число, яке ми порівнюємо), і ГОЛОВНІ метрики — порівняння
 * хешів / посимвольні перевірки / КОЛІЗІЇ / rolling-оновлення, плюс контраст ціни
 * хешування «ковзний хеш проти перерахунку». Колізії — унікальна перлина методу.
 */
export function RkSummaryPanel({ className }: { className?: string }) {
  const t = useT()
  const text = useRabinKarpStringSearchStore((s) => s.text)
  const pattern = useRabinKarpStringSearchStore((s) => s.pattern)

  const m = pattern.length
  const result = m === 0 ? 0 : rabinKarpSearch(text, pattern)
  const all = m === 0 ? [] : rabinKarpSearchAll(text, pattern)
  const found = result !== -1
  const tooLong = m > text.length
  const patternHash = m === 0 ? 0 : polynomialHash(pattern)
  const metrics = rabinKarpMetrics(text, pattern)
  const rollingOps = countHashCharOps(text, pattern, true)
  const recomputeOps = countHashCharOps(text, pattern, false)

  return (
    <SummaryCard className={className}>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-muted-foreground">{t("editor.rkLen")}</span>
        <span className="font-medium tabular-nums">{t("editor.rkLenVal", { n: text.length, m })}</span>
      </div>

      {/* Хеш шаблону. */}
      <div className="mb-3 flex items-center justify-between rounded-md border border-violet-400/50 bg-violet-500/10 px-2.5 py-2">
        <span className="inline-flex items-center gap-1.5 text-xs text-violet-700 dark:text-violet-300">
          <Hash className="size-3.5" />
          {t("editor.rkPatternHash")}
        </span>
        <span className="font-mono text-sm font-medium tabular-nums text-violet-700 dark:text-violet-300">
          {m === 0 ? "—" : patternHash}
        </span>
      </div>

      {/* Фактичний результат. */}
      <div className="mb-3 rounded-md border bg-muted/30 px-2.5 py-2">
        <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Search className="size-3.5" />
          {t("editor.rkTargetResult")}
        </div>
        {m === 0 ? (
          <div className="text-xs text-amber-700 dark:text-amber-300">{t("editor.rkEmptyPattern")}</div>
        ) : tooLong ? (
          <div className="text-xs text-amber-700 dark:text-amber-300">{t("editor.rkTooLong")}</div>
        ) : (
          <>
            <div
              className={cn(
                "flex items-center gap-1.5 text-sm font-medium",
                found ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
              )}
            >
              {found ? <Check className="size-4 shrink-0" /> : <X className="size-4 shrink-0" />}
              {found ? t("editor.rkFoundAt", { i: result }) : t("editor.rkNotFound")}
            </div>
            {all.length > 1 && (
              <div className="mt-1 text-xs tabular-nums text-muted-foreground">
                <b>{t("editor.rkAllAt")}</b> [{all.join(", ")}]
              </div>
            )}
          </>
        )}
      </div>

      {/* Метрики. */}
      <div className="mb-1 text-xs font-medium text-muted-foreground">{t("editor.rkMetricsTitle")}</div>
      <table className="w-full border-collapse text-xs">
        <tbody>
          <tr className="border-b text-right tabular-nums">
            <td className="py-1 text-left">{t("editor.rkHashComparisons")}</td>
            <td className="py-1 font-mono">{metrics.hashComparisons}</td>
          </tr>
          <tr className="border-b text-right tabular-nums">
            <td className="py-1 text-left">{t("editor.rkCharVerifications")}</td>
            <td className="py-1 font-mono">{metrics.charVerifications}</td>
          </tr>
          <tr className="border-b text-right tabular-nums">
            <td className="py-1 text-left">{t("editor.rkCollisions")}</td>
            <td
              className={cn(
                "py-1 font-mono",
                metrics.collisions > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground",
              )}
            >
              {metrics.collisions}
            </td>
          </tr>
          <tr className="text-right tabular-nums">
            <td className="py-1 text-left">{t("editor.rkRolls")}</td>
            <td className="py-1 font-mono">{metrics.rolls}</td>
          </tr>
        </tbody>
      </table>

      {/* Ціна хешування: rolling проти перерахунку. */}
      <div className="mt-3 mb-1 text-xs font-medium text-muted-foreground">{t("editor.rkCostTitle")}</div>
      <div className="flex flex-col gap-1 text-xs tabular-nums">
        <div className="flex items-center justify-between">
          <span className="text-emerald-700 dark:text-emerald-400">{t("editor.rkCostRolling")}</span>
          <span className="font-mono text-emerald-700 dark:text-emerald-400">{rollingOps}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-rose-600 dark:text-rose-400">{t("editor.rkCostRecompute")}</span>
          <span className="font-mono text-rose-600 dark:text-rose-400">{recomputeOps}</span>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{t("editor.rkMetricsNote")}</p>
    </SummaryCard>
  )
}
