import { describe, it, expect } from "vitest"
import { messages } from "@/i18n/messages"

describe("i18n messages", () => {
  it("UA та EN мають однаковий набір ключів", () => {
    const ua = Object.keys(messages.ua).sort()
    const en = Object.keys(messages.en).sort()
    expect(en).toEqual(ua)
  })

  it("жоден рядок не порожній", () => {
    for (const lang of ["ua", "en"] as const) {
      for (const [key, value] of Object.entries(messages[lang])) {
        expect(value, `${lang}/${key}`).not.toBe("")
      }
    }
  })

  it("переклади відрізняються між мовами (sanity)", () => {
    expect(messages.ua["home.heading"]).not.toBe(messages.en["home.heading"])
    expect(messages.ua["tab.learn"]).toBe("Навчання")
    expect(messages.en["tab.learn"]).toBe("Learn")
  })
})
