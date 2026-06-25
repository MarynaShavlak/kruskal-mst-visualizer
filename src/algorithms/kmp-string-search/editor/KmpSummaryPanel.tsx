import { Check, Search, Table2, X } from "lucide-react"
import { useKmpStringSearchStore } from "@/store/kmp-string-search-store"
import {
  computeLps,
  kmpSearch,
  kmpSearchAll,
  countKmpComparisons,
  countNaiveComparisons,
} from "@/lib/kmpStringSearch"
import { SummaryCard } from "@/algorithms/shared/editor/summary"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

/**
 * Зведення пари (текст, шаблон) для KMP: фактичний результат (перший індекс / -1 + усі
 * входження) + ПРЕВ'Ю таблиці `lps` шаблону (серце KMP) + КОНТРАСТ «ціни» в порівняннях:
 * KMP (lps + пошук = total) проти наївного (N-M+1)·M у найгіршому. Саме розрив total/naive
 * на патологічних входах (AAAA…/AAAAB) показує перевагу лінійного O(n+m).
 */
export function KmpSummaryPanel({ className }: { className?: string }) {
  const t = useT()
  const text = useKmpStringSearchStore((s) => s.text)
  const pattern = useKmpStringSearchStore((s) => s.pattern)

  const m = pattern.length
  const tooLong = m > text.length
  const result = m === 0 ? 0 : kmpSearch(text, pattern)
  const all = m === 0 ? [] : kmpSearchAll(text, pattern)
  const found = result !== -1
  const lps = m === 0 ? [] : computeLps(pattern)
  const cmp = countKmpComparisons(text, pattern)
  const naive = countNaiveComparisons(text, pattern)

  return (
    <SummaryCard className={className}>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-muted-foreground">{t("editor.kmpLen")}</span>
        <span className="font-medium tabular-nums">{t("editor.kmpLenVal", { n: text.length, m })}</span>
      </div>

      {/* Фактичний результат. */}
      <div className="mb-3 rounded-md border bg-muted/30 px-2.5 py-2">
        <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Search className="size-3.5" />
          {t("editor.kmpTargetResult")}
        </div>
        {m === 0 ? (
          <div className="text-xs text-amber-700 dark:text-amber-300">{t("editor.kmpEmptyPattern")}</div>
        ) : tooLong ? (
          <div className="text-xs text-amber-700 dark:text-amber-300">{t("editor.kmpTooLong")}</div>
        ) : (
          <>
            <div
              className={cn(
                "flex items-center gap-1.5 text-sm font-medium",
                found ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
              )}
            >
              {found ? <Check className="size-4 shrink-0" /> : <X className="size-4 shrink-0" />}
              {found ? t("editor.kmpFoundAt", { i: result }) : t("editor.kmpNotFound")}
            </div>
            {all.length > 1 && (
              <div className="mt-1 text-xs tabular-nums text-muted-foreground">
                <b>{t("editor.kmpAllAt")}</b> [{all.join(", ")}]
              </div>
            )}
          </>
        )}
      </div>

      {/* Прев'ю таблиці lps шаблону. */}
      {m > 0 && (
        <div className="mb-3">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Table2 className="size-3.5" /> {t("editor.kmpLpsTitle")}
          </div>
          <div className="overflow-x-auto">
            <table className="border-collapse text-center text-xs">
              <tbody>
                <tr>
                  <td className="px-1.5 py-0.5 text-right text-[10px] text-muted-foreground">i</td>
                  {Array.from(pattern).map((_, i) => (
                    <td key={i} className="border px-1.5 py-0.5 tabular-nums text-muted-foreground">{i}</td>
                  ))}
                </tr>
                <tr>
                  <td className="px-1.5 py-0.5 text-right text-[10px] text-muted-foreground">{t("editor.kmpLpsChar")}</td>
                  {Array.from(pattern).map((ch, i) => (
                    <td key={i} className="border px-1.5 py-0.5 font-mono">{ch === " " ? "␣" : ch}</td>
                  ))}
                </tr>
                <tr>
                  <td className="px-1.5 py-0.5 text-right text-[10px] text-muted-foreground">lps</td>
                  {lps.map((v, i) => (
                    <td key={i} className="border px-1.5 py-0.5 font-mono tabular-nums text-sky-700 dark:text-sky-300">{v}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Контраст ціни KMP проти наївного. */}
      <div className="mb-1 text-xs font-medium text-muted-foreground">{t("editor.kmpCostTitle")}</div>
      <table className="w-full border-collapse text-xs">
        <tbody>
          <tr className="border-b text-right tabular-nums">
            <td className="py-1 text-left">{t("editor.kmpCostLps")}</td>
            <td className="py-1 font-mono">{cmp.lps}</td>
            <td className="py-1 font-mono text-muted-foreground">O(m)</td>
          </tr>
          <tr className="border-b text-right tabular-nums">
            <td className="py-1 text-left">{t("editor.kmpCostSearch")}</td>
            <td className="py-1 font-mono">{cmp.search}</td>
            <td className="py-1 font-mono text-muted-foreground">O(n)</td>
          </tr>
          <tr className="border-b text-right tabular-nums">
            <td className="py-1 text-left">{t("editor.kmpCostTotal")}</td>
            <td className="py-1 font-mono text-emerald-700 dark:text-emerald-400">{cmp.total}</td>
            <td className="py-1 font-mono text-muted-foreground">O(n+m)</td>
          </tr>
          <tr className="text-right tabular-nums">
            <td className="py-1 text-left">{t("editor.kmpCostNaive")}</td>
            <td className="py-1 font-mono text-rose-600 dark:text-rose-400">{naive}</td>
            <td className="py-1 font-mono text-muted-foreground">O(n·m)</td>
          </tr>
        </tbody>
      </table>
      <p className="mt-2 text-xs text-muted-foreground">{t("editor.kmpCostNote")}</p>
    </SummaryCard>
  )
}
