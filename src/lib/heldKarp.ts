// Алгоритм Хелда–Карпа (динамічне програмування) для задачі комівояжера.
// Замість перебору n! маршрутів розбиває задачу на підзадачі «найкоротший шлях
// зі старту через підмножину міст S із кінцем у місті j», запам'ятовує їх
// (мемоізація) і складає більші. Час O(n²·2ⁿ), пам'ять O(n·2ⁿ): експоненційно,
// але набагато краще за факторіальний перебір.
//
// Підмножини кодуються БІТМАСКАМИ (i-й біт = місто i присутнє) — швидко й зручно
// для індексації, на відміну від frozenset у Python-оригіналі. Вхід — матриця
// відстаней; місто `start` (за замовчуванням 0) вважається стартом. Функція
// чиста: повертає вартість і замкнений маршрут, вхід не мутує.

import { tourLess, type ReadonlyMatrix, type TspTour } from "@/lib/tsp"

/** Значення комірки таблиці dp: найкоротший шлях через підмножину з кінцем у j. */
interface Cell {
  readonly cost: number
  readonly path: number[]
}

/** Ключ комірки dp у пласкій Map: (бітмаска підмножини, кінцеве місто). */
function cellKey(mask: number, end: number, n: number): number {
  return mask * n + end
}

/**
 * Точний найкоротший замкнений маршрут методом динамічного програмування.
 * Повертає `{ cost, path }`, де `path` — список індексів міст, що починається і
 * закінчується стартом (напр. `[0, 2, 1, 3, 4, 0]`).
 *
 * Таблиця `dp[(S, j)]` будується «знизу вгору» за розміром підмножини S:
 *   • БАЗА (|S| = 2): пряме ребро start → j;
 *   • НАРОЩУВАННЯ: dp[(S, j)] = min по передостанньому k з dp[(S\{j}, k)] + dist(k, j);
 *   • ЗАМИКАННЯ: до кожного шляху через усі міста додаємо ребро j → start, беремо мінімум.
 */
export function heldKarp(dist: ReadonlyMatrix, start = 0): TspTour {
  const n = dist.length
  if (n <= 1) return { cost: 0, path: [start] }

  const dp = new Map<number, Cell>()
  const full = (1 << n) - 1

  // Перебираємо маски за зростанням: підмаска prev = mask без біта j завжди
  // менша за mask, тож на момент обробки mask усі менші блоки вже пораховані.
  for (let mask = 0; mask <= full; mask++) {
    if ((mask & (1 << start)) === 0) continue // підмножина має містити старт
    for (let j = 0; j < n; j++) {
      if (j === start || (mask & (1 << j)) === 0) continue

      const prev = mask ^ (1 << j)
      if (prev === 1 << start) {
        // БАЗА: підмножина {start, j} — найкоротший шлях це пряме ребро.
        dp.set(cellKey(mask, j, n), { cost: dist[start][j], path: [start, j] })
        continue
      }

      // НАРОЩУВАННЯ: перебираємо передостаннє місто k у prev (крім старту).
      let best: Cell | null = null
      for (let k = 0; k < n; k++) {
        if (k === start || (prev & (1 << k)) === 0) continue
        const block = dp.get(cellKey(prev, k, n))
        if (!block) continue
        const cand: Cell = { cost: block.cost + dist[k][j], path: [...block.path, j] }
        if (best === null || tourLess(cand, best)) best = cand
      }
      if (best !== null) dp.set(cellKey(mask, j, n), best)
    }
  }

  // ЗАМИКАННЯ: до кожного повного шляху додаємо повернення в старт.
  let answer: Cell | null = null
  for (let j = 0; j < n; j++) {
    if (j === start) continue
    const block = dp.get(cellKey(full, j, n))
    if (!block) continue
    const cand: Cell = { cost: block.cost + dist[j][start], path: [...block.path, start] }
    if (answer === null || tourLess(cand, answer)) answer = cand
  }
  // answer не може бути null для n ≥ 2 (повний граф відстаней завжди зв'язний).
  return answer ?? { cost: 0, path: [start] }
}
