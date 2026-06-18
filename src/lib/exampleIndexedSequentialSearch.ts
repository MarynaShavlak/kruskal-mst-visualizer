// Канонічні приклади індексно-послідовного пошуку (еталон коректності з README та
// Python-репозиторію algo-indexed-sequential-search). На відміну від лінійного та
// двійкового пошуку (масив + ціль), тут інстанс — ТРІЙКА (ВІДСОРТОВАНИЙ масив,
// `step`, `target`): `step` задає розрідженість індексної таблиці. Інстанси покривають
// усі гілки вибору блоку. «Ціна» — окремо ЗОНДУВАННЯ ІНДЕКСУ (двійкові) та ПОРІВНЯННЯ
// в блоці. Без React.

/** Трійка «відсортований масив + крок індексу + ціль». */
export interface IxsCase {
  readonly values: readonly number[]
  readonly target: number
  readonly step: number
}

/** Основний масив із конспекту (13 елементів, відсортований). */
const KONSPECT: readonly number[] = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25]

/**
 * Основний приклад із конспекту: `step=4`, шукаємо `15` → позиція **7**. Індексна
 * таблиця `[(1,0),(9,4),(17,8),(25,12)]`. Фаза 1: `9<15`, `17>15` → блок `[4,8)`
 * (гілка general); фаза 2: скан `9,11,13,15`. Базово: 2 зондування + 4 порівняння = 6.
 * На ньому README веде весь розбір (повне трасування з 15 кадрів = step_00…step_14).
 */
export const IXS_MAIN: IxsCase = { values: KONSPECT, target: 15, step: 4 }

/** Best-case (гілка ==): `9` — ключ стовпа → відповідь ще на фазі 1 (1 зондування, 0 порівнянь) → позиція 4. */
export const IXS_IN_INDEX: IxsCase = { values: KONSPECT, target: 9, step: 4 }

/** Гілка `start==0`: `0` лівіше за перший стовп → порожній блок `(0,0)` → -1. */
export const IXS_LEFT_ABSENT: IxsCase = { values: KONSPECT, target: 0, step: 4 }

/** Гілка `start>=len`: `27` правіше за останній стовп → скан хвоста `[12,13)` → -1. */
export const IXS_RIGHT_ABSENT: IxsCase = { values: KONSPECT, target: 27, step: 4 }

/** Загальна гілка, перший неекстремальний блок: `3` → блок `[0,4)` → позиція 1. */
export const IXS_BLOCK_FIRST: IxsCase = { values: KONSPECT, target: 3, step: 4 }

/** Загальна гілка, останній повний блок: `23` → блок `[8,12)` → позиція 11 (3 зондування + 4 = 7). */
export const IXS_BLOCK_LAST: IxsCase = { values: KONSPECT, target: 23, step: 4 }

/** Відсутній усередині блоку: `10` → блок `[4,8)` сканується (`9,11,13,15`), збігу немає → -1. */
export const IXS_BLOCK_ABSENT: IxsCase = { values: KONSPECT, target: 10, step: 4 }

/** Дублікати `[1,3,3,3,5,7,9,11]`, `step=4`, `3`: скан у блоці повертає ПЕРШЕ входження (позиція 1). */
export const IXS_DUPLICATES: IxsCase = {
  values: [1, 3, 3, 3, 5, 7, 9, 11],
  target: 3,
  step: 4,
}

/** Відомі підсумки головного прикладу (з README): позиція 7, 2 зондування + 4 порівняння = 6. */
export const IXS_MAIN_STATS = {
  result: 7,
  indexProbes: 2,
  seqComparisons: 4,
  total: 6,
} as const

/** Усі інстанси (для пакетних тестів). */
export const IXS_ALL: readonly IxsCase[] = [
  IXS_MAIN,
  IXS_IN_INDEX,
  IXS_LEFT_ABSENT,
  IXS_RIGHT_ABSENT,
  IXS_BLOCK_FIRST,
  IXS_BLOCK_LAST,
  IXS_BLOCK_ABSENT,
  IXS_DUPLICATES,
]
