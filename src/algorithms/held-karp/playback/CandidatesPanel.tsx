import type { ReactNode } from "react"
import { Check } from "lucide-react"
import { Panel } from "@/algorithms/shared/playback/Panel"
import {
  closingCandidates,
  fmt,
  subsetMembers,
} from "@/algorithms/held-karp/playback/highlight"
import type { HkFrame, HkResult } from "@/lib/heldKarpTrace"
import { cn } from "@/lib/utils"

type RowState = "chosen" | "active" | "rejected" | "normal"

/**
 * «Розклад кандидатів» — внутрішній min() поточної дії. У фазі нарощування це
 * вибір передостаннього міста k для комірки dp[(S, j)]; у фазі замикання — вибір
 * кінця j, через який повертаємось у старт. Список стабільний на всіх кадрах
 * однієї комірки (кандидати лежать у кадрі), тож при скрабінгу не блимає.
 */
export function CandidatesPanel({
  result,
  frame,
  className,
}: {
  result: HkResult
  frame: HkFrame
  className?: string
}) {
  const closing = frame.phase === "closing" || frame.phase === "done"

  return (
    <Panel
      title="Вибір у min()"
      className={className}
      bodyClassName="overflow-auto p-3"
    >
      {closing ? (
        <ClosingList result={result} frame={frame} />
      ) : frame.candidates.length > 0 ? (
        <CellList result={result} frame={frame} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Тут з'явиться розбір min() — коли почнемо рахувати комірку dp.
        </p>
      )}
    </Panel>
  )
}

function CellList({
  result,
  frame,
}: {
  result: HkResult
  frame: HkFrame
}): ReactNode {
  const n = result.names.length
  const subsetLbl =
    frame.subset !== null
      ? subsetMembers(frame.subset, n)
          .map((i) => result.names[i])
          .join(", ")
      : ""
  const endName = frame.end !== null ? result.names[frame.end] : "?"

  return (
    <>
      <Formula>
        dp[ {`{${subsetLbl}}`}, {endName} ] = min
      </Formula>
      <ul className="mt-2 space-y-1">
        {frame.candidates.map((c, i) => {
          const state: RowState = c.chosen
            ? "chosen"
            : frame.activeCandidate === i
              ? "active"
              : !c.improved
                ? "rejected"
                : "normal"
          return (
            <Row
              key={i}
              chip={result.names[c.k]}
              chipTitle={`блок ${c.blockPath
                .map((x) => result.names[x])
                .join(" → ")} → ${endName}`}
              expr={`${fmt(c.blockCost)} + ${fmt(c.edge)}`}
              total={c.total}
              state={state}
            />
          )
        })}
      </ul>
    </>
  )
}

function ClosingList({
  result,
  frame,
}: {
  result: HkResult
  frame: HkFrame
}): ReactNode {
  const startName = result.names[result.start]
  const cands = closingCandidates(result)
  const activeJ =
    frame.sub.kind === "closing-candidate" ? frame.sub.end : null
  const bestJ =
    frame.bestTour != null
      ? frame.bestTour.path[frame.bestTour.path.length - 2]
      : null

  return (
    <>
      <Formula>
        тур = min( dp[усі, j] + dist[j→{startName}] )
      </Formula>
      <ul className="mt-2 space-y-1">
        {cands.map((c) => {
          const state: RowState =
            bestJ === c.j ? "chosen" : activeJ === c.j ? "active" : "normal"
          return (
            <Row
              key={c.j}
              chip={result.names[c.j]}
              chipTitle={`кінець ${result.names[c.j]} → ${startName}`}
              expr={`${fmt(c.blockCost)} + ${fmt(c.edge)}`}
              total={c.total}
              state={state}
            />
          )
        })}
      </ul>
    </>
  )
}

function Row({
  chip,
  chipTitle,
  expr,
  total,
  state,
}: {
  chip: string
  chipTitle?: string
  expr: string
  total: number
  state: RowState
}) {
  return (
    <li
      className={cn(
        "flex items-center gap-2 rounded-md border px-2 py-1 text-sm transition-colors",
        state === "chosen" && "border-emerald-500/50 bg-emerald-500/10",
        state === "active" && "ring-2 ring-amber-500/60",
        state === "rejected" && "opacity-55",
      )}
    >
      <span
        title={chipTitle}
        className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold"
      >
        {chip}
      </span>
      <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
        {expr}
      </span>
      <span className="ml-auto tabular-nums font-semibold">{fmt(total)}</span>
      {state === "chosen" && (
        <Check className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
      )}
    </li>
  )
}

function Formula({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border bg-muted/30 px-2 py-1 font-mono text-[11px] text-muted-foreground">
      {children}
    </div>
  )
}
