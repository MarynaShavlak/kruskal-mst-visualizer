// Generic-ядро сторів-пошуків у масиві (Zustand). linear/binary/interpolation ділять
// масив + ЦІЛЬ `target` і однакові мутації — це ядро. Механіку над масивом переюзаємо
// з create-array-store (`arrayValueActions`). Специфіку кожен стор додає тонко поверх:
// `sortValues` — лише сортовані варіанти (двійк./інтерпол.); `step` + крокова таблиця —
// лише індексно-послідовний (він будує своє ядро на `arrayValueActions` напряму, бо
// його документ несе ще й крок, несумісний із SearchCore.loadDoc).

import {
  arrayValueActions,
  intClamp,
  type ArrayValueActions,
} from "@/store/create-array-store"

/** Документ редактора-пошуку: масив + ціль (серіалізовний). */
export interface SearchStoreDoc {
  readonly values: readonly number[]
  readonly target: number
}

/** Спільне ядро стору-пошуку: масив + ціль + мутації + doc round-trip. */
export interface SearchCore extends ArrayValueActions {
  readonly values: readonly number[]
  readonly target: number
  setTarget: (target: number) => void
  loadDoc: (doc: SearchStoreDoc) => void
  toDoc: () => SearchStoreDoc
}

/** Вузький тип set над ядром — сумісний із Zustand-овим set повного стору. */
type SearchCoreSet = (
  partial: Partial<SearchCore> | ((s: SearchCore) => Partial<SearchCore>),
) => void

export interface SearchCoreCfg {
  /** Початковий документ (зазвичай головний пресет). */
  readonly initial: SearchStoreDoc
  /** Санітизація значення/цілі. Дефолт — intClamp (будь-яке ціле, зокрема від'ємне). */
  readonly clamp?: (value: number) => number
  /** Тримати масив відсортованим при addValue (двійк./інтерпол. — передумова методу). */
  readonly keepSorted?: boolean
}

/**
 * Будує ядро стору-пошуку. Викликається всередині
 * `create<S>()((set, get) => ({ ...searchCore(cfg, set, get), ...екстри, ...лоадери }))`.
 * `clear` лишає ціль недоторканою (спорожнює лише масив) — як у вихідних сторах.
 */
export function searchCore(
  cfg: SearchCoreCfg,
  set: SearchCoreSet,
  get: () => SearchCore,
): SearchCore {
  const clamp = cfg.clamp ?? intClamp
  return {
    values: cfg.initial.values,
    target: cfg.initial.target,
    ...arrayValueActions(set, clamp, cfg.keepSorted ?? false),
    setTarget: (target) => set({ target: clamp(target) }),
    loadDoc: (doc) =>
      set({ values: doc.values.map(clamp), target: clamp(doc.target) }),
    toDoc: () => ({ values: get().values, target: get().target }),
  }
}
