import type { ReactNode } from "react"

// Рядок-статистики плеєра — спільний для всіх не-графових плеєрів (сортування/пошуки/
// рядкові). Раніше копіювався в кожен PlaybackView; тепер один екземпляр.

/** Обгортка рядка лічильників (усередині — кілька <Stat>). */
export function StatsBar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 rounded-md border bg-card px-3 py-2 text-xs">
      {children}
    </div>
  )
}

/** Один лічильник: жирний підпис + моноширинне значення. */
export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span>
      <b>{label}</b> <span className="tabular-nums">{value}</span>
    </span>
  )
}
