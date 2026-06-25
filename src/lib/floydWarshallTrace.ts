// Модель trace для Флойда–Воршала — аналог trace.ts/kruskalDsu.ts Краскала.
// Алгоритм проганяється ОДИН раз і пише список незмінних кадрів (FwFrame);
// UI лише рухає курсор по них. Формат дворівневий: зовнішній крок на проміжну
// вершину k (open-k / k-done) + підкроки-порівняння на кожну пару (i, j).

import {
  toDistMatrix,
  type DirectedGraph,
  type Vertex,
} from "@/lib/directedGraph"
import { INF, type NextMatrix, type ReadonlyMatrix } from "@/lib/floydWarshall"
import { createFrameList } from "@/lib/frameList"
import { identityTranslate, type Translate } from "@/lib/translate"

/** Лістинг коду для панелі підсвітки (рядок = елемент, 1-based індекси). */
export const FLOYD_WARSHALL_CODE: readonly string[] = [
  "for k in range(n):                    # відкриваємо проміжні вершини по черзі",
  "    for i in range(n):                # звідки (рядок)",
  "        for j in range(n):            # куди (стовпець)",
  "            via_k = dist[i][k] + dist[k][j]",
  "            if via_k < dist[i][j]:    # чи коротший шлях i → j через k?",
  "                dist[i][j] = via_k    # так — оновлюємо найкоротшу відстань",
  "                nxt[i][j] = nxt[i][k] # і запам'ятовуємо перший крок шляху",
]

/** Охопні цикли (for k / for i / for j) — тьмяний контекст на кадрах тіла. */
const BODY_CONTEXT: readonly number[] = [1, 2, 3]

/** Підкрок кадру. Дискримінант — `kind`. */
export type FwSub =
  | { readonly kind: "init" }
  | { readonly kind: "open-k"; readonly k: number }
  | {
      readonly kind: "compare"
      readonly k: number
      readonly cell: readonly [number, number]
      readonly viaK: number
      readonly current: number
      readonly relaxed: boolean
    }
  | {
      readonly kind: "apply"
      readonly k: number
      readonly cell: readonly [number, number]
      /** Попередня відстань D[i][j] (можливо ∞). */
      readonly from: number
      /** Нова (менша) відстань via_k, яку записуємо. */
      readonly to: number
    }
  | { readonly kind: "k-done"; readonly k: number; readonly improved: number }
  | { readonly kind: "done" }

export interface FwFrame {
  readonly i: number
  readonly sub: FwSub
  /** Активна проміжна вершина k (null у init/done). */
  readonly k: number | null
  /** Активна клітинка (i, j) для compare; null інакше. */
  readonly cell: readonly [number, number] | null
  /** Знімок матриці D на цьому кадрі (спільне посилання, якщо не змінювалась). */
  readonly matrix: ReadonlyMatrix
  /** Клітинки, покращені від початку поточного кроку k (для зеленого). */
  readonly improvedThisK: ReadonlyArray<readonly [number, number]>
  /** Підсвічені рядки коду — поточна дія (1-based у FLOYD_WARSHALL_CODE). */
  readonly lines: readonly number[]
  /** Рядки-контекст (охопні цикли) — тьмяна підсвітка. */
  readonly contextLines: readonly number[]
  /** Нарація українською. */
  readonly caption: string
  /** Чи виявлено від'ємний цикл на момент кадру (D[i][i] < 0). */
  readonly negativeCycle: boolean
}

export interface FwResult {
  /** Мітки вершин у порядку рядків/стовпців матриці. */
  readonly order: readonly Vertex[]
  /** Підсумкова матриця найкоротших відстаней. */
  readonly dist: ReadonlyMatrix
  /** Матриця наступних вершин для відновлення шляхів. */
  readonly nxt: NextMatrix
  readonly hasNegativeCycle: boolean
  /** Скільки всього релаксацій (покращень) сталося. */
  readonly improvedCount: number
}

export interface FwTrace {
  readonly code: readonly string[]
  readonly order: readonly Vertex[]
  readonly frames: readonly FwFrame[]
  readonly result: FwResult
}

export interface FwRun {
  readonly result: FwResult
  readonly trace: FwTrace
}

/**
 * Проганяє Флойда–Воршала на орієнтованому графі й збирає trace для плеєра.
 * Знімок матриці клонується лише на кадрах із релаксацією — незмінні кадри
 * ділять одне посилання (пам'ять ≈ O(n² · к-сть покращень), а не O(n⁴)).
 */
