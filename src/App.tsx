import { lazy, Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useHashTab } from "@/hooks/use-hash-tab"

// Важкі вкладки вантажимо лінією окремими чанками
// (React Flow / Shiki / react-markdown+KaTeX / Recharts+Worker).
const LearnView = lazy(() =>
  import("@/features/learn/LearnView").then((m) => ({ default: m.LearnView })),
)
const EditorView = lazy(() =>
  import("@/features/editor/EditorView").then((m) => ({ default: m.EditorView })),
)
const PlaybackView = lazy(() =>
  import("@/features/playback/PlaybackView").then((m) => ({
    default: m.PlaybackView,
  })),
)
const BenchmarkView = lazy(() =>
  import("@/features/benchmark/BenchmarkView").then((m) => ({
    default: m.BenchmarkView,
  })),
)

const TABS = [
  { key: "learn", label: "Навчання", View: LearnView },
  { key: "editor", label: "Редактор", View: EditorView },
  { key: "playback", label: "Алгоритм", View: PlaybackView },
  { key: "benchmark", label: "Бенчмарк", View: BenchmarkView },
] as const

const TAB_KEYS = TABS.map((t) => t.key)

function TabFallback() {
  return (
    <div className="p-10 text-center text-sm text-muted-foreground">
      Завантаження…
    </div>
  )
}

export default function App() {
  const [tab, selectTab] = useHashTab(TAB_KEYS, "learn")

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <h1 className="text-xl font-semibold">
            Візуалізатор алгоритму Краскала
          </h1>
          <p className="text-sm text-muted-foreground">
            Інтерактивний розбір мінімального остовного дерева (МОД)
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Tabs value={tab} onValueChange={selectTab}>
          <TabsList>
            {TABS.map(({ key, label }) => (
              <TabsTrigger key={key} value={key}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
          {TABS.map(({ key, View }) => (
            <TabsContent key={key} value={key} className="mt-4">
              <Suspense fallback={<TabFallback />}>
                <View />
              </Suspense>
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  )
}
