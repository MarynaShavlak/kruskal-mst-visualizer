// Прев'ю розкладки хеш-таблиці в редакторі: за поточним скриптом рахує фінальний
// стан (α, довжини ланцюгів, колізії) і показує наслідок ДО програвання — плюс
// попередження про перевантаження (α>0.75) і «гарячі точки» (довгі ланцюги).

import { SummaryCard, SummaryRow, HeavyWarning } from "@/algorithms/shared/editor/summary"
import { hashTablePreview, HT_HOT_CHAIN } from "@/lib/hashTablePreview"
import { useHashTableStore } from "@/store/hash-table-store"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

/** Тон міні-комірки за довжиною ланцюга: порожня / норм / гаряча точка. */
function cellTone(len: number): string {
  if (len === 0) return "border-border bg-muted/40 text-muted-foreground/60"
  if (len >= HT_HOT_CHAIN) return "border-rose-500/60 bg-rose-500/15 text-rose-700 dark:text-rose-300"
  return "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
}

export function HashPreviewPanel({ className }: { className?: string }) {
  const ops = useHashTableStore((s) => s.ops)
  const capacity = useHashTableStore((s) => s.capacity)
  const hashFn = useHashTableStore((s) => s.hashFn)
  const t = useT()

  const p = hashTablePreview(ops, capacity, { hashFn })

  return (
    <SummaryCard className={className}>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        <SummaryRow label={t("editor.htSize")} value={String(p.size)} mono />
        <SummaryRow label={t("editor.htCapacity")} value={String(p.capacity)} mono />
        <SummaryRow label={t("editor.htLoadFactor")} value={p.loadFactor.toFixed(2)} mono />
        <SummaryRow label={t("editor.htCollisions")} value={String(p.collisions)} mono />
        <SummaryRow label={t("editor.htMaxChain")} value={String(p.maxChain)} mono />
        <SummaryRow label={t("editor.htEmptyBuckets")} value={String(p.emptyBuckets)} mono />
      </dl>

      {/* Міні-розкладка комірок: довжина ланцюга кожної комірки. */}
      <div className="mt-3 flex flex-wrap gap-1">
        {p.chainLengths.map((len, i) => (
          <span
            key={i}
            title={`#${i}: ${len}`}
            className={cn(
              "inline-flex size-6 items-center justify-center rounded border text-xs font-mono tabular-nums",
              cellTone(len),
            )}
          >
            {len}
          </span>
        ))}
      </div>

      <HeavyWarning show={p.overloaded} text={t("editor.htWarnOverloaded")} />
      <HeavyWarning show={p.clustered} text={t("editor.htWarnClustered")} />
    </SummaryCard>
  )
}
