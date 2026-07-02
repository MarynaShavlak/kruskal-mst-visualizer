// Сигнатурний візуал хеш-таблиці: (1) «хеш-конвеєр» ключ → hash() → % m → слот;
// (2) масив КОМІРОК, у кожній — ланцюг пар (flex-col-reverse), з підсвіткою домашньої
// комірки / колізії / сканування / влучення; (3) датчик навантаження α із порогом
// рехешу; (4) легенда. Суто презентаційний — усе бере з кадру (highlight.ts).

import { ArrowRight } from "lucide-react"
import { Panel } from "@/algorithms/shared/playback/Panel"
import { LegendRow } from "@/algorithms/shared/playback/LegendRow"
import { HT_LOAD_THRESHOLD } from "@/lib/hashTablePreview"
import type { HtFrame } from "@/lib/hashTableTrace"
import {
  cellRole,
  entryRole,
  type HtCellRole,
  type HtEntryRole,
} from "@/algorithms/hash-table/playback/highlight"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

const CELL_CLASS: Record<HtCellRole, string> = {
  empty: "border-border bg-muted/30",
  filled: "border-border bg-card",
  home: "border-amber-500/70 bg-amber-500/5 ring-2 ring-amber-400/50",
  collision: "border-rose-500 bg-rose-500/5 ring-2 ring-rose-400/60",
}

const ENTRY_CLASS: Record<HtEntryRole, string> = {
  idle: "border-border bg-slate-400/15 text-foreground/80 dark:bg-slate-500/15",
  scanning: "border-amber-500 bg-amber-400/25 text-amber-800 dark:text-amber-200",
  probed: "border-border bg-muted/40 text-muted-foreground/60",
  landed: "border-amber-500/70 bg-amber-500/20 text-amber-700 dark:text-amber-300",
  found: "border-emerald-500/60 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
}

/** Тон коробки конвеєра за фазою кадру. */
function pipeTone(phase: HtFrame["phase"]): string {
  if (phase === "collision") return "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300"
  if (phase === "found" || phase === "insert" || phase === "update")
    return "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
  if (phase === "miss") return "border-slate-400/60 bg-slate-400/10 text-muted-foreground"
  return "border-amber-500/60 bg-amber-500/10 text-amber-700 dark:text-amber-300"
}

function EntryChip({ label, value, role }: { label: string; value: number; role: HtEntryRole }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-xs",
        ENTRY_CLASS[role],
      )}
    >
      <span className="font-medium">{label}</span>
      <span className="text-[10px] opacity-70 tabular-nums">{value}</span>
    </span>
  )
}

export function HashTablePanel({ frame, className }: { frame: HtFrame; className?: string }) {
  const t = useT()
  const { op, homeIndex, rawHash, capacity, keyCodes, loadFactor } = frame
  const alphaPct = Math.min(1, loadFactor) * 100

  const legend = [
    { label: t("play.htLegendHome"), cls: CELL_CLASS.home },
    { label: t("play.htLegendCollision"), cls: CELL_CLASS.collision },
    { label: t("play.htLegendScan"), cls: ENTRY_CLASS.scanning },
    { label: t("play.htLegendFound"), cls: ENTRY_CLASS.found },
  ]

  return (
    <Panel title={t("play.htTableTitle")} className={className} bodyClassName="flex flex-col gap-3 p-3">
      {/* (1) Хеш-конвеєр */}
      <div className="flex min-h-[2rem] flex-wrap items-center gap-2 text-sm">
        {op ? (
          <>
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
              {op.kind}
            </span>
            <span className="flex gap-0.5">
              {[...op.key].map((ch, i) => (
                <span
                  key={i}
                  className="inline-flex flex-col items-center rounded border border-border bg-card px-1 py-0.5 font-mono leading-none"
                >
                  <span>{ch}</span>
                  <span className="text-[9px] text-muted-foreground">{keyCodes[i]}</span>
                </span>
              ))}
            </span>
            <ArrowRight className="size-4 text-muted-foreground" />
            <span className={cn("rounded border px-2 py-0.5 font-mono text-xs", pipeTone(frame.phase))}>
              {rawHash != null
                ? t("play.htPipeSum", { raw: rawHash, m: capacity })
                : t("play.htPipePoly", { m: capacity })}
            </span>
            {homeIndex != null && (
              <>
                <ArrowRight className="size-4 text-muted-foreground" />
                <span className={cn("rounded border px-2 py-0.5 font-mono text-xs font-bold", pipeTone(frame.phase))}>
                  #{homeIndex}
                </span>
              </>
            )}
          </>
        ) : (
          <span className="text-xs text-muted-foreground">{t("play.htPipeIdle")}</span>
        )}
      </div>

      {/* (2) Масив комірок із ланцюгами */}
      <div className="flex items-start gap-1.5 overflow-x-auto">
        {frame.buckets.map((chain, i) => (
          <div
            key={i}
            className={cn(
              "flex min-w-[3.2rem] flex-1 flex-col items-center gap-1 rounded-md border-2 px-1 pb-1.5 pt-1 transition-colors",
              CELL_CLASS[cellRole(i, frame)],
            )}
          >
            <span className="text-xs font-bold leading-none text-muted-foreground">{i}</span>
            <div className="flex min-h-[1.5rem] flex-col-reverse items-stretch gap-1">
              {chain.map((entry, j) => (
                <EntryChip
                  key={j}
                  label={entry.key}
                  value={entry.value}
                  role={entryRole(i, j, frame)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* (3) Датчик навантаження α */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-muted-foreground">{t("play.htLoadFactor")}</span>
        <div className="relative h-2 flex-1 overflow-hidden rounded bg-muted">
          <div
            className={cn(
              "h-full rounded transition-all",
              loadFactor > HT_LOAD_THRESHOLD ? "bg-rose-500" : "bg-primary",
            )}
            style={{ width: `${alphaPct}%` }}
          />
          {/* Пунктирна позначка порогу рехешу */}
          <div
            className="absolute top-0 h-full border-l border-dashed border-foreground/40"
            style={{ left: `${HT_LOAD_THRESHOLD * 100}%` }}
          />
        </div>
        <span className="font-mono tabular-nums">{loadFactor.toFixed(2)}</span>
      </div>

      <LegendRow entries={legend} />
    </Panel>
  )
}
