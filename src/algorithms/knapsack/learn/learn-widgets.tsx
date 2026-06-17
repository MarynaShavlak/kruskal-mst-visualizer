import { useMemo, type ReactNode } from "react"
import { Check, Crown } from "lucide-react"
import {
  knapsackDpTable,
  knapsackRecursive,
  greedySteps,
  type KnapsackInstance,
} from "@/lib/knapsack"
import { buildBruteTrace } from "@/lib/knapsackAltTrace"
import { buildKnapsackTrace } from "@/lib/knapsackTrace"
import {
  backtrackPath,
  cellSources,
  dpLinear,
} from "@/algorithms/knapsack/playback/highlight"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { DpGridPanel } from "@/algorithms/knapsack/playback/DpGridPanel"
import { MiniPlayerShell } from "@/algorithms/shared/learn/MiniPlayerShell"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { useT } from "@/i18n/use-t"
import type { MessageKey } from "@/i18n/messages"
import type { Translate } from "@/lib/translate"
import { useLangStore } from "@/store/lang-store"
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

// — Крупний план клітинки K[i][w] -------------------------------------------

export function CellFormulaFigure({
  instance,
  i,
  w,
  caption,
}: {
  instance: KnapsackInstance
  i: number
  w: number
  caption?: string
}) {
  const t = useT()
  const { weights, values, names } = arrays(instance)
  const W = instance.capacity
  const n = weights.length
  const cols = W + 1
  const table = knapsackDpTable(weights, values, W)
  const target = dpLinear(i, w, cols)

  const wt = i >= 1 ? weights[i - 1] : 0
  const val = i >= 1 ? values[i - 1] : 0
  const isBase = i === 0 || w === 0
  const fits = !isBase && wt <= w
  const skip = isBase ? null : table[i - 1][w]
  const take = fits ? val + table[i - 1][w - wt] : null
  const value = table[i][w]
  const takeWins = fits && (take as number) > (skip as number)
  const src = cellSources(i, w, weights)

  const isSrc = (ri: number, rw: number): "take" | "skip" | null => {
    if (src.take && src.take[0] === ri && src.take[1] === rw) return "take"
    if (src.skip && src.skip[0] === ri && src.skip[1] === rw) return "skip"
    return null
  }

  return (
    <Figure caption={caption}>
      <table className="border-collapse text-[11px] tabular-nums">
        <thead>
          <tr>
            <th className="px-1.5 py-0.5 text-muted-foreground">i\w</th>
            {Array.from({ length: cols }, (_, c) => (
              <th
                key={c}
                className={cn(
                  "min-w-[1.75rem] px-1 py-0.5 text-center font-normal text-muted-foreground",
                  c === w && "text-foreground font-semibold",
                )}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.map((row, ri) => (
            <tr key={ri}>
              <th
                className={cn(
                  "whitespace-nowrap px-1.5 py-0.5 text-left font-normal text-muted-foreground",
                  ri === i && "text-foreground font-semibold",
                )}
              >
                {ri === 0 ? "∅" : `${ri} ${names[ri - 1] ?? ""}`}
              </th>
              {row.map((cellVal, rw) => {
                const shown = dpLinear(ri, rw, cols) <= target
                const active = ri === i && rw === w
                const source = isSrc(ri, rw)
                return (
                  <td
                    key={rw}
                    className={cn(
                      "min-w-[1.75rem] border border-border/40 px-1 py-0.5 text-center",
                      !shown && "text-transparent",
                      active && "bg-amber-400/20 font-semibold ring-2 ring-amber-500/70",
                      source === "skip" && "bg-sky-500/20 ring-2 ring-sky-500/60",
                      source === "take" && "bg-emerald-500/20 ring-2 ring-emerald-500/60",
                    )}
                  >
                    {shown ? cellVal : "·"}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <span className="mt-2 block font-mono text-xs">
        <span className="text-muted-foreground">{`K[${i}][${w}] = `}</span>
        {isBase ? (
          <span>0 · {t("learn.knapCellBase")}</span>
        ) : !fits ? (
          <span>
            <span className="text-sky-700 dark:text-sky-300">
              {t("learn.knapCellSkip")} K[{i - 1}][{w}] = {skip}
            </span>{" "}
            <span className="text-muted-foreground">
              ({wt} &gt; {w} — {t("learn.knapCellNofit")})
            </span>
          </span>
        ) : (
          <span>
            max(
            <span className={cn("text-emerald-700 dark:text-emerald-300", takeWins && "font-bold")}>
              {t("learn.knapCellTake")} {val}+{table[i - 1][w - wt]}={take}
            </span>
            ,{" "}
            <span className={cn("text-sky-700 dark:text-sky-300", !takeWins && "font-bold")}>
              {t("learn.knapCellSkip")} {skip}
            </span>
            ) = <b className="text-foreground">{value}</b>
          </span>
        )}
      </span>
      {i === n && w === W && (
        <span className="mt-1 block text-xs text-rose-600 dark:text-rose-400">
          {t("play.knapOptimum")}: {value}
        </span>
      )}
    </Figure>
  )
}

// — Покрокове виконання коду: міні-плеєр «код ↔ таблиця» ---------------------

/**
 * Вбудований у навчальну сторінку міні-плеєр: ліворуч код ДП із підсвіченими
 * активними рядками, праворуч — жива таблиця K[i][w] (ті самі панелі, що й на
 * вкладці «Алгоритм»). Гілку переходу кодує колір активної клітинки таблиці
 * (🟩 взяти · 🟦 не брати · ⬜ не влазить · база). `focusRow` лишає тільки кадри
 * одного рядка (детальний скан клітинок), інакше — весь прогін заповнення +
 * відновлення. Замінює статичні фігури «код ↔ таблиця» розділу 21.
 */
export function CodeWalkthroughFigure({
  instance,
  focusRow,
  caption,
}: {
  instance: KnapsackInstance
  /** Лишити лише кадри цього рядка i (детальний скан однієї стрічки). */
  focusRow?: number
  caption?: string
}) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)

  const { frames, result, code } = useMemo(() => {
    const run = buildKnapsackTrace(instance, tr)
    const all = run.trace.frames
    const picked =
      focusRow === undefined
        ? all
        : all.filter(
            (f) =>
              f.phase === "fill" &&
              f.row === focusRow &&
              (f.sub.kind === "row-open" || f.sub.kind === "cell"),
          )
    return { frames: picked, result: run.result, code: run.trace.code }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance, lang, focusRow])

  const player = usePlayer(frames.length, frames)

  if (frames.length === 0) {
    return (
      <Figure caption={caption}>
        <span className="block text-sm text-muted-foreground">—</span>
      </Figure>
    )
  }

  const frame = frames[Math.min(player.index, frames.length - 1)]

  return (
    <MiniPlayerShell
      player={player}
      frameCount={frames.length}
      caption={frame.caption}
    >
      <span className="grid gap-3 lg:grid-cols-2">
        <CodePanel
          code={code}
          title={t("play.codeKnapDp")}
          activeLines={frame.lines}
          contextLines={frame.contextLines}
          className="h-[320px]"
        />
        <DpGridPanel result={result} frame={frame} className="h-[320px]" />
      </span>
      {caption && (
        <span className="mt-2 block text-center text-xs text-muted-foreground">
          {caption}
        </span>
      )}
    </MiniPlayerShell>
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

// — Дерево рекурсії повного перебору -----------------------------------------

// Останній рівень (n=1) згортаємо в листки зі значенням knapSack(W, 1) — так
// само, як у README: «листки — підзадачі з одним П1». Гілки: ліворуч «взяти»,
// праворуч «не брати»; вартість набирається на гілках «взяти».
const TREE_LEAF_LEVEL = 1

interface TreeNode {
  W: number
  n: number
  value: number
  /** Індекс предмета, чию долю вирішує вузол (для branch/nofit), інакше null. */
  item: number | null
  kind: "branch" | "nofit" | "leaf"
  isBase: boolean
  take: TreeNode | null
  skip: TreeNode | null
  /** Гілка-переможець (для branch). */
  best: "take" | "skip" | null
  onPath: boolean
  x: number
  depth: number
}

function buildRecursionTree(
  weights: readonly number[],
  values: readonly number[],
  W: number,
  n: number,
  depth: number,
): TreeNode {
  const value = knapsackRecursive(W, weights, values, n)
  const base = n === 0 || W === 0
  const node: TreeNode = {
    W, n, value, item: null, kind: "leaf", isBase: base,
    take: null, skip: null, best: null, onPath: false, x: 0, depth,
  }
  if (base || n <= TREE_LEAF_LEVEL) return node // листок (база або згорнутий рівень)

  const item = n - 1
  node.item = item
  if (weights[item] > W) {
    node.kind = "nofit"
    node.skip = buildRecursionTree(weights, values, W, n - 1, depth + 1)
    return node
  }
  node.kind = "branch"
  node.take = buildRecursionTree(weights, values, W - weights[item], n - 1, depth + 1)
  node.skip = buildRecursionTree(weights, values, W, n - 1, depth + 1)
  const takeTotal = values[item] + node.take.value
  node.best = takeTotal > node.skip.value ? "take" : "skip"
  return node
}

function markTreePath(node: TreeNode): void {
  node.onPath = true
  if (node.kind === "branch") markTreePath(node.best === "take" ? node.take! : node.skip!)
  else if (node.kind === "nofit") markTreePath(node.skip!)
}

/** Геометрія: листки отримують послідовні x-слоти, внутрішні вузли — середину дітей. */
function layoutTree(node: TreeNode, counter: { x: number }): void {
  const kids = [node.take, node.skip].filter((c): c is TreeNode => c !== null)
  if (kids.length === 0) {
    node.x = counter.x++
    return
  }
  kids.forEach((c) => layoutTree(c, counter))
  node.x = (kids[0].x + kids[kids.length - 1].x) / 2
}

function flattenTree(node: TreeNode, out: TreeNode[]): void {
  out.push(node)
  if (node.take) flattenTree(node.take, out)
  if (node.skip) flattenTree(node.skip, out)
}

const TREE_BOX_W = 96
const TREE_BOX_H = 46
const TREE_COL = 120
const TREE_ROW = 104
const TREE_MARGIN_L = 48
const TREE_MARGIN_T = 16

export function RecursionTreeFigure({
  instance,
  caption,
}: {
  instance: KnapsackInstance
  caption?: string
}) {
  const t = useT()
  const { weights, values, names } = arrays(instance)
  const W = instance.capacity
  const N = weights.length

  const root = buildRecursionTree(weights, values, W, N, 0)
  markTreePath(root)
  layoutTree(root, { x: 0 })
  const nodes: TreeNode[] = []
  flattenTree(root, nodes)

  const leafCount = nodes.filter((nd) => !nd.take && !nd.skip).length
  const maxDepth = Math.max(...nodes.map((nd) => nd.depth))

  // Безпека: дуже широке дерево (велике N) не показуємо покроково.
  if (leafCount > 40) {
    return (
      <Figure caption={caption}>
        <span className="block text-sm text-muted-foreground">
          {t("learn.knapTreeTooBig", { n: N })}
        </span>
      </Figure>
    )
  }

  const cx = (nd: TreeNode) => TREE_MARGIN_L + (nd.x + 0.5) * TREE_COL
  const top = (nd: TreeNode) => TREE_MARGIN_T + nd.depth * TREE_ROW
  const width = TREE_MARGIN_L + leafCount * TREE_COL + 12
  const height = TREE_MARGIN_T + maxDepth * TREE_ROW + TREE_BOX_H + 12

  interface Edge {
    x1: number; y1: number; x2: number; y2: number
    onPath: boolean; label: string; kind: "take" | "skip" | "nofit"
  }
  const edges: Edge[] = []
  for (const nd of nodes) {
    const addEdge = (child: TreeNode, kind: "take" | "skip" | "nofit") => {
      edges.push({
        x1: cx(nd), y1: top(nd) + TREE_BOX_H,
        x2: cx(child), y2: top(child),
        onPath: nd.onPath && child.onPath,
        kind,
        label:
          kind === "take"
            ? `${t("learn.knapCellTake")} ${names[nd.item!]} +${values[nd.item!]}`
            : kind === "nofit"
              ? t("learn.knapCellNofit")
              : t("learn.knapCellSkip"),
      })
    }
    if (nd.kind === "branch") {
      addEdge(nd.take!, "take")
      addEdge(nd.skip!, "skip")
    } else if (nd.kind === "nofit") {
      addEdge(nd.skip!, "nofit")
    }
  }

  return (
    <Figure caption={caption}>
      <div className="relative" style={{ width, height }}>
        <svg className="absolute inset-0" width={width} height={height}>
          {edges.map((e, k) => (
            <line
              key={k}
              x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
              className={cn(
                e.onPath
                  ? "stroke-emerald-500"
                  : e.kind === "take"
                    ? "stroke-emerald-500/40"
                    : "stroke-muted-foreground/30",
              )}
              strokeWidth={e.onPath ? 2.5 : 1.5}
              strokeDasharray={e.kind === "nofit" ? "4 3" : undefined}
            />
          ))}
        </svg>

        {/* Підписи рівнів зліва */}
        {Array.from({ length: maxDepth + 1 }, (_, d) => (
          <div
            key={`lvl-${d}`}
            className="absolute text-[10px] font-medium text-muted-foreground"
            style={{ left: 0, top: TREE_MARGIN_T + d * TREE_ROW + TREE_BOX_H / 2 - 6, width: TREE_MARGIN_L - 6 }}
          >
            {d < N ? names[N - 1 - d] : t("learn.knapCellBase")}
          </div>
        ))}

        {/* Підписи ребер */}
        {edges.map((e, k) => (
          <div
            key={`el-${k}`}
            className={cn(
              "absolute -translate-x-1/2 whitespace-nowrap rounded bg-card px-1 text-[10px]",
              e.kind === "take"
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-muted-foreground",
            )}
            style={{ left: e.x1 + (e.x2 - e.x1) * 0.5, top: e.y1 + (e.y2 - e.y1) * 0.42 - 8 }}
          >
            {e.label}
          </div>
        ))}

        {/* Вузли */}
        {nodes.map((nd, k) => {
          const isLeaf = !nd.take && !nd.skip
          return (
            <div
              key={`n-${k}`}
              className={cn(
                "absolute flex flex-col items-center justify-center rounded-md border text-center",
                nd.onPath
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-border bg-card",
              )}
              style={{
                left: cx(nd) - TREE_BOX_W / 2,
                top: top(nd),
                width: TREE_BOX_W,
                height: TREE_BOX_H,
              }}
            >
              <span className="font-mono text-[10px] text-muted-foreground">
                kS({nd.W},{nd.n})
              </span>
              <span className="text-base font-semibold tabular-nums leading-none">
                {nd.value}
              </span>
              {nd.isBase && (
                <span className="text-[9px] text-muted-foreground">
                  {t("learn.knapCellBase")}: W=0
                </span>
              )}
              {nd.onPath && nd === root && (
                <span className="absolute -right-1 -top-2 text-amber-500">★</span>
              )}
              {isLeaf && nd.onPath && !nd.isBase && (
                <span className="absolute -right-1 -top-2 text-amber-500">★</span>
              )}
            </div>
          )
        })}
      </div>
      <span className="mt-2 block text-xs text-muted-foreground">
        {t("learn.knapTreeLegend")}
      </span>
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
