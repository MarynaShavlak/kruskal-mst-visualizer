import type { ComponentType, LazyExoticComponent } from "react"

/** Стан готовності алгоритму на платформі. */
export type AlgorithmStatus = "ready" | "soon"

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
  /** Категорія, напр. «Графи · Остовні дерева». */
  readonly category: Localized
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
