import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useT } from "@/i18n/use-t"
import { analyzeGraph } from "@/lib/graphAnalysis"
import { cn } from "@/lib/utils"
import { useGraphStore } from "@/store/graph-store"

export function ConnectivityPanel({ className }: { className?: string }) {
  const graph = useGraphStore((s) => s.graph)
  const a = analyzeGraph(graph)
  const t = useT()

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{t("editor.connTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <Row label={t("editor.countVertices")} value={a.vertexCount} />
        <Row label={t("editor.countEdges")} value={a.edgeCount} />
        <Row label={t("editor.connComponents")} value={a.componentCount} />
        <div
          className={cn(
            "mt-2 rounded-md px-2 py-1.5 text-xs",
            a.isConnected
              ? "bg-primary/10 text-foreground"
              : "bg-destructive/10 text-destructive",
          )}
        >
          {a.vertexCount === 0
            ? t("editor.emptyGraph")
            : a.isConnected
              ? t("editor.connConnected")
              : t("editor.connDisconnected", { n: a.componentCount })}
        </div>
      </CardContent>
    </Card>
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
