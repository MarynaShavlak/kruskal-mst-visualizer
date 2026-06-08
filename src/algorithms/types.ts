import type { ComponentType, LazyExoticComponent } from "react"

/** Стан готовності алгоритму на платформі. */
export type AlgorithmStatus = "ready" | "soon"

/** Одна вкладка всередині розділу алгоритму (ліниво завантажуваний екран). */
export interface AlgoTab {
  readonly key: string
  readonly label: string
  readonly View: LazyExoticComponent<ComponentType>
}

/**
 * Опис одного алгоритму на платформі.
 * `registry.ts` — єдине джерело правди; каталог, перемикач у шапці й роутер
 * читають саме його.
 */
export interface Algorithm {
  /** URL-slug і ключ роуту, напр. "kruskal" → #kruskal/<tab>. */
  readonly id: string
  /** Повна назва, напр. «Алгоритм Краскала». */
  readonly name: string
  /** Коротка назва для карток і перемикача, напр. «Краскал (МОД)». */
  readonly shortName: string
  /** Один рядок опису для картки каталогу. */
  readonly tagline: string
  /** Категорія, напр. «Графи · Остовні дерева». */
  readonly category: string
  readonly status: AlgorithmStatus
  /** Іконка (lucide-react). */
  readonly icon: ComponentType<{ className?: string }>
  /** Ключ вкладки за замовчуванням (коли в роуті вкладку не задано). */
  readonly defaultTab: string
  /** Вкладки розділу. Для status="soon" може бути порожнім. */
  readonly tabs: readonly AlgoTab[]
  /** Для заглушок: перелік запланованих розділів (показуємо на екрані «Незабаром»). */
  readonly planned?: readonly string[]
}
