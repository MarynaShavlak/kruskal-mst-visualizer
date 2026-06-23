import { lazy, type ComponentType } from "react"
import type {
  Algorithm,
  AlgorithmFamily,
  AlgorithmStatus,
  Localized,
} from "@/algorithms/types"

// Фабрика опису алгоритму: прибирає повторювану lazy-обгортку екранів із кожного
// `<id>/index.ts`. Кожна вкладка задається лише лінивим import свого View-модуля —
// назва компонента виводиться з ключа вкладки (learn→LearnView, editor→EditorView,
// playback→PlaybackView, benchmark→BenchmarkView). Шляхи import лишаються ЯВНИМИ
// (статичний аналіз Vite → окремий чанк на екран; tsc перевіряє існування модуля).

/** Лінивий завантажувач модуля екрана (повертає модуль; компонент дістаємо за іменем). */
type ViewLoader = () => Promise<Record<string, unknown>>

/** Ключ вкладки → ім'я іменованого експорту її View-компонента. */
const TAB_VIEW: Record<string, string> = {
  learn: "LearnView",
  editor: "EditorView",
  playback: "PlaybackView",
  benchmark: "BenchmarkView",
}

export interface AlgorithmConfig {
  readonly id: string
  readonly name: Localized
  readonly shortName: Localized
  readonly tagline: Localized
  readonly family: AlgorithmFamily
  readonly category: Localized
  readonly icon: ComponentType<{ className?: string }>
  /** Вкладки в порядку показу: ключ → лінивий import свого View-модуля. */
  readonly views: Record<string, ViewLoader>
  /** Дефолт — "ready". */
  readonly status?: AlgorithmStatus
  /** Дефолт — перша вкладка. */
  readonly defaultTab?: string
  /** Заплановані (ще не готові) розділи — для екрана «Незабаром». */
  readonly planned?: readonly Localized[]
}

/** Збирає `Algorithm`: lazy-обгортки екранів + метадані + дефолти (status/defaultTab). */
export function createAlgorithm(cfg: AlgorithmConfig): Algorithm {
  const tabs = Object.entries(cfg.views).map(([key, load]) => {
    const name = TAB_VIEW[key] ?? key
    return {
      key,
      View: lazy(() => load().then((m) => ({ default: m[name] as ComponentType }))),
    }
  })
  return {
    id: cfg.id,
    name: cfg.name,
    shortName: cfg.shortName,
    tagline: cfg.tagline,
    family: cfg.family,
    category: cfg.category,
    icon: cfg.icon,
    status: cfg.status ?? "ready",
    defaultTab: cfg.defaultTab ?? Object.keys(cfg.views)[0],
    tabs,
    ...(cfg.planned ? { planned: cfg.planned } : {}),
  }
}