export function buildFloydWarshallTrace(
  graph: DirectedGraph,
  t: Translate = identityTranslate,
): FwRun {
  const { order, dist: initial } = toDistMatrix(graph)
  const n = order.length
  const label = (idx: number): string => order[idx] ?? String(idx)
  const fmt = (x: number): string => (x === INF ? "∞" : String(x))

  const working: number[][] = initial.map((row) => [...row])
  // nxt[i][j] = j для кожної відомої відстані, інакше null.
  const nxt: (number | null)[][] = working.map((row, i) =>
    row.map((_, j) => (working[i][j] !== INF ? j : null)),
  )
  let frozen: ReadonlyMatrix = working.map((row) => [...row])
  let negativeCycle = false
  let improvedCount = 0

  const { frames, push } = createFrameList<FwFrame>()

  push({
    sub: { kind: "init" },
    k: null,
    cell: null,
    matrix: frozen,
    improvedThisK: [],
    lines: [],
    contextLines: [],
    caption: t("play.nFwInit"),
    negativeCycle: false,
  })

  for (let k = 0; k < n; k++) {
    const improvedThisK: [number, number][] = []
    push({
      sub: { kind: "open-k", k },
      k,
      cell: null,
      matrix: frozen,
      improvedThisK: [],
      lines: [1],
      contextLines: [],
      caption: t("play.nFwOpenK", { k: label(k) }),
      negativeCycle,
    })

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const current = working[i][j]
        const viaK = working[i][k] + working[k][j]
        const relaxed = viaK < current

        // Кадр РІШЕННЯ (рядки 4–5): рахуємо via_k і перевіряємо умову. Матриця
        // ще стара, клітинку (i, j) лише розглядаємо — вона поки не зелена.
        push({
          sub: { kind: "compare", k, cell: [i, j], viaK, current, relaxed },
          k,
          cell: [i, j],
          matrix: frozen,
          improvedThisK: [...improvedThisK],
          lines: [4, 5],
          contextLines: BODY_CONTEXT,
          caption: compareCaption(label(i), label(j), label(k), viaK, current, relaxed, fmt, t),
          negativeCycle,
        })

        if (!relaxed) continue

        // Релаксація — застосовуємо й показуємо ОКРЕМИМ кадром ОНОВЛЕННЯ
        // (рядки 6–7): матриця вже з новим значенням, клітинка стає зеленою.
        working[i][j] = viaK
        nxt[i][j] = nxt[i][k]
        frozen = working.map((row) => [...row])
        improvedThisK.push([i, j])
        improvedCount++
        if (i === j && viaK < 0) negativeCycle = true

        push({
          sub: { kind: "apply", k, cell: [i, j], from: current, to: viaK },
          k,
          cell: [i, j],
          matrix: frozen,
          improvedThisK: [...improvedThisK],
          lines: [6, 7],
          contextLines: BODY_CONTEXT,
          caption: applyCaption(label(i), label(j), viaK, fmt, t),
          negativeCycle,
        })
      }
    }

    push({
      sub: { kind: "k-done", k, improved: improvedThisK.length },
      k,
      cell: null,
      matrix: frozen,
      improvedThisK: [...improvedThisK],
      lines: [1],
      contextLines: [],
      caption:
        improvedThisK.length === 0
          ? t("play.nFwKDoneNone", { k: label(k) })
          : t("play.nFwKDoneSome", { k: label(k), n: improvedThisK.length }),
      negativeCycle,
    })
  }

  push({
    sub: { kind: "done" },
    k: null,
    cell: null,
    matrix: frozen,
    improvedThisK: [],
    lines: [],
    contextLines: [],
    caption: negativeCycle ? t("play.nFwDoneNeg") : t("play.nFwDone"),
    negativeCycle,
  })

  const result: FwResult = {
    order,
    dist: frozen,
    nxt,
    hasNegativeCycle: negativeCycle,
    improvedCount,
  }
  return { result, trace: { code: FLOYD_WARSHALL_CODE, order, frames, result } }
}

function compareCaption(
  a: string,
  b: string,
  k: string,
  viaK: number,
  current: number,
  relaxed: boolean,
  fmt: (x: number) => string,
  t: Translate,
): string {
  if (viaK === INF) {
    return t("play.nFwCmpInf", { a, b, k })
  }
  if (relaxed) {
    return t("play.nFwCmpRelax", { a, b, k, viaK: fmt(viaK), current: fmt(current) })
  }
  return t("play.nFwCmpNoChange", { a, b, k, viaK: fmt(viaK), current: fmt(current) })
}

/** Нарація кадру оновлення (рядки 6–7): запис коротшої відстані та nxt. */
function applyCaption(
  a: string,
  b: string,
  viaK: number,
  fmt: (x: number) => string,
  t: Translate,
): string {
  return t("play.nFwApply", { a, b, viaK: fmt(viaK) })
}
