import { beforeEach, describe, expect, it } from "vitest"
import { useNaiveStringSearchStore } from "@/store/naive-string-search-store"
import { NSS_MAIN, NSS_WORST, NSS_OVERLAP } from "@/lib/exampleNaiveStringSearch"
import { describeStringCore } from "@/store/string-core-contract"

const reset = () => useNaiveStringSearchStore.getState().loadMain()

describeStringCore(
  "naive-string-search-store",
  () => useNaiveStringSearchStore.getState(),
  reset,
  NSS_MAIN,
)

describe("naive-string-search-store", () => {
  beforeEach(reset)

  it("пресети завантажують відповідні пари", () => {
    const s = useNaiveStringSearchStore.getState()
    s.loadWorst()
    expect(useNaiveStringSearchStore.getState().pattern).toBe(NSS_WORST.pattern)
    s.loadOverlap()
    expect(useNaiveStringSearchStore.getState().text).toBe(NSS_OVERLAP.text)
  })
})
