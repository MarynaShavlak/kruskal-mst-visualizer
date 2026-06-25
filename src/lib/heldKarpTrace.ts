// Модель trace для Хелда–Карпа — аналог floydWarshallTrace.ts. Алгоритм
// проганяється ОДИН раз і пише список незмінних кадрів (HkFrame); UI лише рухає
// курсор по них (scrubbing, крок назад). Формат ДВОРІВНЕВИЙ, як вимагає
// платформа: зовнішній крок — комірка таблиці dp[(S, j)]; підкроки — перебір
// передостанніх міст k усередині min() (де й відбувається реальний вибір).
//
// Порядок кадрів дослівно повторює README/held_karp_traced: база (рівень 2) →
// рівні 3..n (для кожної комбінації підмножини — кожне кінцеве місто) →
// замикання. Шляхи зберігаються повністю — для панелі карти й «розкладу
// кандидатів». Таблиця dp росте монотонно: кадр несе лише лічильник готових
// комірок (`committedCount`), а самі комірки лежать у `result.cells`.

import {
  distanceMatrix,
  tourLess,
  type ReadonlyMatrix,
  type TspInstance,
  type TspTour,
} from "@/lib/tsp"
import { createFrameList } from "@/lib/frameList"
import { identityTranslate, type Translate } from "@/lib/translate"

/** Лістинг коду для панелі підсвітки (рядок = елемент, 1-based індекси). */
export const HELD_KARP_CODE: readonly string[] = [
  "dp = {}                                    # (S, j) → (вартість, шлях)",
  "for j in cities_except_start:              # БАЗА: прямі ребра зі старту",
  "    dp[({start, j}, j)] = dist[start][j]",
  "for r in range(3, n + 1):                  # нарощуємо підмножини за розміром",
  "    for S in subsets(rest, size=r-1) | {start}:",
  "        for j in S - {start}:              # кожне кінцеве місто",
  "            dp[(S, j)] = min(",
  "                dp[(S - {j}, k)] + dist[k][j]    # готовий блок + ребро k→j",
  "                for k in S - {start, j})         # перебір передостанніх k",
  "tour = min(                                # ЗАМИКАННЯ: повертаємось у старт",
  "    dp[(all_cities, j)] + dist[j][start]",
  "    for j in cities_except_start)",
]

/** Один кандидат-передостаннє місто k усередині min() для комірки (S, j). */
export interface HkCandidate {
  /** Передостаннє місто (індекс). */
  readonly k: number
  /** Вартість готового блоку dp[(S\{j}, k)]. */
  readonly blockCost: number
  /** Шлях готового блоку (start … k). */
  readonly blockPath: readonly number[]
  /** Нове ребро k → j. */
  readonly edge: number
  /** Повна вартість кандидата = blockCost + edge. */
  readonly total: number
  /** Чи став цей кандидат новим найкращим на момент свого розгляду. */
  readonly improved: boolean
  /** Чи це переможець комірки (підставляється в dp). */
  readonly chosen: boolean
}

/** Готова комірка таблиці dp у порядку обчислення. */
export interface HkCell {
  /** Бітмаска підмножини S (включно зі стартом). */
  readonly subset: number
  /** Кінцеве місто j. */
  readonly end: number
  /** Розмір підмножини |S| (рівень: 2 — база, далі 3..n). */
  readonly level: number
  readonly cost: number
  /** Найкоротший шлях start … j. */
  readonly path: readonly number[]
  /** Обране передостаннє місто (для бази — старт). */
  readonly bestK: number
}

/** Підкрок кадру. Дискримінант — `kind`. */
export type HkSub =
  | { readonly kind: "init" }
  | { readonly kind: "base"; readonly end: number; readonly cost: number }
  | { readonly kind: "level-open"; readonly level: number; readonly cellCount: number }
  | { readonly kind: "cell-open"; readonly subset: number; readonly end: number }
  | {
      readonly kind: "candidate"
      readonly subset: number
      readonly end: number
      /** Індекс кандидата у `candidates` поточного кадру. */
      readonly index: number
      readonly improved: boolean
    }
  | {
      readonly kind: "cell-commit"
      readonly subset: number
      readonly end: number
      readonly cost: number
      readonly bestK: number
    }
  | { readonly kind: "closing-open" }
  | {
      readonly kind: "closing-candidate"
      readonly end: number
      readonly edge: number
      readonly total: number
      readonly improved: boolean
    }
  | { readonly kind: "done"; readonly cost: number }

