import { useMemo, type ReactNode } from "react"
import { buildHeapSortTrace, type HpFrame } from "@/lib/heapSortTrace"
import { countOperations, leftOf, rightOf, type HeapOrder } from "@/lib/heapSort"
import { HeapTree } from "@/algorithms/heap-sort/playback/HeapTreePanel"
import { HeapArrayCells } from "@/algorithms/heap-sort/playback/HeapArrayPanel"
import type { HeapNodeState } from "@/algorithms/heap-sort/playback/highlight"
import { CodePanel } from "@/algorithms/shared/playback/CodePanel"
import { MiniPlayerShell } from "@/algorithms/shared/learn/MiniPlayerShell"
import { QuizFigure } from "@/algorithms/shared/learn/QuizFigure"
import { MAX_HEAP_QUIZ } from "@/algorithms/heap-sort/learn/learn-quiz.heap-sort"
import { usePlayer } from "@/algorithms/shared/playback/use-player"
import { useT } from "@/i18n/use-t"
import type { MessageKey } from "@/i18n/messages"
import type { Translate } from "@/lib/translate"
import { useLangStore } from "@/store/lang-store"

// Живі навчальні віджети пірамідального сортування на еталонних масивах. Головний
// образ — масив, прочитаний як ДВІЙКОВЕ ДЕРЕВО (купа): просіювання, побудова max-купи
// й «наростання» відсортованого хвоста. Усе будується з реального trace, тож
// «картинки» завжди узгоджені з кодом плеєра.

/** Обгортка фігури: рамка-картка + опційний підпис (alt із markdown). */
function Figure({ caption, children }: { caption?: string; children: ReactNode }) {
  return (
    <span className="not-prose my-4 block overflow-x-auto rounded-lg border bg-card p-3">
      {children}
      {caption && (
        <span className="mt-2 block text-center text-xs text-muted-foreground">{caption}</span>
      )}
    </span>
  )
}

/** Двомовний текст без походу в messages (внутрішні підписи віджетів). */
function useL(): (ua: string, en: string) => string {
  const lang = useLangStore((s) => s.lang)
  return (ua, en) => (lang === "ua" ? ua : en)
}

function useTrace(values: readonly number[], order: HeapOrder) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const tr: Translate = (k, v) => t(k as MessageKey, v)
  return useMemo(
    () => buildHeapSortTrace(values, order, tr),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [values, order, lang],
  )
}

/** Стан підсвітки вузлів із кадру trace. */
function nodeState(f: HpFrame): HeapNodeState {
  return {
    heapSize: f.heapSize,
    siftNode: f.siftNode,
    compareChild: f.compareChild,
    swapA: f.swapA,
    swapB: f.swapB,
    isExtract: f.isExtract,
    sortedAll: f.sortedAll,
  }
}

const NEUTRAL = (n: number): HeapNodeState => ({
  heapSize: n,
  siftNode: null,
  compareChild: null,
  swapA: null,
  swapB: null,
  isExtract: false,
  sortedAll: false,
})

// — Масив як комірки ----------------------------------------------------------

export function HeapArrayFigure({ values, caption }: { values: readonly number[]; caption?: string }) {
  return (
    <Figure caption={caption}>
      <HeapArrayCells array={values} state={NEUTRAL(values.length)} size="lg" />
    </Figure>
  )
}

// — Карта індексів: масив ↔ дерево (формула 2i+1 / 2i+2) -----------------------

export function IndexMapFigure({ values, caption }: { values: readonly number[]; caption?: string }) {
  const L = useL()
  const n = values.length
  const indices = useMemo(() => Array.from({ length: n }, (_, i) => i), [n])
  return (
    <Figure caption={caption}>
      <span className="block text-center text-xs text-muted-foreground">
        {L(
          "Той самий масив, прочитаний як дерево. У вузлах — ІНДЕКСИ: дитина вузла i живе на 2i+1 і 2i+2, батько — на (i−1)//2.",
          "The same array read as a tree. Nodes show INDICES: children of i live at 2i+1 and 2i+2, the parent at (i−1)//2.",
        )}
      </span>
      <span className="my-2 block">
        <HeapTree array={indices} state={NEUTRAL(n)} scale={1.15} />
      </span>
      <span className="block">
        <HeapArrayCells array={values} state={NEUTRAL(n)} size="lg" />
      </span>
      {n > 2 && (
        <span className="mt-2 block text-center text-[11px] text-muted-foreground">
          {L("Приклад: діти вузла 1 — це", "Example: children of node 1 are")}{" "}
          <b>
            {leftOf(1)}, {rightOf(1)}
          </b>{" "}
          ({values[leftOf(1)]}, {values[rightOf(1)]}).
        </span>
      )}
    </Figure>
  )
}

// — Побудова купи: до → після -------------------------------------------------

