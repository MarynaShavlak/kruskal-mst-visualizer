import { describe, expect, it } from "vitest"
import { buildInterpolationSearchTrace } from "@/lib/interpolationSearchTrace"
import {
  IP_DEMO1,
  IP_DEMO2,
  IP_CLUSTERED,
  IP_ABSENT_OUT,
  IP_ABSENT_IN,
  IP_DEMO1_STATS,
  IP_DEMO2_STATS,
  IP_CLUSTERED_STATS,
} from "@/lib/exampleInterpolationSearch"

describe("buildInterpolationSearchTrace — кадри", () => {
  it("демо 1: init + probe + found + done = 4 кадри, 1 проба, індекс 7", () => {
    const { frames, result } = buildInterpolationSearchTrace(IP_DEMO1.values, IP_DEMO1.target)
    expect(frames.length).toBe(4)
    expect(frames.map((f) => f.phase)).toEqual(["init", "probe", "found", "done"])
    expect(result.found).toBe(true)
    expect(result.result).toBe(IP_DEMO1_STATS.result)
    expect(result.probes).toBe(IP_DEMO1_STATS.probes)
    expect(result.exit).toBe("found")
  })

  it("демо 2: 6 кадрів = step_00..05 (init+probe+discard+probe+found+done), 2 проби", () => {
    const { frames, result } = buildInterpolationSearchTrace(IP_DEMO2.values, IP_DEMO2.target)
    expect(frames.length).toBe(6)
    expect(frames.map((f) => f.phase)).toEqual([
      "init", "probe", "discard", "probe", "found", "done",
    ])
    expect(result.result).toBe(IP_DEMO2_STATS.result)
    expect(result.probes).toBe(IP_DEMO2_STATS.probes)
    // Перша проба — index 10 (з README walkthrough).
    expect(frames[1].index).toBe(10)
    // Друга проба влучає у 11.
    expect(frames[3].index).toBe(11)
    expect(frames[4].index).toBe(11)
  })

  it("кадри індексуються по порядку (i = 0..n-1)", () => {
    const { frames } = buildInterpolationSearchTrace(IP_DEMO2.values, IP_DEMO2.target)
    frames.forEach((f, i) => expect(f.i).toBe(i))
  })

  it("проба несе дані прямої-моделі (frac/pos/loVal/hiVal)", () => {
    const { frames } = buildInterpolationSearchTrace(IP_DEMO2.values, IP_DEMO2.target)
    const probe = frames[1]
    expect(probe.frac).not.toBeNull()
    expect(probe.pos).not.toBeNull()
    expect(probe.loVal).toBe(1)
    expect(probe.hiVal).toBe(30)
    expect(probe.lineLow).toBe(0)
    expect(probe.lineHigh).toBe(13)
  })

  it("ключ поза діапазоном: init + done = 2 кадри, exit=guard, 0 проб", () => {
    const { frames, result } = buildInterpolationSearchTrace(IP_ABSENT_OUT.values, IP_ABSENT_OUT.target)
    expect(frames.length).toBe(2)
    expect(frames.map((f) => f.phase)).toEqual(["init", "done"])
    expect(result.exit).toBe("guard")
    expect(result.probes).toBe(0)
    expect(result.result).toBe(-1)
  })

  it("ключ усередині, але відсутній: init+probe+discard+done = 4 кадри, 1 проба, exit=guard", () => {
    const { frames, result } = buildInterpolationSearchTrace(IP_ABSENT_IN.values, IP_ABSENT_IN.target)
    expect(frames.length).toBe(4)
    expect(frames.map((f) => f.phase)).toEqual(["init", "probe", "discard", "done"])
    expect(result.probes).toBe(1)
    expect(result.exit).toBe("guard")
    expect(result.result).toBe(-1)
  })

  it("скупчені: 9 проб → init + 8·(probe+discard) + (probe+found) + done = 20 кадрів", () => {
    const { frames, result } = buildInterpolationSearchTrace(IP_CLUSTERED.values, IP_CLUSTERED.target)
    expect(result.probes).toBe(IP_CLUSTERED_STATS.probes)
    expect(result.result).toBe(IP_CLUSTERED_STATS.result)
    expect(frames.length).toBe(1 + 8 * 2 + 2 + 1)
    expect(frames[frames.length - 1].phase).toBe("done")
  })

  it("рекурсивний режим: той самий результат і та сама еволюція вікна", () => {
    const it0 = buildInterpolationSearchTrace(IP_DEMO2.values, IP_DEMO2.target, false)
    const rec = buildInterpolationSearchTrace(IP_DEMO2.values, IP_DEMO2.target, true)
    expect(rec.result.result).toBe(it0.result.result)
    expect(rec.frames.length).toBe(it0.frames.length)
    expect(rec.frames.map((f) => [f.low, f.high, f.index])).toEqual(
      it0.frames.map((f) => [f.low, f.high, f.index]),
    )
    // Різниться лише лістинг коду.
    expect(rec.code).not.toEqual(it0.code)
  })

  it("found-кадр підсвічує саме знайдений індекс", () => {
    const { frames, result } = buildInterpolationSearchTrace(IP_DEMO1.values, IP_DEMO1.target)
    const found = frames.find((f) => f.phase === "found")!
    expect(found.index).toBe(result.result)
  })
})
