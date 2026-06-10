import { useEffect, useRef } from "react"
import { Panel } from "@/algorithms/shared/playback/Panel"
import { fmt, subsetMembers } from "@/algorithms/held-karp/playback/highlight"
import type { HkFrame, HkResult } from "@/lib/heldKarpTrace"
import { cn } from "@/lib/utils"

/**
 * Таблиця підзадач dp — серце Хелда–Карпа. Росте монотонно: показуємо лише вже
 * пораховані комірки (frame.committedCount) плюс ту, що рахується зараз. Рядки
 * згруповані за рівнем |S|. Активна комірка підсвічена й автоскролиться у вид;
 * клік по будь-якій — стрибок на кадр її обчислення (commitFrames[k]).
 */
export function DpTablePanel({
  result,
  frame,
  commitFrames,
  onSeek,
  className,
}: {
  result: HkResult
  frame: HkFrame
  commitFrames: readonly number[]
  onSeek: (frameIndex: number) => void
  className?: string
}) {
  const names = result.names
  const total = result.cells.length
  const committed = frame.committedCount
  const building =
    (frame.sub.kind === "cell-open" || frame.sub.kind === "candidate") &&
    frame.subset !== null

  // Активна комірка: щойно зафіксована (base/commit) або та, що в роботі (building).
  let activeIdx = -1
  if (frame.sub.kind === "base" || frame.sub.kind === "cell-commit") {
    activeIdx = committed - 1
  } else if (building) {
    activeIdx = committed // наступна в черзі — результат ще не підставлено
  }

  const visibleCount = committed + (building ? 1 : 0)
  const rows = result.cells.slice(0, visibleCount)

  // Індекси рядків, де змінюється рівень |S| — перед ними малюємо заголовок групи.
  const levelStarts = new Set<number>()
  let seenLevel = -1
  for (let k = 0; k < rows.length; k++) {
    if (rows[k].level !== seenLevel) {
      seenLevel = rows[k].level
      levelStarts.add(k)
    }
  }

  const activeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" })
  }, [activeIdx])

  return (
    <Panel
      title="Таблиця dp[(S, j)]"
      className={className}
      bodyClassName="overflow-auto p-2"
    >
      <div className="mb-1 px-1 text-[11px] text-muted-foreground tabular-nums">
        готово {committed}/{total} комірок
      </div>
      {rows.length === 0 ? (
        <p className="px-1 text-sm text-muted-foreground">
          Ще порожньо — почнемо з базових ребер зі старту.
        </p>
      ) : (
        <ul className="space-y-0.5">
          {rows.map((cell, k) => {
            const header = levelStarts.has(k) ? cell.level : null
            const isActive = k === activeIdx
            const pending = isActive && building
            const members = subsetMembers(cell.subset, names.length)
              .map((i) => names[i])
              .join("")
            return (
              <li key={k}>
                {header !== null && (
                  <div className="px-1 pb-0.5 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {header === 2 ? "База · |S|=2" : `Рівень · |S|=${header}`}
                  </div>
                )}
                <button
                  ref={isActive ? activeRef : undefined}
                  type="button"
                  onClick={() => onSeek(commitFrames[k])}
                  className={cn(
                    "w-full rounded-md border px-2 py-1 text-left transition-colors hover:bg-muted/50",
                    isActive &&
                      (pending
                        ? "border-amber-500/60 bg-amber-400/10 ring-2 ring-amber-500/50"
                        : "border-emerald-500/50 bg-emerald-500/10"),
                  )}
                >
                  <div className="flex items-center gap-1.5 text-sm">
                    <span className="font-mono text-xs text-muted-foreground">
                      {`{${members}}`}
                    </span>
                    <span className="text-muted-foreground">↦</span>
                    <span className="font-semibold">{names[cell.end]}</span>
                    <span className="ml-auto tabular-nums font-semibold">
                      {fmt(cell.cost)}
                    </span>
                  </div>
                  <div className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                    {cell.path.map((i) => names[i]).join(" → ")}
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}
