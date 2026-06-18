import { describe, it, expect } from "vitest"
import {
  createIndexTable,
  indexedSequentialSearch,
  indexedSequentialSearchLinearIndex,
  jumpSearch,
  blockRange,
  branchFor,
  isSorted,
  optimalStep,
  indexedSequentialSearchSteps,
  countSteps,
} from "@/lib/indexedSequentialSearch"
import {
  IXS_MAIN,
  IXS_IN_INDEX,
  IXS_LEFT_ABSENT,
  IXS_RIGHT_ABSENT,
  IXS_BLOCK_FIRST,
  IXS_BLOCK_LAST,
  IXS_BLOCK_ABSENT,
  IXS_DUPLICATES,
  IXS_ALL,
} from "@/lib/exampleIndexedSequentialSearch"

const MAIN = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25]

describe("createIndexTable — розріджені сигнальні стовпи", () => {
  it("кожен step-ий елемент як (ключ, позиція)", () => {
    expect(createIndexTable(MAIN, 4)).toEqual([
      [1, 0], [9, 4], [17, 8], [25, 12],
    ])
    expect(createIndexTable([10, 20, 30], 1)).toEqual([[10, 0], [20, 1], [30, 2]])
    expect(createIndexTable([], 4)).toEqual([])
  })
})

describe("indexedSequentialSearch — еталон коректності з README", () => {
  it("MAIN: 15 → позиція 7", () => {
    const table = createIndexTable(MAIN, 4)
    expect(indexedSequentialSearch(MAIN, table, 15)).toBe(7)
  })

  it("усі канонічні інстанси дають відому позицію", () => {
    const expected = new Map<string, number>([
      ["main", 7], ["in_index", 4], ["left_absent", -1], ["right_absent", -1],
      ["block_first", 1], ["block_last", 11], ["block_absent", -1], ["duplicates", 1],
    ])
    const cases: [typeof IXS_MAIN, number][] = [
      [IXS_MAIN, 7], [IXS_IN_INDEX, 4], [IXS_LEFT_ABSENT, -1], [IXS_RIGHT_ABSENT, -1],
      [IXS_BLOCK_FIRST, 1], [IXS_BLOCK_LAST, 11], [IXS_BLOCK_ABSENT, -1], [IXS_DUPLICATES, 1],
    ]
    for (const [c, want] of cases) {
      const table = createIndexTable(c.values, c.step)
      expect(indexedSequentialSearch(c.values, table, c.target)).toBe(want)
    }
    expect(expected.size).toBe(8)
  })

  it("кожне наявне значення знаходиться; завідомо відсутні → -1", () => {
    const table = createIndexTable(MAIN, 4)
    for (const x of MAIN) expect(MAIN[indexedSequentialSearch(MAIN, table, x)]).toBe(x)
    for (const x of [-5, 2, 100]) expect(indexedSequentialSearch(MAIN, table, x)).toBe(-1)
  })
})

describe("варіант linear-index та родич jump_search — той самий результат", () => {
  it("збігаються з базовою версією на всіх інстансах і кроках", () => {
    for (const c of IXS_ALL) {
      const table = createIndexTable(c.values, c.step)
      const base = indexedSequentialSearch(c.values, table, c.target)
      expect(indexedSequentialSearchLinearIndex(c.values, table, c.target)).toBe(base)
      expect(jumpSearch(c.values, c.target, c.step)).toBe(base)
      expect(jumpSearch(c.values, c.target)).toBe(base) // крок √n за замовч.
    }
  })
})

describe("blockRange / branchFor — три гілки вибору блоку", () => {
  const table = createIndexTable(MAIN, 4) // [(1,0),(9,4),(17,8),(25,12)]
  it("start==0 → лівий/порожній блок", () => {
    expect(branchFor(table, 0)).toBe("start==0")
    expect(blockRange(MAIN, table, 0)).toEqual([0, 0])
  })
  it("start>=len → хвіст", () => {
    expect(branchFor(table, 4)).toBe("start>=len")
    expect(blockRange(MAIN, table, 4)).toEqual([12, 13])
  })
  it("general → блок між сусідніми стовпами", () => {
    expect(branchFor(table, 2)).toBe("general")
    expect(blockRange(MAIN, table, 2)).toEqual([4, 8])
  })
})