export function BuildHeapFigure({
  values,
  order = "asc",
  caption,
}: {
  values: readonly number[]
  order?: HeapOrder
  caption?: string
}) {
  const L = useL()
  const { frames } = useTrace(values, order)
  const init = frames[0]
  const built = frames.find((f) => f.phase === "build" && f.lines.includes(16)) ?? frames[frames.length - 1]
  return (
    <Figure caption={caption}>
      <span className="grid gap-3 sm:grid-cols-2">
        <span className="block rounded-md border bg-muted/20 p-2">
          <span className="mb-1 block text-center text-xs font-medium text-muted-foreground">
            {L("Початковий масив", "Initial array")}
          </span>
          <HeapTree array={init.array} state={NEUTRAL(values.length)} />
        </span>
        <span className="block rounded-md border bg-emerald-500/5 p-2">
          <span className="mb-1 block text-center text-xs font-medium text-emerald-700 dark:text-emerald-300">
            {order === "asc"
              ? L("Побудована max-купа", "Max-heap built")
              : L("Побудована min-купа", "Min-heap built")}
          </span>
          <HeapTree array={built.array} state={NEUTRAL(values.length)} />
        </span>
      </span>
      <span className="mt-2 block text-center text-[11px] text-muted-foreground">
        {order === "asc"
          ? L(
              "Кожен батько ≥ своїх дітей — корінь став найбільшим елементом.",
              "Every parent ≥ its children — the root is now the largest element.",
            )
          : L(
              "Кожен батько ≤ своїх дітей — корінь став найменшим елементом.",
              "Every parent ≤ its children — the root is now the smallest element.",
            )}
      </span>
    </Figure>
  )
}

// — Повний міні-плеєр (дерево + код + масив) -----------------------------------

export function HeapWalkthrough({
  values,
  order = "asc",
  caption,
}: {
  values: readonly number[]
  order?: HeapOrder
  caption?: string
}) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const { frames, code } = useTrace(values, order)
  const player = usePlayer(frames.length, `${values.join()}|${order}|${lang}`)
  const f = frames[Math.min(player.index, frames.length - 1)]
  const state = nodeState(f)
  return (
    <MiniPlayerShell player={player} frameCount={frames.length} caption={f.caption}>
      <span className="grid gap-3 lg:grid-cols-2">
        <span className="block overflow-auto rounded-lg border bg-card p-2">
          <HeapTree array={f.array} state={state} scale={1.1} />
        </span>
        <CodePanel
          code={code}
          title={t("play.hpCodeTitle")}
          activeLines={f.lines}
          contextLines={f.contextLines}
          className="h-[300px]"
        />
      </span>
      <span className="mt-3 block">
        <HeapArrayCells array={f.array} state={state} size="lg" />
      </span>
      {caption && (
        <span className="mt-2 block text-center text-xs text-muted-foreground">{caption}</span>
      )}
    </MiniPlayerShell>
  )
}

// — Один крок трасування (дерево + масив на конкретній події) ------------------

export function HeapStepFigure({
  values,
  eventIndex,
  order = "asc",
  caption,
}: {
  values: readonly number[]
  eventIndex: number
  order?: HeapOrder
  caption?: string
}) {
  const { frames } = useTrace(values, order)
  const f = frames[Math.min(Math.max(0, eventIndex), frames.length - 1)]
  const state = nodeState(f)
  return (
    <Figure caption={caption}>
      <HeapTree array={f.array} state={state} scale={1.1} />
      <span className="my-2 block">
        <HeapArrayCells array={f.array} state={state} size="lg" />
      </span>
      <span className="block text-center text-[11px] text-muted-foreground">{f.caption}</span>
    </Figure>
  )
}

// — Порівняння напрямів (max-купа asc проти min-купа desc) ---------------------

