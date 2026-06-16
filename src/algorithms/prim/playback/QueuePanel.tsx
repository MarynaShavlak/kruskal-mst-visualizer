import type { PrimFrame } from "@/lib/primTrace"
import type { PrimQueueEdge } from "@/lib/prim"
import { Panel } from "@/algorithms/shared/playback/Panel"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

const fmt = (e: PrimQueueEdge): string => `(${e.weight}, ${e.from}, ${e.to})`

/**
 * Черга з пріоритетами на поточному кадрі. Зверху — щойно зняте ребро (жовте) з
 * вердиктом прийнято/застаріле; нижче — вміст черги, відсортований за пріоритетом
 * зняття: щойно додані ребра зелені, застарілі (обидва кінці в дереві) — сірі.
 */
export function QueuePanel({
  frame,
  title,
  className,
}: {
  frame: PrimFrame
  title?: string
  className?: string
}) {
  const t = useT()
  const visited = new Set(frame.visited)
  const pushedIds = new Set(frame.pushed.map((p) => p.id))
  const popped = frame.popped
  const verdict =
    popped == null
      ? null
      : frame.sub.kind === "accept"
        ? { label: t("play.primAccepted"), cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" }
        : frame.sub.kind === "skip"
          ? { label: t("play.primStaleTag"), cls: "bg-destructive/15 text-destructive" }
          : { label: t("play.primChecking"), cls: "bg-amber-500/15 text-amber-700 dark:text-amber-300" }

  return (
    <Panel title={title ?? t("play.primQueue")} className={className} bodyClassName="p-0">
      <div className="flex h-full min-h-0 flex-col">
        {popped && (
          <div className="flex items-center justify-between gap-2 border-b bg-amber-200/60 px-3 py-1.5 text-sm dark:bg-amber-400/20">
            <span className="font-mono font-medium tabular-nums">
              {t("play.primPopped")} {fmt(popped)}
            </span>
            {verdict && (
              <span className={cn("rounded px-1.5 py-0.5 text-xs font-medium", verdict.cls)}>
                {verdict.label}
              </span>
            )}
          </div>
        )}
        <ul className="min-h-0 flex-1 overflow-auto py-1 text-sm">
          {frame.queue.length === 0 ? (
            <li className="px-3 py-2 text-muted-foreground">{t("play.primQueueEmpty")}</li>
          ) : (
            frame.queue.map((q) => {
              const stale = visited.has(q.to) && visited.has(q.from)
              const fresh = pushedIds.has(q.id)
              return (
                <li
                  key={`${q.id}:${q.from}`}
                  className={cn(
                    "flex items-center justify-between gap-2 px-3 py-1 font-mono tabular-nums",
                    fresh && "bg-emerald-500/10",
                    stale && "text-muted-foreground line-through decoration-1",
                  )}
                >
                  <span>{fmt(q)}</span>
                  {fresh && <span className="text-xs not-italic text-emerald-600">＋</span>}
                  {stale && !fresh && (
                    <span className="text-[10px] uppercase tracking-wide">
                      {t("play.primStaleTag")}
                    </span>
                  )}
                </li>
              )
            })
          )}
        </ul>
      </div>
    </Panel>
  )
}
