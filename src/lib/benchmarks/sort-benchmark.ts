// Дескриптор бенчмарку сортувань для узагальненого kit. Демонструє узагальнення:
// вхід — масив чисел, серії — наївна vs оптимізована бульбашка; ops-метрика —
// кількість порівнянь (детермінована); теоретичний орієнтир — квадратична крива.
// `defineBenchmark` реєструє PURE-ядро (worker) і повертає UI-проєкцію.

import {
  bubbleSort,
  bubbleSortOptimized,
  countOperations,
} from "@/lib/bubbleSort"
import { randomArray } from "@/lib/randomArray"
import {
  defineBenchmark,
  type Benchmarkable,
} from "@/lib/benchmark-descriptor"

const SORT_SIZES = [100, 200, 400, 600, 800, 1000, 1400, 1800]

/** Детермінований масив розміру n за seed (значення 1..n·2 для розкиду). */
function makeSortInput(size: number, seed: number): number[] {
  return randomArray({ count: size, min: 1, max: size * 2, seed })
}

export const sortBenchmark: Benchmarkable = defineBenchmark<number[]>(
  {
    id: "bubble-sort",
    sizes: SORT_SIZES,
    makeInput: makeSortInput,
    series: [
      {
        id: "naive",
        name: { ua: "наївна", en: "naive" },
        color: "#dc2626",
        runMs: (input) => {
          bubbleSort(input)
        },
        countOps: (input) => countOperations(input, false).comparisons,
        theoretical: "quadratic",
      },
      {
        id: "optimized",
        name: { ua: "оптимізована (swapped)", en: "optimized (swapped)" },
        color: "#16a34a",
        runMs: (input) => {
          bubbleSortOptimized(input)
        },
        countOps: (input) => countOperations(input, true).comparisons,
        theoretical: "quadratic",
      },
    ],
  },
  {
    title: { ua: "Бенчмарк: наївна проти оптимізованої", en: "Benchmark: naive vs optimized" },
    intro: {
      ua: "Обидві версії дають той самий відсортований масив, але оптимізована з прапорцем swapped рано зупиняється на майже впорядкованих даних. Метрика «операції» рахує порівняння — детерміновано, без шуму планувальника. Обчислення в ",
      en: "Both versions yield the same sorted array, but the optimized one with a swapped flag exits early on nearly ordered data. The “operations” metric counts comparisons — deterministic, free of scheduler noise. Computations run in a ",
    },
    xLabel: { ua: "елементи", en: "elements" },
  },
)
