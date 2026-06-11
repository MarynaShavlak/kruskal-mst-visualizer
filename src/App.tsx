import { Toaster } from "@/components/ui/toaster"
import { LanguageToggle } from "@/components/language-toggle"
import { ThemeToggle } from "@/components/theme-toggle"
import { AlgorithmShell } from "@/features/shell/AlgorithmShell"
import { AlgorithmSwitcher } from "@/features/shell/AlgorithmSwitcher"
import { HomeView } from "@/features/home/HomeView"
import { getAlgorithm } from "@/algorithms/registry"
import { navigateTo, useRoute } from "@/hooks/use-route"

export default function App() {
  const route = useRoute()
  const algorithm = getAlgorithm(route.algorithmId) ?? null

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <button
            type="button"
            onClick={() => navigateTo(null)}
            className="rounded text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <h1 className="text-xl font-semibold">
              Алгоритми: інтерактивні розбори
            </h1>
            <p className="text-sm text-muted-foreground">
              {algorithm ? algorithm.name : "Платформа для вивчення алгоритмів"}
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
        {algorithm ? (
          <AlgorithmShell algorithm={algorithm} tab={route.tab} />
        ) : (
          <HomeView />
        )}
      </main>

      <Toaster />
    </div>
  )
}
