// Перетворення координат редактора TSP: математичний простір міст ↔ пікселі
// полотна React Flow. Координати міст у сторі — математичні (демо A–E в [0..5],
// щоб матриця збігалася з еталоном); полотно працює в пікселях. Чисто, без React.
//
// Зворотне перетворення СНАПИТЬ до цілої сітки: відстані лишаються «гарними»
// (читані в матриці) і коректно округленими (sqrt над цілими — як в еталоні).
// Координати затискаються до невід'ємних — міста живуть у першому квадранті.

/** Пікселів полотна на одну математичну одиницю. */
export const CANVAS_SCALE = 64
/** Відступ від початку координат (щоб вузли не липли до краю). */
export const CANVAS_PAD = 48

export interface XY {
  readonly x: number
  readonly y: number
}

/** Математичні координати → пікселі полотна. */
export function toCanvas(m: XY): XY {
  return { x: m.x * CANVAS_SCALE + CANVAS_PAD, y: m.y * CANVAS_SCALE + CANVAS_PAD }
}

/** Пікселі полотна → математичні координати, заокруглені до цілої сітки (≥ 0). */
export function toMathSnapped(c: XY): XY {
  return {
    x: Math.max(0, Math.round((c.x - CANVAS_PAD) / CANVAS_SCALE)),
    y: Math.max(0, Math.round((c.y - CANVAS_PAD) / CANVAS_SCALE)),
  }
}
