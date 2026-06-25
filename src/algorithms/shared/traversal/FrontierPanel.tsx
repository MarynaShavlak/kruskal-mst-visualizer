import type { TraversalFrame } from "@/lib/graphTraversal"
import { Panel } from "@/algorithms/shared/playback/Panel"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

/**
 * Фронтир обходу: черга (BFS, наступний — з ПОЧАТКУ) або стек (DFS, наступний — з
 * КІНЦЯ). Щойно додані вершини підсвічені зеленим; «наступна на вихід» — кільцем.
 */
export function FrontierPanel({
  frame,
  className,
}: {
  frame: TraversalFrame
  className?: string
}) {
  const t = useT()
  const isBfs = frame.strategy === "bfs"
  const pushed = new Set(frame.pushed)
  const nextIndex = isBfs ? 0 : frame.frontier.length - 1
  const title = isBfs ? t("play.travQueueTitle") : t("play.travStackTitle")
  const hint = isBfs ? t("play.travQueueHint") : t("play.travStackHint")

  return (
    <Panel title={title} className={className} bodyClassName="p-0">
      <div className="flex h-full min-h-0 flex-col">
        <div className="border-b px-3 py-1.5 text-xs text-muted-foreground">
          {hint}
        </div>
        <div className="min-h-0 flex-1 overflow-auto p-3">
          {frame.frontier.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              {t("play.travFrontierEmpty")}
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {frame.frontier.map((v, idx) => {
                const isNext = idx === nextIndex
                const fresh = pushed.has(v)
                return (
                  <span
                    key={`${v}:${idx}`}
                    className={cn(
                      "inline-flex size-9 items-center justify-center rounded-md border text-sm font-semibold tabular-nums",
                      isNext
                        ? "border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-300"
                        : fresh
                          ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          : "border-border bg-muted/40",
                    )}
                  >
                    {v}
                  </span>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Panel>
  )
}

/** Порядок відвідування (зліва направо); остання — щойно відвідана. */
export function VisitOrderPanel({
  frame,
  className,
}: {
  frame: TraversalFrame
  className?: string
}) {
  const t = useT()
  const last = frame.order[frame.order.length - 1]
  const justVisited = frame.sub === "visit" ? frame.current : null

  return (
    <Panel title={t("play.travOrderTitle")} className={className} bodyClassName="p-3">
      {frame.order.length === 0 ? (
        <div className="text-sm text-muted-foreground">{t("play.travOrderEmpty")}</div>
      ) : (
        <div className="flex flex-wrap items-center gap-1.5">
          {frame.order.map((v, idx) => (
            <span key={`${v}:${idx}`} className="flex items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex size-8 items-center justify-center rounded-full border text-sm font-semibold",
                  v === justVisited || (justVisited === null && v === last)
                    ? "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    : "border-border bg-muted/40",
                )}
              >
                {v}
              </span>
              {idx < frame.order.length - 1 && (
                <span className="text-muted-foreground">→</span>
              )}
            </span>
          ))}
        </div>
      )}
    </Panel>
  )
}