export interface HkFrame {
  readonly i: number
  readonly sub: HkSub
  readonly phase: "base" | "build" | "closing" | "done"
  /** Активний розмір підмножини (рівень) або null. */
  readonly level: number | null
  /** Активна підмножина S (бітмаска) або null. */
  readonly subset: number | null
  /** Активне кінцеве місто j або null. */
  readonly end: number | null
  /**
   * Повний список кандидатів активної комірки (однаковий для всіх її кадрів —
   * cell-open/candidate/cell-commit), щоб «розклад кандидатів» не блимав під час
   * скрабінгу. Порожній на інших кадрах.
   */
  readonly candidates: readonly HkCandidate[]
  /** Індекс кандидата, активного САМЕ на цьому кадрі (для kind="candidate"), інакше null. */
  readonly activeCandidate: number | null
  /** Скільки комірок dp готово на цьому кадрі (UI: result.cells.slice(0, committedCount)). */
  readonly committedCount: number
  /** Найкращий тур, знайдений під час замикання (інакше null). */
  readonly bestTour: TspTour | null
  /** Підсвічені рядки коду — поточна дія (1-based у HELD_KARP_CODE). */
  readonly lines: readonly number[]
  /** Рядки-контекст (охопні цикли) — тьмяна підсвітка. */
  readonly contextLines: readonly number[]
  /** Нарація українською. */
  readonly caption: string
}

export interface HkResult {
  /** Мітки міст у порядку рядків/стовпців матриці. */
  readonly names: readonly string[]
  readonly start: number
  /** Мінімальна довжина оптимального туру. */
  readonly cost: number
  /** Оптимальний замкнений маршрут у індексах: [start, …, start]. */
  readonly path: readonly number[]
  /** Усі комірки dp у порядку обчислення (всього (n−1)·2ⁿ⁻¹ для n міст). */
  readonly cells: readonly HkCell[]
  /** Матриця відстаней (евклідова). */
  readonly dist: ReadonlyMatrix
  /** Орієнтовна кількість операцій n²·2ⁿ. */
  readonly operations: number
}

export interface HkTrace {
  readonly code: readonly string[]
  readonly names: readonly string[]
  readonly frames: readonly HkFrame[]
  readonly result: HkResult
}

export interface HkRun {
  readonly result: HkResult
  readonly trace: HkTrace
}

/** Усі m-елементні комбінації `arr` у лексикографічному порядку його елементів. */
function* combinations<T>(arr: readonly T[], m: number): Generator<T[]> {
  if (m < 0 || m > arr.length) return
  const idx = Array.from({ length: m }, (_, i) => i)
  for (;;) {
    yield idx.map((i) => arr[i])
    let i = m - 1
    while (i >= 0 && idx[i] === arr.length - m + i) i--
    if (i < 0) return
    idx[i]++
    for (let j = i + 1; j < m; j++) idx[j] = idx[j - 1] + 1
  }
}

/** Бітмаска з набору індексів. */
function maskOf(indices: readonly number[]): number {
  return indices.reduce((m, i) => m | (1 << i), 0)
}

/**
 * Проганяє Хелда–Карпа на інстансі задачі й збирає trace для плеєра. Результат
 * (cost/path) збігається з чистим `heldKarp` на тій самій матриці.
 */
