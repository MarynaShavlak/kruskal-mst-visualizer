import { describe, it, expect } from "vitest"
import {
  binaryPredictAdapter,
  linearPredictAdapter,
  kruskalPredictAdapter,
  defaultNoQuestion,
} from "@/algorithms/shared/playback/predict"
import { buildBinarySearchTrace } from "@/lib/binarySearchTrace"
import { buildLinearSearchTrace } from "@/lib/linearSearchTrace"
import { BS_INTRO } from "@/lib/exampleBinarySearch"
import { LS_MAIN } from "@/lib/exampleLinearSearch"
import { kruskalDsu } from "@/lib/kruskalDsu"
import { referenceGraph } from "@/lib/exampleGraph"

describe("binaryPredictAdapter — питання лише на пробі", () => {
  const frames = buildBinarySearchTrace(BS_INTRO.values, BS_INTRO.target).frames

  it("non-probe кадри → null", () => {
    frames.forEach((f, i) => {
      if (f.phase !== "probe") expect(binaryPredictAdapter(frames, i)).toBeNull()
    })
  })

  it("на пробі питання має 3 варіанти й правильний промпт", () => {
    const i = frames.findIndex((f) => f.phase === "probe")
    const q = binaryPredictAdapter(frames, i)
    expect(q).not.toBeNull()
    expect(q!.promptKey).toBe("play.predictBinPrompt")
    expect(q!.options.map((o) => o.id)).toEqual(["lower", "upper", "found"])
  })

  it("⚠️ correctId за ВІДКИНУТИМ ДІАПАЗОНОМ, не за label (інверсія discard)", () => {
    // BS_INTRO=[1,3,5,8,10,12,15,18,20,22,24] target 15:
    //   probe mid=5 value=12<15 → відкидаємо [0..5] (НИЖНІЙ) хоч label «discardRight»
    //   probe mid=8 value=20>15 → відкидаємо [8..10] (ВЕРХНІЙ)
    //   probe mid=6 value=15==15 → found
    const probeIdxs = frames
      .map((f, i) => (f.phase === "probe" ? i : -1))
      .filter((i) => i >= 0)
    expect(probeIdxs).toHaveLength(3)
    expect(binaryPredictAdapter(frames, probeIdxs[0])!.correctId).toBe("lower")
    expect(binaryPredictAdapter(frames, probeIdxs[1])!.correctId).toBe("upper")
    expect(binaryPredictAdapter(frames, probeIdxs[2])!.correctId).toBe("found")
  })

  it("resolution-boundary: probe без наступного кадру → null", () => {
    const i = frames.findIndex((f) => f.phase === "probe")
    expect(binaryPredictAdapter(frames.slice(0, i + 1), i)).toBeNull()
  })
})

describe("linearPredictAdapter", () => {
  const frames = buildLinearSearchTrace(LS_MAIN.values, LS_MAIN.target).frames

  it("non-check кадри → null", () => {
    frames.forEach((f, i) => {
      if (f.phase !== "check") expect(linearPredictAdapter(frames, i)).toBeNull()
    })
  })

  it("check → reject коли не той, match коли збіг", () => {
    // LS_MAIN=[5,3,8,1,4] target 8: i=0(5≠) reject, i=1(3≠) reject, i=2(8=) match.
    const checks = frames
      .map((f, i) => (f.phase === "check" ? i : -1))
      .filter((i) => i >= 0)
    const ids = checks.map((i) => linearPredictAdapter(frames, i)!.correctId)
    expect(ids).toEqual(["reject", "reject", "match"])
  })

  it("resolution-boundary: check без наступного → null", () => {
    const i = frames.findIndex((f) => f.phase === "check")
    expect(linearPredictAdapter(frames.slice(0, i + 1), i)).toBeNull()
  })
})

describe("kruskalPredictAdapter — scan-forward за consideredEdgeId", () => {
  const frames = kruskalDsu(referenceGraph()).trace.frames

  it("питання лише на consider-кадрі (sub.kind=consider, decision=null)", () => {
    frames.forEach((f, i) => {
      const q = kruskalPredictAdapter(frames, i)
      if (f.sub.kind === "consider" && f.decision === null) {
        expect(q).not.toBeNull()
        expect(q!.promptKey).toBe("play.predictKrPrompt")
        expect(q!.options.map((o) => o.id)).toEqual(["accept", "reject"])
      } else {
        expect(q).toBeNull()
      }
    })
  })

  it("correctId = рішення з НАСТУПНОГО non-null-decision кадру того самого ребра", () => {
    // Для КОЖНОГО consider дістаємо реальне рішення скан-форвардом і звіряємо.
    frames.forEach((f, i) => {
      if (f.sub.kind !== "consider" || f.decision !== null) return
      const edgeId = f.consideredEdgeId
      // Ручний скан уперед — еталон.
      let expected: string | null = null
      for (let j = i + 1; j < frames.length; j++) {
        if (frames[j].consideredEdgeId !== edgeId) break
        if (frames[j].decision != null) {
          expected = frames[j].decision
          break
        }
      }
      expect(kruskalPredictAdapter(frames, i)!.correctId).toBe(expected)
    })
  })

  it("на еталонному графі є і accept, і reject (цикл)", () => {
    const decisions = frames
      .map((f, i) => (f.sub.kind === "consider" ? kruskalPredictAdapter(frames, i)!.correctId : null))
      .filter((d): d is string => d != null)
    expect(decisions).toContain("accept")
    expect(decisions).toContain("reject")
  })
})

describe("defaultNoQuestion", () => {
  it("завжди null", () => {
    expect(defaultNoQuestion([], 0)).toBeNull()
    expect(defaultNoQuestion([1, 2, 3], 1)).toBeNull()
  })
})
