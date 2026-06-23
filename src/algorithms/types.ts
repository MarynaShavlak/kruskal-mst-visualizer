import type { ComponentType, LazyExoticComponent } from "react"

/** Стан готовності алгоритму на платформі. */
export type AlgorithmStatus = "ready" | "soon"

/**
 * Родина алгоритму — верхній рівень групування каталогу. Підпис і порядок родин
 * описує `FAMILIES` у `registry.ts`; поле `category` лишається підтипом усередині.
 */
export type AlgorithmFamily =
  | "graphs"
  | "dp"
  | "sorting"
  | "search"
  | "string-search"

/**
 * Часова складність алгоритму: типова (характеристична) і найгірша.
 * Big-O — мовно-нейтральний рядок, тож не `Localized`.
 */
export interface Complexity {
  readonly typical: string
  readonly worst: string
}

/**
 * Клас складності — named bucket за ТИПОВОЮ складністю; верхній рівень другого
 * фільтра каталогу. Підпис словами й представницьку формулу описує
 * `COMPLEXITY_CLASSES` у `registry.ts`.
 */
export type ComplexityClass =
  | "logarithmic"
  | "sublinear"
  | "linear"
  | "linearithmic"
  | "subquadratic"
  | "quadratic"
  | "cubic"
  | "pseudo-polynomial"
  | "exponential"

/** Двомовний рядок (UA/EN). Споживач бере `value[lang]` із lang-store. */
export interface Localized {
  readonly ua: string
  readonly en: string
}

/**
 * Одна вкладка всередині розділу алгоритму (ліниво завантажуваний екран).
 * Підпис вкладки — спільний для всіх алгоритмів, береться з i18n за ключем
 * (`tab.<key>`), тож тут зберігаємо лише ключ роуту.
 */
export interface AlgoTab {
  readonly key: string
  readonly View: LazyExoticComponent<ComponentType>
}

/**
 * Опис одного алгоритму на платформі.
 * `registry.ts` — єдине джерело правди; каталог, перемикач у шапці й роутер
 * читають саме його. Текстові поля двомовні (Localized).
 */
export interface Algorithm {
  /** URL-slug і ключ роуту, напр. "kruskal" → #kruskal/<tab>. */
  readonly id: string
  /** Повна назва, напр. «Алгоритм Краскала». */
  readonly name: Localized
  /** Коротка назва для карток і перемикача, напр. «Краскал (МОД)». */
  readonly shortName: Localized
  /** Один рядок опису для картки каталогу. */
  readonly tagline: Localized
  /** Родина — верхній рівень групування каталогу (секція + чип-фільтр). */
  readonly family: AlgorithmFamily
  /** Категорія (підтип усередині родини), напр. «Графи · Остовні дерева». */
  readonly category: Localized
  /** Часова складність — бейджі «типова / найгірша» на картці каталогу. */
  readonly complexity: Complexity
  /** Клас складності (named bucket за типовою) — для фільтра каталогу. */
  readonly complexityClass: ComplexityClass
  readonly status: AlgorithmStatus
  /** Іконка (lucide-react). */
  readonly icon: ComponentType<{ className?: string }>
  /** Ключ вкладки за замовчуванням (коли в роуті вкладку не задано). */
  readonly defaultTab: string
  /** Вкладки розділу. Для status="soon" може бути порожнім. */
  readonly tabs: readonly AlgoTab[]
  /** Для заглушок: перелік запланованих розділів (показуємо на екрані «Незабаром»). */
  readonly planned?: readonly Localized[]
}
