// Панель результату обходу: послідовність значень, зібрана досі, як чипи. Останній
// доданий (щойно відвіданий) підсвічено. Це «стрічка виводу» print(node.val).

import { Panel } from "@/algorithms/shared/playback/Panel"
import type { BtFrame } from "@/lib/treeTraversalTrace"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

export function OutputPanel({
  frame,
  total,
  className,
}: {
  frame: BtFrame
  /** Скільки всього вузлів у дереві (для «i / n»). */
  total: number
  className?: string
}) {
  const t = useT()
  const last = frame.output.length - 1
  const pulse = frame.justVisited !== null

  return (
    <Panel title={t("play.btOutputTitle")} className={className}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {frame.output.length === 0 ? (
            <span className="text-sm text-muted-foreground">—</span>
          ) : (
            frame.output.map((v, idx) => (
              <span
                key={idx}
                className={cn(
                  "inline-flex min-w-8 items-center justify-center rounded-md border px-2 py-1 font-mono text-sm font-semibold tabular-nums",
                  idx === last && pulse
                    ? "border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300"
                    : "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                )}
              >
                {v}
              </span>
            ))
          )}
        </div>
        <p className="font-mono text-xs text-muted-foreground tabular-nums">
          {frame.output.length} / {total}
        </p>
      </div>
    </Panel>
  )
}
