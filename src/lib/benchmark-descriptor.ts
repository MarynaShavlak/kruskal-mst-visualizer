// Узагальнений каркас бенчмарку (`Benchmarkable`): один дескриптор описує, ЯК для
// заданого розміру побудувати вхід, ЯК поміряти час кожної реалізації-серії і
// (опційно) ЯК порахувати детерміновану операцію-метрику + теоретичний орієнтир.
//
// Дворівнева конструкція (план §9): дескриптор поділений на
//   • worker-importable PURE-частину (input/runMs/countOps) — реєструється в
//     BENCHMARK_REGISTRY за рядковим id; замикання НЕ серіалізуються postMessage,
//     тож по дроту йде лише `descriptorId`, а воркер резолвить closures локально;
//   • UI-частину (Localized-підписи серій, кольори, мітки осей) — живе на
//     `Benchmarkable` й читається у View.
// Обидві сторони ІМПОРТУЮТЬ один і той самий модуль-дескриптор, тож closures й
// підписи не дрейфують. Фреймворк-незалежне, без React.

import type { Localized } from "@/algorithms/types"
import type { ComplexityCurveKind } from "@/lib/complexityBounds"

/**
 * UI-метадані серії (реалізації) — те, що рендерить View: ключ, підпис, колір,
 * рід теоретичної кривої. БЕЗ closures, тож тип неінваріантний за `I` → projection
 * `Benchmarkable` (UI/config) лишається без type-параметра й присвоюється вільно.
 */
export interface SeriesMeta {
  /** Стабільний ключ серії (dataKey у Recharts і ключ у точці: `<id>Ms`/`<id>Ops`). */
  readonly id: string
  /** Підпис серії в легенді (двомовний). */
  readonly name: Localized
  /** Колір лінії (hex). */
  readonly color: string
  /** Чи серія постачає детерміновану ops-метрику (вмикає режим «операції»). */
  readonly hasOps?: boolean
  /** Рід теоретичної кривої-орієнтиру (anchor-scaled). Опційно. */
  readonly theoretical?: ComplexityCurveKind
}

/**
 * PURE-серія для воркера: UI-метадані + closures прогону/підрахунку. `runMs`
 * отримує СВІЖИЙ клон входу на кожен виклик (uniform clone → справедливий тайм).
 * `countOps` — детермінована операція-метрика (порівняння/кроки/…), рахується на
 * main-thread (snapshot-testable).
 */
export interface BenchmarkSeries<I> extends SeriesMeta {
  /** Прогнати реалізацію над клоном входу (для ms-тайму). */
  readonly runMs: (input: I) => void
  /** Детермінована операція-метрика (для ops-режиму). Опційно. */
  readonly countOps?: (input: I) => number
}

/** Worker-importable ядро дескриптора: усе, що потрібно для обчислення точок. */
export interface BenchmarkCore<I> {
  /** Рядковий id (= ключ у BENCHMARK_REGISTRY і поле на `Benchmarkable`). */
  readonly id: string
  /** Розміри n, за якими будуються точки графіка. */
  readonly sizes: readonly number[]
  /** Детерміновано побудувати вхід розміру n (seed-based). */
  readonly makeInput: (size: number, seed: number) => I
  /** Серії-реалізації (з closures). */
  readonly series: readonly BenchmarkSeries<I>[]
}

/**
 * UI-проєкція дескриптора (БЕЗ closures за `I`) — кладеться на
 * `AlgorithmConfig.benchmark` і передається в `GenericBenchmarkView`. Воркер
 * резолвить closures окремо за `id` із BENCHMARK_REGISTRY, тож View їх не бачить
 * → тип лишається без type-параметра й присвоюється з будь-якого `BenchmarkCore<I>`.
 */
export interface Benchmarkable {
  /** Рядковий id — ключ у BENCHMARK_REGISTRY (воркер резолвить closures за ним). */
  readonly id: string
  /** UI-метадані серій (порядок = порядок ліній). */
  readonly series: readonly SeriesMeta[]
  /** Підпис осі X (що варіюється — вершини/елементи/…). */
  readonly xLabel: Localized
  /** Заголовок картки бенчмарку. */
  readonly title: Localized
  /** Короткий вступний абзац (до згадки про Web Worker). */
  readonly intro: Localized
}

