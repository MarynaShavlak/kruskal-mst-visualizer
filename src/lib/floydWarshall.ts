// Алгоритм Флойда–Воршала: найкоротші шляхи між усіма парами вершин.
// Фреймворк-незалежний, на чистих матрицях чисел. Порт із Python-репозиторію
// (floyd_warshall/core.py). Дві угоди про «немає ребра»:
//   • floydWarshallSteps приймає матрицю суміжності, де 0 == немає ребра;
//   • floydWarshall / stepsFromDist працюють в угоді INF == немає ребра
//     (надійніша: коректно підтримує ребра нульової ваги).
// Усі функції чисті — повертають нові матриці, вхід не мутують.

/** «Нескінченність» — позначає відсутність шляху між парою вершин. */
export const INF = Infinity

/** Квадратна матриця чисел (відстані або ваги ребер). Мутабельна — робоча. */
export type Matrix = number[][]
/** Незмінна матриця (для входів і знімків). */
export type ReadonlyMatrix = ReadonlyArray<ReadonlyArray<number>>
/** Матриця наступних вершин: nxt[i][j] — індекс першого кроку на шляху i→j. */
export type NextMatrix = ReadonlyArray<ReadonlyArray<number | null>>

/** Знімок матриці після відкриття чергової проміжної вершини `k`. */
export interface FwSnapshot {
  /** Індекс проміжної вершини або null для початкового стану. */
  readonly k: number | null
  readonly matrix: ReadonlyMatrix
  /** Матриця до цього кроку (для підсвічування змін); null на початку. */
  readonly prev: ReadonlyMatrix | null
  /** Клітинки (i, j), що покращилися на цьому кроці. */
  readonly changed: ReadonlyArray<readonly [number, number]>
}

export interface FwSteps {
  readonly dist: ReadonlyMatrix
  readonly nxt: NextMatrix
  /** n+1 знімків: початковий (k=null) і по одному після кожної вершини. */
  readonly snapshots: readonly FwSnapshot[]
}

/**
 * Переводить матрицю суміжності з угоди «0 == немає ребра» в угоду з INF:
 * нулі на діагоналі, ваги наявних ребер, відсутні ребра — INF.
 */
export function adjacencyToInf(adj: ReadonlyMatrix): Matrix {
  const n = adj.length
  const dist: Matrix = Array.from({ length: n }, () => new Array<number>(n).fill(INF))
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) dist[i][j] = 0
      else if (adj[i][j] !== 0) dist[i][j] = adj[i][j]
    }
  }
  return dist
}

/**
 * Інструментована версія в угоді «0 == немає ребра» (порт floyd_warshall_steps).
 * Конвертує вхід у INF-угоду й проганяє двигун зі знімками.
 */
export function floydWarshallSteps(adj0: ReadonlyMatrix): FwSteps {
  return stepsFromDist(adjacencyToInf(adj0))
}

/**
 * Інструментований двигун на INF-матриці: повертає підсумкову матрицю
 * відстаней `dist`, матрицю наступних вершин `nxt` (для відновлення шляхів)
 * та n+1 знімків (стан після відкриття кожної проміжної вершини).
 * Складність: O(n³) часу, O(n²) пам'яті (плюс ще O(n²) на nxt і кожен знімок).
 */
export function stepsFromDist(initial: ReadonlyMatrix): FwSteps {
  const n = initial.length
  const dist: Matrix = initial.map((row) => [...row])
  // nxt[i][j] = j для кожної відомої (скінченної) відстані, інакше null.
  const nxt: (number | null)[][] = dist.map((row, i) =>
    row.map((_, j) => (dist[i][j] !== INF ? j : null)),
  )

  const snapshots: FwSnapshot[] = [
    { k: null, matrix: clone(dist), prev: null, changed: [] },
  ]

  // «Відкриваємо» вершини 0, 1, 2, … по черзі як дозволені проміжні.
  for (let k = 0; k < n; k++) {
    const prev = clone(dist)
    const changed: [number, number][] = []
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const viaK = dist[i][k] + dist[k][j]
        if (viaK < dist[i][j]) {
          dist[i][j] = viaK
          nxt[i][j] = nxt[i][k] // шлях i→j тепер починається як i→k
          changed.push([i, j]) // релаксація лише зменшує ⇒ зміна = покращення
        }
      }
    }
    snapshots.push({ k, matrix: clone(dist), prev, changed })
  }

  return { dist, nxt, snapshots }
}

/**
 * Компактна реалізація (угода INF): adj[i][j] — вага ребра або INF, 0 на
 * діагоналі. Без службових структур. Повертає нову матрицю найкоротших
 * відстаней між усіма парами.
 */
export function floydWarshall(adjInf: ReadonlyMatrix): Matrix {
  const n = adjInf.length
  const dist: Matrix = adjInf.map((row) => [...row])
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j]
        }
      }
    }
  }
  return dist
}

/**
 * Відновлює список вершин найкоротшого шляху u→v за матрицею `nxt`.
 * Повертає масив індексів від u до v включно або null, якщо шляху немає.
 * Кидає помилку, якщо маршрут не завершується за n кроків — ознака
 * від'ємного циклу на шляху (інакше прохід зациклився б нескінченно).
 */
export function reconstructPath(
  nxt: NextMatrix,
  u: number,
  v: number,
): number[] | null {
  if (nxt[u][v] === null) return null
  const path = [u]
  let cur = u
  while (cur !== v) {
    const step = nxt[cur][v]
    if (step === null) return null
    cur = step
    path.push(cur)
    if (path.length > nxt.length) {
      throw new Error(
        "reconstructPath: маршрут не завершується — граф містить " +
          "від'ємний цикл, тож найкоротшого шляху не існує.",
      )
    }
  }
  return path
}

/**
 * Чи є у графі досяжний цикл від'ємної ваги. Критерій: після Флойда–Воршала
 * від'ємний цикл існує тоді й лише тоді, коли на діагоналі є від'ємне
 * значення (dist[i][i] < 0): вершина «повертається в себе» з від'ємною вагою.
 */
export function hasNegativeCycle(dist: ReadonlyMatrix): boolean {
  for (let i = 0; i < dist.length; i++) {
    if (dist[i][i] < 0) return true
  }
  return false
}

function clone(m: ReadonlyMatrix): number[][] {
  return m.map((row) => [...row])
}
