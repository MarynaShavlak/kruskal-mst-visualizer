import { beforeEach, describe, expect, it } from "vitest"
import { useKmpStringSearchStore } from "@/store/kmp-string-search-store"
import { KMP_CANONICAL, KMP_WORST, KMP_KONSPECT } from "@/lib/exampleKmpStringSearch"
import { describeStringCore } from "@/store/string-core-contract"

const reset = () => useKmpStringSearchStore.getState().loadMain()

describeStringCore(
  "kmp-string-search-store",
  () => useKmpStringSearchStore.getState(),
  reset,
  KMP_CANONICAL,
)

describe("kmp-string-search-store", () => {
  beforeEach(reset)

  it("пресети завантажують відповідні пари", () => {
    const s = useKmpStringSearchStore.getState()
    s.loadWorst()
    expect(useKmpStringSearchStore.getState().pattern).toBe(KMP_WORST.pattern)
    s.loadKonspect()
    expect(useKmpStringSearchStore.getState().pattern).toBe(KMP_KONSPECT.pattern)
  })
})
