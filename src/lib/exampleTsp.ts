// Канонічний приклад задачі комівояжера (еталон коректності з README та
// Python-репозиторію tsp_held_karp). П'ять міст A–E на площині; старт — A (0).
// Той самий набір перевіряють і повний перебір, і Хелда–Карпа, тож їхні
// результати звіряються напряму. Використовується пресетом редактора й тестами.

import { distanceMatrix, type Matrix, type TspCity, type TspInstance } from "@/lib/tsp"

/** Координати п'яти міст демо. Порядок задає індекси: A=0, B=1, C=2, D=3, E=4. */
export const TSP_DEMO_CITIES: readonly TspCity[] = [
  { name: "A", x: 0, y: 0 },
  { name: "B", x: 1, y: 5 },
  { name: "C", x: 2, y: 2 },
  { name: "D", x: 3, y: 3 },
  { name: "E", x: 5, y: 1 },
]

/** Інстанс демо: міста A–E, старт A (0). */
export function tspDemoInstance(): TspInstance {
  return { cities: TSP_DEMO_CITIES, start: 0 }
}

/** Матриця відстаней демо (евклідова, симетрична, нулі на діагоналі). */
export function tspDemoMatrix(): Matrix {
  return distanceMatrix(TSP_DEMO_CITIES)
}

/** Відома мінімальна довжина оптимального туру (повний перебір == Хелда–Карпа). */
export const TSP_DEMO_OPTIMAL_LENGTH = 16.746578547999732

/** Оптимальний замкнений тур у індексах: A → C → B → D → E → A. */
export const TSP_DEMO_OPTIMAL_TOUR: readonly number[] = [0, 2, 1, 3, 4, 0]
