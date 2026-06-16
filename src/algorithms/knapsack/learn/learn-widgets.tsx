import type { ReactNode } from "react"
import { Check, Crown } from "lucide-react"
import {
  knapsackDpTable,
  greedySteps,
  type KnapsackInstance,
} from "@/lib/knapsack"
import { buildBruteTrace } from "@/lib/knapsackAltTrace"
import { backtrackPath } from "@/algorithms/knapsack/playback/highlight"
import { useT } from "@/i18n/use-t"
import { cn } from "@/lib/utils"

// Живі навчальні віджети рюкзака на еталонних інстансах (малий W=4, класичний
// W=50). Замінюють статичні фігури README обчисленнями з lib/. Кольори — за
// легендою README: 🟧 активна · 🟦 «не брати» · 🟩 «взяти» · 🟨 шлях · 🔴 відповідь.

/** Обгортка фігури: рамка-картка + опційний підпис (alt із markdown). */
function Figure({ caption, children }: { caption?: string; children: ReactNode }) {
  return (
    <span className="not-prose my-4 block overflow-x-auto rounded-lg border bg-card p-3">
      {children}
      {caption && (
        <span className="mt-2 block text-center text-xs text-muted-foreground">
          {caption}
        </span>
      )}
    </span>
  )
}

const arrays = (inst: KnapsackInstance) => ({
  weights: inst.items.map((it) => it.weight),
  values: inst.items.map((it) => it.value),
  names: inst.items.map((it) => it.name),
})

// — Предмети ----------------------------------------------------------------

