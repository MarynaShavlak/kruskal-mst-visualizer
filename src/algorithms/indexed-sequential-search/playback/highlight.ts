// Чисті хелпери відмальовки індексно-послідовного пошуку (без React). Тестуються
// окремо. ДВА РІВНІ → дві ролі-функції:
//   indexRole — сигнальні стовпи ІНДЕКСУ (фаза 1): 🟦 вікно · 🌸 проба mid · 🟥
//     відкинуто · 🟢 збіг у індексі · 🟦 межі обраного блоку (фаза 2) · 🩶 поза.
//   cellRole — комірки МАСИВУ (вибір блоку + фаза 2): ⬜ поза фазою 1 (idle) ·
//     🟦 у блоці · 🌸 курсор · 🩶 відкинуто ✗ · 🟢 збіг ✓ · 🩶 поза блоком.

/** Роль стовпа індексу (верхній рівень). */
export type IndexRole = "probe" | "window" | "discarding" | "found" | "boundary" | "out"

/** Стан, потрібний для класифікації стовпа індексу. */
export interface IndexState {
  /** Активне вікно індексу `[idxLow..idxHigh]` (двійковий: [start,end]; лінійний: [cursor,len-1]). */
  readonly idxLow: number | null
  readonly idxHigh: number | null
  /** Проба — стовп, який зондуємо. */
  readonly idxMid: number | null
  /** Фаза «проба» (курсор на стовпі mid). */
  readonly probing: boolean
  /** Стовпи, що відкидаємо ЦЬОГО кроку. */
  readonly idxDiscardLo: number | null
  readonly idxDiscardHi: number | null
  /** Збіг знайдено в самому індексі (зелений стовп). */
  readonly indexFound: boolean
  /** Межі обраного блоку (для підсвітки стовпів-меж у фазі 2). */
  readonly blockLo: number | null
  readonly blockHi: number | null
}

/**
 * Класифікує стовп індексу `j` (його позиція в масиві — `pos`). Пріоритет: збіг у
 * індексі (зелено) → відкидаємо зараз (червоно ✗) → проба mid (рожевий) → активне
 * вікно (блакитний) → стовп-межа обраного блоку (блакитний) → поза (тьмяний).
 */
export function indexRole(j: number, pos: number, s: IndexState): IndexRole {
  if (s.indexFound && j === s.idxMid) return "found"
  if (s.idxDiscardLo != null && s.idxDiscardHi != null && j >= s.idxDiscardLo && j <= s.idxDiscardHi) {
    return "discarding"
  }
  if (s.probing && j === s.idxMid) return "probe"
  if (s.idxLow != null && s.idxHigh != null && j >= s.idxLow && j <= s.idxHigh) return "window"
  if (s.blockLo != null && (pos === s.blockLo || pos === s.blockHi)) return "boundary"
  return "out"
}

/** Роль комірки масиву (нижній рівень). */
export type CellRole = "idle" | "block" | "cursor" | "rejected" | "found" | "out"

/** Фаза кадру (для розрізнення «курсор» vs «відкинуто» на тій самій комірці). */
export type CellPhase =
  | "init" | "probe" | "discard" | "block" | "scan" | "reject" | "found" | "done"

/** Стан, потрібний для класифікації комірки масиву. */
export interface CellState {
  /** Межі обраного блоку `[blockLo, blockHi)` або null (фаза 1 — ще не обрано). */
  readonly blockLo: number | null
  readonly blockHi: number | null
  /** Курсор фази 2 (поточна комірка) або null. */
  readonly cursor: number | null
  readonly phase: CellPhase
  /** Знайдений індекс або -1. */
  readonly result: number
  /** На фінальному / знайденому кадрі підсвічуємо результат зеленим. */
  readonly resolved: boolean
}

/**
 * Класифікує комірку масиву `i`. Пріоритет: знайдений результат (зелено ✓) → поза
 * фазою 1 (блок ще не обрано → нейтрально «idle») → поза блоком (тьмяно) → у блоці:
 * пройдені/поточна-відкинута (червоно ✗) → поточна-перевірка (рожевий) → ще не дійшли.
 */
export function cellRole(i: number, s: CellState): CellRole {
  if (s.resolved && s.result >= 0 && i === s.result) return "found"
  if (s.blockLo == null || s.blockHi == null) return "idle"
  if (i < s.blockLo || i >= s.blockHi) return "out"
  if (s.cursor != null) {
    if (i < s.cursor) return "rejected"
    if (i === s.cursor) {
      return s.phase === "reject" || s.phase === "done" ? "rejected" : s.phase === "found" ? "found" : "cursor"
    }
  }
  return "block"
}
