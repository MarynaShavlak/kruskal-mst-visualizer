import { describe, it, expect } from "vitest"
import { DSU } from "@/lib/dsu"

describe("DSU", () => {
  it("кожен елемент спершу сам собі корінь", () => {
    const dsu = new DSU(["A", "B", "C"])
    expect(dsu.findRoot("A")).toBe("A")
    expect(dsu.componentCount()).toBe(3)
  })

  it("union зʼєднує множини", () => {
    const dsu = new DSU(["A", "B", "C"])
    expect(dsu.connected("A", "B")).toBe(false)
    const r = dsu.union("A", "B")
    expect(r.merged).toBe(true)
    expect(dsu.connected("A", "B")).toBe(true)
    expect(dsu.componentCount()).toBe(2)
  })

  it("повторний union у тій самій множині не обʼєднує", () => {
    const dsu = new DSU(["A", "B"])
    dsu.union("A", "B")
    const r = dsu.union("A", "B")
    expect(r.merged).toBe(false)
    expect(r.attached).toBeNull()
  })

  it("union-by-rank: дерево меншого рангу чіпляється під більше", () => {
    const dsu = new DSU(["A", "B", "C", "D"])
    dsu.union("A", "B") // рівні ранги → корінь A, rank(A)=1
    dsu.union("C", "D") // рівні ранги → корінь C, rank(C)=1
    const r = dsu.union("A", "C") // рівні ранги (1) → корінь A, rank(A)=2
    expect(r.merged).toBe(true)
    expect(r.root).toBe("A")
    expect(r.rankIncreased).toBe(true)
    expect(dsu.findRoot("D")).toBe("A")
    expect(dsu.componentCount()).toBe(1)
  })

  it("path compression: find стискає шлях до кореня", () => {
    const dsu = new DSU(["A", "B", "C", "D"])
    dsu.union("A", "B") // корінь A, B→A
    dsu.union("C", "D") // корінь C, D→C
    dsu.union("A", "C") // корінь A, C→A  ⇒ глибина 2: D→C→A

    const before = dsu.find("D")
    expect(before.root).toBe("A")
    expect(before.path).toEqual(["D", "C", "A"])
    expect(before.compressed).toContain("D")

    const after = dsu.find("D") // після стиснення — прямий шлях
    expect(after.path).toEqual(["D", "A"])
    expect(after.compressed).toEqual([])
  })

  it("find невідомого елемента кидає помилку", () => {
    const dsu = new DSU(["A"])
    expect(() => dsu.find("Z")).toThrow()
  })

  it("snapshot повертає копію parent/rank", () => {
    const dsu = new DSU(["A", "B"])
    dsu.union("A", "B")
    const snap = dsu.snapshot()
    expect(Object.keys(snap.parent).sort()).toEqual(["A", "B"])
    expect(snap.rank).toHaveProperty("A")
  })
})