export function buildHeldKarpTrace(
  instance: TspInstance,
  t: Translate = identityTranslate,
): HkRun {
  const names = instance.cities.map((c) => c.name)
  const start = instance.start
  const n = names.length
  const dist = distanceMatrix(instance.cities)
  const rest = [...Array(n).keys()].filter((c) => c !== start) // міста крім старту, за зростанням

  const label = (i: number): string => names[i] ?? String(i)
  const setLabel = (mask: number): string => {
    const items: string[] = []
    for (let i = 0; i < n; i++) if (mask & (1 << i)) items.push(label(i))
    return `{${items.sort().join(", ")}}`
  }
  const pathLabel = (path: readonly number[]): string => path.map(label).join(" → ")
  const num = (x: number): string => x.toFixed(2)

  // Таблиця підзадач: ключ `mask * n + end` → готова комірка.
  const dp = new Map<number, HkCell>()
  const key = (mask: number, end: number): number => mask * n + end

  const cells: HkCell[] = []
  const { frames, push: pushFrame } = createFrameList<HkFrame>()
  const push = (f: Omit<HkFrame, "i" | "committedCount">): void => {
    pushFrame({ committedCount: cells.length, ...f })
  }
  const EMPTY: readonly HkCandidate[] = []

  // --- ІНІЦІАЛІЗАЦІЯ ---------------------------------------------------------
  push({
    sub: { kind: "init" },
    phase: "base",
    level: null,
    subset: null,
    end: null,
    candidates: EMPTY,
    activeCandidate: null,
    bestTour: null,
    lines: [1],
    contextLines: [],
    caption: t("play.nHkInit", { start: label(start) }),
  })

  // --- БАЗА (рівень 2): прямі ребра start → j --------------------------------
  for (const j of rest) {
    const mask = (1 << start) | (1 << j)
    const cell: HkCell = {
      subset: mask,
      end: j,
      level: 2,
      cost: dist[start][j],
      path: [start, j],
      bestK: start,
    }
    dp.set(key(mask, j), cell)
    cells.push(cell)
    const cand: HkCandidate = {
      k: start,
      blockCost: 0,
      blockPath: [start],
      edge: dist[start][j],
      total: dist[start][j],
      improved: true,
      chosen: true,
    }
    push({
      sub: { kind: "base", end: j, cost: cell.cost },
      phase: "base",
      level: 2,
      subset: mask,
      end: j,
      candidates: [cand],
      activeCandidate: 0,
      bestTour: null,
      lines: [2, 3],
      contextLines: [],
      caption: t("play.nHkBase", {
        from: label(start),
        to: label(j),
        cost: num(cell.cost),
      }),
    })
  }

  // --- НАРОЩУВАННЯ (рівні 3..n) ----------------------------------------------
  for (let r = 3; r <= n; r++) {
    const combos = [...combinations(rest, r - 1)] // підмножини без старту; старт додаємо завжди
    const cellCount = combos.reduce((acc, c) => acc + c.length, 0)
    push({
      sub: { kind: "level-open", level: r, cellCount },
      phase: "build",
      level: r,
      subset: null,
      end: null,
      candidates: EMPTY,
      activeCandidate: null,
      bestTour: null,
      lines: [4, 5],
      contextLines: [],
      caption: t("play.nHkLevelOpen", { r, cells: cellCount, prev: r - 1 }),
    })

    for (const combo of combos) {
      const subset = maskOf(combo) | (1 << start)
      for (const end of [...combo].sort((a, b) => a - b)) {
        const prev = subset ^ (1 << end)
        const preds = combo.filter((k) => k !== end).sort((a, b) => a - b)

        // Готуємо всіх кандидатів наперед (із прапорцями improved/chosen),
        // далі лише розкриваємо їх кадрами по одному.
        let running: TspTour | null = null
        let bestK = preds[0]
        const raw = preds.map((k) => {
          const block = dp.get(key(prev, k))
          if (!block) throw new Error(`heldKarpTrace: блок (${setLabel(prev)}, ${label(k)}) не пораховано`)
          const total = block.cost + dist[k][end]
          const tour: TspTour = { cost: total, path: [...block.path, end] }
          const improved = running === null || tourLess(tour, running)
          if (improved) {
            running = tour
            bestK = k
          }
          return { k, block, edge: dist[k][end], total, tour, improved }
        })
        const candidates: HkCandidate[] = raw.map((c) => ({
          k: c.k,
          blockCost: c.block.cost,
          blockPath: c.block.path,
          edge: c.edge,
          total: c.total,
          improved: c.improved,
          chosen: c.k === bestK,
        }))
        const winner = running as TspTour | null
        if (winner === null) continue

        push({
          sub: { kind: "cell-open", subset, end },
          phase: "build",
          level: r,
          subset,
          end,
          candidates,
          activeCandidate: null,
          bestTour: null,
          lines: [6],
          contextLines: [4, 5],
          caption: t("play.nHkCellOpen", {
            subset: setLabel(subset),
            end: label(end),
          }),
        })

        candidates.forEach((c, index) => {
          push({
            sub: { kind: "candidate", subset, end, index, improved: c.improved },
            phase: "build",
            level: r,
            subset,
            end,
            candidates,
            activeCandidate: index,
            bestTour: null,
            lines: [8, 9],
            contextLines: [7],
            caption: t("play.nHkCand", {
              k: label(c.k),
              path: pathLabel(c.blockPath),
              blockCost: num(c.blockCost),
              end: label(end),
              edge: num(c.edge),
              total: num(c.total),
              verdict: c.improved
                ? t("play.nHkCandBetter")
                : t("play.nHkCandWorse"),
            }),
          })
        })

        const cell: HkCell = {
          subset,
          end,
          level: r,
          cost: winner.cost,
          path: winner.path,
          bestK,
        }
        dp.set(key(subset, end), cell)
        cells.push(cell)
        push({
          sub: { kind: "cell-commit", subset, end, cost: cell.cost, bestK },
          phase: "build",
          level: r,
          subset,
          end,
          candidates,
          activeCandidate: null,
          bestTour: null,
          lines: [7],
          contextLines: [5, 6],
          caption: t("play.nHkCommit", {
            path: pathLabel(cell.path),
            cost: num(cell.cost),
            bestK: label(bestK),
          }),
        })
      }
    }
  }

  // --- ЗАМИКАННЯ -------------------------------------------------------------
  const full = (1 << n) - 1
  push({
    sub: { kind: "closing-open" },
    phase: "closing",
    level: null,
    subset: full,
    end: null,
    candidates: EMPTY,
    activeCandidate: null,
    bestTour: null,
    lines: [10],
    contextLines: [],
    caption: t("play.nHkClosingOpen"),
  })

  let bestTour: TspTour | null = null
  for (const j of rest) {
    const block = dp.get(key(full, j))
    if (!block) continue
    const edge = dist[j][start]
    const total = block.cost + edge
    const tour: TspTour = { cost: total, path: [...block.path, start] }
    const improved = bestTour === null || tourLess(tour, bestTour)
    if (improved) bestTour = tour
    push({
      sub: { kind: "closing-candidate", end: j, edge, total, improved },
      phase: "closing",
      level: null,
      subset: full,
      end: j,
      candidates: EMPTY,
      activeCandidate: null,
      bestTour,
      lines: [11, 12],
      contextLines: [10],
      caption: t("play.nHkClosingCand", {
        j: label(j),
        blockCost: num(block.cost),
        start: label(start),
        edge: num(edge),
        total: num(total),
        verdict: improved
          ? t("play.nHkTourBetter")
          : t("play.nHkTourWorse"),
      }),
    })
  }

  const answer: TspTour = bestTour ?? { cost: 0, path: [start] }
  push({
    sub: { kind: "done", cost: answer.cost },
    phase: "done",
    level: null,
    subset: full,
    end: null,
    candidates: EMPTY,
    activeCandidate: null,
    bestTour: answer,
    lines: [],
    contextLines: [],
    caption: t("play.nHkDone", {
      path: pathLabel(answer.path),
      cost: num(answer.cost),
    }),
  })

  const result: HkResult = {
    names,
    start,
    cost: answer.cost,
    path: answer.path,
    cells,
    dist,
    operations: n * n * 2 ** n,
  }
  return { result, trace: { code: HELD_KARP_CODE, names, frames, result } }
}
