import type { ReactNode } from "react"
import { Panel } from "@/algorithms/shared/playback/Panel"
import { cn } from "@/lib/utils"

/** Одна теоретична межа на шкалі «живої складності». */
export interface ComplexityBound {
  /** Значення межі в одиницях лічильника (порівняння/обміни/…). */
  readonly value: number
  /** Клас, напр. "O(n²)". */
  readonly cls: string
  /** Назва словами, напр. "найгірша". */
  readonly name: string
  /** Формула з підставленим n, напр. "n(n+1)/2 − 1 = 27". */
  readonly formula: string
}

/**
 * «Жива складність»: лічильник операцій ПОТОЧНОГО кадру на тлі теоретичних меж для
 * цього n. Шкала 0…worst.value; заповнення = actual; пунктир — орієнтир `reference`
 * (типова межа). Поки фактичне ≤ орієнтиру — ефективно; що ближче до правого краю —
 * то ближче до найгіршого випадку. Презентаційний компонент: числа й вердикт рахує
 * викликач (щоб лишатися i18n-незалежним і придатним для будь-якого алгоритму).
 */
export function LiveComplexity({
  title,
  n,
  unit,
  actual,
  actualLabel,
  reference,
  worst,
  verdict,
}: {
  title: string
  n: number
  unit: string
  actual: number
  actualLabel: string
  reference: ComplexityBound
  worst: ComplexityBound
  verdict?: ReactNode
}) {
  const max = Math.max(worst.value, actual, 1)
  const fillPct = Math.min(100, (actual / max) * 100)
  const refPct = Math.min(100, (reference.value / max) * 100)
  const refLabelPct = Math.min(92, Math.max(8, refPct))
  // Тон заповнення: ≤ орієнтиру — ефективно; на найгіршій межі — деградація.
  const tone =
    actual <= reference.value
      ? "bg-emerald-500"
      : actual >= worst.value
        ? "bg-rose-500"
        : "bg-amber-500"

  return (
    <Panel title={title}>
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-baseline justify-between">
          <span className="text-muted-foreground">
            n ={" "}
            <span className="font-mono tabular-nums text-foreground">{n}</span>
          </span>
          <span>
            <span className="text-muted-foreground">{actualLabel} </span>
            <span className="font-mono text-base font-semibold tabular-nums">
              {actual}
            </span>{" "}
            <span className="text-muted-foreground">{unit}</span>
          </span>
        </div>

        {/* Шкала 0…найгірша; заповнення = фактично; пунктир = орієнтир O(n·log n). */}
        <div className="relative h-3 rounded-full bg-muted">
          <div
            className={cn(
              "absolute inset-y-0 left-0 rounded-full transition-all",
              tone,
            )}
            style={{ width: `${fillPct}%` }}
          />
          <div
            className="absolute inset-y-[-2px] w-0 border-l border-dashed border-foreground/70"
            style={{ left: `${refPct}%` }}
            aria-hidden="true"
          />
        </div>

        <div className="relative h-3 font-mono text-[10px] text-muted-foreground">
          <span className="absolute left-0">0</span>
          <span
            className="absolute -translate-x-1/2 whitespace-nowrap"
            style={{ left: `${refLabelPct}%` }}
          >
            ↑ {reference.cls}
          </span>
          <span className="absolute right-0 tabular-nums">{worst.value}</span>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <span className="inline-flex items-baseline gap-1.5">
            <span className="font-mono">{reference.cls}</span>
            <span className="text-muted-foreground">{reference.name}</span>
            <span className="font-mono text-muted-foreground/80">
              {reference.formula}
            </span>
          </span>
          <span className="inline-flex items-baseline gap-1.5">
            <span className="font-mono">{worst.cls}</span>
            <span className="text-muted-foreground">{worst.name}</span>
            <span className="font-mono text-muted-foreground/80">
              {worst.formula}
            </span>
          </span>
        </div>

        {verdict != null && (
          <div className="rounded-md bg-muted/50 px-2 py-1 text-xs">{verdict}</div>
        )}
      </div>
    </Panel>
  )
}
