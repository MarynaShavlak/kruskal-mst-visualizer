import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useT } from "@/i18n/use-t"
import { toDistMatrix } from "@/lib/directedGraph"
import { INF, floydWarshall, hasNegativeCycle } from "@/lib/floydWarshall"
import { cn } from "@/lib/utils"
import { useDirectedGraphStore } from "@/store/directed-graph-store"

/**
 * Панель матриці суміжності орієнтованого графа (вхід Флойда–Воршала):
 * рядок i → стовпець j містить вагу ребра i→j (0 на діагоналі, «·» — немає
 * ребра). Унизу — лічильники й попередження про від'ємний цикл.
 */
export function AdjacencyMatrixPanel({ className }: { className?: string }) {
  const graph = useDirectedGraphStore((s) => s.graph)
  const { order, dist } = toDistMatrix(graph)
  const n = order.length
  const negativeCycle = n > 0 && hasNegativeCycle(floydWarshall(dist))
  const t = useT()

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{t("editor.fwMatrixTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {n === 0 ? (
          <p className="text-muted-foreground">{t("editor.emptyGraph")}</p>
        ) : (
          <div className="overflow-auto">
            <div
              className="grid w-max gap-px text-center text-xs tabular-nums"
              style={{ gridTemplateColumns: `auto repeat(${n}, minmax(1.75rem, 1fr))` }}
            >
              {/* кутова клітинка + заголовки стовпців */}
              <Head>i\j</Head>
              {order.map((v) => (
                <Head key={`col-${v}`}>{v}</Head>
              ))}

              {/* рядки */}
              {order.map((vi, i) => (
                <RowCells key={`row-${vi}`} label={vi} values={dist[i]} diag={i} />
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <Row label={t("editor.countVertices")} value={n} />
          <Row label={t("editor.fwEdgesDirected")} value={graph.edges.length} />
        </div>

        {negativeCycle && (
          <div className="rounded-md bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
            {t("editor.fwNegCycleWarn")}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function Head({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-muted/60 px-1 py-1 font-semibold text-muted-foreground">
      {children}
    </div>
  )
}

function RowCells({
  label,
  values,
  diag,
}: {
  label: string
  values: readonly number[]
  diag: number
}) {
  return (
    <>
      <Head>{label}</Head>
      {values.map((val, j) => {
        const isDiag = j === diag
        const empty = !isDiag && val === INF
        return (
          <div
            key={j}
            className={cn(
              "border border-border/50 px-1 py-1",
              isDiag && "bg-muted/40 text-muted-foreground",
              empty && "text-muted-foreground/40",
              !isDiag && !empty && val < 0 && "font-semibold text-destructive",
            )}
          >
            {isDiag ? 0 : empty ? "·" : val}
          </div>
        )
      })}
    </>
  )
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  )
}
