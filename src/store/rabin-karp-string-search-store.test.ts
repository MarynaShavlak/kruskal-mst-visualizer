import { beforeEach, describe, expect, it } from "vitest"
import { useRabinKarpStringSearchStore } from "@/store/rabin-karp-string-search-store"
import { RK_MAIN, RK_COLLISION, RK_MULTI } from "@/lib/exampleRabinKarpStringSearch"
import { describeStringCore } from "@/store/string-core-contract"

const reset = () => useRabinKarpStringSearchStore.getState().loadMain()

describeStringCore(
  "rabin-karp-string-search-store",
  () => useRabinKarpStringSearchStore.getState(),
  reset,
  RK_MAIN,
)

describe("rabin-karp-string-search-store", () => {
  beforeEach(reset)

  it("пресети завантажують відповідні пари", () => {
    const s = useRabinKarpStringSearchStore.getState()
    s.loadCollision()
    expect(useRabinKarpStringSearchStore.getState().pattern).toBe(RK_COLLISION.pattern)
    s.loadMulti()
    expect(useRabinKarpStringSearchStore.getState().text).toBe(RK_MULTI.text)
  })
})
