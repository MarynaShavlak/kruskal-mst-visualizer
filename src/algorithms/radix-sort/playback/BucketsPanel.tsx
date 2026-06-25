import { ArrowDown } from "lucide-react"
import { Panel } from "@/algorithms/shared/playback/Panel"
import { LegendRow } from "@/algorithms/shared/playback/LegendRow"
import { chipRole, digitParts, type ChipRole } from "@/algorithms/radix-sort/playback/highlight"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

// Кольори рамок 10 кошиків (0–9) — кожен має свій відтінок, щоб легше стежити,
// куди падають фішки (легенда «🔵 рамки 10 кошиків»).
const BUCKET_TINT: readonly string[] = [
  "border-rose-400/50 text-rose-600 dark:text-rose-300",
  "border-orange-400/50 text-orange-600 dark:text-orange-300",
  "border-amber-400/50 text-amber-600 dark:text-amber-300",
  "border-lime-400/50 text-lime-600 dark:text-lime-300",
  "border-emerald-400/50 text-emerald-600 dark:text-emerald-300",
  "border-teal-400/50 text-teal-600 dark:text-teal-300",
  "border-sky-400/50 text-sky-600 dark:text-sky-300",
  "border-blue-400/50 text-blue-600 dark:text-blue-300",
  "border-indigo-400/50 text-indigo-600 dark:text-indigo-300",
  "border-violet-400/50 text-violet-600 dark:text-violet-300",
]

const CHIP_CLASS: Record<ChipRole | "bucket" | "landed", string> = {
  falling: "border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300",
  gathered: "border-emerald-500/60 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  placed: "border-border bg-muted/40 text-muted-foreground/60",
  idle: "border-border bg-slate-400/15 text-foreground/80 dark:bg-slate-500/15",
  bucket: "border-border bg-card text-foreground/80",
  landed: "border-amber-500/70 bg-amber-500/20 text-amber-700 dark:text-amber-300",
}

/** Фішка-число з підсвіченою цифрою поточного розряду (провідні нулі тьмяні). */
export function DigitChip({
  value,
  width,
  activeDigit,
  variant,
  size = "md",
}: {
  value: number
  width: number
  activeDigit: number | null
  variant: ChipRole | "bucket" | "landed"
  size?: "sm" | "md"
}) {
  const parts = digitParts(value, width, activeDigit)
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded border font-mono tabular-nums",
        size === "md" ? "px-1.5 py-1 text-sm" : "px-1 py-0.5 text-[11px]",
        CHIP_CLASS[variant],
      )}
    >
      {parts.map((p, i) => (
        <span
          key={i}
          className={cn(
            p.active && "rounded-sm bg-amber-400/70 px-[1px] font-bold text-amber-950 dark:text-amber-50",
            p.pad && !p.active && "opacity-30",
          )}
        >
          {p.char}
        </span>
      ))}
    </span>
  )
}

export interface BucketsProps {
  readonly array: readonly number[]
  readonly buckets: readonly (readonly number[])[]
  readonly digitIndex: number | null
  readonly maxDigits: number
  readonly activeIndex: number | null
  readonly activeBucket: number | null
  readonly gathered: boolean
  /** Розмір фішок у кошиках («sm» — плеєр; «md» — більший образ у навчанні). */
  readonly chipSize?: "sm" | "md"
}

/**
 * Сигнатурний образ розбору: рядок-джерело з фішок-чисел (підсвічена цифра
 * поточного розряду) над 10 кошиками `0–9`. 🔴 фішка, що падає; 🟢 зібраний
 * масив; ⬜ ще не розкладені. Активний кошик обведено; щойно додана фішка —
 * бурштинова. Спільне для плеєра й навчальних віджетів.
 */
export function BucketsView({
  array,
  buckets,
  digitIndex,
  maxDigits,
  activeIndex,
  activeBucket,
  gathered,
  chipSize = "sm",
}: BucketsProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Рядок-джерело: фішки з підсвіченою цифрою поточного розряду. */}
      <div className="flex flex-wrap items-end justify-center gap-1.5">
        {array.map((v, i) => {
          const role = chipRole(i, { activeIndex, gathered })
          const isFalling = role === "falling"
          return (
            <span key={i} className="flex flex-col items-center gap-0.5">
              <ArrowDown
                className={cn(
                  "size-3 text-rose-500 transition-opacity",
                  isFalling ? "opacity-100" : "opacity-0",
                )}
              />
              <DigitChip value={v} width={maxDigits} activeDigit={digitIndex} variant={role} />
              <span className="text-[10px] tabular-nums text-muted-foreground/60">{i}</span>
            </span>
          )
        })}
      </div>

      {/* 10 кошиків 0–9. */}
      <div className="flex w-full items-start justify-center gap-1 overflow-x-auto">
        {buckets.map((bucket, b) => {
          const isActive = b === activeBucket
          return (
            <div
              key={b}
              className={cn(
                "flex min-w-[2.1rem] flex-1 flex-col items-center gap-1 rounded-md border-2 px-1 pb-1.5 pt-1 transition-colors",
                BUCKET_TINT[b],
                isActive && "bg-primary/5 ring-2 ring-primary/60",
              )}
            >
              <span className={cn("text-xs font-bold leading-none", BUCKET_TINT[b])}>{b}</span>
              <div className="flex min-h-[1.5rem] flex-col-reverse items-center gap-0.5">
                {bucket.map((v, k) => {
                  const justLanded = isActive && k === bucket.length - 1
                  return (
                    <DigitChip
                      key={k}
                      value={v}
                      width={maxDigits}
                      activeDigit={digitIndex}
                      variant={justLanded ? "landed" : "bucket"}
                      size={chipSize}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** Панель плеєра: рядок розряду + BucketsView у рамці + легенда. */
export function BucketsPanel({
  className,
  position,
  ...view
}: BucketsProps & { className?: string; position: number | null }) {
  const t = useT()
  return (
    <Panel
      title={t("play.rxBucketsTitle")}
      className={className}
      bodyClassName="flex flex-col gap-2 p-3"
    >
      <div className="text-xs text-muted-foreground">
        {position != null ? (
          <span>
            {t("play.rxPosLabel")}{" "}
            <b className="tabular-nums text-amber-600 dark:text-amber-400">{position}</b>{" "}
            <span className="opacity-70">
              ({t("play.rxPlaceLabel", { place: placeFor(position, t) })})
            </span>
          </span>
        ) : (
          <span>{t("play.rxNoPass")}</span>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        <BucketsView {...view} />
      </div>
      <Legend />
    </Panel>
  )
}

/** Назва розряду за позицією (1→одиниці, 10→десятки…). */
function placeFor(position: number, t: ReturnType<typeof useT>): string {
  const d = Math.round(Math.log10(position))
  return t(`play.rxPlace${Math.min(Math.max(d, 0), 3)}` as Parameters<typeof t>[0])
}

function Legend() {
  const t = useT()
  const entries = [
    { label: t("learn.rxLegendFalling"), cls: CHIP_CLASS.falling },
    { label: t("learn.rxLegendGathered"), cls: CHIP_CLASS.gathered },
    { label: t("learn.rxLegendIdle"), cls: CHIP_CLASS.idle },
  ]
  return (
    <LegendRow entries={entries}>
      <span className="inline-flex items-center gap-1">
        <span className="inline-block size-2.5 rounded-sm bg-amber-400/70" />
        {t("learn.rxLegendDigit")}
      </span>
    </LegendRow>
  )
}
