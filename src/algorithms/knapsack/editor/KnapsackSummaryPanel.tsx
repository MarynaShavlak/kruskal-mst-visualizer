import { AlertTriangle } from "lucide-react"
import { useKnapsackStore } from "@/store/knapsack-store"
import { knapsackCells } from "@/lib/knapsack"
import { useT } from "@/i18n/use-t"
import { useLangStore } from "@/store/lang-store"
import { cn } from "@/lib/utils"

// Поріг, за яким таблиця ДП дає забагато кадрів для плавного плеєра (узгоджено з
// MAX_CELLS у плеєрі). Вище — показуємо попередження в редакторі.
const HEAVY_CELLS = 4000

/** Зведення інстансу рюкзака: лічильники, складність обох підходів, попередження. */
export function KnapsackSummaryPanel({ className }: { className?: string }) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const items = useKnapsackStore((s) => s.items)
  const capacity = useKnapsackStore((s) => s.capacity)

  const n = items.length
  const totalWeight = items.reduce((acc, it) => acc + it.weight, 0)
  const cells = knapsackCells(n, capacity)
  const subsets = 2 ** n
  const locale = lang === "ua" ? "uk-UA" : "en-US"
  const fmt = (x: number): string =>
    Number.isFinite(x) ? x.toLocaleString(locale) : "∞"

  return (
    <div className={cn("rounded-lg border bg-card p-3 text-sm", className)}>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        <Row label={t("editor.knapItems")} value={String(n)} />
        <Row label={t("editor.knapTotalWeight")} value={String(totalWeight)} />
        <Row label={t("editor.knapCapacity")} value={String(capacity)} />
        <Row label={t("editor.knapBruteSubsets")} value={fmt(subsets)} />
        <Row label={t("editor.knapDpCells")} value={fmt(cells)} mono />
      </dl>

      {cells > HEAVY_CELLS && (
        <p className="mt-3 flex items-start gap-1.5 rounded-md bg-amber-500/10 px-2 py-1.5 text-xs text-amber-700 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          {t("editor.knapWarnMany")}
        </p>
      )}
    </div>
  )
}

function Row({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("text-right font-medium tabular-nums", mono && "font-mono")}>
        {value}
      </dd>
    </>
  )
}
