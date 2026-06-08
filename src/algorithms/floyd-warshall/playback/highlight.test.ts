import { describe, it, expect } from "vitest"
import { abcdefGraph } from "@/lib/exampleDirectedGraph"
import { buildFloydWarshallTrace } from "@/lib/floydWarshallTrace"
import { cellFormula, cellRole, relaxationsUpTo } from "./highlight"

const { trace, result } = buildFloydWarshallTrace(abcdefGraph())
const lastIndex = trace.frames.length - 1

describe("cellRole", () => {
  it("на стартовому кадрі (init) жодна клітинка не підсвічена", () => {
    const init = trace.frames[0]
    expect(init.sub.kind).toBe("init")
    for (let r = 0; r < result.order.length; r++) {
      for (let c = 0; c < result.order.length; c++) {
        const role = cellRole(init, r, c)
        expect(role).toEqual({
          pivot: false,
          summand: false,
          target: false,
          improved: false,
        })
      }
    }
  })

  it("на кадрі порівняння активна клітинка — target, доданки — summand, хрест k — pivot", () => {
    const f = trace.frames.find((fr) => fr.sub.kind === "compare")
    expect(f).toBeDefined()
    if (!f || f.sub.kind !== "compare") throw new Error("немає compare-кадру")
    const [i, j] = f.sub.cell
    const k = f.k as number

    // активна клітинка (i, j)
    expect(cellRole(f, i, j).target).toBe(true)
    // доданки D[i][k] та D[k][j]
    expect(cellRole(f, i, k).summand).toBe(true)
    expect(cellRole(f, k, j).summand).toBe(true)
    // увесь рядок k та стовпець k — на хресті півота
    expect(cellRole(f, k, 0).pivot).toBe(true)
    expect(cellRole(f, 0, k).pivot).toBe(true)
  })

  it("на кадрі apply записана клітинка — і target, і improved (зелена)", () => {
    const f = trace.frames.find((fr) => fr.sub.kind === "apply")
    expect(f).toBeDefined()
    if (!f || f.sub.kind !== "apply") throw new Error("немає apply-кадру")
    const [i, j] = f.sub.cell
    const role = cellRole(f, i, j)
    expect(role.target).toBe(true)
    expect(role.improved).toBe(true)
  })
})

describe("cellFormula", () => {
  it("на init/done/open-k формули немає (показуємо загальне правило)", () => {
    expect(cellFormula(trace.frames[0], result.order)).toBeNull()
    expect(cellFormula(trace.frames[trace.frames.length - 1], result.order)).toBeNull()
    const openK = trace.frames.find((f) => f.sub.kind === "open-k")
    if (openK) expect(cellFormula(openK, result.order)).toBeNull()
  })

  it("перша релаксація A–F: D[A][C] = min( ∞, 3 + 1 ) = 4", () => {
    const f = trace.frames.find((fr) => fr.sub.kind === "apply")
    expect(f).toBeDefined()
    if (!f) throw new Error("немає apply-кадру")
    expect(cellFormula(f, result.order)).toEqual({
      target: "D[A][C]",
      termIK: "D[A][B]",
      termKJ: "D[B][C]",
      curr: "∞",
      viaText: "3 + 1",
      result: "4",
      improved: true,
    })
  })

  it("недосяжний доданок дає '∞' і не покращує", () => {
    const f = trace.frames.find(
      (fr) => cellFormula(fr, result.order)?.viaText === "∞",
    )
    expect(f).toBeDefined()
    if (!f) throw new Error("немає кадру з недосяжним доданком")
    const formula = cellFormula(f, result.order)
    expect(formula?.viaText).toBe("∞")
    expect(formula?.improved).toBe(false)
  })
})

describe("relaxationsUpTo", () => {
  it("на старті журнал порожній", () => {
    expect(relaxationsUpTo(trace, 0)).toHaveLength(0)
  })

  it("кількість монотонно не спадає з курсором", () => {
    let prev = 0
    for (let i = 0; i <= lastIndex; i++) {
      const n = relaxationsUpTo(trace, i).length
      expect(n).toBeGreaterThanOrEqual(prev)
      prev = n
    }
  })

  it("підсумкова кількість релаксацій == improvedCount результату", () => {
    expect(relaxationsUpTo(trace, lastIndex)).toHaveLength(result.improvedCount)
  })

  it("кожна релаксація справді зменшує відстань (to < from)", () => {
    for (const r of relaxationsUpTo(trace, lastIndex)) {
      expect(r.to).toBeLessThan(r.from)
    }
  })
})
