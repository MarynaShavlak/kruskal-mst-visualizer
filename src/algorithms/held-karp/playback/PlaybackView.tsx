import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { buildHeldKarpTrace, type HkFrame, type HkResult } from "@/lib/heldKarpTrace"
import { useTspStore } from "@/store/tsp-store"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { PlayerShell } from "@/algorithms/shared/playback/PlayerShell"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import {
  cellCommitFrames,
  fmt,
  subsetMembers,
} from "@/algorithms/held-karp/playback/highlight"
import { CandidatesPanel } from "@/algorithms/held-karp/playback/CandidatesPanel"
import { DpTablePanel } from "@/algorithms/held-karp/playback/DpTablePanel"
import { MatrixPanel } from "@/algorithms/held-karp/playback/MatrixPanel"
import { TourMapPanel } from "@/algorithms/held-karp/playback/TourMapPanel"
import { cn } from "@/lib/utils"

// Кожен кадр зберігається в пам'яті, тож обмежуємо інстанс плеєра. n=11 → ~10 тис.
// комірок dp; вище — забагато кадрів для плавного скрабінгу (редактор попереджає
// про складність ще раніше). Демо — 5 міст, випадковий пресет — 6.
const MAX_CITIES = 11

export function PlaybackView() {
  const cities = useTspStore((s) => s.cities)
  const start = useTspStore((s) => s.start)
  const n = cities.length
  const inRange = n >= 2 && n <= MAX_CITIES

  const run = useMemo(
    () => (inRange ? buildHeldKarpTrace({ cities, start }) : null),
    [cities, start, inRange],
  )
  const frames = run?.trace.frames
  const player = usePlayer(frames?.length ?? 1, run)
  const commitFrames = useMemo(
    () => (run ? cellCommitFrames(run.trace.frames) : []),
    [run],
  )

  if (!run || !frames) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          {n < 2
            ? "Замало міст для маршруту — додайте принаймні два у вкладці «Редактор»."
            : `Для покрокового плеєра підтримано до ${MAX_CITIES} міст (інакше забагато кадрів). Зараз — ${n}. Зменшіть кількість у редакторі.`}
        </CardContent>
      </Card>
    )
  }

  const index = Math.min(player.index, frames.length - 1)
  const frame = frames[index]
  const result = run.result
  const badge = phaseBadge(frame)

  return (
    <PlayerShell
      player={player}
      caption={frame.caption}
      captionBadge={
        <span
          className={cn(
            "ml-2 inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium",
            badge.cls,
          )}
        >
          {badge.text}
        </span>
      }
      statsBar={<StatsBar frame={frame} result={result} />}
      panels={
        <>
          <TourMapPanel
            cities={cities}
            result={result}
            frame={frame}
            className="min-h-[360px]"
          />
          <CodePanel
            code={run.trace.code}
            title="Код (Хелда–Карпа)"
            activeLines={frame.lines}
            contextLines={frame.contextLines}
            className="min-h-[360px]"
          />
          <CandidatesPanel
            result={result}
            frame={frame}
            className="min-h-[360px]"
          />
        </>
      }
      secondRow={
        <>
          <DpTablePanel
            result={result}
            frame={frame}
            commitFrames={commitFrames}
            onSeek={(i) => player.dispatch({ type: "seek", index: i })}
            className="max-h-[440px] lg:col-span-2"
          />
          <div className="flex flex-col gap-3">
            <ResultCard result={result} done={frame.phase === "done"} />
            <MatrixPanel result={result} frame={frame} />
          </div>
        </>
      }
    />
  )
}

function StatsBar({ frame, result }: { frame: HkFrame; result: HkResult }) {
  const subsetLbl =
    frame.subset !== null
      ? `{${subsetMembers(frame.subset, result.names.length)
          .map((i) => result.names[i])
          .join(", ")}}`
      : "—"
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 rounded-md border bg-card px-3 py-2 text-xs">
      <span>
        <b>рівень |S|:</b>{" "}
        <span className="tabular-nums">{frame.level ?? "—"}</span>
      </span>
      <span>
        <b>підмножина S:</b> <span className="font-mono">{subsetLbl}</span>
      </span>
      <span>
        <b>комірок dp:</b>{" "}
        <span className="tabular-nums">
          {frame.committedCount}/{result.cells.length}
        </span>
      </span>
      <span>
        <b>найкоротший тур:</b>{" "}
        <span className="tabular-nums">
          {frame.bestTour ? fmt(frame.bestTour.cost) : "—"}
        </span>
      </span>
    </div>
  )
}

function ResultCard({ result, done }: { result: HkResult; done: boolean }) {
  const tour = result.path.map((i) => result.names[i]).join(" → ")
  return (
    <Card className={done ? "border-emerald-500/50" : undefined}>
      <CardContent className="space-y-1 py-4 text-sm">
        <div className="text-muted-foreground">Оптимальний тур</div>
        <div className="text-2xl font-semibold tabular-nums">
          {fmt(result.cost)}
        </div>
        <div className="font-mono text-[12px]">{tour}</div>
        <div className="text-muted-foreground">
          {result.names.length} міст · {result.cells.length} підзадач ·{" "}
          ≈{result.operations.toLocaleString("uk-UA")} операцій
        </div>
      </CardContent>
    </Card>
  )
}

function phaseBadge(frame: HkFrame): { text: string; cls: string } {
  switch (frame.phase) {
    case "base":
      return { text: "база", cls: "bg-muted text-muted-foreground" }
    case "build":
      return {
        text: `нарощування · |S|=${frame.level ?? "?"}`,
        cls: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
      }
    case "closing":
      return {
        text: "замикання",
        cls: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
      }
    case "done":
      return {
        text: "готово",
        cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
      }
  }
}
