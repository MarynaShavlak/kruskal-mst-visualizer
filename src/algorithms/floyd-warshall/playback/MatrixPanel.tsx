import { Panel } from "@/algorithms/shared/playback/Panel"
import { cellFormula, cellRole } from "@/algorithms/floyd-warshall/playback/highlight"
import type { FwFrame } from "@/lib/floydWarshallTrace"
import { useT } from "@/i18n/use-t"
import { INF } from "@/lib/floydWarshall"
import type { Vertex } from "@/lib/directedGraph"
import { cn } from "@/lib/utils"

/**
 * Головна панель плеєра — матриця найкоротших відстаней D на поточному кадрі.
 * Підсвічує активну клітинку (i, j), два доданки D[i][k]+D[k][j], хрест півота
 * k та клітинки, покращені на цьому кроці k. ∞ — немає шляху.
 */
export function MatrixPanel({
  order,
  frame,
  className,
}: {
  order: readonly Vertex[]
  frame: FwFrame
  className?: string
}) {
  const n = order.length
  const matrix = frame.matrix
  const k = frame.k
  const t = useT()

  return (
    <Panel
      title={t("play.matrixD")}
      className={className}
      bodyClassName="overflow-auto p-3"
    >
      <div
        className="grid w-max gap-px text-center text-sm tabular-nums"
        style={{ gridTemplateColumns: `auto repeat(${n}, minmax(2.1rem, 1fr))` }}
      >
        <CornerHead />
        {order.map((v, c) => (
          <ColHead key={`col-${v}`} label={v} pivot={c === k} />
        ))}

        {order.map((vi, r) => (
          <RowGroup
            key={`row-${vi}`}
            label={vi}
            rowPivot={r === k}
            values={matrix[r]}
            r={r}
            frame={frame}
          />
        ))}
      </div>

      <FormulaBox frame={frame} order={order} />
      <Legend />
    </Panel>
  )
}

/** Розрахунок поточного кадру: D[i][j] = min( D[i][j], D[i][k] + D[k][j] ). */
function FormulaBox({
  frame,
  order,
}: {
  frame: FwFrame
  order: readonly Vertex[]
}) {
  const f = cellFormula(frame, order)
  const t = useT()

  if (!f) {
    return (
      <div className="mt-3 rounded-md border bg-muted/30 px-3 py-2 font-mono text-[11px] text-muted-foreground">
        D[i][j] = min( D[i][j], D[i][k] + D[k][j] )
      </div>
    )
  }

  return (
    <div className="mt-3 rounded-md border bg-muted/30 px-3 py-2 font-mono text-[11px] leading-relaxed">
      <div className="text-muted-foreground">
        {f.target} = min( {f.target}, {f.termIK} + {f.termKJ} )
      </div>
      <div>
        = min( {f.curr}, {f.viaText} ) ={" "}
        <span
          className={cn(
            "font-semibold",
            f.improved
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-foreground",
          )}
        >
          {f.result}
        </span>
        {!f.improved && (
          <span className="ml-1 text-muted-foreground">{t("play.fwNoChange")}</span>
        )}
      </div>
    </div>
  )
}

function CornerHead() {
  return (
    <div className="bg-muted/60 px-2 py-1 text-xs font-semibold text-muted-foreground">
      i\j
    </div>
  )
}

function ColHead({ label, pivot }: { label: string; pivot: boolean }) {
  return (
    <div
      className={cn(
        "px-1 py-1 font-semibold",
        pivot
          ? "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300"
          : "bg-muted/60 text-muted-foreground",
      )}
    >
      {label}
    </div>
  )
}

function RowGroup({
  label,
  rowPivot,
  values,
  r,
  frame,
}: {
  label: string
  rowPivot: boolean
  values: readonly number[]
  r: number
  frame: FwFrame
}) {
  return (
    <>
      <div
        className={cn(
          "px-2 py-1 font-semibold",
          rowPivot
            ? "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300"
            : "bg-muted/60 text-muted-foreground",
        )}
      >
        {label}
      </div>
      {values.map((val, c) => (
        <Cell key={c} val={val} role={cellRole(frame, r, c)} diag={r === c} />
      ))}
    </>
  )
}

function Cell({
  val,
  role,
  diag,
}: {
  val: number
  role: ReturnType<typeof cellRole>
  diag: boolean
}) {
  const empty = val === INF
  const negative = val < 0
  // Тло: summand (читаємо) важливіший за improved (щойно змінили) за pivot.
  const bg = role.summand
    ? "bg-sky-400/40"
    : role.improved
      ? "bg-emerald-400/35"
      : role.pivot
        ? "bg-indigo-500/10"
        : undefined

  return (
    <div
      className={cn(
        "border border-border/40 px-1 py-1 transition-colors",
        bg,
        role.target && "ring-2 ring-inset ring-amber-500 font-semibold",
        diag && !role.target && "text-muted-foreground",
        empty && "text-muted-foreground/40",
        negative && "font-semibold text-destructive",
      )}
    >
      {empty ? "∞" : val}
    </div>
  )
}

function Legend() {
  const t = useT()
  return (
    <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
      <Swatch className="ring-2 ring-inset ring-amber-500">D[i][j]</Swatch>
      <Swatch className="bg-sky-400/40">{t("play.legSummands")}</Swatch>
      <Swatch className="bg-emerald-400/35">{t("play.legImproved")}</Swatch>
      <Swatch className="bg-indigo-500/20">{t("play.legRowColK")}</Swatch>
    </div>
  )
}

function Swatch({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={cn("inline-block size-3 rounded-sm border", className)} />
      {children}
    </span>
  )
}
