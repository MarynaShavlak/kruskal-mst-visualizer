import { beforeEach, describe, expect, it } from "vitest"
import { useBoyerMooreStringSearchStore } from "@/store/boyer-moore-string-search-store"
import { BM_MAIN, BM_WORST, BM_MULTI } from "@/lib/exampleBoyerMooreStringSearch"
import { describeStringCore } from "@/store/string-core-contract"

const reset = () => useBoyerMooreStringSearchStore.getState().loadMain()

describeStringCore(
  "boyer-moore-string-search-store",
  () => useBoyerMooreStringSearchStore.getState(),
  reset,
  BM_MAIN,
)

describe("boyer-moore-string-search-store", () => {
  beforeEach(reset)

  it("пресети завантажують відповідні пари", () => {
    const s = useBoyerMooreStringSearchStore.getState()
    s.loadWorst()
    expect(useBoyerMooreStringSearchStore.getState().pattern).toBe(BM_WORST.pattern)
    s.loadMulti()
    expect(useBoyerMooreStringSearchStore.getState().text).toBe(BM_MULTI.text)
  })
})