describe("isSorted / optimalStep — передумова й баланс кроку", () => {
  it("isSorted розпізнає впорядкованість", () => {
    expect(isSorted(MAIN)).toBe(true)
    expect(isSorted([3, 1, 2])).toBe(false)
    expect(isSorted([])).toBe(true)
  })
  it("optimalStep ≈ √n", () => {
    expect(optimalStep(100)).toBe(10)
    expect(optimalStep(13)).toBe(4) // round(sqrt(13)) = 4
    expect(optimalStep(0)).toBe(1)
  })
})

describe("countSteps — два доданки (зондування індексу + порівняння в блоці)", () => {
  it("еталонні лічильники з README (база, двійковий індекс)", () => {
    const want: [typeof IXS_MAIN, number, number, number][] = [
      [IXS_MAIN, 2, 4, 6],
      [IXS_IN_INDEX, 1, 0, 1],
      [IXS_LEFT_ABSENT, 2, 0, 2],
      [IXS_RIGHT_ABSENT, 3, 1, 4],
      [IXS_BLOCK_FIRST, 2, 2, 4],
      [IXS_BLOCK_LAST, 3, 4, 7],
      [IXS_BLOCK_ABSENT, 2, 4, 6],
      [IXS_DUPLICATES, 2, 2, 4],
    ]
    for (const [c, ip, sc, tot] of want) {
      expect(countSteps(c.values, c.target, c.step)).toEqual({
        indexProbes: ip, seqComparisons: sc, total: tot,
      })
    }
  })
})

describe("indexedSequentialSearchSteps — журнал подій узгоджений", () => {
  it("init перший, final останній; result і лічильники збігаються", () => {
    for (const c of IXS_ALL) {
      const { result, events } = indexedSequentialSearchSteps(c.values, c.target, c.step)
      expect(events[0].kind).toBe("init")
      expect(events[events.length - 1].kind).toBe("final")
      expect(events[events.length - 1].result).toBe(result)
      expect(events[0].array).toEqual(c.values)
      // рівно один вердикт found / not_found
      const verdicts = events.filter((e) => e.kind === "found" || e.kind === "not_found")
      expect(verdicts.length).toBe(1)
      // лічильники монотонні
      const totals = events.map((e) => e.total)
      expect(totals).toEqual([...totals].sort((a, b) => a - b))
    }
  })

  it("MAIN: дві фази — index_probe×2, block_selected(general), seq_step×3, found", () => {
    const { events } = indexedSequentialSearchSteps(MAIN, 15, 4)
    const kinds = events.map((e) => e.kind)
    expect(kinds.filter((k) => k === "index_probe").length).toBe(2)
    expect(kinds.filter((k) => k === "seq_step").length).toBe(3)
    expect(kinds.filter((k) => k === "block_selected").length).toBe(1)
    const block = events.find((e) => e.kind === "block_selected")!
    expect(block.branch).toBe("general")
    expect(block.searchRange).toEqual([4, 8])
    const found = events.find((e) => e.kind === "found")!
    expect(found.phase).toBe("block")
    expect(found.result).toBe(7)
  })

  it("IN_INDEX: збіг у самому індексі (phase index, 0 порівнянь у блоці)", () => {
    const { result, events } = indexedSequentialSearchSteps(MAIN, 9, 4)
    expect(result).toBe(4)
    const found = events.find((e) => e.kind === "found")!
    expect(found.phase).toBe("index")
    expect(events.every((e) => e.kind !== "block_selected")).toBe(true)
    expect(events[events.length - 1].seqComparisons).toBe(0)
  })

  it("не змінює вхідний масив", () => {
    const arr = [...MAIN]
    indexedSequentialSearchSteps(arr, 15, 4)
    expect(arr).toEqual(MAIN)
  })
})
