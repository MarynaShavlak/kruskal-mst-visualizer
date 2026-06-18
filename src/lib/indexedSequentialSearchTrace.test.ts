import { describe, it, expect } from "vitest"
import {
  buildIndexedSequentialSearchTrace,
  BASE_CODE,
  LINEAR_INDEX_CODE,
} from "@/lib/indexedSequentialSearchTrace"
import {
  IXS_MAIN,
  IXS_IN_INDEX,
  IXS_BLOCK_ABSENT,
  IXS_ALL,
} from "@/lib/exampleIndexedSequentialSearch"

describe("buildIndexedSequentialSearchTrace — головний приклад (двійковий індекс)", () => {
  const trace = buildIndexedSequentialSearchTrace(IXS_MAIN.values, IXS_MAIN.target, IXS_MAIN.step)

  it("15 кадрів = step_00…step_14 повного трасування README", () => {
    expect(trace.frames.length).toBe(15)
    expect(trace.frames.map((f) => f.phase)).toEqual([
      "init",
      "probe", "discard", // фаза 1, зондування 1
      "probe", "discard", // фаза 1, зондування 2
      "block",            // вибір блоку (general)
      "scan", "reject",   // array[4]
      "scan", "reject",   // array[5]
      "scan", "reject",   // array[6]
      "scan", "found",    // array[7] = 15
      "done",
    ])
  })

  it("результат і лічильники — еталон (позиція 7, 2 зондування + 4 порівняння = 6)", () => {
    expect(trace.result.result).toBe(7)
    expect(trace.result.indexProbes).toBe(2)
    expect(trace.result.seqComparisons).toBe(4)
    expect(trace.result.total).toBe(6)
    expect(trace.result.found).toBe(true)
    expect(trace.result.branch).toBe("general")
    expect(trace.code).toBe(BASE_CODE)
  })

  it("фаза 1: проби на стовпах mid 1,2; вікно індексу звужується", () => {
    const probes = trace.frames.filter((f) => f.phase === "probe")
    expect(probes.map((f) => f.idxMid)).toEqual([1, 2])
    expect(probes.map((f) => [f.idxLow, f.idxHigh])).toEqual([[0, 3], [2, 3]])
    expect(probes.map((f) => f.idxKey)).toEqual([9, 17])
  })

  it("вибір блоку: загальна гілка → [4, 8); фаза 2 курсор по 4,5,6,7", () => {
    const block = trace.frames.find((f) => f.phase === "block")!
    expect([block.blockLo, block.blockHi]).toEqual([4, 8])
    const scans = trace.frames.filter((f) => f.phase === "scan")
    expect(scans.map((f) => f.cursor)).toEqual([4, 5, 6, 7])
    expect(scans.map((f) => f.value)).toEqual([9, 11, 13, 15])
  })

  it("масив незмінний; лічильники монотонні; підписи непорожні", () => {
    let probes = 0
    let seq = 0
    for (const f of trace.frames) {
      expect(f.array).toEqual([...IXS_MAIN.values])
      expect(f.caption.length).toBeGreaterThan(0)
      expect(f.indexProbes).toBeGreaterThanOrEqual(probes)
      expect(f.seqComparisons).toBeGreaterThanOrEqual(seq)
      probes = f.indexProbes
      seq = f.seqComparisons
    }
  })
})

describe("buildIndexedSequentialSearchTrace — варіанти й крайові випадки", () => {
  it("IN_INDEX: збіг у самому індексі → init+probe+found+done (4 кадри), позиція 4", () => {
    const trace = buildIndexedSequentialSearchTrace(IXS_IN_INDEX.values, IXS_IN_INDEX.target, IXS_IN_INDEX.step)
    expect(trace.frames.map((f) => f.phase)).toEqual(["init", "probe", "found", "done"])
    expect(trace.result.result).toBe(4)
    expect(trace.result.indexProbes).toBe(1)
    expect(trace.result.seqComparisons).toBe(0)
    expect(trace.frames.find((f) => f.phase === "found")!.level).toBe("index")
  })

  it("BLOCK_ABSENT: 15 кадрів, -1, скан усього блоку (4 порівняння)", () => {
    const trace = buildIndexedSequentialSearchTrace(IXS_BLOCK_ABSENT.values, IXS_BLOCK_ABSENT.target, IXS_BLOCK_ABSENT.step)
    expect(trace.result.result).toBe(-1)
    expect(trace.result.found).toBe(false)
    expect(trace.result.seqComparisons).toBe(4)
    expect(trace.frames[trace.frames.length - 1].phase).toBe("done")
  })

  it("ЛІНІЙНИЙ індекс: той самий результат і ті самі порівняння в блоці; більше зондувань", () => {
    const bin = buildIndexedSequentialSearchTrace(IXS_MAIN.values, IXS_MAIN.target, IXS_MAIN.step, false)
    const lin = buildIndexedSequentialSearchTrace(IXS_MAIN.values, IXS_MAIN.target, IXS_MAIN.step, true)
    expect(lin.code).toBe(LINEAR_INDEX_CODE)
    expect(lin.result.result).toBe(bin.result.result) // 7
    expect(lin.result.seqComparisons).toBe(bin.result.seqComparisons) // 4 — фаза 2 ідентична
    expect(lin.result.indexProbes).toBe(3) // лінійно дорожча фаза 1 (vs 2 двійково)
    expect(lin.result.indexProbes).toBeGreaterThan(bin.result.indexProbes)
    expect(lin.frames.length).toBe(17) // init + 3·2 + block + 4·2 + done
  })

  it("обидва режими дають той самий індекс на всіх інстансах", () => {
    for (const c of IXS_ALL) {
      const bin = buildIndexedSequentialSearchTrace(c.values, c.target, c.step, false)
      const lin = buildIndexedSequentialSearchTrace(c.values, c.target, c.step, true)
      expect(lin.result.result).toBe(bin.result.result)
      expect(lin.result.seqComparisons).toBe(bin.result.seqComparisons)
    }
  })
})

describe("лістинги коду", () => {
  it("BASE_CODE: двійковий — while start <= end, обидві функції", () => {
    expect(BASE_CODE.some((l) => l.includes("while start <= end"))).toBe(true)
    expect(BASE_CODE.some((l) => l.includes("def create_index_table"))).toBe(true)
    expect(BASE_CODE.some((l) => l.includes("return -1"))).toBe(true)
  })
  it("LINEAR_INDEX_CODE: лінійний прохід — while start < len(table)", () => {
    expect(LINEAR_INDEX_CODE.some((l) => l.includes("while start < len(table)"))).toBe(true)
  })
})
