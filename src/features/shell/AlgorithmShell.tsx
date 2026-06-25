import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { ComingSoon } from "@/features/shell/ComingSoon"
import { navigateTo } from "@/hooks/use-route"
import { useT } from "@/i18n/use-t"
import type { MessageKey } from "@/i18n/messages"
import type { Algorithm } from "@/algorithms/types"

function TabFallback() {
  const t = useT()
  return (
    <div className="p-10 text-center text-sm text-muted-foreground">
      {t("common.loading")}
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
  const t = useT()

  if (algorithm.status === "soon" || algorithm.tabs.length === 0) {
    return <ComingSoon algorithm={algorithm} />
  }

  const active =
    tab && algorithm.tabs.some((tb) => tb.key === tab)
      ? tab
      : algorithm.defaultTab

  return (
    <Tabs
      value={active}
      onValueChange={(value) => navigateTo(algorithm.id, value)}
    >
      <TabsList className="no-print">
        {algorithm.tabs.map((tb) => (
          <TabsTrigger key={tb.key} value={tb.key}>
            {/* Підписи вкладок спільні для всіх алгоритмів — з i18n за ключем. */}
            {t(`tab.${tb.key}` as MessageKey)}
          </TabsTrigger>
        ))}
      </TabsList>
      {algorithm.tabs.map((tb) => (
        <TabsContent key={tb.key} value={tb.key} className="mt-4">
          <ErrorBoundary>
            <Suspense fallback={<TabFallback />}>
              <tb.View />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>
      ))}
    </Tabs>
  )
}
