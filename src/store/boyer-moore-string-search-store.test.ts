import { beforeEach, describe, expect, it } from "vitest"
import { useBoyerMooreStringSearchStore } from "@/store/boyer-moore-string-search-store"
import { BM_MAIN, BM_WORST, BM_MULTI } from "@/lib/exampleBoyerMooreStringSearch"

const reset = () => useBoyerMooreStringSearchStore.getState().loadMain()

describe("boyer-moore-string-search-store", () => {
  beforeEach(reset)

  it("за замовчуванням — канонічний приклад", () => {
    const s = useBoyerMooreStringSearchStore.getState()
    expect(s.text).toBe(BM_MAIN.text)
    expect(s.pattern).toBe(BM_MAIN.pattern)
  })

  it("setText / setPattern / clear", () => {
    const s = useBoyerMooreStringSearchStore.getState()
    s.setText("hello")
    s.setPattern("ll")
    expect(useBoyerMooreStringSearchStore.getState().text).toBe("hello")
    expect(useBoyerMooreStringSearchStore.getState().pattern).toBe("ll")
    s.clear()
    expect(useBoyerMooreStringSearchStore.getState().text).toBe("")
    expect(useBoyerMooreStringSearchStore.getState().pattern).toBe("")
  })

  it("пресети завантажують відповідні пари", () => {
    const s = useBoyerMooreStringSearchStore.getState()
    s.loadWorst()
    expect(useBoyerMooreStringSearchStore.getState().pattern).toBe(BM_WORST.pattern)
    s.loadMulti()
    expect(useBoyerMooreStringSearchStore.getState().text).toBe(BM_MULTI.text)
  })

  it("loadDoc / toDoc — кругообіг", () => {
    const s = useBoyerMooreStringSearchStore.getState()
    s.loadDoc({ text: "ABCABC", pattern: "BC" })
    const doc = useBoyerMooreStringSearchStore.getState().toDoc()
    expect(doc).toEqual({ text: "ABCABC", pattern: "BC" })
  })

  it("loadRandom детермінований за seed (текст + підрядок із нього)", () => {
    const s = useBoyerMooreStringSearchStore.getState()
    s.loadRandom(42)
    const a = useBoyerMooreStringSearchStore.getState().toDoc()
    s.loadRandom(42)
    const b = useBoyerMooreStringSearchStore.getState().toDoc()
    expect(a).toEqual(b)
    expect(a.text.length).toBeGreaterThan(0)
  })
})
