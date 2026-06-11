import { Fragment, type ReactNode } from "react"
import { Panel } from "@/algorithms/shared/playback/Panel"
import {
  activeEdge,
  fmt,
  subsetMembers,
} from "@/algorithms/held-karp/playback/highlight"
import type { HkFrame, HkResult } from "@/lib/heldKarpTrace"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

/**
 * Матриця відстаней (тільки читання) під час програвання. Підсвічує активне
 * ребро поточного кадру (k→j / start→j / j→start) та його симетричну клітинку,
 * виділяє заголовки старту й активного кінця; міста поза активною підмножиною —
 * тьмяні. Діагональ — нулі.
 */
export function MatrixPanel({
  result,
  frame,
  className,
}: {
  result: HkResult
  frame: HkFrame
  className?: string
}) {
  const t = useT()
  const n = result.names.length
  const edge = activeEdge(frame, result.start)
  const edgeSet = edge
    ? new Set([`${edge[0]},${edge[1]}`, `${edge[1]},${edge[0]}`])
    : null
  const inSub =
    frame.subset !== null ? new Set(subsetMembers(frame.subset, n)) : null
  const endIdx = frame.end
  const inSubset = (i: number): boolean => inSub?.has(i) ?? true

  return (
    <Panel
      title={t("play.hkMatrixTitle")}
      className={className}
      bodyClassName="overflow-auto p-3"
    >
      <div
        className="grid w-max gap-px text-center text-xs tabular-nums"
        style={{ gridTemplateColumns: `auto repeat(${n}, minmax(2.6rem, 1fr))` }}
      >
        <div className="bg-muted/60 px-1 py-1 text-[11px] font-semibold text-muted-foreground">
          j\k
        </div>
        {result.names.map((nm, c) => (
          <Head
            key={`col-${c}`}
            label={nm}
            start={c === result.start}
            end={c === endIdx}
            dim={!inSubset(c)}
          />
        ))}

        {result.names.map((nm, r) => (
          <Fragment key={`row-${r}`}>
            <Head
              label={nm}
              start={r === result.start}
              end={r === endIdx}
              dim={!inSubset(r)}
            />
            {result.dist[r].map((d, c) => (
              <Cell
                key={c}
                value={d}
                diag={r === c}
                active={edgeSet?.has(`${r},${c}`) ?? false}
              />
            ))}
          </Fragment>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        <Swatch className="ring-2 ring-inset ring-amber-500">{t("play.legActiveEdge")}</Swatch>
        <Swatch className="bg-violet-500/30">{t("play.legStart")}</Swatch>
        <Swatch className="ring-2 ring-inset ring-amber-500/40">{t("play.legEndJ")}</Swatch>
      </div>
    </Panel>
  )
}

function Head({
  label,
  start,
  end,
  dim,
}: {
  label: string
  start: boolean
  end: boolean
  dim: boolean
}) {
  return (
    <div
      className={cn(
        "px-1 py-1 font-semibold",
        start
          ? "bg-violet-500/25 text-violet-700 dark:text-violet-300"
          : "bg-muted/60 text-muted-foreground",
        end && "ring-2 ring-inset ring-amber-500/50",
        dim && !start && "opacity-45",
      )}
    >
      {label}
    </div>
  )
}

function Cell({
  value,
  diag,
  active,
}: {
  value: number
  diag: boolean
  active: boolean
}) {
  return (
    <div
      className={cn(
        "border border-border/40 px-1 py-1 transition-colors",
        active && "bg-amber-400/30 font-semibold ring-2 ring-inset ring-amber-500",
        diag && "text-muted-foreground/40",
      )}
    >
      {diag ? "0" : fmt(value)}
    </div>
  )
}

function Swatch({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={cn("inline-block size-3 rounded-sm border", className)} />
      {children}
    </span>
  )
}
