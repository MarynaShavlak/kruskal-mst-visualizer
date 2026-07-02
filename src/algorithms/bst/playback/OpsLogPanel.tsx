// Журнал скрипта операцій ДДП: список зверху вниз із підсвіткою поточної операції та
// вердиктом кожної вже виконаної (вставлено / уже є / знайдено / не знайдено / видалено).
// Презентаційний — усе інжектиться пропсами.

import { Panel } from "@/algorithms/shared/playback/Panel"
import type { BstOp, BstOpResult } from "@/lib/binarySearchTree"
import type { MessageKey } from "@/i18n/messages"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

const VERDICT_KEY: Record<BstOpResult, MessageKey> = {
  inserted: "play.bstResInserted",
  exists: "play.bstResExists",
  found: "play.bstResFound",
  missing: "play.bstResMissing",
  deleted: "play.bstResDeleted",
}

const VERDICT_TONE: Record<BstOpResult, string> = {
  inserted: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  exists: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  found: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  missing: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  deleted: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
}

export function OpsLogPanel({
  ops,
  perOp,
  revealed,
  currentOpIndex,
  className,
}: {
  ops: readonly BstOp[]
  perOp: readonly { readonly op: BstOp; readonly result: BstOpResult }[]
  /** Скільки вердиктів уже розкрито (стільки операцій виконано). */
  revealed: number
  /** Індекс поточної операції для підсвітки, або null. */
  currentOpIndex: number | null
  className?: string
}) {
  const t = useT()
  return (
    <Panel title={t("play.bstLogTitle")} className={className} bodyClassName="p-2">
      <ol className="flex flex-col gap-1 text-sm">
        {ops.map((op, i) => {
          const isCurrent = i === currentOpIndex
          const done = i < revealed
          const verdict = done ? perOp[i]?.result : undefined
          return (
            <li
              key={i}
              className={cn(
                "flex items-center gap-2 rounded px-2 py-1",
                isCurrent && "bg-primary/10 ring-1 ring-primary/40",
                !isCurrent && !done && "opacity-50",
              )}
            >
              <span className="w-4 text-right text-xs tabular-nums text-muted-foreground">
                {i + 1}
              </span>
              <span className="font-mono text-xs">
                <span className="text-muted-foreground">{t(`play.bstName_${op.kind}`)}</span>{" "}
                <span className="font-medium">{op.key}</span>
              </span>
              {verdict && (
                <span
                  className={cn(
                    "ml-auto rounded px-1.5 py-0.5 text-[11px] font-medium",
                    VERDICT_TONE[verdict],
                  )}
                >
                  {t(VERDICT_KEY[verdict])}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </Panel>
  )
}
