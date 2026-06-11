import type { Frame } from "@/lib/trace"
import { Panel } from "@/algorithms/shared/playback/Panel"
import { useT } from "@/i18n/use-t"

export function NaiveStatePanel({
  frame,
  className,
}: {
  frame: Frame
  className?: string
}) {
  const t = useT()
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
    <Panel title={t("play.naiveTitle")} className={className}>
      <div className="space-y-2 text-sm">
        <Row label={t("play.curVertex")} value={at ?? "—"} accent />
        <Row label={t("play.queue")} value={frontier.length ? frontier.join(", ") : "—"} />
        <Row label={t("play.visited")} value={visited.length ? visited.join(", ") : "—"} />
        <p className="pt-1 text-xs text-muted-foreground">{t("play.naiveHint")}</p>
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
