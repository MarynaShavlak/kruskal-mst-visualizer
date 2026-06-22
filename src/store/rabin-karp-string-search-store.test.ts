import { beforeEach, describe, expect, it } from "vitest"
import { useRabinKarpStringSearchStore } from "@/store/rabin-karp-string-search-store"
import { RK_MAIN, RK_COLLISION, RK_MULTI } from "@/lib/exampleRabinKarpStringSearch"

const reset = () => useRabinKarpStringSearchStore.getState().loadMain()

describe("rabin-karp-string-search-store", () => {
  beforeEach(reset)

  it("за замовчуванням — канонічний приклад", () => {
    const s = useRabinKarpStringSearchStore.getState()
    expect(s.text).toBe(RK_MAIN.text)
    expect(s.pattern).toBe(RK_MAIN.pattern)
  })

  it("setText / setPattern / clear", () => {
    const s = useRabinKarpStringSearchStore.getState()
    s.setText("hello world")
    s.setPattern("world")
    expect(useRabinKarpStringSearchStore.getState().text).toBe("hello world")
    expect(useRabinKarpStringSearchStore.getState().pattern).toBe("world")
    s.clear()
    expect(useRabinKarpStringSearchStore.getState().text).toBe("")
    expect(useRabinKarpStringSearchStore.getState().pattern).toBe("")
  })

  it("пресети завантажують відповідні пари", () => {
    const s = useRabinKarpStringSearchStore.getState()
    s.loadCollision()
    expect(useRabinKarpStringSearchStore.getState().pattern).toBe(RK_COLLISION.pattern)
    s.loadMulti()
    expect(useRabinKarpStringSearchStore.getState().text).toBe(RK_MULTI.text)
  })

  it("loadDoc / toDoc — кругообіг", () => {
    const s = useRabinKarpStringSearchStore.getState()
    s.loadDoc({ text: "abcabc", pattern: "bc" })
    const doc = useRabinKarpStringSearchStore.getState().toDoc()
    expect(doc).toEqual({ text: "abcabc", pattern: "bc" })
  })

  it("loadRandom детермінований за seed (текст + підрядок із нього)", () => {
    const s = useRabinKarpStringSearchStore.getState()
    s.loadRandom(42)
    const a = useRabinKarpStringSearchStore.getState().toDoc()
    s.loadRandom(42)
    const b = useRabinKarpStringSearchStore.getState().toDoc()
    expect(a).toEqual(b)
    expect(a.text.length).toBeGreaterThan(0)
  })
})
