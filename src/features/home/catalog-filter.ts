import type { AlgorithmGroup } from "@/algorithms/registry"
import type {
  Algorithm,
  AlgorithmFamily,
  ComplexityClass,
} from "@/algorithms/types"
import type { Lang } from "@/store/lang-store"

/** Активні фасети каталогу: родина та клас складності (або «всі»). */
export type FamilyFilter = AlgorithmFamily | "all"
export type ClassFilter = ComplexityClass | "all"

/** Повний набір фільтрів каталогу: дві фасети + текстовий запит + мова. */
export interface CatalogFilters {
  readonly family: FamilyFilter
  readonly cls: ClassFilter
  readonly q: string
  readonly lang: Lang
}

/** Нормалізує рядок для пошуку без урахування регістру/крайніх пробілів. */
export function normalize(s: string): string {
  return s.trim().toLowerCase()
}

/**
 * Чи відповідає алгоритм текстовому запиту `q` (поточною мовою `lang`).
 * Шукає в назві, короткій назві, описі, категорії та id (id — англомовний slug,
 * тож збіг по ньому корисний незалежно від мови). Порожній запит → завжди true.
 */
export function matchesQuery(algo: Algorithm, q: string, lang: Lang): boolean {
  const needle = normalize(q)
  if (needle === "") return true
  const haystack = [
    algo.name[lang],
    algo.shortName[lang],
    algo.tagline[lang],
    algo.category[lang],
    algo.id,
  ]
  return haystack.some((field) => field.toLowerCase().includes(needle))
}

/** Чи проходить алгоритм фасет класу складності. */
export function matchesClass(algo: Algorithm, cls: ClassFilter): boolean {
  return cls === "all" || algo.complexityClass === cls
}

/** Чи проходить алгоритм фасет родини. */
export function matchesFamily(algo: Algorithm, family: FamilyFilter): boolean {
  return family === "all" || algo.family === family
}

/** Результат фільтрації каталогу: видимі секції + лічильники для кожної фасети. */
export interface CatalogFilterResult {
  /** Родини (у вихідному порядку), що містять хоч один видимий алгоритм. */
  readonly groups: readonly AlgorithmGroup[]
  /** Сумарна кількість видимих алгоритмів (для empty-state). */
  readonly total: number
}

/**
 * Застосовує всі фасети (родина + клас + текст) до груп каталогу й повертає
 * лише непорожні секції з відфільтрованими елементами. Чиста функція: lang —
 * параметр, жодної залежності від React/store → юніт-тестується напряму.
 */
export function applyCatalogFilters(
  groups: readonly AlgorithmGroup[],
  filters: CatalogFilters,
): CatalogFilterResult {
  const { family, cls, q, lang } = filters
  const passes = (a: Algorithm): boolean =>
    matchesClass(a, cls) && matchesQuery(a, q, lang)

  const visible = groups
    .filter((g) => family === "all" || g.family.id === family)
    .map((g) => ({ family: g.family, items: g.items.filter(passes) }))
    .filter((g) => g.items.length > 0)

  const total = visible.reduce((sum, g) => sum + g.items.length, 0)
  return { groups: visible, total }
}

/**
 * Лічильник для чипа родини: скільки алгоритмів цієї родини проходять решту
 * фасет (клас + текст). `family="all"` → усі групи (загальний лічильник).
 */
export function countForFamily(
  groups: readonly AlgorithmGroup[],
  family: FamilyFilter,
  cls: ClassFilter,
  q: string,
  lang: Lang,
): number {
  return groups
    .filter((g) => family === "all" || g.family.id === family)
    .reduce(
      (sum, g) =>
        sum +
        g.items.filter((a) => matchesClass(a, cls) && matchesQuery(a, q, lang))
          .length,
      0,
    )
}

/**
 * Лічильник для чипа класу складності: скільки алгоритмів цього класу проходять
 * решту фасет (родина + текст). `cls="all"` → усі класи (загальний лічильник).
 */
export function countForClass(
  groups: readonly AlgorithmGroup[],
  cls: ClassFilter,
  family: FamilyFilter,
  q: string,
  lang: Lang,
): number {
  return groups
    .flatMap((g) => g.items)
    .filter(
      (a) =>
        matchesFamily(a, family) &&
        matchesClass(a, cls) &&
        matchesQuery(a, q, lang),
    ).length
}
