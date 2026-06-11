import { useState } from "react"
import { ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useT } from "@/i18n/use-t"
import { INF, reconstructPath } from "@/lib/floydWarshall"
import type { FwResult } from "@/lib/floydWarshallTrace"

/**
 * Відновлення найкоротшого шляху між парою вершин за фінальною матрицею nxt.
 * Незалежне від курсора плеєра — працює з підсумковим результатом прогону.
 */
export function PathExplorer({
  result,
  className,
}: {
  result: FwResult
  className?: string
}) {
  const { order } = result
  const n = order.length
  const [from, setFrom] = useState(0)
  const [to, setTo] = useState(Math.max(0, n - 1))

  const u = Math.min(from, n - 1)
  const v = Math.min(to, n - 1)
  const t = useT()

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{t("play.pathReconstruct")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {result.hasNegativeCycle ? (
          <p className="rounded-md bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
            {t("play.fwNegCycleUndefined")}
          </p>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <VertexSelect value={u} order={order} onChange={setFrom} label={t("play.from")} />
              <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
              <VertexSelect value={v} order={order} onChange={setTo} label={t("play.to")} />
            </div>
            <PathResult result={result} u={u} v={v} />
          </>
        )}
      </CardContent>
    </Card>
  )
}

function VertexSelect({
  value,
  order,
  onChange,
  label,
}: {
  value: number
  order: readonly string[]
  onChange: (i: number) => void
  label: string
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="rounded-md border bg-background px-2 py-1 text-sm"
    >
      {order.map((v, i) => (
        <option key={v} value={i}>
          {v}
        </option>
      ))}
    </select>
  )
}

function PathResult({
  result,
  u,
  v,
}: {
  result: FwResult
  u: number
  v: number
}) {
  const dist = result.dist[u][v]
  const t = useT()
  let path: number[] | null = null
  try {
    path = reconstructPath(result.nxt, u, v)
  } catch {
    path = null
  }

  if (dist === INF || path === null) {
    return (
      <p className="text-muted-foreground">
        {t("play.noPath", { u: result.order[u], v: result.order[v] })}
      </p>
    )
  }

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-1 font-medium">
        {path.map((idx, k) => (
          <span key={`${idx}-${k}`} className="inline-flex items-center gap-1">
            {k > 0 && <ArrowRight className="size-3.5 text-muted-foreground" />}
            <span className="rounded bg-muted px-1.5 py-0.5">
              {result.order[idx]}
            </span>
          </span>
        ))}
      </div>
      <div className="text-muted-foreground">
        {t("play.pathLength")}{" "}
        <b className="tabular-nums text-foreground">{dist}</b>
        {" · "}
        {path.length - 1}{" "}
        {path.length - 1 === 1 ? t("play.edgeSingular") : t("play.edgesPlural")}
      </div>
    </div>
  )
}