export function ItemsFigure({
  instance,
  caption,
}: {
  instance: KnapsackInstance
  caption?: string
}) {
  const t = useT()
  return (
    <Figure caption={caption}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="px-2 py-1 font-medium">{t("editor.knapColName")}</th>
            <th className="px-2 py-1 text-right font-medium">{t("editor.knapColWeight")}</th>
            <th className="px-2 py-1 text-right font-medium">{t("editor.knapColValue")}</th>
            <th className="px-2 py-1 text-right font-medium">{t("editor.knapColRatio")}</th>
          </tr>
        </thead>
        <tbody>
          {instance.items.map((it, i) => (
            <tr key={i} className="border-b last:border-0">
              <td className="px-2 py-1 font-medium">{it.name}</td>
              <td className="px-2 py-1 text-right tabular-nums">{it.weight}</td>
              <td className="px-2 py-1 text-right tabular-nums">{it.value}</td>
              <td className="px-2 py-1 text-right tabular-nums text-muted-foreground">
                {(it.value / it.weight).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <span className="mt-1.5 block text-xs text-muted-foreground">
        {t("editor.knapCapacity")}: <b className="tabular-nums">{instance.capacity}</b>
      </span>
    </Figure>
  )
}

// — Підмножини повного перебору ----------------------------------------------

export function SubsetsFigure({
  instance,
  caption,
}: {
  instance: KnapsackInstance
  caption?: string
}) {
  const t = useT()
  const { result } = buildBruteTrace(instance)
  const { names } = arrays(instance)
  const label = (combo: readonly number[]) =>
    combo.length === 0 ? "∅" : combo.map((i) => names[i]).join("")
  return (
    <Figure caption={caption}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="px-2 py-1 font-medium">{t("play.knapColSubset")}</th>
            <th className="px-2 py-1 text-right font-medium">{t("editor.knapColWeight")}</th>
            <th className="px-2 py-1 text-right font-medium">{t("editor.knapColValue")}</th>
            <th className="w-10 px-2 py-1 text-center font-medium">{t("play.knapColFits")}</th>
          </tr>
        </thead>
        <tbody>
          {result.subsets.map((s, idx) => {
            const isBest = idx === result.bestIndex
            return (
              <tr
                key={idx}
                className={cn(
                  "border-b last:border-0",
                  isBest && "bg-emerald-500/10",
                  !s.fits && "text-muted-foreground",
                )}
              >
                <td className="px-2 py-1 font-mono">
                  <span className="inline-flex items-center gap-1">
                    {isBest && <Crown className="size-3.5 text-emerald-600" />}
                    {label(s.combo)}
                  </span>
                </td>
                <td className="px-2 py-1 text-right tabular-nums">{s.weight}</td>
                <td className="px-2 py-1 text-right tabular-nums">{s.value}</td>
                <td className="px-2 py-1 text-center">
                  {s.fits ? <span className="text-emerald-600">✓</span> : <span className="text-destructive">✗</span>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Figure>
  )
}

// — Таблиця ДП K[i][w] -------------------------------------------------------

/** Стовпці для показу: усі, або лише кратні `condense` (+ 0 і W) для широких таблиць. */
function visibleCols(W: number, condense?: number): number[] {
  const all = Array.from({ length: W + 1 }, (_, w) => w)
  if (!condense) return all
  return all.filter((w) => w % condense === 0 || w === W)
}

export function DpTableFigure({
  instance,
  rows,
  condense,
  answer,
  caption,
}: {
  instance: KnapsackInstance
  /** Скільки рядків предметів показати як заповнені (решта — тьмяні). За замовч. усі. */
  rows?: number
  /** Прорідити стовпці (показувати кратні цьому числу). */
  condense?: number
  /** Підсвітити клітинку-відповідь K[n][W] червоною рамкою. */
  answer?: boolean
  caption?: string
}) {
  const { weights, values, names } = arrays(instance)
  const W = instance.capacity
  const n = weights.length
  const table = knapsackDpTable(weights, values, W)
  const shownRows = rows ?? n
  const cols = visibleCols(W, condense)

  return (
    <Figure caption={caption}>
      <table className="border-collapse text-[11px] tabular-nums">
        <thead>
          <tr>
            <th className="px-1.5 py-0.5 text-muted-foreground">i\w</th>
            {cols.map((w) => (
              <th key={w} className="min-w-[1.75rem] px-1 py-0.5 text-center font-normal text-muted-foreground">
                {w}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.map((row, i) => {
            const filled = i <= shownRows
            return (
              <tr key={i} className={cn(!filled && "opacity-30")}>
                <th className="whitespace-nowrap px-1.5 py-0.5 text-left font-normal text-muted-foreground">
                  {i === 0 ? "∅" : `${i} ${names[i - 1] ?? ""}`}
                </th>
                {cols.map((w) => {
                  const isAnswer = answer && i === n && w === W
                  return (
                    <td
                      key={w}
                      className={cn(
                        "min-w-[1.75rem] border border-border/40 px-1 py-0.5 text-center",
                        isAnswer && "bg-rose-500/15 font-semibold ring-2 ring-rose-500/70",
                      )}
                    >
                      {filled ? row[w] : ""}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </Figure>
  )
}

// — Зворотний прохід ---------------------------------------------------------

export function BacktrackFigure({
  instance,
  condense,
  caption,
}: {
  instance: KnapsackInstance
  condense?: number
  caption?: string
}) {
  const t = useT()
  const { weights, values, names } = arrays(instance)
  const W = instance.capacity
  const n = weights.length
  const table = knapsackDpTable(weights, values, W)
  const path = backtrackPath(table, weights, W)
  const pathCells = new Map(path.map((s) => [`${s.i},${s.w}`, s.taken]))
  const chosen = path.filter((s) => s.taken).map((s) => s.i - 1).sort((a, b) => a - b)
  const cols = visibleCols(W, condense)

  return (
    <Figure caption={caption}>
      <table className="border-collapse text-[11px] tabular-nums">
        <thead>
          <tr>
            <th className="px-1.5 py-0.5 text-muted-foreground">i\w</th>
            {cols.map((w) => (
              <th key={w} className="min-w-[1.75rem] px-1 py-0.5 text-center font-normal text-muted-foreground">
                {w}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.map((row, i) => (
            <tr key={i}>
              <th className="whitespace-nowrap px-1.5 py-0.5 text-left font-normal text-muted-foreground">
                {i === 0 ? "∅" : `${i} ${names[i - 1] ?? ""}`}
              </th>
              {cols.map((w) => {
                const taken = pathCells.get(`${i},${w}`)
                const isAnswer = i === n && w === W
                return (
                  <td
                    key={w}
                    className={cn(
                      "min-w-[1.75rem] border border-border/40 px-1 py-0.5 text-center",
                      taken !== undefined && (taken ? "bg-amber-500/30 font-semibold" : "bg-amber-500/10"),
                      isAnswer && "ring-2 ring-rose-500/70",
                    )}
                  >
                    {row[w]}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <span className="mt-1.5 block text-xs text-muted-foreground">
        {t("play.knapChosenSet")}:{" "}
        <b className="font-mono">{`{${chosen.map((i) => names[i]).join(", ")}}`}</b>
      </span>
    </Figure>
  )
}

// — Жадібний контрприклад ----------------------------------------------------

export function GreedyFigure({
  instance,
  caption,
}: {
  instance: KnapsackInstance
  caption?: string
}) {
  const t = useT()
  const { weights, values, names } = arrays(instance)
  const W = instance.capacity
  const steps = greedySteps(weights, values, W)
  const greedyValue = steps.length > 0 ? steps[steps.length - 1].totalAfter : 0
  const { result } = buildBruteTrace(instance)
  const optimal = result.bestValue
  const gap = optimal - greedyValue

  return (
    <Figure caption={caption}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="px-2 py-1 font-medium">{t("editor.knapColName")}</th>
            <th className="px-2 py-1 text-right font-medium">{t("editor.knapColRatio")}</th>
            <th className="px-2 py-1 text-right font-medium">{t("editor.knapColWeight")}</th>
            <th className="px-2 py-1 text-right font-medium">{t("editor.knapColValue")}</th>
            <th className="px-2 py-1 text-right font-medium">{t("play.knapColStatus")}</th>
          </tr>
        </thead>
        <tbody>
          {steps.map((s, idx) => (
            <tr key={idx} className={cn("border-b last:border-0", s.taken ? "bg-emerald-500/10" : "text-muted-foreground")}>
              <td className="px-2 py-1 font-medium">
                <span className="inline-flex items-center gap-1">
                  {s.taken && <Check className="size-3.5 text-emerald-600" />}
                  {names[s.index]}
                </span>
              </td>
              <td className="px-2 py-1 text-right tabular-nums">{s.ratio.toFixed(2)}</td>
              <td className="px-2 py-1 text-right tabular-nums">{s.weight}</td>
              <td className="px-2 py-1 text-right tabular-nums">{s.value}</td>
              <td className="px-2 py-1 text-right text-xs">
                {s.taken ? t("play.knapTaken") : t("play.knapSkipped")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <span className="mt-2 block text-sm">
        <b className="tabular-nums">{greedyValue}</b>{" · "}
        <span className="text-muted-foreground">{t("play.knapVsOptimal", { optimal })}</span>
      </span>
      {gap > 0 && (
        <span className="mt-1.5 block rounded-md bg-amber-500/10 px-2 py-1.5 text-xs text-amber-700 dark:text-amber-300">
          {t("play.knapGreedyLoses", { gap })}
        </span>
      )}
    </Figure>
  )
}

// — Зростання складності 2ⁿ проти n·W ----------------------------------------

export function ComplexityFigure({ caption }: { caption?: string }) {
  const rows = [3, 5, 10, 20, 30, 50]
  const W = 50
  const fmt = (x: number) => x.toLocaleString("uk-UA")
  return (
    <Figure caption={caption}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-right text-xs text-muted-foreground">
            <th className="px-2 py-1 text-left font-medium">n</th>
            <th className="px-2 py-1 font-medium font-mono">2ⁿ</th>
            <th className="px-2 py-1 font-medium font-mono">(n+1)·(W+1)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((n) => (
            <tr key={n} className="border-b last:border-0 text-right tabular-nums">
              <td className="px-2 py-1 text-left font-medium">{n}</td>
              <td className="px-2 py-1 font-mono">{fmt(2 ** n)}</td>
              <td className="px-2 py-1 font-mono text-emerald-700 dark:text-emerald-400">
                {fmt((n + 1) * (W + 1))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <span className="mt-1.5 block text-xs text-muted-foreground">W = {W}</span>
    </Figure>
  )
}
