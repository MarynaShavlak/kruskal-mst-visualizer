import { describe, it, expect, beforeEach } from "vitest"
import { useTreeTraversalStore, MAX_TREE_LEVELS } from "@/store/tree-traversal-store"
import {
  BT_BST_LEVELS,
  BT_CHAIN_LEVELS,
  BT_FULL_LEVELS,
  BT_INTRO_LEVELS,
} from "@/lib/exampleTreeTraversal"

const get = () => useTreeTraversalStore.getState()

describe("tree-traversal-store", () => {
  beforeEach(() => get().loadIntro())

  it("стартовий стан — класичний еталон із конспекту (прямий обхід)", () => {
    expect(get().levels).toEqual(BT_INTRO_LEVELS)
    expect(get().order).toBe("preorder")
  })

  it("setLevels санітизує: цілі або null, хвостові null обрізаються", () => {
    get().setLevels([1.9, null, 3.2, null, null])
    expect(get().levels).toEqual([1, null, 3]) // Math.trunc
    // нечисло/нескінченність → null
    get().setLevels([1, Number.NaN, Infinity as number, 4])
    expect(get().levels).toEqual([1, null, null, 4])
  })

  it("setLevels обрізає до MAX_TREE_LEVELS", () => {
    const long = Array.from({ length: MAX_TREE_LEVELS + 20 }, (_, i) => i + 1)
    get().setLevels(long)
    expect(get().levels.length).toBe(MAX_TREE_LEVELS)
  })

  it("setOrder перемикає; недозволений → preorder", () => {
    get().setOrder("inorder")
    expect(get().order).toBe("inorder")
    get().setOrder("postorder")
    expect(get().order).toBe("postorder")
    get().setOrder("spiral" as never)
    expect(get().order).toBe("preorder")
  })

  it("clear лишає порожнє дерево й прямий обхід", () => {
    get().setOrder("postorder")
    get().clear()
    expect(get().levels).toEqual([])
    expect(get().order).toBe("preorder")
  })

  it("пресети завантажуються з відповідним порядком", () => {
    get().loadBst()
    expect(get().levels).toEqual(BT_BST_LEVELS)
    expect(get().order).toBe("inorder") // BST + центровий = відсортовано
    get().loadChain()
    expect(get().levels).toEqual(BT_CHAIN_LEVELS)
    get().loadFull()
    expect(get().levels).toEqual(BT_FULL_LEVELS)
  })

  it("випадковий пресет детермінований за seed", () => {
    get().loadRandom(123)
    const a = get().levels
    get().loadIntro()
    get().loadRandom(123)
    expect(get().levels).toEqual(a)
  })

  it("toDoc/loadDoc — round-trip", () => {
    get().loadBst()
    const doc = get().toDoc()
    get().clear()
    get().loadDoc(doc)
    expect(get().levels).toEqual(BT_BST_LEVELS)
    expect(get().order).toBe("inorder")
  })
})
