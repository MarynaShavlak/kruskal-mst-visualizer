import { AlertTriangle, Check, Search, X } from "lucide-react"
import { useIndexedSequentialSearchStore } from "@/store/indexed-sequential-search-store"
import {
  createIndexTable,
  indexedSequentialSearch,
  countSteps,
  isSorted,
  optimalStep,
} from "@/lib/indexedSequentialSearch"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

// Поріг, за яким масив завеликий для плавної дворівневої схеми (узгоджено з MAX_SIZE).
const HEAVY_SIZE = 48

/**
 * Зведення: ПЕРЕДУМОВА (відсортованість) + ІНДЕКСНА таблиця (крок) + фактичний
 * результат поточної цілі (позиція / -1 + два доданки ціни) + КОНТРАСТ складності
 * (чистий лінійний O(n) / чистий двійковий O(log n) / гібрид) + оптимум кроку ≈ √n.
 */
export function IxsSummaryPanel({ className }: { className?: string }) {
  const t = useT()
  const values = useIndexedSequentialSearchStore((s) => s.values)
  const target = useIndexedSequentialSearchStore((s) => s.target)
  const step = useIndexedSequentialSearchStore((s) => s.step)

  const n = values.length
  const sorted = isSorted(values)
  const table = sorted ? createIndexTable(values, step) : []
  const counts = sorted
    ? countSteps(values, target, step)
    : { indexProbes: 0, seqComparisons: 0, total: 0 }
  const result = sorted ? indexedSequentialSearch(values, table, target) : -1
  const found = result !== -1
  const linear = n
  const binary = n > 0 ? Math.floor(Math.log2(n)) + 1 : 0
  const opt = optimalStep(n)

  return (
    <div className={cn("rounded-lg border bg-card p-3 text-sm", className)}>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-muted-foreground">{t("editor.issSize")}</span>
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
        {sorted ? t("editor.issSortedYes") : t("editor.issSortedNo")}
      </p>

      {/* Індексна таблиця (сигнальні стовпи). */}
      <div className="mb-3">
        <div className="mb-1 text-xs text-muted-foreground">{t("editor.issIndexTitle", { step })}</div>
        {sorted && table.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {table.map(([key, pos], j) => (
              <span
                key={j}
                className="inline-flex items-center gap-0.5 rounded border border-violet-400/50 bg-violet-500/10 px-1.5 py-0.5 font-mono text-xs text-violet-700 dark:text-violet-300"
              >
                {key}
                <span className="text-violet-500/70">↘{pos}</span>
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">{t("editor.issIndexEmpty")}</span>
        )}
      </div>

      {/* Фактичний результат для поточної цілі (лише якщо відсортовано). */}
      <div className="mb-3 rounded-md border bg-muted/30 px-2.5 py-2">
        <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Search className="size-3.5" />
          {t("editor.issTargetResult", { target })}
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
              {found ? t("editor.issFoundAt", { i: result }) : t("editor.issNotFound")}
            </div>
            <div className="mt-1 flex flex-col gap-0.5 text-xs tabular-nums text-muted-foreground">
              <span><b>{t("editor.issProbes")}</b> {counts.indexProbes}</span>
              <span><b>{t("editor.issComparisons")}</b> {counts.seqComparisons}</span>
              <span><b>{t("editor.issTotal")}</b> {counts.total}</span>
            </div>
          </>
        ) : (
          <div className="text-xs text-amber-700 dark:text-amber-300">{t("editor.issNeedSort")}</div>
        )}
      </div>

      {/* Контраст складності: де лежить гібрид. */}
      <div className="mb-1 text-xs font-medium text-muted-foreground">{t("editor.issCostTitle")}</div>
      <div className="mb-2 text-[11px] text-muted-foreground">{t("editor.issContrastTitle")}</div>
      <table className="w-full border-collapse text-xs">
        <tbody>
          <tr className="border-b text-right tabular-nums">
            <td className="py-1 text-left">{t("editor.issContrastLinear")}</td>
            <td className="py-1 font-mono text-rose-600 dark:text-rose-400">{linear}</td>
          </tr>
          <tr className="border-b text-right tabular-nums">
            <td className="py-1 text-left">{t("editor.issContrastBinary")}</td>
            <td className="py-1 font-mono text-sky-600 dark:text-sky-400">{binary}</td>
          </tr>
          <tr className="text-right tabular-nums">
            <td className="py-1 text-left">{t("editor.issContrastHybrid")}</td>
            <td className="py-1 font-mono text-emerald-700 dark:text-emerald-400">{counts.total}</td>
          </tr>
        </tbody>
      </table>

      <p className="mt-2 text-xs tabular-nums text-violet-700 dark:text-violet-300">
        {t("editor.issOptimalStep", { n, opt })}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{t("editor.issStepNote")}</p>

      {n > HEAVY_SIZE && (
        <p className="mt-2 flex items-start gap-1.5 rounded-md bg-amber-500/10 px-2 py-1.5 text-xs text-amber-700 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          {t("editor.issWarnMany")}
        </p>
      )}
    </div>
  )
}
