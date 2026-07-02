// Плеєр ДДП: проганяє СКРИПТ операцій (buildBinarySearchTreeTrace) і рухає курсор по
// кадрах. Розкладка як у хеш-таблиці: код (лістинг перемикається за видом операції) +
// сигнатурне SVG-дерево з підсвіткою шляху пошуку, статистика + жива складність над
// ними, журнал операцій — другим рядом. Перемикача режимів нема (в алгоритмі його немає).

import { buildBinarySearchTreeTrace, codeFor } from "@/lib/binarySearchTreeTrace"
import { useBstStore } from "@/store/bst-store"
import { bstCodec } from "@/algorithms/bst/editor/bst-doc"
import { usePlaybackDeeplink } from "@/algorithms/shared/playback/use-playback-deeplink"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { Panel } from "@/algorithms/shared/playback/Panel"
import { PlayerShell } from "@/algorithms/shared/playback/PlayerShell"
import { LegendRow } from "@/algorithms/shared/playback/LegendRow"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { StatsBar, Stat } from "@/algorithms/shared/playback/Stats"
import { LiveComplexity } from "@/algorithms/shared/playback/LiveComplexity"
import { useTraceRun, TraceFallback } from "@/algorithms/shared/playback/use-trace-run"
import { BstTreeView } from "@/algorithms/bst/BstTreeView"
import { BST_ROLE_SWATCH } from "@/algorithms/bst/bst-roles"
import { OpsLogPanel } from "@/algorithms/bst/playback/OpsLogPanel"
import { useT, useTr } from "@/i18n/use-t"
import { useLangStore } from "@/store/lang-store"

/** Стеля довжини скрипта — щоб кількість кадрів не вибухала. */
const MAX_OPS = 24

export function PlaybackView() {
  const ops = useBstStore((s) => s.ops)
  const loadDoc = useBstStore((s) => s.loadDoc)
  const toDoc = useBstStore((s) => s.toDoc)
  const t = useT()
  const tr = useTr()
  const lang = useLangStore((s) => s.lang)

  const sig = ops.map((o) => `${o.kind}:${o.key}`).join(";")

  const run = useTraceRun(() => buildBinarySearchTreeTrace(ops, tr), {
    empty: ops.length === 0,
    tooBig: ops.length > MAX_OPS,
    sig,
    lang,
  })

  const frameCount = run.kind === "ok" ? run.trace.frames.length : 1
  const player = usePlayer(frameCount, sig)

  usePlaybackDeeplink({
    player,
    codec: bstCodec,
    loadDoc,
    toDoc,
    mode: "",
    setMode: () => undefined,
    modeKeys: [] as const,
    routePath: "bst/playback",
  })

  if (run.kind !== "ok") {
    return (
      <TraceFallback
        message={
          run.kind === "empty" ? t("play.bstEmpty") : t("play.bstTooBig", { max: MAX_OPS })
        }
      />
    )
  }

  const { trace } = run
  const index = Math.min(player.index, trace.frames.length - 1)
  const frame = trace.frames[index]
  const opName = frame.opKind ? t(`play.bstName_${frame.opKind}`) : t("play.bstName_insert")

  const revealed =
    frame.kind === "done"
      ? trace.result.perOp.length
      : frame.opIndex != null
        ? frame.opIndex + (frame.kind === "op_done" ? 1 : 0)
        : 0

  const legend = (
    <LegendRow
      entries={[
        { label: t("play.bstLegendPath"), cls: BST_ROLE_SWATCH.path },
        { label: t("play.bstLegendActive"), cls: BST_ROLE_SWATCH.active },
        { label: t("play.bstLegendResult"), cls: BST_ROLE_SWATCH.result },
        { label: t("play.bstLegendRemove"), cls: BST_ROLE_SWATCH.remove },
        { label: t("play.bstLegendSucc"), cls: BST_ROLE_SWATCH.successor },
      ]}
    />
  )

  return (
    <PlayerShell
      player={player}
      caption={frame.caption}
      statsBar={
        <>
          <StatsBar>
            <Stat label={t("play.bstStatNodes")} value={String(frame.size)} />
            <Stat label={t("play.bstStatHeight")} value={String(frame.height)} />
            <Stat label={t("play.bstStatComparisons")} value={String(frame.comparisons)} />
            <Stat label={t("play.bstStatOps")} value={String(trace.result.ops.length)} />
          </StatsBar>
          <LiveComplexity
            title={t("play.lcTitle")}
            n={frame.size}
            unit={t("play.bstLcUnit")}
            actual={frame.pathIds.length}
            actualLabel={t("play.lcActual")}
            reference={{
              value: Math.max(1, Math.ceil(Math.log2(frame.size + 1))),
              cls: "O(log n)",
              name: t("play.bstLcTypical"),
              formula: `⌈log₂(${frame.size}+1)⌉`,
            }}
            worst={{
              value: Math.max(1, frame.size),
              cls: "O(n)",
              name: t("play.bstLcWorst"),
              formula: `n = ${frame.size}`,
            }}
            verdict={
              frame.kind === "done"
                ? t("play.bstLcVerdict", { size: frame.size, height: frame.height })
                : undefined
            }
          />
        </>
      }
      panels={
        <>
          <CodePanel
            title={t("play.bstCodeTitle", { op: opName })}
            code={codeFor(frame.opKind)}
            activeLines={frame.lines}
            contextLines={frame.contextLines}
          />
          <Panel
            title={t("play.bstTreeTitle")}
            className="lg:col-span-2"
            bodyClassName="flex flex-col gap-3"
          >
            <div className="flex min-h-[320px] flex-1 items-center justify-center overflow-x-auto">
              <BstTreeView frame={frame} scale={1.2} />
            </div>
            {legend}
          </Panel>
        </>
      }
      secondRow={
        <OpsLogPanel
          ops={trace.result.ops}
          perOp={trace.result.perOp}
          revealed={revealed}
          currentOpIndex={frame.kind === "done" ? null : frame.opIndex}
          className="lg:col-span-3"
        />
      }
    />
  )
}
