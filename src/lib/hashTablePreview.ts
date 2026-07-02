// Чистий аналіз розкладки хеш-таблиці для ПРЕВ'Ю в редакторі (без React): за
// скриптом операцій рахує фінальний стан комірок, навантаження α, довжини ланцюгів
// і прапорці-попередження (перевантаження й «гаряча точка» — довгий ланцюг, ознака
// поганої/нерівномірної хеш-функції). Плеєр цим не користується — лише редактор,
// щоб показати наслідок ДО програвання.

import { runHashTable, type HtBuckets, type HtOp, type HtOptions } from "@/lib/hashTable"

/** Поріг навантаження, за яким варто збільшувати таблицю (класичні 0.75). */
export const HT_LOAD_THRESHOLD = 0.75

/** «Гаряча точка»: ланцюг такої довжини псує перевагу O(1) → попереджаємо. */
export const HT_HOT_CHAIN = 3

export interface HtPreview {
  readonly buckets: HtBuckets
  readonly capacity: number
  /** Кількість збережених пар (n). */
  readonly size: number
  /** Навантаження α = size / capacity. */
  readonly loadFactor: number
  /** Скільки вставок влучили в непорожню комірку. */
  readonly collisions: number
  /** Довжина ланцюга кожної комірки. */
  readonly chainLengths: readonly number[]
  /** Найдовший ланцюг (глибина найгіршого пошуку). */
  readonly maxChain: number
  /** Скільки комірок порожні. */
  readonly emptyBuckets: number
  /** α перевищує поріг → таблиця «тісна». */
  readonly overloaded: boolean
  /** Є ланцюг ≥ HT_HOT_CHAIN → «гаряча точка» (нерівномірний розподіл). */
  readonly clustered: boolean
}

/**
 * Проганяє скрипт операцій і повертає зведення розкладки для прев'ю редактора.
 * Пусту таблицю (capacity ≤ 0) трактуємо як α = 0 без попереджень.
 */
export function hashTablePreview(
  ops: readonly HtOp[],
  capacity: number,
  opts: HtOptions = {},
): HtPreview {
  const run = runHashTable(ops, capacity, opts)
  const chainLengths = run.buckets.map((chain) => chain.length)
  const maxChain = chainLengths.reduce((m, l) => Math.max(m, l), 0)
  const emptyBuckets = chainLengths.filter((l) => l === 0).length
  const loadFactor = capacity > 0 ? run.size / capacity : 0

  return {
    buckets: run.buckets,
    capacity,
    size: run.size,
    loadFactor,
    collisions: run.collisions,
    chainLengths,
    maxChain,
    emptyBuckets,
    overloaded: loadFactor > HT_LOAD_THRESHOLD,
    clustered: maxChain >= HT_HOT_CHAIN,
  }
}
