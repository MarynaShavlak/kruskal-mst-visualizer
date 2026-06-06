import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useHashTab } from "@/hooks/use-hash-tab"
import { LearnView } from "@/features/learn/LearnView"
import { EditorView } from "@/features/editor/EditorView"
import { PlaybackView } from "@/features/playback/PlaybackView"
import { BenchmarkView } from "@/features/benchmark/BenchmarkView"

const TABS = [
  { key: "learn", label: "Навчання", View: LearnView },
  { key: "editor", label: "Редактор", View: EditorView },
  { key: "playback", label: "Алгоритм", View: PlaybackView },
  { key: "benchmark", label: "Бенчмарк", View: BenchmarkView },
] as const

const TAB_KEYS = TABS.map((t) => t.key)

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
              <View />
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  )
}
