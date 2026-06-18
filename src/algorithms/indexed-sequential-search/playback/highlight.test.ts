import { describe, it, expect } from "vitest"
import {
  indexRole,
  cellRole,
  type IndexState,
  type CellState,
} from "@/algorithms/indexed-sequential-search/playback/highlight"

const idx = (over: Partial<IndexState> = {}): IndexState => ({
  idxLow: null, idxHigh: null, idxMid: null, probing: false,
  idxDiscardLo: null, idxDiscardHi: null, indexFound: false,
  blockLo: null, blockHi: null, ...over,
})

const cell = (over: Partial<CellState> = {}): CellState => ({
  blockLo: null, blockHi: null, cursor: null, phase: "init", result: -1, resolved: false, ...over,
})

// Індексна таблиця головного прикладу: стовпи на позиціях 0,4,8,12.
const POS = [0, 4, 8, 12]

describe("indexRole — стовпи індексу (фаза 1)", () => {
  it("проба: mid рожевий, решта вікна блакитна", () => {
    const s = idx({ idxLow: 0, idxHigh: 3, idxMid: 1, probing: true })
    expect(indexRole(1, POS[1], s)).toBe("probe")
    expect(indexRole(0, POS[0], s)).toBe("window")
    expect(indexRole(3, POS[3], s)).toBe("window")
  })

  it("відкидання лівої половини: стовпи [0..1] червоні, нове вікно [2..3]", () => {
    const s = idx({ idxLow: 2, idxHigh: 3, idxMid: 1, idxDiscardLo: 0, idxDiscardHi: 1 })
    expect(indexRole(0, POS[0], s)).toBe("discarding")
    expect(indexRole(1, POS[1], s)).toBe("discarding")
    expect(indexRole(2, POS[2], s)).toBe("window")
  })

  it("збіг у індексі: стовп mid зелений", () => {
    const s = idx({ idxLow: 0, idxHigh: 3, idxMid: 1, indexFound: true })
    expect(indexRole(1, POS[1], s)).toBe("found")
  })

  it("фаза 2 (вікно null): стовпи-межі блоку блакитні, решта тьмяні", () => {
    const s = idx({ blockLo: 4, blockHi: 8 }) // блок [4,8): межі — стовпи на pos 4 і 8
    expect(indexRole(1, 4, s)).toBe("boundary")
    expect(indexRole(2, 8, s)).toBe("boundary")
    expect(indexRole(0, 0, s)).toBe("out")
    expect(indexRole(3, 12, s)).toBe("out")
  })
})

describe("cellRole — комірки масиву (фаза 1 + фаза 2)", () => {
  it("фаза 1 (блок не обрано): усі нейтральні (idle)", () => {
    const s = cell({ phase: "probe" })
    expect([0, 5, 12].map((i) => cellRole(i, s))).toEqual(["idle", "idle", "idle"])
  })

  it("вибір блоку [4,8): комірки блоку активні, поза блоком тьмяні", () => {
    const s = cell({ blockLo: 4, blockHi: 8, phase: "block" })
    expect([4, 5, 6, 7].map((i) => cellRole(i, s))).toEqual(["block", "block", "block", "block"])
    expect([0, 3, 8, 12].map((i) => cellRole(i, s))).toEqual(["out", "out", "out", "out"])
  })

  it("скан i=6: пройдені 4,5 відкинуті, 6 — курсор, 7 — ще в блоці", () => {
    const s = cell({ blockLo: 4, blockHi: 8, cursor: 6, phase: "scan" })
    expect(cellRole(4, s)).toBe("rejected")
    expect(cellRole(5, s)).toBe("rejected")
    expect(cellRole(6, s)).toBe("cursor")
    expect(cellRole(7, s)).toBe("block")
  })

  it("розв'язок reject на i=6: комірка 6 стає відкинутою ✗", () => {
    const s = cell({ blockLo: 4, blockHi: 8, cursor: 6, phase: "reject" })
    expect(cellRole(6, s)).toBe("rejected")
  })

  it("збіг на позиції 7: зелено ✓ навіть без блоку (фаза index) і в блоці", () => {
    const s = cell({ blockLo: 4, blockHi: 8, cursor: 7, phase: "found", result: 7, resolved: true })
    expect(cellRole(7, s)).toBe("found")
    // збіг у самому індексі: блоку нема, але результат зелений
    const idxFound = cell({ result: 4, resolved: true, phase: "found" })
    expect(cellRole(4, idxFound)).toBe("found")
  })

  it("відсутній (done): курсор=blockHi → весь блок відкинуто ✗", () => {
    const s = cell({ blockLo: 4, blockHi: 8, cursor: 8, phase: "done", result: -1, resolved: true })
    expect([4, 5, 6, 7].map((i) => cellRole(i, s))).toEqual(["rejected", "rejected", "rejected", "rejected"])
  })
})
