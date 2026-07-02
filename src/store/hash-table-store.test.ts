import { describe, it, expect, beforeEach } from "vitest"
import { useHashTableStore } from "@/store/hash-table-store"
import {
  HT_INTRO_OPS,
  HT_INTRO_CAPACITY,
  HT_ANAGRAMS_OPS,
  HT_ADVERSARIAL_OPS,
} from "@/lib/exampleHashTable"

const get = () => useHashTableStore.getState()

describe("hash-table-store", () => {
  beforeEach(() => get().loadClassic())

  it("стартовий стан — класичний еталон (скрипт + місткість + хеш)", () => {
    expect(get().ops).toEqual(HT_INTRO_OPS)
    expect(get().capacity).toBe(HT_INTRO_CAPACITY)
    expect(get().hashFn).toBe("sum")
  })

  it("addOp додає insert канонічного ключа; addOp('get') додає get без value", () => {
    const n = get().ops.length
    get().addOp()
    expect(get().ops[n]).toEqual({ kind: "insert", key: `key${n + 1}`, value: 0 })
    get().addOp("get")
    expect(get().ops[n + 1]).toEqual({ kind: "get", key: `key${n + 2}` })
  })

  it("updateOp санітизує kind (недозволений → insert) і value (ціле)", () => {
    get().updateOp(0, { value: 3.9 })
    expect(get().ops[0]).toEqual({ kind: "insert", key: "apple", value: 3 })
    // недозволений kind → insert; get скидає value
    get().updateOp(1, { kind: "bogus" as never })
    expect(get().ops[1].kind).toBe("insert")
    get().updateOp(2, { kind: "get" })
    expect(get().ops[2]).toEqual({ kind: "get", key: "banana" })
  })

  it("removeOp прибирає операцію за індексом", () => {
    const before = get().ops.length
    get().removeOp(0)
    expect(get().ops.length).toBe(before - 1)
    expect(get().ops[0].key).toBe("orange")
  })

  it("setCapacity тримає ціле ≥ 1; setHashFn/setStrategy перемикають", () => {
    get().setCapacity(0)
    expect(get().capacity).toBe(1)
    get().setCapacity(12.7)
    expect(get().capacity).toBe(12)
    get().setHashFn("poly")
    expect(get().hashFn).toBe("poly")
    expect(get().strategy).toBe("chaining") // стартова стратегія
    get().setStrategy("linear")
    expect(get().strategy).toBe("linear")
  })

  it("clear лишає порожній скрипт, безпечну місткість і стратегію chaining", () => {
    get().setStrategy("linear")
    get().clear()
    expect(get().ops).toEqual([])
    expect(get().capacity).toBe(5)
    expect(get().hashFn).toBe("sum")
    expect(get().strategy).toBe("chaining")
  })

  it("пресет «Зловмисний» вмикає погану хеш-функцію firstChar", () => {
    get().loadAdversarial()
    expect(get().ops).toEqual(HT_ADVERSARIAL_OPS)
    expect(get().hashFn).toBe("firstChar")
  })

  it("setHashFn приймає погані функції (firstChar/zero)", () => {
    get().setHashFn("firstChar")
    expect(get().hashFn).toBe("firstChar")
    get().setHashFn("zero")
    expect(get().hashFn).toBe("zero")
  })

  it("пресети завантажуються (анаграми + випадковий детермінований)", () => {
    get().loadAnagrams()
    expect(get().ops).toEqual(HT_ANAGRAMS_OPS)
    get().loadRandom(123)
    const a = get().ops
    expect(a.length).toBe(8) // 6 вставок + влучення + промах
    get().loadClassic()
    get().loadRandom(123)
    expect(get().ops).toEqual(a) // детерміновано за seed
  })

  it("toDoc/loadDoc — round-trip", () => {
    get().loadAnagrams()
    const doc = get().toDoc()
    get().clear()
    get().loadDoc(doc)
    expect(get().ops).toEqual(HT_ANAGRAMS_OPS)
    expect(get().hashFn).toBe(doc.hashFn)
  })
})
