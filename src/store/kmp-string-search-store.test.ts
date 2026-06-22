import { beforeEach, describe, expect, it } from "vitest"
import { useKmpStringSearchStore } from "@/store/kmp-string-search-store"
import { KMP_CANONICAL, KMP_WORST, KMP_KONSPECT } from "@/lib/exampleKmpStringSearch"

const reset = () => useKmpStringSearchStore.getState().loadMain()

describe("kmp-string-search-store", () => {
  beforeEach(reset)

  it("за замовчуванням — канонічний приклад", () => {
    const s = useKmpStringSearchStore.getState()
    expect(s.text).toBe(KMP_CANONICAL.text)
    expect(s.pattern).toBe(KMP_CANONICAL.pattern)
  })

  it("setText / setPattern / clear", () => {
    const s = useKmpStringSearchStore.getState()
    s.setText("hello")
    s.setPattern("ll")
    expect(useKmpStringSearchStore.getState().text).toBe("hello")
    expect(useKmpStringSearchStore.getState().pattern).toBe("ll")
    s.clear()
    expect(useKmpStringSearchStore.getState().text).toBe("")
    expect(useKmpStringSearchStore.getState().pattern).toBe("")
  })

  it("пресети завантажують відповідні пари", () => {
    const s = useKmpStringSearchStore.getState()
    s.loadWorst()
    expect(useKmpStringSearchStore.getState().pattern).toBe(KMP_WORST.pattern)
    s.loadKonspect()
    expect(useKmpStringSearchStore.getState().pattern).toBe(KMP_KONSPECT.pattern)
  })

  it("loadDoc / toDoc — кругообіг", () => {
    const s = useKmpStringSearchStore.getState()
    s.loadDoc({ text: "ABCABC", pattern: "BC" })
    const doc = useKmpStringSearchStore.getState().toDoc()
    expect(doc).toEqual({ text: "ABCABC", pattern: "BC" })
  })

  it("loadRandom детермінований за seed (текст + підрядок із нього)", () => {
    const s = useKmpStringSearchStore.getState()
    s.loadRandom(42)
    const a = useKmpStringSearchStore.getState().toDoc()
    s.loadRandom(42)
    const b = useKmpStringSearchStore.getState().toDoc()
    expect(a).toEqual(b)
    expect(a.text.length).toBeGreaterThan(0)
  })
})
