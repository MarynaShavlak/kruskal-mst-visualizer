import { describe, expect, it } from "vitest"
import {
  interpolationSearch,
  interpolationSearchRecursive,
  interpolationSearchSafe,
  interpolationSearchSteps,
  countProbes,
  countBinaryProbes,
  caseAnalysis,
  isSorted,
} from "@/lib/interpolationSearch"
import {
  IP_DEMO1,
  IP_DEMO2,
  IP_CLUSTERED,
  IP_UNIFORM_WIN,
  IP_BIG_UNIFORM,
  IP_ABSENT_OUT,
  IP_ABSENT_IN,
  IP_ALL_EQUAL,
  IP_DEMO1_STATS,
  IP_DEMO2_STATS,
  IP_CLUSTERED_STATS,
  IP_UNIFORM_WIN_STATS,
} from "@/lib/exampleInterpolationSearch"

describe("interpolationSearch — базовий результат (еталон README)", () => {
  it("демо 1: знаходить 15 на індексі 7", () => {
    expect(interpolationSearch(IP_DEMO1.values, IP_DEMO1.target)).toBe(IP_DEMO1_STATS.result)
  })

  it("демо 2: знаходить 25 на індексі 11", () => {
    expect(interpolationSearch(IP_DEMO2.values, IP_DEMO2.target)).toBe(IP_DEMO2_STATS.result)
  })

  it("скупчені дані: знаходить 9 на індексі 8 (деградація, але результат вірний)", () => {
    expect(interpolationSearch(IP_CLUSTERED.values, IP_CLUSTERED.target)).toBe(IP_CLUSTERED_STATS.result)
  })

  it("рівномірні дані: знаходить 21 на індексі 10", () => {
    expect(interpolationSearch(IP_UNIFORM_WIN.values, IP_UNIFORM_WIN.target)).toBe(IP_UNIFORM_WIN_STATS.result)
  })

  it("велика рівномірна прогресія: знаходить 500 на індексі 100", () => {
    expect(interpolationSearch(IP_BIG_UNIFORM.values, IP_BIG_UNIFORM.target)).toBe(100)
  })

  it("ключ поза діапазоном (100) → -1", () => {
    expect(interpolationSearch(IP_ABSENT_OUT.values, IP_ABSENT_OUT.target)).toBe(-1)
  })

  it("ключ усередині діапазону, але відсутній (26) → -1", () => {
    expect(interpolationSearch(IP_ABSENT_IN.values, IP_ABSENT_IN.target)).toBe(-1)
  })

  it("порожній масив → -1", () => {
    expect(interpolationSearch([], 5)).toBe(-1)
  })

  it("два елементи: збіг / промах (база коректна на різних межах)", () => {
    expect(interpolationSearch([40, 42], 40)).toBe(0)
    expect(interpolationSearch([40, 42], 42)).toBe(1)
    expect(interpolationSearch([40, 42], 7)).toBe(-1)
  })

  it("один елемент — вироджений діапазон (пастка базової версії; safe коректний)", () => {
    // arr[high] == arr[low] → ділення на нуль; база ненадійна, safe повертає 0.
    expect(interpolationSearchSafe([42], 42)).toBe(0)
    expect(interpolationSearchSafe([42], 7)).toBe(-1)
  })
})

describe("interpolationSearchRecursive — дослівно той самий результат", () => {
  const cases = [IP_DEMO1, IP_DEMO2, IP_CLUSTERED, IP_UNIFORM_WIN, IP_BIG_UNIFORM, IP_ABSENT_OUT, IP_ABSENT_IN]
  it.each(cases)("рекурсивний = ітеративний для target=$target", ({ values, target }) => {
    expect(interpolationSearchRecursive(values, target)).toBe(interpolationSearch(values, target))
  })
})

describe("interpolationSearchSafe — закриває пастки", () => {
  it("усі елементи однакові [7,7,7,7]→7: безпечна повертає 0 (без ділення на нуль)", () => {
    expect(interpolationSearchSafe(IP_ALL_EQUAL.values, IP_ALL_EQUAL.target)).toBe(0)
  })

  it("усі однакові, ключа немає → -1", () => {
    expect(interpolationSearchSafe([7, 7, 7, 7], 9)).toBe(-1)
  })

  it("на коректних (різні межі) даних збігається з базовою", () => {
    for (const { values, target } of [IP_DEMO1, IP_DEMO2, IP_CLUSTERED, IP_UNIFORM_WIN, IP_ABSENT_IN]) {
      expect(interpolationSearchSafe(values, target)).toBe(interpolationSearch(values, target))
    }
  })
})