/** UI-метадані всього дескриптора (osі+підписи) — UI-частина при `defineBenchmark`. */
export interface BenchmarkMeta {
  readonly xLabel: Localized
  readonly title: Localized
  readonly intro: Localized
}

/**
 * Зібрати дескриптор: зареєструвати PURE-ядро (closures) у BENCHMARK_REGISTRY і
 * повернути UI-проєкцію `Benchmarkable` (для config/View). Один об'єкт-джерело —
 * closures й підписи не дрейфують.
 */
export function defineBenchmark<I>(
  core: BenchmarkCore<I>,
  meta: BenchmarkMeta,
): Benchmarkable {
  registerBenchmark(core)
  return {
    id: core.id,
    series: core.series.map((s) => ({
      id: s.id,
      name: s.name,
      color: s.color,
      hasOps: Boolean(s.countOps),
      ...(s.theoretical ? { theoretical: s.theoretical } : {}),
    })),
    ...meta,
  }
}

/**
 * Реєстр PURE-ядер за id. Воркер імпортує цей модуль (а він — усі дескриптори
 * через `@/lib/benchmarks`), тож за `descriptorId` дістає closures локально.
 * Заповнюється `registerBenchmark` під час імпорту конкретних дескрипторів.
 */
const BENCHMARK_REGISTRY = new Map<string, BenchmarkCore<unknown>>()

/** Зареєструвати ядро дескриптора (ідемпотентно — повторна реєстрація перезаписує). */
export function registerBenchmark<I>(core: BenchmarkCore<I>): void {
  BENCHMARK_REGISTRY.set(core.id, core as BenchmarkCore<unknown>)
}

/** Дістати зареєстроване ядро за id (воркер-сторона). */
export function getBenchmarkCore(id: string): BenchmarkCore<unknown> | undefined {
  return BENCHMARK_REGISTRY.get(id)
}

/** Одна точка графіка: розмір n + час кожної серії (мс) + операції (опц.). */
export interface SeriesPoint {
  readonly size: number
  /** `<seriesId>Ms` → час, `<seriesId>Ops` → операції. */
  readonly [key: string]: number
}

// Прогрів + ітерування, доки набереться вимірний час. Кожна ітерація отримує
// свіжий клон входу (через factory), щоб in-place робота над попередньою
// ітерацією не спотворювала наступну.
function timeIt(makeFresh: () => unknown, run: (input: unknown) => void, minTotalMs = 8): number {
  run(makeFresh()) // прогрів
  const t0 = performance.now()
  let iters = 0
  let elapsed: number
  do {
    run(makeFresh())
    iters++
    elapsed = performance.now() - t0
  } while (elapsed < minTotalMs && iters < 1_000_000)
  return elapsed / iters
}

// Глибокий клон входу для справедливого тайму: масиви клонуються поелементно,
// решта (об'єкти-графи тощо) лишається без змін (вони не мутуються — публічні
// sort-експорти й kruskalCompute клонують внутрішньо). Масив — найчастіший вхід.
function cloneInput<I>(input: I): I {
  return (Array.isArray(input) ? ([...input] as unknown as I) : input)
}

/**
 * Одна заміряна точка дескриптора: будує вхід розміру `size`, міряє кожну серію
 * (з uniform-клоном) і додає ops-метрику серій, що її надають. Детермінованість
 * ops гарантує snapshot-тести; ms лишається недетермінованим (тест — finiteness).
 */
export function runBenchmarkPoint<I>(
  core: BenchmarkCore<I>,
  size: number,
  seed: number,
): SeriesPoint {
  const input = core.makeInput(size, seed)
  const point: Record<string, number> = { size }
  for (const s of core.series) {
    point[`${s.id}Ms`] = timeIt(
      () => cloneInput(input),
      (fresh) => s.runMs(fresh as I),
    )
    if (s.countOps) point[`${s.id}Ops`] = s.countOps(input)
  }
  return point as SeriesPoint
}

/**
 * Лише операції-метрика для точки (без тайму) — детерміновано, придатне до
 * snapshot-тестів і обчислення на main-thread без worker round-trip.
 */
export function countBenchmarkOps<I>(
  core: BenchmarkCore<I>,
  size: number,
  seed: number,
): SeriesPoint {
  const input = core.makeInput(size, seed)
  const point: Record<string, number> = { size }
  for (const s of core.series) {
    if (s.countOps) point[`${s.id}Ops`] = s.countOps(input)
  }
  return point as SeriesPoint
}
