import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { analyzeGraph } from "@/lib/graphAnalysis"
import { cn } from "@/lib/utils"
import { useGraphStore } from "@/store/graph-store"

export function ConnectivityPanel({ className }: { className?: string }) {
  const graph = useGraphStore((s) => s.graph)
  const a = analyzeGraph(graph)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Зв'язність</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <Row label="Вершини" value={a.vertexCount} />
        <Row label="Ребра" value={a.edgeCount} />
        <Row label="Компоненти" value={a.componentCount} />
        <div
          className={cn(
            "mt-2 rounded-md px-2 py-1.5 text-xs",
            a.isConnected
              ? "bg-primary/10 text-foreground"
              : "bg-destructive/10 text-destructive",
          )}
        >
          {a.vertexCount === 0
            ? "Граф порожній — додайте вершини."
            : a.isConnected
              ? "Граф зв'язний — існує остовне дерево (МОД)."
              : `Граф незв'язний (${a.componentCount} компонент) — буде остовний ліс.`}
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
