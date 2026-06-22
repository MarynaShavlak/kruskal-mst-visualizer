// Generic-ядро сторів-масивів (Zustand) — аналог create-graph-store для не-графових
// алгоритмів. Сортувальні стори (бульбашкове, вставками, вибором, швидке, злиттям,
// Шелла, порозрядне) ділять однаковий набір мутацій над масивом цілих; пошукові
// (linear/binary/indexed/interpolation) додають ще ЦІЛЬ — їхнє ядро в create-search-store
// переюзає тутешній `arrayValueActions`. Пресетні лоадери лишаються у конкретних сторах
// (вони store-специфічні: приклад / межовий інстанс / випадковий).

/** Ціле (відкидає дробову частину; нечисло → 0). Пошук: дозволені від'ємні. */
export const intClamp = (value: number): number =>
  Number.isFinite(value) ? Math.trunc(value) : 0

/** Невід'ємне ціле. Сортування: панель стовпчиків і ядро вимагають значень ≥ 0. */
export const nonNegIntClamp = (value: number): number =>
  Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0

/** Детерміноване «варіативне» число для addValue — щоб додані елементи різнилися. */
const seededValue = (length: number): number => ((length * 37 + 13) % 90) + 1

/** Мутації над `values`, спільні для сортувань і пошуків у масиві. */
export interface ArrayValueActions {
  /** Додає число (детерміноване від довжини; з підтримкою порядку — якщо keepSorted). */
  addValue: () => void
  /** Оновлює значення за індексом (із санітизацією); поза межами — no-op. */
  updateValue: (index: number, value: number) => void
  removeValue: (index: number) => void
  /** Замінює весь масив (значення санітизуються). */
  setValues: (values: readonly number[]) => void
  clear: () => void
}

/** Мінімум стану, який потрібен діям над масивом; набір `values`. */
interface ValuesState {
  readonly values: readonly number[]
}

/**
 * Функційна форма set над `values`. Zustand-овий set повного стору присвоюваний цьому
 * типу (стан стору містить `values`), тож дії переюзаються будь-яким стором без кастів.
 */
type ValuesSet = (updater: (s: ValuesState) => Partial<ValuesState>) => void

/**
 * Будує спільні дії над масивом значень. `keepSorted` тримає масив упорядкованим при
 * додаванні (передумова двійкового/інтерполяційного/індексного пошуку).
 */
export function arrayValueActions(
  set: ValuesSet,
  clamp: (value: number) => number,
  keepSorted: boolean,
): ArrayValueActions {
  return {
    addValue: () =>
      set((s) => {
        const out = [...s.values, seededValue(s.values.length)]
        return { values: keepSorted ? out.sort((a, b) => a - b) : out }
      }),

    updateValue: (index, value) =>
      set((s) => {
        if (index < 0 || index >= s.values.length) return {}
        return {
          values: s.values.map((v, i) => (i === index ? clamp(value) : v)),
        }
      }),

    removeValue: (index) =>
      set((s) => {
        if (index < 0 || index >= s.values.length) return {}
        return { values: s.values.filter((_, i) => i !== index) }
      }),

    setValues: (values) => set(() => ({ values: values.map(clamp) })),

    clear: () => set(() => ({ values: [] })),
  }
}

/** Документ редактора-масиву (серіалізовний). */
export interface ArrayStoreDoc {
  readonly values: readonly number[]
}

/** Спільне ядро стору-масиву: стан `values` + мутації + doc round-trip. */
export interface ArrayCore extends ArrayValueActions {
  readonly values: readonly number[]
  loadDoc: (doc: ArrayStoreDoc) => void
  toDoc: () => ArrayStoreDoc
}

/** Вузький тип set над ядром — сумісний із Zustand-овим set повного стору. */
type ArrayCoreSet = (
  partial: Partial<ArrayCore> | ((s: ArrayCore) => Partial<ArrayCore>),
) => void

export interface ArrayCoreCfg {
  /** Початковий документ (зазвичай introPreset()). */
  readonly initial: ArrayStoreDoc
  /** Санітизація значення. Дефолт — nonNegIntClamp (сортування вимагають ≥ 0). */
  readonly clamp?: (value: number) => number
}

/**
 * Будує ядро стору-масиву для СОРТУВАНЬ. Викликається всередині
 * `create<S>()((set, get) => ({ ...arrayCore(cfg, set, get), ...пресет-лоадери }))`,
 * де `S` — повний стан конкретного стору (ядро + його лоадери).
 */
export function arrayCore(
  cfg: ArrayCoreCfg,
  set: ArrayCoreSet,
  get: () => ArrayCore,
): ArrayCore {
  const clamp = cfg.clamp ?? nonNegIntClamp
  return {
    values: cfg.initial.values,
    ...arrayValueActions(set, clamp, false),
    loadDoc: (doc) => set({ values: doc.values.map(clamp) }),
    toDoc: () => ({ values: get().values }),
  }
}
