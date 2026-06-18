import { Panel } from "@/algorithms/shared/playback/Panel"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

// «Пряма-модель» — геометричне серце інтерполяційного пошуку. Будуємо пряму через
// кінці поточного вікна: (low, arr[low]) → (high, arr[high]). Шуканий ключ x — це
// горизонталь; її перетин із прямою проєктується вниз на вісь індексів і дає пробу.
// КЛЮЧОВА інтуїція видно очима: фактичні значення масиву показані ТОЧКАМИ. Якщо дані
// РІВНОМІРНІ — точки лежать на прямій, і проба точна (1 проба). Якщо СКУПЧЕНІ (один
// викид) — точки далеко від прямої, прямо «бреше», і проба систематично промахується
// (деградація до O(n)). Це той образ, якого немає у двійкового пошуку.

// — Геометрія SVG (внутрішня система координат viewBox) —
const W = 330
const H = 230
const PAD_L = 42
const PAD_R = 16
const PAD_T = 14
const PAD_B = 34
const X0 = PAD_L
const X1 = W - PAD_R
const Y0 = H - PAD_B // низ (мінімальне значення)
const Y1 = PAD_T // верх (максимальне значення)

export interface LineModelProps {
  readonly array: readonly number[]
  readonly target: number
  /** Межі прямої (вікно на момент проби). */
  readonly lineLow: number
  readonly lineHigh: number
  readonly loVal: number | null
  readonly hiVal: number | null
  /** Проба (інтерпольований індекс) або null. */
  readonly index: number | null
  /** Чи показувати проєкцію активно (фаза «проба»). */
  readonly probing: boolean
  /** Знайдений індекс або -1. */
  readonly result: number
  readonly resolved: boolean
}

interface Geometry {
  readonly lo: number
  readonly hi: number
  readonly loVal: number
  readonly hiVal: number
  readonly xOf: (i: number) => number
  readonly yOf: (v: number) => number
  readonly span: number
}

/** Будує мапінг індекс↔X, значення↔Y для поточного вікна (або null, якщо вироджене). */
function geometry(p: LineModelProps): Geometry | null {
  const lo = p.lineLow
  const hi = p.lineHigh
  if (hi <= lo) return null
  const loVal = p.loVal ?? p.array[lo]
  const hiVal = p.hiVal ?? p.array[hi]
  if (loVal == null || hiVal == null || hiVal <= loVal) return null
  const xOf = (i: number) => X0 + ((i - lo) / (hi - lo)) * (X1 - X0)
  const yOf = (v: number) => Y0 + ((v - loVal) / (hiVal - loVal)) * (Y1 - Y0)
  return { lo, hi, loVal, hiVal, xOf, yOf, span: hi - lo }
}

/**
 * Внутрішнє SVG «прямої-моделі». Спільне для плеєра й навчальних віджетів — приймає
 * лише поля кадру. Малює: осі, пряму (low,arr[low])→(high,arr[high]), точки реальних
 * значень, горизонталь ключа, перетин і проєкцію на вісь індексів.
 */
