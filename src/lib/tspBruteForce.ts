// Повний перебір для задачі комівояжера — еталон для звірки Хелда–Карпа.
// Фіксуємо старт і перебираємо всі перестановки решти міст, тобто (n−1)!
// замкнених маршрутів, і беремо найкоротший. Метод ГАРАНТОВАНО точний, але має
// факторіальну складність O(n!) — придатний лише для дуже малих n. Той самий
// tie-break (tourLess), що й у Хелда–Карпа, тож обидва дають ІДЕНТИЧНИЙ тур.

import { tourLength, tourLess, type ReadonlyMatrix, type TspTour } from "@/lib/tsp"

/**
 * Найкоротший замкнений маршрут повним перебором. Повертає `{ cost, path }`, де
 * `path` замкнений: `[start, …, start]`.
 */
export function bruteForceTsp(dist: ReadonlyMatrix, start = 0): TspTour {
  const n = dist.length
  if (n <= 1) return { cost: 0, path: [start] }

  const rest = [...Array(n).keys()].filter((c) => c !== start)
  const used = new Array<boolean>(rest.length).fill(false)
  const current: number[] = []
  let best: TspTour | null = null

  const recurse = (): void => {
    if (current.length === rest.length) {
      const order = [start, ...current]
      const tour: TspTour = { cost: tourLength(order, dist), path: [...order, start] }
      if (best === null || tourLess(tour, best)) best = tour
      return
    }
    for (let i = 0; i < rest.length; i++) {
      if (used[i]) continue
      used[i] = true
      current.push(rest[i])
      recurse()
      current.pop()
      used[i] = false
    }
  }
  recurse()

  return best ?? { cost: 0, path: [start] }
}

/** Кількість замкнених маршрутів, які перебирає метод (зафіксувавши старт): (n−1)!. */
export function countRoutes(n: number): number {
  let result = 1
  for (let i = 2; i <= n - 1; i++) result *= i
  return result
}
