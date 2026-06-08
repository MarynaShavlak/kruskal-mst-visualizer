import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DEFAULT_DSU_OPTIONS, type DsuOptions } from "@/lib/dsu"
import { kruskalDsu } from "@/lib/kruskalDsu"
import { kruskalHasPath } from "@/lib/kruskalHasPath"
import { useGraphStore } from "@/store/graph-store"
import { CompareView } from "@/algorithms/kruskal/playback/CompareView"
import { DsuForestPanel } from "@/algorithms/kruskal/playback/DsuForestPanel"
import { NaiveStatePanel } from "@/algorithms/kruskal/playback/NaiveStatePanel"
import { SinglePlayer } from "@/algorithms/kruskal/playback/SinglePlayer"

type Mode = "dsu" | "hasPath" | "compare"

const MODES: { key: Mode; label: string }[] = [
  { key: "dsu", label: "DSU" },
  { key: "hasPath", label: "Наївна (BFS)" },
  { key: "compare", label: "Порівняння" },
]

export function PlaybackView() {
  const graph = useGraphStore((s) => s.graph)
  const positions = useGraphStore((s) => s.positions)
  const [mode, setMode] = useState<Mode>("dsu")
  const [dsuOptions, setDsuOptions] = useState<DsuOptions>(DEFAULT_DSU_OPTIONS)

  const dsuRun = useMemo(
    () => kruskalDsu(graph, dsuOptions),
    [graph, dsuOptions],
  )
  const naiveRun = useMemo(() => kruskalHasPath(graph), [graph])

  if (graph.vertices.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Граф порожній — створіть його у вкладці «Редактор».
        </CardContent>
      </Card>
    )
  }

  const dsuOptionsBar = (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border bg-muted/20 px-3 py-2 text-sm">
      <span className="font-medium">Оптимізації DSU:</span>
      <label className="flex cursor-pointer items-center gap-1.5">
        <input
          type="checkbox"
          className="accent-primary"
          checked={dsuOptions.unionByRank}
          onChange={(e) =>
            setDsuOptions((o) => ({ ...o, unionByRank: e.target.checked }))
          }
        />
        об'єднання за рангом
      </label>
      <label className="flex cursor-pointer items-center gap-1.5">
        <input
          type="checkbox"
          className="accent-primary"
          checked={dsuOptions.pathCompression}
          onChange={(e) =>
            setDsuOptions((o) => ({ ...o, pathCompression: e.target.checked }))
          }
        />
        стиснення шляху
      </label>
      {!dsuOptions.unionByRank && !dsuOptions.pathCompression && (
        <span className="text-amber-700">
          без оптимізацій дерево вироджується в ланцюг — find стає O(n)
        </span>
      )}
      <span className="ml-auto text-muted-foreground">
        усього find-кроків:{" "}
        <b className="tabular-nums text-foreground">
          {dsuRun.result.dsuStats?.findSteps ?? 0}
        </b>
      </span>
    </div>
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Версія алгоритму:</span>
        {MODES.map((m) => (
          <Button
            key={m.key}
            size="sm"
            variant={mode === m.key ? "default" : "outline"}
            onClick={() => setMode(m.key)}
          >
            {m.label}
          </Button>
        ))}
      </div>

      {mode === "dsu" && (
        <SinglePlayer
          graph={graph}
          positions={positions}
          run={dsuRun}
          codeTitle="Код — Краскал на DSU"
          graphTitle="Граф — множини DSU (кольори компонент)"
          headerExtra={dsuOptionsBar}
          thirdPanel={(f) => (
            <DsuForestPanel snapshot={f.dsu} className="min-h-[360px]" />
          )}
        />
      )}

      {mode === "hasPath" && (
        <SinglePlayer
          graph={graph}
          positions={positions}
          run={naiveRun}
          codeTitle="Код — наївний Краскал (BFS)"
          graphTitle="Граф — допоміжний ліс + BFS"
          thirdPanel={(f) => (
            <NaiveStatePanel frame={f} className="min-h-[360px]" />
          )}
        />
      )}

      {mode === "compare" && (
        <CompareView
          graph={graph}
          positions={positions}
          dsuRun={dsuRun}
          naiveRun={naiveRun}
        />
      )}
    </div>
  )
}
