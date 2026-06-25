import { AlertTriangle, Check, Search, X } from "lucide-react"
import { useInterpolationSearchStore } from "@/store/interpolation-search-store"
import {
  interpolationSearch,
  countProbes,
  countBinaryProbes,
  isSorted,
  caseAnalysis,
} from "@/lib/interpolationSearch"
import { HeavyWarning, SummaryCard } from "@/algorithms/shared/editor/summary"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

// Поріг, за яким масив завеликий для плавного плеєра (узгоджено з MAX_SIZE).
const HEAVY_SIZE = 64

/**
 * Зведення масиву + ПЕРЕДУМОВА (відсортованість) + КОНТРАСТ «формула проти середини»
 * + АНАЛІЗ ВИПАДКІВ. Найперше — індикатор «масив відсортований?»: без цього метод
 * некоректний. Далі — фактичний результат (індекс / -1 + проби) і ГОЛОВНЕ: пряме
 * порівняння проб інтерполяційного ↔ двійкового на ЦЬОМУ масиві (хто виграв) — серце
 * методу. Наприкінці — складність: best 1 / O(log log n) рівномірний / O(log n)
 * двійковий / O(n) скупчений.
 */
export function IpSummaryPanel({ className }: { className?: string }) {
  const t = useT()
  const values = useInterpolationSearchStore((s) => s.values)
  const target = useInterpolationSearchStore((s) => s.target)

  const n = values.length
  const sorted = isSorted(values)
  const cases = caseAnalysis(values)
  // Метод коректний лише на відсортованому масиві.
  const result = sorted ? interpolationSearch(values, target) : -1
  const probes = sorted ? countProbes(values, target) : 0
  const binProbes = sorted ? countBinaryProbes(values, target) : 0
  const found = result !== -1
  const ipWins = probes < binProbes
  const tie = probes === binProbes

  return (
    <SummaryCard className={className}>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-muted-foreground">{t("editor.ipSize")}</span>
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
        {sorted ? t("editor.ipSortedYes") : t("editor.ipSortedNo")}
      </p>

      {/* Фактичний результат для поточної цілі (лише якщо відсортовано). */}
      <div className="mb-3 rounded-md border bg-muted/30 px-2.5 py-2">
        <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Search className="size-3.5" />
          {t("editor.ipTargetResult", { target })}
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
              {found ? t("editor.ipFoundAt", { i: result }) : t("editor.ipNotFound")}
            </div>
            <div className="mt-1 text-xs tabular-nums text-muted-foreground">
              <b>{t("editor.ipProbes")}</b> {probes}
            </div>
          </>
        ) : (
          <div className="text-xs text-amber-700 dark:text-amber-300">
            {t("editor.ipNeedSort")}
          </div>
        )}
      </div>

      {/* КОНТРАСТ: формула проти середини на цьому масиві. */}
      {sorted && (
        <div className="mb-3 rounded-md border border-violet-400/40 bg-violet-500/5 px-2.5 py-2">
          <div className="mb-1.5 text-xs font-medium text-violet-700 dark:text-violet-300">
            {t("editor.ipVsTitle")}
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-md bg-card px-2 py-1.5">
              <div className="text-[11px] text-muted-foreground">{t("editor.ipVsInterp")}</div>
              <div className="text-lg font-semibold tabular-nums text-violet-600 dark:text-violet-400">{probes}</div>
            </div>
            <div className="rounded-md bg-card px-2 py-1.5">
              <div className="text-[11px] text-muted-foreground">{t("editor.ipVsBinary")}</div>
              <div className="text-lg font-semibold tabular-nums text-sky-600 dark:text-sky-400">{binProbes}</div>
            </div>
          </div>
          <p
            className={cn(
              "mt-1.5 text-[11px]",
              ipWins
                ? "text-emerald-700 dark:text-emerald-300"
                : tie
                  ? "text-muted-foreground"
                  : "text-amber-700 dark:text-amber-300",
            )}
          >
            {ipWins ? t("editor.ipVsWin") : tie ? t("editor.ipVsTie") : t("editor.ipVsLose")}
          </p>
        </div>
      )}

      {/* Аналіз складності. */}
      <div className="mb-1 text-xs font-medium text-muted-foreground">{t("editor.ipCasesTitle")}</div>
      <table className="w-full border-collapse text-xs">
        <tbody>
          <tr className="border-b text-right tabular-nums">
            <td className="py-1 text-left">{t("editor.ipCaseBest")}</td>
            <td className="py-1 font-mono">{cases.best}</td>
            <td className="py-1 font-mono text-muted-foreground">O(1)</td>
          </tr>
          <tr className="border-b text-right tabular-nums">
            <td className="py-1 text-left">{t("editor.ipCaseUniform")}</td>
            <td className="py-1 font-mono text-emerald-700 dark:text-emerald-400">{cases.avgUniform}</td>
            <td className="py-1 font-mono text-muted-foreground">O(log log n)</td>
          </tr>
          <tr className="border-b text-right tabular-nums">
            <td className="py-1 text-left">{t("editor.ipCaseBinary")}</td>
            <td className="py-1 font-mono text-sky-600 dark:text-sky-400">{cases.binary}</td>
            <td className="py-1 font-mono text-muted-foreground">O(log n)</td>
          </tr>
          <tr className="text-right tabular-nums">
            <td className="py-1 text-left">{t("editor.ipCaseWorst")}</td>
            <td className="py-1 font-mono text-rose-600 dark:text-rose-400">{cases.worst}</td>
            <td className="py-1 font-mono text-muted-foreground">O(n)</td>
          </tr>
        </tbody>
      </table>
      <p className="mt-2 text-xs text-muted-foreground">{t("editor.ipCasesNote")}</p>

      <HeavyWarning show={n > HEAVY_SIZE} text={t("editor.ipWarnMany")} />
    </SummaryCard>
  )
}
