import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DEFAULT_DSU_OPTIONS, type DsuOptions } from "@/lib/dsu"
import { kruskalDsu } from "@/lib/kruskalDsu"
import { kruskalHasPath } from "@/lib/kruskalHasPath"
import { useT, useTr } from "@/i18n/use-t"
import { useGraphStore } from "@/store/graph-store"
import { useLangStore } from "@/store/lang-store"
import { CompareView } from "@/algorithms/kruskal/playback/CompareView"
import { DsuForestPanel } from "@/algorithms/kruskal/playback/DsuForestPanel"
import { NaiveStatePanel } from "@/algorithms/kruskal/playback/NaiveStatePanel"
import { SinglePlayer } from "@/algorithms/kruskal/playback/SinglePlayer"

type Mode = "dsu" | "hasPath" | "compare"

const MODE_KEYS: Mode[] = ["dsu", "hasPath", "compare"]

export function PlaybackView() {
  const graph = useGraphStore((s) => s.graph)
  const positions = useGraphStore((s) => s.positions)
  const [mode, setMode] = useState<Mode>("dsu")
  const [dsuOptions, setDsuOptions] = useState<DsuOptions>(DEFAULT_DSU_OPTIONS)
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr = useTr()
  const modeLabel = (m: Mode): string =>
    m === "dsu" ? "DSU" : m === "hasPath" ? t("play.modeNaive") : t("play.modeCompare")

  // Trace перебудовується при зміні мови (lang у залежностях) — нарація кадрів
  // локалізується; resetKey плеєра — граф, тож курсор не скидається.
  const dsuRun = useMemo(
    () => kruskalDsu(graph, dsuOptions, tr),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [graph, dsuOptions, lang],
  )
  const naiveRun = useMemo(
    () => kruskalHasPath(graph, tr),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [graph, lang],
  )

  if (graph.vertices.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          {t("play.emptyGraph")}
        </CardContent>
      </Card>
    )
  }

  const dsuOptionsBar = (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border bg-muted/20 px-3 py-2 text-sm">
      <span className="font-medium">{t("play.dsuOpts")}</span>
      <label className="flex cursor-pointer items-center gap-1.5">
        <input
          type="checkbox"
          className="accent-primary"
          checked={dsuOptions.unionByRank}
          onChange={(e) =>
            setDsuOptions((o) => ({ ...o, unionByRank: e.target.checked }))
          }
        />
        {t("play.unionByRank")}
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
        {t("play.pathCompression")}
      </label>
      {!dsuOptions.unionByRank && !dsuOptions.pathCompression && (
        <span className="text-amber-700">{t("play.noOptWarn")}</span>
      )}
      <span className="ml-auto text-muted-foreground">
        {t("play.totalFindSteps")}{" "}
        <b className="tabular-nums text-foreground">
          {dsuRun.result.dsuStats?.findSteps ?? 0}
        </b>
      </span>
    </div>
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {t("play.algoVersion")}
        </span>
        {MODE_KEYS.map((m) => (
          <Button
            key={m}
            size="sm"
            variant={mode === m ? "default" : "outline"}
            onClick={() => setMode(m)}
          >
            {modeLabel(m)}
          </Button>
        ))}
      </div>

      {mode === "dsu" && (
        <SinglePlayer
          graph={graph}
          positions={positions}
          run={dsuRun}
          codeTitle={t("play.codeDsu")}
          graphTitle={t("play.graphDsu")}
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
          codeTitle={t("play.codeNaive")}
          graphTitle={t("play.graphNaive")}
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
