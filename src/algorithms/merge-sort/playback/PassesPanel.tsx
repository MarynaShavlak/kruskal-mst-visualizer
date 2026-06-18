import { Panel } from "@/algorithms/shared/playback/Panel"
import type { BottomUpPass } from "@/lib/mergeSort"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

/** Розбиває масив на пробіжки (runs) ширини `width`. */
function toRuns(values: readonly number[], width: number): { start: number; items: readonly number[] }[] {
  const runs: { start: number; items: readonly number[] }[] = []
  for (let start = 0; start < values.length; start += width) {
    runs.push({ start, items: values.slice(start, start + width) })
  }
  return runs
}

function RunCell({ value, tone }: { value: number; tone: "left" | "right" | "done" | "dim" }) {
  const cls = {
    left: "bg-sky-500/70 text-white",
    right: "bg-orange-400/80 text-white",
    done: "bg-emerald-500/70 text-white",
    dim: "bg-muted text-muted-foreground/70",
  }[tone]
  return (
    <span className={cn("inline-flex size-6 items-center justify-center rounded-sm text-[11px] font-semibold tabular-nums", cls)}>
      {value}
    </span>
  )
}

function PassRow({
  pass,
  state,
  mergeLo,
  mergeHi,
}: {
  pass: BottomUpPass
  state: "done" | "current" | "future"
  mergeLo: number
  mergeHi: number
}) {
  const t = useT()
  // Завершені проходи показуємо як злиті пробіжки (after, ширина 2w); поточний і
  // майбутні — як пробіжки ширини w на вході проходу (before).
  const values = state === "done" ? pass.after : pass.before
  const runWidth = state === "done" ? pass.width * 2 : pass.width
  const runs = toRuns(values, runWidth)

  return (
    <div className={cn("flex items-center gap-2", state === "future" && "opacity-50")}>
      <span className="w-24 shrink-0 text-right text-[11px] font-medium text-muted-foreground">
        {t("play.msPassLabel", { width: pass.width })}
      </span>
      <span className="inline-flex flex-wrap gap-1.5">
        {runs.map((run, ri) => {
          const inActive =
            state === "current" && mergeLo >= 0 && run.start >= mergeLo && run.start < mergeHi
          const tone: "left" | "right" | "done" | "dim" =
            state === "done" ? "done" : state === "future" ? "dim" : ri % 2 === 0 ? "left" : "right"
          return (
            <span
              key={ri}
              className={cn(
                "inline-flex gap-0.5 rounded border px-0.5 py-0.5",
                inActive ? "border-amber-500 ring-2 ring-amber-300" : "border-transparent",
              )}
            >
              {run.items.map((v, i) => (
                <RunCell key={i} value={v} tone={tone} />
              ))}
            </span>
          )
        })}
      </span>
    </div>
  )
}

/**
 * Панель проходів bottom-up: кожен рядок — масив, поділений на відсортовані
 * пробіжки (runs) ширини 1, 2, 4, … Завершені проходи показано злитими (🟢),
 * поточний — пробіжками ширини w (🔵/🟧) з підсвіченою активною парою (🟡),
 * майбутні — приглушено. Зіркова панель злиття внизу показує живі вказівники.
 */
export function PassesPanel({
  passes,
  currentPass,
  mergeLo,
  mergeHi,
  done,
  className,
}: {
  passes: readonly BottomUpPass[]
  currentPass: number
  mergeLo: number
  mergeHi: number
  /** Фінальний кадр: усі проходи завершено. */
  done: boolean
  className?: string
}) {
  const t = useT()
  return (
    <Panel
      title={t("play.msPassesTitle")}
      className={className}
      bodyClassName="flex flex-col gap-2 overflow-auto p-3"
    >
      <div className="flex min-w-0 flex-col gap-2">
        {passes.map((pass, pi) => {
          const state: "done" | "current" | "future" =
            done || pi < currentPass ? "done" : pi === currentPass ? "current" : "future"
          return (
            <PassRow
              key={pi}
              pass={pass}
              state={state}
              mergeLo={mergeLo}
              mergeHi={mergeHi}
            />
          )
        })}
      </div>
      <TreeLikeLegend />
    </Panel>
  )
}

function TreeLikeLegend() {
  const t = useT()
  const items = [
    { cls: "bg-sky-500/70", label: t("play.msRunLeft") },
    { cls: "bg-orange-400/80", label: t("play.msRunRight") },
    { cls: "bg-emerald-500/70", label: t("play.msRunDone") },
  ]
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1">
          <span className={cn("inline-block size-2.5 rounded-sm", it.cls)} />
          {it.label}
        </span>
      ))}
    </div>
  )
}
