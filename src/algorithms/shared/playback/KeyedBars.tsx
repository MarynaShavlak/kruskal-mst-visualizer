import { ArrowDown } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/** Висота стовпчика у % від макс. значення (мінімум `minPct`%). Спільна для барів. */
export function barHeightPct(value: number, max: number, minPct = 8): number {
  if (max <= 0) return minPct
  return Math.max(minPct, Math.round((value / max) * 100))
}

export interface KeyedBarsProps<R extends string> {
  readonly array: readonly number[]
  /** Роль i-го стовпчика (інжектує алгоритм зі своєї highlight). */
  readonly roleAt: (i: number) => R
  /** Мапа роль → класи кольору стовпчика. Роль "hole" малюється як порожня пунктирна. */
  readonly classMap: Record<R, string>
  readonly hole: number | null
  /** Значення «у руці» (плаваючий бар над «діркою») або null. */
  readonly keyValue: number | null
  /** Чи роль активна → значення контрастне (foreground). */
  readonly isActive: (role: R) => boolean
  readonly height?: number
  readonly size?: "md" | "lg"
  /** Додаткова висота контейнера знизу (selection: 16 під курсор ▲). За замовч. 0. */
  readonly extraBottom?: number
  /** Вміст зони ключа, коли НЕ показуємо key «у руці» (selection: ↔ над парою обміну). */
  readonly keyZoneOverlay?: (i: number) => ReactNode
  /** Область індексу під стовпчиком (звичайний індекс / + курсор ▲ / фіолетовий чип). */
  readonly renderIndex: (i: number, idxText: string) => ReactNode
}

/**
 * Спільне ядро стовпчикового виду «зі стовпчиком у руці» — для сортувань вставками,
 * прямим вибором (стабільне) і Шелла. Контейнер + зона плаваючого `key`/`temp` над
 * «діркою» (зі стрілкою ↓) + основний стовпчик (висота ∝ значенню; "hole" = порожня
 * пунктирна на всю висоту). Ролі, кольори, область індексу й оверлеї інжектить алгоритм.
 */
export function KeyedBars<R extends string>({
  array,
  roleAt,
  classMap,
  hole,
  keyValue,
  isActive,
  height = 220,
  size = "md",
  extraBottom = 0,
  keyZoneOverlay,
  renderIndex,
}: KeyedBarsProps<R>) {
  const max = Math.max(1, ...array, keyValue ?? 0)
  const keyZone = Math.round(height * 0.4)
  const valueText = size === "lg" ? "text-sm" : "text-[11px]"
  const idxText = size === "lg" ? "text-xs" : "text-[10px]"
  const outer = height + keyZone + extraBottom
  return (
    <div className="flex items-end justify-center gap-1.5" style={{ height: outer }}>
      {array.map((v, i) => {
        const role = roleAt(i)
        const isHole = role === "hole"
        const active = isActive(role)
        const showKey = hole !== null && i === hole && keyValue !== null
        return (
          <div
            key={i}
            className="flex min-w-[1.5rem] flex-1 flex-col items-center justify-end gap-1"
            style={{ height: outer }}
          >
            {/* Зона під key «у руці» (висить над «діркою»). */}
            <div className="flex w-full flex-col items-center justify-end gap-0.5" style={{ height: keyZone }}>
              {showKey ? (
                <>
                  <span className={cn("font-semibold tabular-nums leading-none text-amber-700 dark:text-amber-300", valueText)}>
                    {keyValue}
                  </span>
                  <div
                    className="w-full rounded-t bg-amber-400/80 dark:bg-amber-400/70"
                    style={{ height: `${Math.max(8, ((keyValue ?? 0) / max) * (keyZone - 28))}px` }}
                  />
                  <ArrowDown className="size-3 text-amber-600 dark:text-amber-400" />
                </>
              ) : (
                keyZoneOverlay?.(i)
              )}
            </div>
            {/* Сам стовпчик / порожня «дірка». */}
            <div className="flex w-full flex-col items-center justify-end gap-1" style={{ height }}>
              <span
                className={cn(
                  "font-medium tabular-nums leading-none",
                  valueText,
                  isHole && "opacity-0",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {v}
              </span>
              <div
                className={cn("w-full rounded-t transition-all", classMap[role])}
                style={{ height: isHole ? "100%" : `${barHeightPct(v, max)}%` }}
              />
            </div>
            {renderIndex(i, idxText)}
          </div>
        )
      })}
    </div>
  )
}
