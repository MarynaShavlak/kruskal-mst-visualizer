// Спільний контракт ядра масиву-сортування для тестів сторів. Чотири it() нижче
// були байт-у-байт у 7 *-sort-store.test.ts (bubble/insertion/selection/quick/merge/
// shell/radix — усі на arrayCore з nonNegIntClamp). Старт-стан, пресети, removeValue
// і round-trip лишаються специфічними в кожному тесті. НЕ для пошукових сторів
// (search використовує intClamp і дозволяє від'ємні значення).
//
// Файл не є *.test.ts → vitest його не запускає сам; його лише імпортують тести.

import { describe, it, expect, beforeEach } from "vitest"

export interface ArrayCoreState {
  readonly values: readonly number[]
  addValue: () => void
  updateValue: (index: number, value: number) => void
  setValues: (values: number[]) => void
  clear: () => void
}

/** Реєструє спільні it() ядра масиву (add/update≥0/setValues/clear) під своїм describe. */
export function describeArrayCore(
  label: string,
  getState: () => ArrayCoreState,
  reset: () => void,
): void {
  describe(`${label}: спільне ядро масиву`, () => {
    beforeEach(reset)

    it("addValue додає одне ціле", () => {
      const before = getState().values.length
      getState().addValue()
      expect(getState().values.length).toBe(before + 1)
      expect(Number.isInteger(getState().values[before])).toBe(true)
    })

    it("updateValue санітизує до цілого ≥ 0", () => {
      getState().updateValue(0, -5)
      expect(getState().values[0]).toBe(0)
      getState().updateValue(0, 7.9)
      expect(getState().values[0]).toBe(7) // truncate
    })

    it("setValues замінює весь масив із санітизацією", () => {
      getState().setValues([3, -1, 2.5])
      expect(getState().values).toEqual([3, 0, 2])
    })

    it("clear спорожнює масив", () => {
      getState().clear()
      expect(getState().values).toEqual([])
    })
  })
}
