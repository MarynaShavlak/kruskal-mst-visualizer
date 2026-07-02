import { describe, it, expect } from "vitest"
import {
  buildTreeTraversalTrace,
  BT_PREORDER_CODE,
  BT_INORDER_CODE,
  BT_POSTORDER_CODE,
  codeFor,
} from "@/lib/treeTraversalTrace"
import { TRAVERSAL_ORDERS } from "@/lib/treeTraversal"
import {
  BT_INTRO_LEVELS,
  BT_INTRO_ORDERS,
  BT_INTRO_STATS,
} from "@/lib/exampleTreeTraversal"

describe("buildTreeTraversalTrace (головний приклад)", () => {
  const trace = buildTreeTraversalTrace(BT_INTRO_LEVELS, "preorder")

  it("23 кадри (4·n+3); перший init, останній done", () => {
    expect(trace.frames.length).toBe(BT_INTRO_STATS.frames)
    expect(trace.frames[0].kind).toBe("init")
    expect(trace.frames[trace.frames.length - 1].kind).toBe("done")
  })

  it("індекс кадру i збігається з позицією в списку", () => {
    trace.frames.forEach((f, i) => expect(f.i).toBe(i))
  })

  it("підсумок — еталон (5 вузлів / 3 листки / висота 2 / preorder-послідовність)", () => {
    expect(trace.result.nodes).toBe(BT_INTRO_STATS.nodes)
    expect(trace.result.leaves).toBe(BT_INTRO_STATS.leaves)
    expect(trace.result.height).toBe(BT_INTRO_STATS.height)
    expect(trace.result.output).toEqual(BT_INTRO_ORDERS.preorder)
    expect(trace.result.order).toBe("preorder")
    expect(trace.result.calls).toBe(11) // 2n+1
  })

  it("кожен кадр має непорожню нарацію; output монотонно росте; ≤ n", () => {
    let prevLen = 0
    for (const f of trace.frames) {
      expect(f.caption.length).toBeGreaterThan(0)
      expect(f.output.length).toBeGreaterThanOrEqual(prevLen)
      expect(f.output.length).toBeLessThanOrEqual(BT_INTRO_STATS.nodes)
      expect(f.calls).toBeGreaterThanOrEqual(0)
      prevLen = f.output.length
    }
  })

  it("фінальний output кадру = повний preorder-обхід", () => {
    const done = trace.frames[trace.frames.length - 1]
    expect(done.output).toEqual(BT_INTRO_ORDERS.preorder)
    expect(done.visits).toBe(BT_INTRO_STATS.nodes)
  })

  it("justVisited ненульовий лише на visit-кадрах, у порядку обходу", () => {
    const visitedVals = trace.frames
      .filter((f) => f.justVisited !== null)
      .map((f) => f.justVisited as number)
    // перший відвіданий у preorder — корінь (id 0)
    expect(visitedVals[0]).toBe(0)
    // не-visit кадри не мають justVisited
    for (const f of trace.frames) {
      if (f.kind !== "visit") expect(f.justVisited).toBeNull()
    }
  })

  it("кадр enter підсвічує перевірку None; visit — рядок visit(node.val)", () => {
    const enter = trace.frames.find((f) => f.kind === "enter")!
    expect(enter.lines).toContain(2)
    const visit = trace.frames.find((f) => f.kind === "visit")!
    expect(visit.lines).toEqual([4]) // preorder: visit на рядку 4
  })

  it("кадри base трапляються для порожніх дітей (n+1 разів)", () => {
    const bases = trace.frames.filter((f) => f.kind === "base")
    expect(bases).toHaveLength(6)
    for (const b of bases) {
      expect(b.nodeId).toBeNull()
      expect(b.lines).toEqual([2, 3])
    }
  })
})

describe("buildTreeTraversalTrace — усі три порядки", () => {
  it("output кадру done збігається з еталонною послідовністю кожного порядку", () => {
    for (const order of TRAVERSAL_ORDERS) {
      const trace = buildTreeTraversalTrace(BT_INTRO_LEVELS, order)
      const done = trace.frames[trace.frames.length - 1]
      expect(done.output).toEqual(BT_INTRO_ORDERS[order])
      expect(trace.result.output).toEqual(BT_INTRO_ORDERS[order])
    }
  })

  it("кількість кадрів однакова для всіх порядків (структура та сама)", () => {
    const counts = TRAVERSAL_ORDERS.map(
      (o) => buildTreeTraversalTrace(BT_INTRO_LEVELS, o).frames.length,
    )
    expect(counts).toEqual([23, 23, 23])
  })

  it("visit-рядок коду залежить від порядку (4 / 5 / 6)", () => {
    const pre = buildTreeTraversalTrace(BT_INTRO_LEVELS, "preorder").frames.find((f) => f.kind === "visit")!
    const ino = buildTreeTraversalTrace(BT_INTRO_LEVELS, "inorder").frames.find((f) => f.kind === "visit")!
    const post = buildTreeTraversalTrace(BT_INTRO_LEVELS, "postorder").frames.find((f) => f.kind === "visit")!
    expect(pre.lines).toEqual([4])
    expect(ino.lines).toEqual([5])
    expect(post.lines).toEqual([6])
  })
})

describe("порожнє дерево", () => {
  it("trace = init + base + done (3 кадри = 4·0+3), порожній output", () => {
    const trace = buildTreeTraversalTrace([], "preorder")
    expect(trace.frames).toHaveLength(3)
    expect(trace.frames.map((f) => f.kind)).toEqual(["init", "base", "done"])
    expect(trace.result.output).toEqual([])
    expect(trace.result.nodes).toBe(0)
  })
})

describe("лістинги коду", () => {
  it("codeFor повертає лістинг за порядком", () => {
    expect(codeFor("preorder")).toBe(BT_PREORDER_CODE)
    expect(codeFor("inorder")).toBe(BT_INORDER_CODE)
    expect(codeFor("postorder")).toBe(BT_POSTORDER_CODE)
  })

  it("кожен лістинг має базу None, три частини й visit у правильному місці", () => {
    expect(BT_PREORDER_CODE.some((l) => l.includes("if node is None"))).toBe(true)
    // preorder: visit ПЕРЕД рекурсіями
    expect(BT_PREORDER_CODE[3]).toContain("visit(node.val)")
    // inorder: visit МІЖ рекурсіями
    expect(BT_INORDER_CODE[4]).toContain("visit(node.val)")
    // postorder: visit ПІСЛЯ рекурсій
    expect(BT_POSTORDER_CODE[5]).toContain("visit(node.val)")
  })
})
