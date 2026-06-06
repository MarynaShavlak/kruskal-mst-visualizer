// Ядро бенчмарку: для кожного розміру графа міряє час обох реалізацій Краскала.
// Викликається у Web Worker (фреймворк-незалежне, без UI).

import {
  kruskalDsuCompute,
  kruskalHasPathCompute,
} from "@/lib/kruskalCompute"
import { randomGraph } from "@/lib/randomGraph"

export interface BenchPoint {
  readonly size: number
  readonly edges: number
  readonly dsuMs: number
  readonly hasPathMs: number
}

export const DEFAULT_SIZES = [25, 50, 75, 100, 150, 200, 275, 350]

// Запускає fn у циклі, доки не набереться вимірний час, і повертає час на
// одну ітерацію (мс). Так навіть субмілісекундні запуски вимірюються стабільно.
function timeIt(fn: () => void, minTotalMs = 8): number {
  fn() // прогрів
  const t0 = performance.now()
  let iters = 0
  let elapsed = 0
  do {
    fn()
    iters++
    elapsed = performance.now() - t0
  } while (elapsed < minTotalMs && iters < 1_000_000)
  return elapsed / iters
}

/** Один заміряний розмір: будує граф і міряє обидві реалізації. */
export function benchmarkPoint(size: number, seed = 1): BenchPoint {
  const graph = randomGraph({
    vertexCount: size,
    seed,
    extraEdgeProb: 0.18,
    maxWeight: 1000,
    connected: true,
  })
  return {
    size,
    edges: graph.edges.length,
    dsuMs: timeIt(() => kruskalDsuCompute(graph)),
    hasPathMs: timeIt(() => kruskalHasPathCompute(graph)),
  }
}
