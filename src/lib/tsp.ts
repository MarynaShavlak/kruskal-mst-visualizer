// Геометрія задачі комівояжера: евклідові відстані, матриця відстаней і довжина
// замкненого маршруту. Фреймворк-незалежне ядро (порт із Python-репозиторію
// tsp_held_karp/distance.py + cities.py). КООРДИНАТИ МІСТ — джерело правди:
// матриця відстаней ПОХІДНА від них (евклід за теоремою Піфагора), тож і
// симетрична, і з нулями на діагоналі. Усі функції чисті — вхід не мутують.

/** Місто: мітка + координати на площині. Порядок міст задає індекси. */
export interface TspCity {
  readonly name: string
  readonly x: number
  readonly y: number
}

/**
 * Інстанс задачі: міста + індекс стартового міста (звідки виходить і куди
 * повертається маршрут). Старт має значення для Хелда–Карпа (підзадачі ростуть
 * саме від нього), хоча на довжину оптимального ЦИКЛУ він не впливає.
 */
export interface TspInstance {
  readonly cities: readonly TspCity[]
  readonly start: number
}

/** Квадратна матриця відстаней (мутабельна — робоча). */
export type Matrix = number[][]
/** Незмінна матриця (для входів і знімків). */
export type ReadonlyMatrix = ReadonlyArray<ReadonlyArray<number>>

/** Замкнений маршрут: вартість + шлях у індексах міст. */
export interface TspTour {
  readonly cost: number
  readonly path: readonly number[]
}

/**
 * Пряма (евклідова) відстань між двома точками за теоремою Піфагора.
 * Свідомо `sqrt(dx² + dy²)` (а не `Math.hypot`): для цілих координат це
 * коректно округлене значення, БІТ-у-БІТ однакове з Python-оригіналом, тож
 * детерміновані tie-break-и дають той самий тур, що й еталон.
 */
export function euclidean(a: TspCity, b: TspCity): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Квадратна матриця n×n: `matrix[i][j]` — відстань від міста i до міста j.
 * Симетрична, 0 на діагоналі. Сенс — порахувати всі відстані ОДИН раз наперед,
 * щоб алгоритм брав готові значення за індексами, а не рахував корінь щоразу.
 */
export function distanceMatrix(cities: readonly TspCity[]): Matrix {
  return cities.map((from) => cities.map((to) => euclidean(from, to)))
}

/**
 * Довжина ЗАМКНЕНОГО маршруту, заданого порядком індексів `order` БЕЗ повторення
 * старту в кінці (напр. `[0, 2, 1, 3, 4]`): сума переїздів між сусідами плюс
 * повернення з останнього міста в перше.
 */
export function tourLength(order: readonly number[], dist: ReadonlyMatrix): number {
  if (order.length < 2) return 0
  let total = 0
  for (let i = 0; i < order.length - 1; i++) total += dist[order[i]][order[i + 1]]
  return total + dist[order[order.length - 1]][order[0]]
}

/**
 * Чи тур `a` строго кращий за `b`: насамперед за вартістю (точне порівняння), а
 * на рівних — лексикографічно за шляхом. Точно відтворює кортежне порівняння
 * `min((cost, path))` Python-оригіналу: цей інстанс має КІЛЬКА оптимальних турів
 * однакової довжини, і саме tie-break фіксує канонічний (детермінований і
 * напрямок циклу, і проміжні шляхи комірок dp).
 */
export function tourLess(a: TspTour, b: TspTour): boolean {
  if (a.cost < b.cost) return true
  if (a.cost > b.cost) return false
  const la = a.path
  const lb = b.path
  const len = Math.min(la.length, lb.length)
  for (let i = 0; i < len; i++) {
    if (la[i] !== lb[i]) return la[i] < lb[i]
  }
  return la.length < lb.length
}

/** Орієнтовна кількість операцій Хелда–Карпа для n міст: n² · 2ⁿ. */
export function countOperations(n: number): number {
  return n * n * 2 ** n
}