export function LineModelView({ className, ...p }: LineModelProps & { className?: string }) {
  const t = useT()
  const g = geometry(p)

  if (!g) {
    return (
      <div className={cn("flex items-center justify-center rounded-lg border bg-card p-4 text-center text-xs text-muted-foreground", className)}>
        {t("play.ipLineDegenerate")}
      </div>
    )
  }

  const { lo, hi, loVal, hiVal, xOf, yOf } = g

  // Проєкція ключа: де горизонталь x перетинає пряму (дробова позиція). Показуємо,
  // лише якщо ключ лежить у діапазоні значень вікна.
  const inRange = p.target >= loVal && p.target <= hiVal
  const projFrac = inRange ? (p.target - loVal) / (hiVal - loVal) : null
  const projPos = projFrac != null ? lo + projFrac * (hi - lo) : null
  const yTarget = yOf(p.target)

  // Видимі індекси (на дуже довгих вікнах не малюємо кожну точку).
  const STEP = Math.max(1, Math.ceil((hi - lo) / 40))
  const dots: number[] = []
  for (let i = lo; i <= hi; i += STEP) dots.push(i)
  if (dots[dots.length - 1] !== hi) dots.push(hi)

  const probeX = p.index != null ? xOf(p.index) : null
  const isFound = p.resolved && p.result >= 0

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={cn("h-full w-full", className)}
      role="img"
      aria-label={t("play.ipLineTitle")}
    >
      {/* осі */}
      <line x1={X0} y1={Y1} x2={X0} y2={Y0} className="stroke-border" strokeWidth={1} />
      <line x1={X0} y1={Y0} x2={X1} y2={Y0} className="stroke-border" strokeWidth={1} />

      {/* підписи кінців осі значень */}
      <text x={X0 - 5} y={Y0} textAnchor="end" dominantBaseline="middle" className="fill-muted-foreground text-[9px] tabular-nums">{loVal}</text>
      <text x={X0 - 5} y={Y1 + 4} textAnchor="end" dominantBaseline="middle" className="fill-muted-foreground text-[9px] tabular-nums">{hiVal}</text>
      {/* підписи кінців осі індексів */}
      <text x={X0} y={Y0 + 14} textAnchor="middle" className="fill-sky-600 dark:fill-sky-400 text-[9px] font-semibold tabular-nums">low={lo}</text>
      <text x={X1} y={Y0 + 14} textAnchor="middle" className="fill-sky-600 dark:fill-sky-400 text-[9px] font-semibold tabular-nums">high={hi}</text>

      {/* «пряма-модель»: (low,arr[low]) → (high,arr[high]) */}
      <line
        x1={xOf(lo)} y1={yOf(loVal)} x2={xOf(hi)} y2={yOf(hiVal)}
        className="stroke-violet-500" strokeWidth={2}
      />

      {/* горизонталь ключа x */}
      <line
        x1={X0} y1={yTarget} x2={X1} y2={yTarget}
        className="stroke-rose-500/70" strokeWidth={1.5} strokeDasharray="4 3"
      />
      <text x={X1} y={yTarget - 4} textAnchor="end" className="fill-rose-600 dark:fill-rose-400 text-[9px] font-semibold tabular-nums">
        x={p.target}
      </text>

      {/* проєкція: вертикаль від перетину донизу + позначка проби */}
      {projPos != null && (
        <>
          <line
            x1={xOf(projPos)} y1={yTarget} x2={xOf(projPos)} y2={Y0}
            className="stroke-rose-500/70" strokeWidth={1.5} strokeDasharray="4 3"
          />
          <circle cx={xOf(projPos)} cy={yTarget} r={3.5} className="fill-rose-500" />
        </>
      )}

      {/* фактичні значення масиву — точки; на рівномірних лежать на прямій */}
      {dots.map((i) => {
        const cx = xOf(i)
        const cy = yOf(p.array[i])
        const role =
          isFound && i === p.result ? "found" : p.probing && i === p.index ? "probe" : "idle"
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={role === "idle" ? 2.4 : 4}
            className={cn(
              role === "found" && "fill-emerald-500",
              role === "probe" && "fill-rose-500 stroke-rose-600",
              role === "idle" && "fill-sky-500/70",
            )}
          />
        )
      })}

      {/* позначка проби на осі індексів (ціле ⌊pos⌋) */}
      {probeX != null && (
        <>
          <line x1={probeX} y1={Y0 - 4} x2={probeX} y2={Y0 + 4} className="stroke-rose-600" strokeWidth={2} />
          <text x={probeX} y={Y0 - 7} textAnchor="middle" className="fill-rose-600 dark:fill-rose-400 text-[9px] font-semibold tabular-nums">
            {p.index}
          </text>
        </>
      )}
    </svg>
  )
}

/** Панель плеєра: «пряма-модель» у рамці + підказка-легенда. */
export function LineModelPanel({
  className,
  ...view
}: LineModelProps & { className?: string }) {
  const t = useT()
  return (
    <Panel
      title={t("play.ipLineTitle")}
      className={className}
      bodyClassName="flex flex-col gap-2 p-3"
    >
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <LineModelView {...view} className="max-h-[260px]" />
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-0.5 w-3 bg-violet-500" /> {t("play.ipLineLegLine")}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block size-2 rounded-full bg-sky-500/70" /> {t("play.ipLineLegDots")}
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-0.5 w-3 border-t border-dashed border-rose-500" /> {t("play.ipLineLegKey")}
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground">{t("play.ipLineHint")}</p>
    </Panel>
  )
}