export function OrderCompareFigure({ values, caption }: { values: readonly number[]; caption?: string }) {
  const L = useL()
  const rows: { key: HeapOrder; label: string; sorted: number[] }[] = [
    { key: "asc", label: L("за зростанням (max-купа)", "ascending (max-heap)"), sorted: heapSorted(values, "asc") },
    { key: "desc", label: L("за спаданням (min-купа)", "descending (min-heap)"), sorted: heapSorted(values, "desc") },
  ]
  return (
    <Figure caption={caption}>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b text-right text-muted-foreground">
            <th className="px-2 py-1 text-left font-medium">{L("напрям", "order")}</th>
            <th className="px-2 py-1 text-left font-mono font-medium">{L("результат", "result")}</th>
            <th className="px-2 py-1 font-medium">{L("порівн.", "comp.")}</th>
            <th className="px-2 py-1 font-medium">{L("обміни", "swaps")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const c = countOperations(values, r.key)
            return (
              <tr key={r.key} className="border-b last:border-0 text-right tabular-nums">
                <td className="px-2 py-1 text-left font-medium">{r.label}</td>
                <td className="px-2 py-1 text-left font-mono text-muted-foreground">[{r.sorted.join(", ")}]</td>
                <td className="px-2 py-1">{c.comparisons}</td>
                <td className="px-2 py-1">{c.swaps}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <span className="mt-1.5 block text-xs text-muted-foreground">
        {L(
          "Той самий масив: max-купа дає зростання, min-купа — спадання. Ціна обох — порядку n·log n.",
          "Same array: a max-heap yields ascending, a min-heap descending. Both cost on the order of n·log n.",
        )}
      </span>
    </Figure>
  )
}

// — НЕадаптивність: різні входи — схожа ціна -----------------------------------

export function NonAdaptiveFigure({ caption }: { caption?: string }) {
  const L = useL()
  const cases: { label: string; arr: number[] }[] = [
    { label: L("вже відсортований", "already sorted"), arr: [1, 2, 3, 4, 5, 6, 7, 8] },
    { label: L("зворотний", "reversed"), arr: [8, 7, 6, 5, 4, 3, 2, 1] },
    { label: L("випадковий", "random"), arr: [5, 1, 8, 3, 7, 2, 6, 4] },
  ]
  return (
    <Figure caption={caption}>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b text-right text-muted-foreground">
            <th className="px-2 py-1 text-left font-medium">{L("вхід (n = 8)", "input (n = 8)")}</th>
            <th className="px-2 py-1 font-medium">{L("порівн.", "comp.")}</th>
            <th className="px-2 py-1 font-medium">{L("обміни", "swaps")}</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => {
            const s = countOperations(c.arr, "asc")
            return (
              <tr key={c.label} className="border-b last:border-0 text-right tabular-nums">
                <td className="px-2 py-1 text-left font-medium">{c.label}</td>
                <td className="px-2 py-1">{s.comparisons}</td>
                <td className="px-2 py-1">{s.swaps}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <span className="mt-1.5 block text-xs text-muted-foreground">
        {L(
          "Числа близькі для будь-якого входу: Heap Sort НЕ адаптивний — Θ(n·log n) у всіх випадках. Цікаво, що «вже відсортований» масив не дешевший (це min-купа, а max-купу треба будувати з нуля).",
          "The numbers are close for any input: Heap Sort is NOT adaptive — Θ(n·log n) in all cases. Notably, an «already sorted» array is not cheaper (it is a min-heap, while we must build a max-heap from scratch).",
        )}
      </span>
    </Figure>
  )
}

// — Зростання складності ------------------------------------------------------

export function GrowthFigure({ caption }: { caption?: string }) {
  const L = useL()
  const lang = useLangStore((s) => s.lang)
  const locale = lang === "ua" ? "uk-UA" : "en-US"
  const rows = [10, 100, 1000, 10000, 100000]
  const fmt = (x: number) => Math.round(x).toLocaleString(locale)
  return (
    <Figure caption={caption}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b text-right text-xs text-muted-foreground">
            <th className="px-2 py-1 text-left font-medium">n</th>
            <th className="px-2 py-1 font-mono font-medium">n²</th>
            <th className="px-2 py-1 font-mono font-medium">n·log₂n</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((n) => (
            <tr key={n} className="border-b last:border-0 text-right tabular-nums">
              <td className="px-2 py-1 text-left font-medium">{fmt(n)}</td>
              <td className="px-2 py-1 font-mono text-rose-600 dark:text-rose-400">{fmt(n * n)}</td>
              <td className="px-2 py-1 font-mono text-emerald-700 dark:text-emerald-400">{fmt(n * Math.log2(n))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <span className="mt-1.5 block text-xs text-muted-foreground">
        {L(
          "На великих n різниця між n² і n·log n — колосальна. Саме тому Heap Sort придатний для великих наборів даних.",
          "For large n the gap between n² and n·log n is enormous. That is why Heap Sort scales to large data sets.",
        )}
      </span>
    </Figure>
  )
}

// — Квіз «де коректна max-купа?» (за мотивами конспекту) -----------------------

/**
 * MCQ-чекпойнт max-купи. Делегує рендер спільному data-driven `QuizFigure`, а
 * сам несе лише декларативну спеку `MAX_HEAP_QUIZ` (питання, дерева-варіанти,
 * предикат `isMaxHeap` + адресні пояснення кожного варіанта).
 */
export function MaxHeapQuizFigure({ caption }: { caption?: string }) {
  return <QuizFigure spec={MAX_HEAP_QUIZ} caption={caption} />
}

/** Допоміжне: відсортований результат (для таблиці порівняння напрямів). */
function heapSorted(values: readonly number[], order: HeapOrder): number[] {
  return [...values].sort((a, b) => (order === "asc" ? a - b : b - a))
}
