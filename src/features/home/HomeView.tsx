import { ArrowRight } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ALGORITHMS } from "@/algorithms/registry"
import { navigateTo } from "@/hooks/use-route"
import { cn } from "@/lib/utils"
import type { AlgorithmStatus } from "@/algorithms/types"

function StatusBadge({ status }: { status: AlgorithmStatus }) {
  const ready = status === "ready"
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        ready
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "bg-amber-500/10 text-amber-700 dark:text-amber-400",
      )}
    >
      {ready ? "Готово" : "Незабаром"}
    </span>
  )
}

/** Каталог: картки алгоритмів — головний екран платформи. */
export function HomeView() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Оберіть алгоритм</h2>
        <p className="text-sm text-muted-foreground">
          Інтерактивні розбори: теорія, редактор графа, покрокове програвання та
          бенчмарк. Нові алгоритми додаються поступово.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ALGORITHMS.map((algo) => {
          const ready = algo.status === "ready"
          const open = () =>
            navigateTo(algo.id, ready ? algo.defaultTab : null)
          return (
            <Card
              key={algo.id}
              role="button"
              tabIndex={0}
              onClick={open}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  open()
                }
              }}
              className="cursor-pointer transition outline-none hover:ring-foreground/25 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <CardHeader>
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-foreground/80">
                    <algo.icon className="size-5" />
                  </span>
                  <StatusBadge status={algo.status} />
                </div>
                <CardTitle className="flex items-center gap-1.5">
                  {algo.shortName}
                  {ready && (
                    <ArrowRight className="size-4 -translate-x-1 opacity-0 transition-all group-hover/card:translate-x-0 group-hover/card:opacity-100" />
                  )}
                </CardTitle>
                <CardDescription>{algo.tagline}</CardDescription>
                <p className="mt-1 text-xs text-muted-foreground/80">
                  {algo.category}
                </p>
              </CardHeader>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
