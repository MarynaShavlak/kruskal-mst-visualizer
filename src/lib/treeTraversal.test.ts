import { describe, it, expect } from "vitest"
import {
  buildTree,
  countLeaves,
  inorder,
  layoutTree,
  nodeCount,
  postorder,
  preorder,
  traverse,
  treeHeight,
  treeTraversalSteps,
  TRAVERSAL_ORDERS,
} from "@/lib/treeTraversal"
import {
  BT_BST_INORDER,
  BT_BST_LEVELS,
  BT_CHAIN_LEVELS,
  BT_FULL_LEVELS,
  BT_INTRO_LEVELS,
  BT_INTRO_ORDERS,
  BT_INTRO_STATS,
} from "@/lib/exampleTreeTraversal"

describe("buildTree (рівнева серіалізація)", () => {
  it("головний приклад: корінь 1, діти 2/3, у 2 діти 4/5", () => {
    const t = buildTree(BT_INTRO_LEVELS)
    expect(t.root).toBe(0)
    expect(nodeCount(t)).toBe(5)
    const root = t.nodes[0]
    expect(root.value).toBe(1)
    expect(root.parent).toBeNull()
    expect(root.depth).toBe(0)
    const left = t.nodes[root.left as number]
    const right = t.nodes[root.right as number]
    expect(left.value).toBe(2)
    expect(right.value).toBe(3)
    expect(left.depth).toBe(1)
    // у 2 дві дитини (4,5), у 3 — жодної (лист)
    expect(t.nodes[left.left as number].value).toBe(4)
    expect(t.nodes[left.right as number].value).toBe(5)
    expect(right.left).toBeNull()
    expect(right.right).toBeNull()
  })

  it("порожній список / null-корінь → порожнє дерево", () => {
    expect(buildTree([]).root).toBeNull()
    expect(buildTree([null]).root).toBeNull()
    expect(nodeCount(buildTree([])).valueOf()).toBe(0)
  })

  it("несиметричне дерево: null-слот не породжує піддерева", () => {
    // корінь 1, ліва null, права 3 → у 1 лише правий син
    const t = buildTree([1, null, 3])
    expect(t.nodes[0].left).toBeNull()
    expect(t.nodes[t.nodes[0].right as number].value).toBe(3)
    expect(nodeCount(t)).toBe(2)
  })

  it("вироджений «ланцюг» лише лівих дітей: висота = n−1, один лист", () => {
    const t = buildTree(BT_CHAIN_LEVELS)
    expect(nodeCount(t)).toBe(5)
    expect(treeHeight(t)).toBe(4)
    expect(countLeaves(t)).toBe(1)
  })
})

describe("три обходи (головний приклад)", () => {
  const t = buildTree(BT_INTRO_LEVELS)

  it("прямий (preorder): корінь → ліве → праве", () => {
    expect(preorder(t)).toEqual(BT_INTRO_ORDERS.preorder)
  })

  it("центровий (inorder): ліве → корінь → праве", () => {
    expect(inorder(t)).toEqual(BT_INTRO_ORDERS.inorder)
  })

  it("зворотний (postorder): ліве → праве → корінь", () => {
    expect(postorder(t)).toEqual(BT_INTRO_ORDERS.postorder)
  })

  it("traverse-диспетчер збігається з іменованими функціями", () => {
    expect(traverse(t, "preorder")).toEqual(preorder(t))
    expect(traverse(t, "inorder")).toEqual(inorder(t))
    expect(traverse(t, "postorder")).toEqual(postorder(t))
  })

  it("кожен обхід відвідує КОЖЕН вузол рівно один раз", () => {
    for (const order of TRAVERSAL_ORDERS) {
      const seq = traverse(t, order)
      expect(seq).toHaveLength(nodeCount(t))
      expect([...seq].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5])
    }
  })
})

describe("центровий обхід BST → відсортована послідовність", () => {
  it("inorder(BST) = 2,4,6,8,10,12,14 (родзинка обходів)", () => {
    const t = buildTree(BT_BST_LEVELS)
    expect(inorder(t)).toEqual([...BT_BST_INORDER])
  })
})

