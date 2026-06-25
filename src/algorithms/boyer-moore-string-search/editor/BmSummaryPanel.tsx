import { Check, Search, Table2, X } from "lucide-react"
import { useBoyerMooreStringSearchStore } from "@/store/boyer-moore-string-search-store"
import {
  buildShiftTable,
  boyerMooreSearch,
  boyerMooreSearchAll,
  bmMetrics,
  countNaiveComparisons,
} from "@/lib/boyerMooreStringSearch"
import { SummaryCard } from "@/algorithms/shared/editor/summary"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

/**
 * Зведення пари (текст, шаблон) для Боєра-Мура: ТАБЛИЦЯ ПОГАНОГО СИМВОЛУ (головний герой
 * передобробки) + фактичний результат (перший індекс / -1 + усі входження) + «ціна» в
 * порівняннях / стрибках / пропущених і КОНТРАСТ із наївним методом на тих самих даних
 * (рідкісні символи → стрибки великі, порівнянь менше за довжину тексту; повторювані →
 * деградація до O(n·m)).
 */
export function BmSummaryPanel({ className }: { className?: string }) {
  const t = useT()
  const text = useBoyerMooreStringSearchStore((s) => s.text)
  const pattern = useBoyerMooreStringSearchStore((s) => s.pattern)

  const m = pattern.length
  const empty = m === 0
  const tooLong = m > text.length
  const result = empty ? 0 : boyerMooreSearch(text, pattern)
  const all = empty ? [] : boyerMooreSearchAll(text, pattern)
  const metrics = empty ? { comparisons: 0, jumps: 0, skipped: 0 } : bmMetrics(text, pattern)
  const naive = empty ? 0 : countNaiveComparisons(text, pattern)
  const table = empty ? {} : buildShiftTable(pattern)
  const found = result !== -1
  const entries = Object.entries(table)

  return (
    <SummaryCard className={className}>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-muted-foreground">{t("editor.bmLen")}</span>
        <span className="font-medium tabular-nums">{t("editor.bmLenVal", { n: text.length, m })}</span>
      </div>

      {/* Таблиця поганого символу. */}
      <div className="mb-3">
        <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Table2 className="size-3.5" />
          {t("editor.bmShiftTable")}
        </div>
        {empty ? (
          <div className="text-xs text-amber-700 dark:text-amber-300">{t("editor.bmEmptyPattern")}</div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {entries.map(([ch, shift]) => (
              <span
                key={ch}
                className="inline-flex items-center gap-1 rounded border border-violet-400/50 bg-violet-500/10 px-1.5 py-0.5 font-mono text-xs text-violet-700 dark:text-violet-300"
              >
                <b>{ch === " " ? "␣" : ch}</b>
                <span className="text-muted-foreground">→</span>
                <span className="tabular-nums">{shift}</span>
              </span>
            ))}
            <span className="inline-flex items-center gap-1 rounded border border-dashed border-border px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
              {t("editor.bmShiftOther", { m })}
            </span>
          </div>
        )}
      </div>

      {/* Фактичний результат. */}
      <div className="mb-3 rounded-md border bg-muted/30 px-2.5 py-2">
        <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Search className="size-3.5" />
          {t("editor.bmTargetResult")}
        </div>
        {empty ? (
          <div className="text-xs text-amber-700 dark:text-amber-300">{t("editor.bmEmptyPattern")}</div>
        ) : tooLong ? (
          <div className="text-xs text-amber-700 dark:text-amber-300">{t("editor.bmTooLong")}</div>
        ) : (
          <>
            <div
              className={cn(
                "flex items-center gap-1.5 text-sm font-medium",
                found ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
              )}
            >
              {found ? <Check className="size-4 shrink-0" /> : <X className="size-4 shrink-0" />}
              {found ? t("editor.bmFoundAt", { i: result }) : t("editor.bmNotFound")}
            </div>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs tabular-nums text-muted-foreground">
              <span><b>{t("editor.bmComparisons")}</b> {metrics.comparisons}</span>
              <span><b>{t("editor.bmJumps")}</b> {metrics.jumps}</span>
              <span><b>{t("editor.bmSkipped")}</b> {metrics.skipped}</span>
            </div>
            {all.length > 1 && (
              <div className="mt-1 text-xs tabular-nums text-muted-foreground">
                <b>{t("editor.bmAllAt")}</b> [{all.join(", ")}]
              </div>
            )}
          </>
        )}
      </div>

      {/* Контраст із наївним. */}
      {!empty && !tooLong && (
        <>
          <div className="mb-1 text-xs font-medium text-muted-foreground">{t("editor.bmContrastTitle")}</div>
          <table className="w-full border-collapse text-xs">
            <tbody>
              <tr className="border-b text-right tabular-nums">
                <td className="py-1 text-left">{t("editor.bmContrastBm")}</td>
                <td className="py-1 font-mono text-emerald-700 dark:text-emerald-400">{metrics.comparisons}</td>
              </tr>
              <tr className="text-right tabular-nums">
                <td className="py-1 text-left">{t("editor.bmContrastNaive")}</td>
                <td className="py-1 font-mono text-muted-foreground">{naive}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}
      <p className="mt-2 text-xs text-muted-foreground">{t("editor.bmCasesNote")}</p>
    </SummaryCard>
  )
}
