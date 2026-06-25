import { MotionConfig } from "motion/react"
import { Toaster } from "@/components/ui/toaster"
import { PwaUpdatePrompt } from "@/components/PwaUpdatePrompt"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { LanguageToggle } from "@/components/language-toggle"
import { ThemeToggle } from "@/components/theme-toggle"
import { AlgorithmShell } from "@/features/shell/AlgorithmShell"
import { AlgorithmSwitcher } from "@/features/shell/AlgorithmSwitcher"
import { HomeView } from "@/features/home/HomeView"
import { ComplexityMatrix } from "@/features/compare/ComplexityMatrix"
import { getAlgorithm } from "@/algorithms/registry"
import { navigateTo, useRoute } from "@/hooks/use-route"
import { useT } from "@/i18n/use-t"
import { useLangStore } from "@/store/lang-store"

export default function App() {
  const route = useRoute()
  const algorithm = getAlgorithm(route.algorithmId) ?? null
  const t = useT()
  const lang = useLangStore((s) => s.lang)

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-background text-foreground">
        <header className="no-print border-b">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
            <button
              type="button"
              onClick={() => navigateTo(null)}
              className="rounded text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <h1 className="text-xl font-semibold">{t("app.title")}</h1>
              <p className="text-sm text-muted-foreground">
                {algorithm
                  ? algorithm.name[lang]
                  : route.page === "compare"
                    ? t("compare.title")
                    : t("app.subtitle")}
              </p>
            </button>
            <div className="flex items-center gap-2">
              <AlgorithmSwitcher current={algorithm} />
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6">
          <ErrorBoundary key={route.algorithmId ?? route.page ?? "home"}>
            {route.page === "compare" ? (
              <ComplexityMatrix />
            ) : algorithm ? (
              <AlgorithmShell algorithm={algorithm} tab={route.tab} />
            ) : (
              <HomeView />
            )}
          </ErrorBoundary>
        </main>

        <Toaster />
        <PwaUpdatePrompt />
      </div>
    </MotionConfig>
  )
}
