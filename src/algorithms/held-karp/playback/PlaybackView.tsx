import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { buildHeldKarpTrace, type HkFrame, type HkResult } from "@/lib/heldKarpTrace"
import { useTspStore } from "@/store/tsp-store"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { PlayerShell } from "@/algorithms/shared/playback/PlayerShell"
import { LiveComplexity } from "@/algorithms/shared/playback/LiveComplexity"
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
import type { Translate } from "@/lib/translate"
import { useT } from "@/i18n/use-t"
import type { MessageKey } from "@/i18n/messages"
import { useLangStore } from "@/store/lang-store"
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
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)

  // Нарація перебудовується при зміні мови; resetKey плеєра — список міст
  // (стабільний при перемиканні UA/EN), тож курсор не скидається.
  const run = useMemo(
    () => (inRange ? buildHeldKarpTrace({ cities, start }, tr) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cities, start, inRange, lang],
  )
  const frames = run?.trace.frames
  const player = usePlayer(frames?.length ?? 1, cities)
  const commitFrames = useMemo(
    () => (run ? cellCommitFrames(run.trace.frames) : []),
    [run],
  )

  if (!run || !frames) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          {n < 2
            ? t("play.hkTooFew")
            : t("play.hkTooMany", { max: MAX_CITIES, n })}
        </CardContent>
      </Card>
    )
  }

  const index = Math.min(player.index, frames.length - 1)
  const frame = frames[index]
  const result = run.result
  const badge = phaseBadge(frame, t)

  // Жива складність (лічильник — заповнені комірки DP): орієнтир — ОМРІЯНИЙ поліном n²
  // (якби TSP була в P); права межа — стани Хелда–Карпа (n−1)·2^(n−1) (експоненційно).
  // Інваріант для фіксованого n; перевага над перебором n! — у вердикті (на малих n,
  // які тут дозволені, n! ще менший за HK — тож на бар його не виносимо).
  const nCities = result.names.length
  const polyRef = nCities * nCities
  const hkStates = result.cells.length
  const done = frame.phase === "done"

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
      statsBar={
        <>
          <StatsBar frame={frame} result={result} />
          <LiveComplexity
            title={t("play.hkLcTitle")}
            n={nCities}
            unit={t("play.hkLcUnit")}
            actual={frame.committedCount}
            actualLabel={t("play.hkLcActual")}
            reference={{
              value: polyRef,
              cls: "O(n²)",
              name: t("play.hkLcPoly"),
              formula: `n² = ${polyRef}`,
            }}
            worst={{
              value: hkStates,
              cls: "O(n·2ⁿ)",
              name: t("play.hkLcStates"),
              formula: `(n−1)·2^(n−1) = ${hkStates}`,
            }}
            verdict={done ? t("play.hkLcVerdict") : undefined}
          />
        </>
      }
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
            title={t("play.codeHk")}
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
  const t = useT()
  const subsetLbl =
    frame.subset !== null
      ? `{${subsetMembers(frame.subset, result.names.length)
          .map((i) => result.names[i])
          .join(", ")}}`
      : "—"
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 rounded-md border bg-card px-3 py-2 text-xs">
      <span>
        <b>{t("play.hkLevel")}</b>{" "}
        <span className="tabular-nums">{frame.level ?? "—"}</span>
      </span>
      <span>
        <b>{t("play.hkSubset")}</b> <span className="font-mono">{subsetLbl}</span>
      </span>
      <span>
        <b>{t("play.hkDpCells")}</b>{" "}
        <span className="tabular-nums">
          {frame.committedCount}/{result.cells.length}
        </span>
      </span>
      <span>
        <b>{t("play.hkShortestTour")}</b>{" "}
        <span className="tabular-nums">
          {frame.bestTour ? fmt(frame.bestTour.cost) : "—"}
        </span>
      </span>
    </div>
  )
}

function ResultCard({ result, done }: { result: HkResult; done: boolean }) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tour = result.path.map((i) => result.names[i]).join(" → ")
  const ops = result.operations.toLocaleString(lang === "ua" ? "uk-UA" : "en-US")
  return (
    <Card className={done ? "border-emerald-500/50" : undefined}>
      <CardContent className="space-y-1 py-4 text-sm">
        <div className="text-muted-foreground">{t("play.hkOptimalTour")}</div>
        <div className="text-2xl font-semibold tabular-nums">
          {fmt(result.cost)}
        </div>
        <div className="font-mono text-[12px]">{tour}</div>
        <div className="text-muted-foreground">
          {t("play.hkResultStats", {
            n: result.names.length,
            m: result.cells.length,
            ops,
          })}
        </div>
      </CardContent>
    </Card>
  )
}

type TFn = ReturnType<typeof useT>

function phaseBadge(frame: HkFrame, t: TFn): { text: string; cls: string } {
  switch (frame.phase) {
    case "base":
      return { text: t("play.hkPhaseBase"), cls: "bg-muted text-muted-foreground" }
    case "build":
      return {
        text: t("play.hkPhaseBuild", { lvl: frame.level ?? "?" }),
        cls: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
      }
    case "closing":
      return {
        text: t("play.hkPhaseClosing"),
        cls: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
      }
    case "done":
      return {
        text: t("play.hkPhaseDone"),
        cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
      }
  }
}