describe("countProbes — «ціна» (обчислення index)", () => {
  it("демо 1: ідеальний здогад за 1 пробу", () => {
    expect(countProbes(IP_DEMO1.values, IP_DEMO1.target)).toBe(IP_DEMO1_STATS.probes)
  })
  it("демо 2: 2 проби (з коригуванням)", () => {
    expect(countProbes(IP_DEMO2.values, IP_DEMO2.target)).toBe(IP_DEMO2_STATS.probes)
  })
  it("скупчені: 9 проб (деградація до O(n))", () => {
    expect(countProbes(IP_CLUSTERED.values, IP_CLUSTERED.target)).toBe(IP_CLUSTERED_STATS.probes)
  })
  it("рівномірні: 1 проба", () => {
    expect(countProbes(IP_UNIFORM_WIN.values, IP_UNIFORM_WIN.target)).toBe(IP_UNIFORM_WIN_STATS.probes)
  })
  it("ключ поза діапазоном: 0 проб (ранній вихід за охоронцем)", () => {
    expect(countProbes(IP_ABSENT_OUT.values, IP_ABSENT_OUT.target)).toBe(0)
  })
  it("ключ усередині, але відсутній: 1 проба, далі вихід за охоронцем", () => {
    expect(countProbes(IP_ABSENT_IN.values, IP_ABSENT_IN.target)).toBe(1)
  })
})

describe("countBinaryProbes — контраст середина проти формули", () => {
  it("рівномірні: інтерполяційний 1 / двійковий 4 (метод виграє)", () => {
    expect(countProbes(IP_UNIFORM_WIN.values, IP_UNIFORM_WIN.target)).toBe(1)
    expect(countBinaryProbes(IP_UNIFORM_WIN.values, IP_UNIFORM_WIN.target)).toBe(4)
  })
  it("скупчені: інтерполяційний 9 / двійковий 3 (метод програє)", () => {
    expect(countProbes(IP_CLUSTERED.values, IP_CLUSTERED.target)).toBe(9)
    expect(countBinaryProbes(IP_CLUSTERED.values, IP_CLUSTERED.target)).toBe(3)
  })
  it("велика рівномірна: інтерполяційний 1, двійковий помітно більше", () => {
    expect(countProbes(IP_BIG_UNIFORM.values, IP_BIG_UNIFORM.target)).toBe(1)
    expect(countBinaryProbes(IP_BIG_UNIFORM.values, IP_BIG_UNIFORM.target)).toBeGreaterThan(1)
  })
})

describe("interpolationSearchSteps — журнал подій", () => {
  it("демо 2: init → probe → found → final, 2 проби", () => {
    const { result, events } = interpolationSearchSteps(IP_DEMO2.values, IP_DEMO2.target)
    expect(result).toBe(11)
    expect(events[0].kind).toBe("init")
    expect(events[events.length - 1].kind).toBe("final")
    expect(events[events.length - 1].probes).toBe(2)
    expect(events.filter((e) => e.kind === "probe").length).toBe(1) // 1 невдала + 1 found
    expect(events.some((e) => e.kind === "found")).toBe(true)
  })

  it("ключ поза діапазоном: guard_exit, 0 проб", () => {
    const { result, events } = interpolationSearchSteps(IP_ABSENT_OUT.values, IP_ABSENT_OUT.target)
    expect(result).toBe(-1)
    expect(events.some((e) => e.kind === "guard_exit")).toBe(true)
    expect(events.every((e) => e.kind !== "probe")).toBe(true)
    expect(events[events.length - 1].probes).toBe(0)
  })

  it("ключ усередині, але відсутній: guard_exit «below» після 1 проби", () => {
    const { result, events } = interpolationSearchSteps(IP_ABSENT_IN.values, IP_ABSENT_IN.target)
    expect(result).toBe(-1)
    const guard = events.find((e) => e.kind === "guard_exit")
    expect(guard?.reason).toBe("below")
    expect(events[events.length - 1].probes).toBe(1)
  })

  it("кожна проба несе дані прямої-моделі (frac ∈ [0,1], index, межі)", () => {
    const { events } = interpolationSearchSteps(IP_DEMO2.values, IP_DEMO2.target)
    const probe = events.find((e) => e.kind === "probe")!
    expect(probe.frac).not.toBeNull()
    expect(probe.frac!).toBeGreaterThanOrEqual(0)
    expect(probe.frac!).toBeLessThanOrEqual(1)
    expect(probe.index).toBe(10)
    expect(probe.loVal).toBe(1)
    expect(probe.hiVal).toBe(30)
    expect(probe.compare).toBe("lt")
    expect(probe.decision).toBe("right")
  })

  it("усі однакові [7,7,7,7]→7: found через вироджений діапазон", () => {
    const { result, events } = interpolationSearchSteps(IP_ALL_EQUAL.values, IP_ALL_EQUAL.target)
    expect(result).toBe(0)
    expect(events.some((e) => e.kind === "found")).toBe(true)
  })
})

describe("caseAnalysis + isSorted", () => {
  it("best 1, worst n, двійковий ⌊log₂n⌋+1", () => {
    const c = caseAnalysis(IP_DEMO1.values) // n = 10
    expect(c.best).toBe(1)
    expect(c.worst).toBe(10)
    expect(c.binary).toBe(Math.floor(Math.log2(10)) + 1)
    expect(c.avgUniform).toBeLessThan(c.binary)
  })

  it("isSorted: передумова коректності", () => {
    expect(isSorted(IP_DEMO1.values)).toBe(true)
    expect(isSorted([3, 1, 2])).toBe(false)
  })
})
