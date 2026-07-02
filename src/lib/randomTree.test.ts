import { describe, it, expect } from "vitest"
import { randomTree } from "@/lib/randomTree"
import { buildTree, nodeCount } from "@/lib/treeTraversal"

describe("randomTree", () => {
  it("детермінований за seed (однаковий seed → однакове дерево)", () => {
    expect(randomTree({ seed: 42 })).toEqual(randomTree({ seed: 42 }))
  })

  it("різні seed зазвичай дають різні дерева", () => {
    expect(randomTree({ seed: 1 })).not.toEqual(randomTree({ seed: 2 }))
  })

  it("дає рівно `count` вузлів валідного двійкового дерева", () => {
    const levels = randomTree({ seed: 7, count: 9 })
    const t = buildTree(levels)
    expect(nodeCount(t)).toBe(9)
    // кожен вузол має ≤2 дітей і рівно одного батька (крім кореня)
    const parents = t.nodes.filter((n) => n.parent === null)
    expect(parents).toHaveLength(1)
  })

  it("значення — перестановка 1..count", () => {
    const levels = randomTree({ seed: 3, count: 8 })
    const vals = levels.filter((v): v is number => v !== null).sort((a, b) => a - b)
    expect(vals).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it("кламп кількості до [1, 15]", () => {
    expect(buildTree(randomTree({ seed: 1, count: 100 })).nodes.length).toBe(15)
    expect(buildTree(randomTree({ seed: 1, count: 0 })).nodes.length).toBe(1)
  })

  it("немає хвостових null у серіалізації", () => {
    const levels = randomTree({ seed: 5, count: 10 })
    expect(levels[levels.length - 1]).not.toBeNull()
  })
})
