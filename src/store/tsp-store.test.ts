import { describe, it, expect, beforeEach } from "vitest"
import { useTspStore } from "@/store/tsp-store"
import { TSP_DEMO_CITIES } from "@/lib/exampleTsp"

const s = () => useTspStore.getState()

describe("tsp-store", () => {
  beforeEach(() => {
    s().clear()
  })

  it("addCityAt додає місто з канонічним ім'ям і координатами; повертає ім'я", () => {
    expect(s().addCityAt(10, 20)).toBe("A")
    expect(s().cities).toEqual([{ name: "A", x: 10, y: 20 }])
    expect(s().addCityAt(3, 4)).toBe("B")
    expect(s().cities[1]).toEqual({ name: "B", x: 3, y: 4 })
  })

  it("moveCity змінює координати міста за індексом", () => {
    s().addCityAt(0, 0)
    s().moveCity(0, 7, 9)
    expect(s().cities[0]).toEqual({ name: "A", x: 7, y: 9 })
  })

  it("removeCity: старт їде за своїм містом при видаленні раніших", () => {
    s().loadExample() // A..E, start = 0
    s().setStart(3) // D
    s().removeCity(1) // прибрали B (індекс < start)
    expect(s().cities.map((c) => c.name)).toEqual(["A", "C", "D", "E"])
    expect(s().start).toBe(2) // D тепер на індексі 2
  })

  it("removeCity: видалення самого старту відкочує його на перше місто", () => {
    s().loadExample()
    s().setStart(3) // D
    s().removeCity(3) // прибрали сам старт
    expect(s().cities.map((c) => c.name)).toEqual(["A", "B", "C", "E"])
    expect(s().start).toBe(0)
  })

  it("removeCity: видалення пізнішого міста не чіпає старт; ігнорує поза межами", () => {
    s().loadExample()
    s().setStart(1) // B
    s().removeCity(4) // прибрали E (індекс > start)
    expect(s().start).toBe(1)
    const before = s().cities.length
    s().removeCity(99) // поза межами — no-op
    expect(s().cities).toHaveLength(before)
  })

  it("setStart приймає валідний індекс і ігнорує поза межами", () => {
    s().loadExample()
    s().setStart(4)
    expect(s().start).toBe(4)
    s().setStart(5) // поза межами
    expect(s().start).toBe(4)
    s().setStart(-1)
    expect(s().start).toBe(4)
  })

  it("clear спорожняє міста і скидає старт на 0", () => {
    s().loadExample()
    s().setStart(2)
    s().clear()
    expect(s().cities).toEqual([])
    expect(s().start).toBe(0)
  })

  it("loadDoc/toDoc — кругова подорож; затискає некоректний старт", () => {
    s().loadDoc({
      cities: [
        { name: "A", x: 0, y: 0 },
        { name: "B", x: 1, y: 1 },
      ],
      start: 99,
    })
    expect(s().start).toBe(1) // затиснуто до count-1
    const doc = s().toDoc()
    expect(doc).toEqual({
      cities: [
        { name: "A", x: 0, y: 0 },
        { name: "B", x: 1, y: 1 },
      ],
      start: 1,
    })
  })

  it("loadExample повертає еталон A–E зі стартом A", () => {
    s().loadExample()
    expect(s().cities).toEqual(TSP_DEMO_CITIES)
    expect(s().start).toBe(0)
  })

  it("loadRandom детермінований за seed і дає різне для різних seed", () => {
    s().loadRandom(11)
    const a = s().toDoc()
    s().clear()
    s().loadRandom(11)
    expect(s().toDoc()).toEqual(a)
    s().loadRandom(12)
    expect(s().toDoc()).not.toEqual(a)
  })
})
