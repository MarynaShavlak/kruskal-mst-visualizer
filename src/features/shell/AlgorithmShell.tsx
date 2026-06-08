import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ComingSoon } from "@/features/shell/ComingSoon"
import { navigateTo } from "@/hooks/use-route"
import type { Algorithm } from "@/algorithms/types"

function TabFallback() {
  return (
    <div className="p-10 text-center text-sm text-muted-foreground">
      Завантаження…
    </div>
  )
}

/**
 * Розділ одного алгоритму: вкладки (Навчання/Редактор/…) з лінивим контентом.
 * Для заглушок (status="soon" або без вкладок) показує екран «Незабаром».
 */
export function AlgorithmShell({
  algorithm,
  tab,
}: {
  algorithm: Algorithm
  tab: string | null
}) {
  if (algorithm.status === "soon" || algorithm.tabs.length === 0) {
    return <ComingSoon algorithm={algorithm} />
  }

  const active =
    tab && algorithm.tabs.some((t) => t.key === tab)
      ? tab
      : algorithm.defaultTab

  return (
    <Tabs
      value={active}
      onValueChange={(value) => navigateTo(algorithm.id, value)}
    >
      <TabsList>
        {algorithm.tabs.map((t) => (
          <TabsTrigger key={t.key} value={t.key}>
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {algorithm.tabs.map((t) => (
        <TabsContent key={t.key} value={t.key} className="mt-4">
          <Suspense fallback={<TabFallback />}>
            <t.View />
          </Suspense>
        </TabsContent>
      ))}
    </Tabs>
  )
}