describe("метрики дерева", () => {
  it("головний приклад: 5 вузлів, 3 листки, висота 2", () => {
    const t = buildTree(BT_INTRO_LEVELS)
    expect(nodeCount(t)).toBe(BT_INTRO_STATS.nodes)
    expect(countLeaves(t)).toBe(BT_INTRO_STATS.leaves)
    expect(treeHeight(t)).toBe(BT_INTRO_STATS.height)
  })

  it("повне дерево з 7 вузлів: 4 листки, висота 2", () => {
    const t = buildTree(BT_FULL_LEVELS)
    expect(nodeCount(t)).toBe(7)
    expect(countLeaves(t)).toBe(4)
    expect(treeHeight(t)).toBe(2)
  })

  it("порожнє дерево: висота −1", () => {
    expect(treeHeight(buildTree([]))).toBe(-1)
  })
})

describe("layoutTree (розкладка для SVG)", () => {
  it("колонки призначені за inorder — без накладань, зростають зліва направо", () => {
    const t = buildTree(BT_INTRO_LEVELS)
    const { nodes, cols, rows } = layoutTree(t)
    expect(cols).toBe(5)
    expect(rows).toBe(3) // висота 2 → 3 рядки
    // gridX унікальні (немає двох вузлів у тій самій колонці)
    const xs = nodes.map((n) => n.gridX)
    expect(new Set(xs).size).toBe(xs.length)
    // gridY = глибина
    for (const n of nodes) expect(n.gridY).toBe(n.depth)
  })

  it("порожнє дерево → порожня розкладка", () => {
    expect(layoutTree(buildTree([])).nodes).toHaveLength(0)
  })
})

describe("treeTraversalSteps (журнал подій)", () => {
  const t = buildTree(BT_INTRO_LEVELS)

  it("output журналу збігається з базовим обходом (усі три порядки)", () => {
    for (const order of TRAVERSAL_ORDERS) {
      const { output } = treeTraversalSteps(t, order)
      expect(output).toEqual(traverse(t, order))
    }
  })

  it("стек рекурсії ніколи не глибший за висоту+1 і завжди валідний", () => {
    const { events } = treeTraversalSteps(t, "preorder")
    for (const ev of events) {
      expect(ev.stack.length).toBeLessThanOrEqual(treeHeight(t) + 1)
    }
  })

  it("кількість викликів = 2n+1 (enter n + base n+1)", () => {
    const { events, calls } = treeTraversalSteps(t, "preorder")
    const enters = events.filter((e) => e.kind === "enter").length
    const bases = events.filter((e) => e.kind === "base").length
    expect(enters).toBe(5)
    expect(bases).toBe(6) // n+1 порожніх дітей
    expect(calls).toBe(11)
  })

  it("visit-події з'являються у порядку обходу; visited = порядок вузлів", () => {
    const { events, visitedOrder } = treeTraversalSteps(t, "inorder")
    const visitValues = events
      .filter((e) => e.kind === "visit")
      .map((e) => t.nodes[e.nodeId as number].value)
    expect(visitValues).toEqual(BT_INTRO_ORDERS.inorder)
    expect(visitedOrder.map((id) => t.nodes[id].value)).toEqual(BT_INTRO_ORDERS.inorder)
  })

  it("для КОЖНОГО справжнього вузла є enter і leave; leave після його visit", () => {
    const { events } = treeTraversalSteps(t, "postorder")
    for (const node of t.nodes) {
      const enterIdx = events.findIndex((e) => e.kind === "enter" && e.nodeId === node.id)
      const visitIdx = events.findIndex((e) => e.kind === "visit" && e.nodeId === node.id)
      const leaveIdx = events.findIndex((e) => e.kind === "leave" && e.nodeId === node.id)
      expect(enterIdx).toBeGreaterThanOrEqual(0)
      expect(leaveIdx).toBeGreaterThan(enterIdx)
      // у postorder visit безпосередньо перед leave
      expect(visitIdx).toBeLessThan(leaveIdx)
    }
  })
})
