// Спільний контракт ядра рядкового стору для тестів. Ці it() були майже байт-у-байт
// у 4 *-string-search-store.test.ts (naive/kmp/boyer-moore/rabin-karp — усі на
// stringCore {text, pattern}). Пресет-специфічні перевірки лишаються в кожному тесті.
//
// Файл не є *.test.ts → vitest його не запускає сам; його лише імпортують тести.

import { describe, it, expect, beforeEach } from "vitest"

export interface StringCoreState {
  readonly text: string
  readonly pattern: string
  setText: (text: string) => void
  setPattern: (pattern: string) => void
  clear: () => void
  loadDoc: (doc: { text: string; pattern: string }) => void
  toDoc: () => { text: string; pattern: string }
  loadRandom: (seed: number) => void
}

/** Реєструє спільні it() ядра рядка (дефолт/set·clear/round-trip/детермінований random). */
export function describeStringCore(
  label: string,
  getState: () => StringCoreState,
  reset: () => void,
  canonical: { text: string; pattern: string },
): void {
  describe(`${label}: спільне ядро рядка`, () => {
    beforeEach(reset)

    it("за замовчуванням — канонічний приклад", () => {
      expect(getState().text).toBe(canonical.text)
      expect(getState().pattern).toBe(canonical.pattern)
    })

    it("setText / setPattern / clear", () => {
      getState().setText("hello")
      getState().setPattern("ll")
      expect(getState().text).toBe("hello")
      expect(getState().pattern).toBe("ll")
      getState().clear()
      expect(getState().text).toBe("")
      expect(getState().pattern).toBe("")
    })

    it("loadDoc / toDoc — кругообіг", () => {
      getState().loadDoc({ text: "ABCABC", pattern: "BC" })
      expect(getState().toDoc()).toEqual({ text: "ABCABC", pattern: "BC" })
    })

    it("loadRandom детермінований за seed", () => {
      getState().loadRandom(42)
      const a = getState().toDoc()
      getState().loadRandom(42)
      const b = getState().toDoc()
      expect(a).toEqual(b)
      expect(a.text.length).toBeGreaterThan(0)
    })
  })
}
