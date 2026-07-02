// Плеєр хеш-таблиці: проганяє СКРИПТ операцій (buildHashTableTrace) і рухає курсор
// по кадрах. Розкладка як у radix/heap: код + сигнатурний візуал (HashTablePanel) у
// panels, статистика + жива складність над ними, журнал операцій — другим рядом.
// Перемикача режимів нема (MVP — лише ланцюжки; хеш-функція живе в документі/редакторі).

import {
  buildHashTableTrace,
  type HtPhase,
} from "@/lib/hashTableTrace"
import { useHashTableStore } from "@/store/hash-table-store"
import { hashTableCodec } from "@/algorithms/hash-table/editor/hash-table-doc"
import { usePlaybackDeeplink } from "@/algorithms/shared/playback/use-playback-deeplink"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { PlayerShell } from "@/algorithms/shared/playback/PlayerShell"
import { PhaseBadge, type PhaseStyle } from "@/algorithms/shared/playback/PhaseBadge"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { StatsBar, Stat } from "@/algorithms/shared/playback/Stats"
import { LiveComplexity } from "@/algorithms/shared/playback/LiveComplexity"
import { useTraceRun, TraceFallback } from "@/algorithms/shared/playback/use-trace-run"
import { HashTablePanel } from "@/algorithms/hash-table/playback/HashTablePanel"
import { OpsLogPanel } from "@/algorithms/hash-table/playback/OpsLogPanel"
import { useT, useTr } from "@/i18n/use-t"
import { useLangStore } from "@/store/lang-store"

/** Стеля довжини скрипта — щоб кількість кадрів не вибухала. */
const MAX_OPS = 24

const PHASE_STYLES: Record<HtPhase, PhaseStyle> = {
  init: { labelKey: "play.htPhaseInit", cls: "bg-slate-500/15 text-slate-700 dark:text-slate-300" },
  op: { labelKey: "play.htPhaseOp", cls: "bg-slate-500/15 text-slate-700 dark:text-slate-300" },
  hash: { labelKey: "play.htPhaseHash", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  collision: { labelKey: "play.htPhaseCollision", cls: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
  compare: { labelKey: "play.htPhaseCompare", cls: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
  insert: { labelKey: "play.htPhaseInsert", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  update: { labelKey: "play.htPhaseUpdate", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  found: { labelKey: "play.htPhaseFound", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  miss: { labelKey: "play.htPhaseMiss", cls: "bg-rose-500/15 text-rose-700 dark:text-rose-300" },
  delete: { labelKey: "play.htPhaseDelete", cls: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
  done: { labelKey: "play.htPhaseDone", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
}

export function PlaybackView() {
  const ops = useHashTableStore((s) => s.ops)
  const capacity = useHashTableStore((s) => s.capacity)
  const hashFn = useHashTableStore((s) => s.hashFn)
  const loadDoc = useHashTableStore((s) => s.loadDoc)
  const toDoc = useHashTableStore((s) => s.toDoc)
  const t = useT()
  const tr = useTr()
  const lang = useLangStore((s) => s.lang)

  const sig = `${capacity}|${hashFn}|${ops.map((o) => `${o.kind}:${o.key}:${o.value ?? ""}`).join(";")}`

  const run = useTraceRun(
    () => buildHashTableTrace(ops, capacity, { hashFn, strategy: "chaining" }, tr),
    { empty: ops.length === 0, tooBig: ops.length > MAX_OPS, sig, lang },
  )

  const frameCount = run.kind === "ok" ? run.trace.frames.length : 1
  const player = usePlayer(frameCount, sig)

  usePlaybackDeeplink({
    player,
    codec: hashTableCodec,
    loadDoc,
    toDoc,
    mode: "",
    setMode: () => undefined,
    modeKeys: [] as const,
    routePath: "hash-table/playback",
  })

  if (run.kind !== "ok") {
    return (
      <TraceFallback
        message={run.kind === "empty" ? t("play.htEmpty") : t("play.htTooBig", { max: MAX_OPS })}
      />
    )
  }

  const { trace } = run
  const index = Math.min(player.index, trace.frames.length - 1)
  const frame = trace.frames[index]

  const homeChainLen =
    frame.homeIndex != null ? frame.buckets[frame.homeIndex].length : 0
  const revealed =
    frame.phase === "done"
      ? trace.result.perOp.length
      : frame.opIndex != null
        ? frame.opIndex + (frame.opResult != null ? 1 : 0)
        : 0

  return (
    <PlayerShell
      player={player}
      caption={frame.caption}
      captionBadge={<PhaseBadge phase={frame.phase} styles={PHASE_STYLES} />}
      statsBar={
        <>
          <StatsBar>
            <Stat label={t("play.htStatSize")} value={String(frame.size)} />
            <Stat label={t("play.htStatCapacity")} value={String(frame.capacity)} />
            <Stat label={t("play.htStatAlpha")} value={frame.loadFactor.toFixed(2)} />
            <Stat label={t("play.htStatComparisons")} value={String(frame.comparisons)} />
            <Stat label={t("play.htStatCollisions")} value={String(frame.collisions)} />
          </StatsBar>
          <LiveComplexity
            title={t("play.lcTitle")}
            n={frame.size}
            unit={t("play.htLcUnit")}
            actual={homeChainLen}
            actualLabel={t("play.lcActual")}
            reference={{
              value: Math.max(1, Math.ceil(1 + frame.loadFactor)),
              cls: "O(1+α)",
              name: t("play.htLcAvg"),
              formula: `1+α = 1+${frame.loadFactor.toFixed(2)}`,
            }}
            worst={{
              value: Math.max(1, frame.size),
              cls: "O(n)",
              name: t("play.htLcWorst"),
              formula: `n = ${frame.size}`,
            }}
            verdict={
              frame.phase === "done"
                ? t("play.htLcVerdict", { alpha: frame.loadFactor.toFixed(2) })
                : undefined
            }
          />
        </>
      }
      panels={
        <>
          <CodePanel
            title={t("play.htCodeTitle")}
            code={trace.code}
            activeLines={frame.lines}
            contextLines={frame.contextLines}
          />
          <HashTablePanel frame={frame} className="min-h-[360px] lg:col-span-2" />
        </>
      }
      secondRow={
        <OpsLogPanel
          ops={trace.result.ops}
          perOp={trace.result.perOp}
          revealed={revealed}
          currentOpIndex={frame.phase === "done" ? null : frame.opIndex}
          className="lg:col-span-3"
        />
      }
    />
  )
}
