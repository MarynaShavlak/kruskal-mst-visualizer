import { beforeEach, describe, expect, it } from "vitest"
import { useNaiveStringSearchStore } from "@/store/naive-string-search-store"
import { NSS_MAIN, NSS_WORST, NSS_OVERLAP } from "@/lib/exampleNaiveStringSearch"

const reset = () => useNaiveStringSearchStore.getState().loadMain()

describe("naive-string-search-store", () => {
  beforeEach(reset)

  it("за замовчуванням — канонічний приклад", () => {
    const s = useNaiveStringSearchStore.getState()
    expect(s.text).toBe(NSS_MAIN.text)
    expect(s.pattern).toBe(NSS_MAIN.pattern)
  })

  it("setText / setPattern / clear", () => {
    const s = useNaiveStringSearchStore.getState()
    s.setText("hello")
    s.setPattern("ll")
    expect(useNaiveStringSearchStore.getState().text).toBe("hello")
    expect(useNaiveStringSearchStore.getState().pattern).toBe("ll")
    s.clear()
    expect(useNaiveStringSearchStore.getState().text).toBe("")
    expect(useNaiveStringSearchStore.getState().pattern).toBe("")
  })

  it("пресети завантажують відповідні пари", () => {
    const s = useNaiveStringSearchStore.getState()
    s.loadWorst()
    expect(useNaiveStringSearchStore.getState().pattern).toBe(NSS_WORST.pattern)
    s.loadOverlap()
    expect(useNaiveStringSearchStore.getState().text).toBe(NSS_OVERLAP.text)
  })

  it("loadDoc / toDoc — кругообіг", () => {
    const s = useNaiveStringSearchStore.getState()
    s.loadDoc({ text: "ABCABC", pattern: "BC" })
    const doc = useNaiveStringSearchStore.getState().toDoc()
    expect(doc).toEqual({ text: "ABCABC", pattern: "BC" })
  })

  it("loadRandom детермінований за seed (текст + підрядок із нього)", () => {
    const s = useNaiveStringSearchStore.getState()
    s.loadRandom(42)
    const a = useNaiveStringSearchStore.getState().toDoc()
    s.loadRandom(42)
    const b = useNaiveStringSearchStore.getState().toDoc()
    expect(a).toEqual(b)
    expect(a.text.length).toBeGreaterThan(0)
  })
})
