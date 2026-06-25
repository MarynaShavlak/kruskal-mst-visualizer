import { Suspense } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { ComingSoon } from "@/features/shell/ComingSoon"
import { PreconditionBanner } from "@/features/shell/PreconditionBanner"
import { bridgeFrom, bridgeTo, getAlgorithm } from "@/algorithms/registry"
import { navigateTo } from "@/hooks/use-route"
import { useT } from "@/i18n/use-t"
import { useLangStore } from "@/store/lang-store"
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
  const lang = useLangStore((s) => s.lang)

  if (algorithm.status === "soon" || algorithm.tabs.length === 0) {
    return <ComingSoon algorithm={algorithm} />
  }

  const active =
    tab && algorithm.tabs.some((tb) => tb.key === tab)
      ? tab
      : algorithm.defaultTab

  // Місточки навчального шляху: prev = звідки сюди веде ланцюг, next = куди далі.
  const prev = getAlgorithm(bridgeTo(algorithm.id)?.from)
  const next = getAlgorithm(bridgeFrom(algorithm.id)?.to)

  return (
    <>
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
        {/* Картка передумов і складності + живий детектор — у шапці, видна під час
            навчання/програвання. На вкладці редактора ховаємо, бо там уже є summary.
            Сам банер сам по собі дає mb-4; коли передумови немає — рендерить null. */}
        {active !== "editor" && <PreconditionBanner algorithm={algorithm} />}
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

      {(prev || next) && (
        <nav className="no-print mt-6 flex items-stretch justify-between gap-3 border-t pt-4">
          {prev ? (
            <button
              type="button"
              onClick={() => navigateTo(prev.id, prev.defaultTab)}
              className="group/nav flex min-w-0 items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-left transition outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0">
                <span className="block text-xs text-muted-foreground">
                  {t("shell.prevAlgo")}
                </span>
                <span className="block truncate text-sm font-medium">
                  {prev.shortName[lang]}
                </span>
              </span>
            </button>
          ) : (
            <span />
          )}
          {next ? (
            <button
              type="button"
              onClick={() => navigateTo(next.id, next.defaultTab)}
              className="group/nav flex min-w-0 items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-right transition outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="min-w-0">
                <span className="block text-xs text-muted-foreground">
                  {t("shell.nextAlgo")}
                </span>
                <span className="block truncate text-sm font-medium">
                  {next.shortName[lang]}
                </span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
            </button>
          ) : (
            <span />
          )}
        </nav>
      )}
    </>
  )
}
