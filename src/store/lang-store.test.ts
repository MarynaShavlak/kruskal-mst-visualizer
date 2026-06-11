import { describe, it, expect, beforeEach } from "vitest"
import { useLangStore } from "@/store/lang-store"

describe("lang-store", () => {
  beforeEach(() => {
    localStorage.clear()
    useLangStore.getState().setLang("ua")
  })

  it("дефолт — ua", () => {
    expect(useLangStore.getState().lang).toBe("ua")
  })

  it("setLang змінює мову й пише в localStorage", () => {
    useLangStore.getState().setLang("en")
    expect(useLangStore.getState().lang).toBe("en")
    expect(localStorage.getItem("kruskal-lang")).toBe("en")
  })

  it("toggle перемикає ua ↔ en", () => {
    useLangStore.getState().toggle()
    expect(useLangStore.getState().lang).toBe("en")
    useLangStore.getState().toggle()
    expect(useLangStore.getState().lang).toBe("ua")
  })

  it("виставляє document.documentElement.lang (uk / en)", () => {
    useLangStore.getState().setLang("en")
    expect(document.documentElement.lang).toBe("en")
    useLangStore.getState().setLang("ua")
    expect(document.documentElement.lang).toBe("uk")
  })
})
