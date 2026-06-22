import { Table2 } from "lucide-react"
import { Panel } from "@/algorithms/shared/playback/Panel"
import type { KmpLpsState } from "@/lib/kmpStringSearchTrace"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

// СИГНАТУРНА панель фази 1 — ТАБЛИЦЯ LPS. Ряд символів шаблону + значення lps під кожним.
// На активному кроці підсвічуємо: 🔵 узгоджений ВЛАСНИЙ ПРЕФІКС pattern[0..length) і
// 🟣 рівний йому СУФІКС, що закінчується на pattern[i]; 🌸 поточні символи порівняння
// pattern[i] ↔ pattern[length]. На відкоті (fallback) видно крок length = lps[length-1].

/** Видимий символ: пробіл → «␣». */
function glyph(ch: string): string {
  return ch === " " ? "␣" : ch
}

export interface LpsTableProps {
  readonly state: KmpLpsState
  readonly size?: "sm" | "md"
}

/**
 * Роль символу шаблону на позиції `k` у поточному кроці побудови lps. Префікс [0, length) —
 * блакитний; суфікс (i-length, i] — фіолетовий; поточні pattern[i]/pattern[length] —
 * рожеві (порівняння). Решта — нейтральні.
 */
type Role = "prefix" | "suffix" | "compareI" | "compareLen" | "set" | "idle"

function roleAt(k: number, s: KmpLpsState): Role {
  const i = s.i ?? -1
  const len = s.length
  // На set/final довжину вже зафіксовано; підсвічуємо префікс+суфікс готового значення.
  if (s.kind === "set" && k === i) return "set"
  if (s.kind === "compare" || s.kind === "fallback" || s.kind === "zero" || s.kind === "set") {
    if (k === i) return "compareI"
    if (k === len) return "compareLen"
  }
  if (len > 0) {
    if (k < len) return "prefix"
    if (i >= 0 && k > i - len && k <= i) return "suffix"
  }
  return "idle"
}

const ROLE_CLASS: Record<Role, string> = {
  prefix: "border-sky-500 bg-sky-500/20 text-sky-700 dark:text-sky-300",
  suffix: "border-violet-500 bg-violet-500/20 text-violet-700 dark:text-violet-300",
  compareI: "border-rose-500 bg-rose-500/20 text-rose-700 dark:text-rose-300",
  compareLen: "border-rose-400 bg-rose-400/15 text-rose-700 dark:text-rose-300",
  set: "border-emerald-500 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
  idle: "border-border bg-muted/30 text-foreground",
}

export function LpsTable({ state, size = "md" }: LpsTableProps) {
  const pattern = state.pattern
  const lps = state.lps
  const cell = size === "md" ? "h-9 w-8 text-sm" : "h-7 w-6 text-xs"
  return (
    <span className="inline-flex max-w-full flex-col gap-1 overflow-x-auto">
      {/* індекси */}
      <span className="inline-flex items-center gap-0.5">
        {Array.from(pattern).map((_, k) => (
          <span
            key={k}
            className={cn(
              "inline-flex shrink-0 items-center justify-center tabular-nums text-muted-foreground/60",
              size === "md" ? "h-4 w-8 text-[10px]" : "h-3 w-6 text-[9px]",
            )}
          >
            {k}
          </span>
        ))}
      </span>
      {/* символи шаблону */}
      <span className="inline-flex items-center gap-0.5">
        {Array.from(pattern).map((ch, k) => (
          <span
            key={k}
            className={cn(
              "inline-flex shrink-0 items-center justify-center rounded border-2 font-mono tabular-nums transition-colors",
              cell,
              ROLE_CLASS[roleAt(k, state)],
            )}
          >
            {glyph(ch)}
          </span>
        ))}
      </span>
      {/* значення lps */}
      <span className="inline-flex items-center gap-0.5">
        {Array.from(pattern).map((_, k) => {
          const known = k < (state.i ?? 0) || (state.kind === "set" && k === state.i) || state.kind === "final"
          return (
            <span
              key={k}
              className={cn(
                "inline-flex shrink-0 items-center justify-center rounded border font-mono tabular-nums",
                cell,
                known
                  ? "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300"
                  : "border-dashed border-border bg-transparent text-muted-foreground/30",
              )}
            >
              {known ? lps[k] : "·"}
            </span>
          )
        })}
      </span>
    </span>
  )
}

/** Панель плеєра фази 1: бейдж «будуємо lps шаблону» + таблиця + покажчики i/length + легенда. */
export function LpsTablePanel({
  state,
  className,
}: {
  state: KmpLpsState
  className?: string
}) {
  const t = useT()
  return (
    <Panel
      title={t("play.kmpLpsTitle")}
      className={className}
      bodyClassName="flex flex-col gap-3 p-3"
    >
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-sky-400/50 bg-sky-500/10 px-2.5 py-1 text-sm font-medium text-sky-700 dark:text-sky-300">
          <Table2 className="size-3.5" />
          {t("play.kmpLpsBadge", { pattern: state.pattern || "∅" })}
        </span>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto">
        <LpsTable state={state} />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs tabular-nums text-muted-foreground">
        <span><b>i</b> = {state.i ?? "—"}</span>
        <span><b>length</b> = {state.length}{state.kind === "fallback" && state.newLength != null ? ` → ${state.newLength}` : ""}</span>
      </div>
      <LpsLegend />
    </Panel>
  )
}

function LpsLegend() {
  const t = useT()
  const items: { role: Role; label: string }[] = [
    { role: "prefix", label: t("play.kmpLegendPrefix") },
    { role: "suffix", label: t("play.kmpLegendSuffix") },
    { role: "compareI", label: t("play.kmpLegendCompare") },
    { role: "set", label: t("play.kmpLegendSet") },
  ]
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
      {items.map((it) => (
        <span key={it.role} className="inline-flex items-center gap-1">
          <span className={cn("inline-block size-2.5 rounded-sm border", ROLE_CLASS[it.role])} />
          {it.label}
        </span>
      ))}
    </div>
  )
}
