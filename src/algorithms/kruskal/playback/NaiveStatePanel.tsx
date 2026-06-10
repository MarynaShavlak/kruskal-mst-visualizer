import type { Frame } from "@/lib/trace"
import { Panel } from "@/algorithms/shared/playback/Panel"

export function NaiveStatePanel({
  frame,
  className,
}: {
  frame: Frame
  className?: string
}) {
  const sub = frame.sub
  const at = sub.kind === "bfs-visit" ? sub.at : null
  const frontier = sub.kind === "bfs-visit" ? sub.frontier : []
  const visited =
    sub.kind === "bfs-visit"
      ? sub.visited
      : sub.kind === "bfs-exhausted"
        ? sub.visited
        : []

  return (
    <Panel title="BFS у допоміжному лісі" className={className}>
      <div className="space-y-2 text-sm">
        <Row label="Поточна вершина" value={at ?? "—"} accent />
        <Row label="Черга (фронтир)" value={frontier.length ? frontier.join(", ") : "—"} />
        <Row label="Відвідані" value={visited.length ? visited.join(", ") : "—"} />
        <p className="pt-1 text-xs text-muted-foreground">
          Ребро додається лише тоді, коли BFS НЕ знайшов шлях між його кінцями
          (інакше — цикл).
        </p>
      </div>
    </Panel>
  )
}

function Row({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={accent ? "font-semibold text-amber-700" : "font-medium"}>
        {value}
      </span>
    </div>
  )
}
