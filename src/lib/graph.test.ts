import { describe, it, expect } from "vitest"
import {
  addEdge,
  addVertex,
  buildGraph,
  edgeId,
  emptyGraph,
  hasEdge,
  hasVertex,
  neighbors,
  nextVertexName,
  removeEdge,
  removeVertex,
  setEdgeWeight,
  sortedEdges,
  totalWeight,
  vertexName,
} from "@/lib/graph"
import { referenceGraph } from "@/lib/exampleGraph"

describe("edgeId", () => {
  it("нормалізує кінці за сортуванням", () => {
    expect(edgeId("A", "B")).toBe("A|B")
    expect(edgeId("B", "A")).toBe("A|B")
  })
})

describe("addVertex", () => {
  it("додає вершину й не дублює", () => {
    let g = emptyGraph()
    g = addVertex(g, "A")
    g = addVertex(g, "A")
    expect(g.vertices).toEqual(["A"])
    expect(hasVertex(g, "A")).toBe(true)
  })
})

describe("addEdge", () => {
  it("нормалізує ребро й додає відсутні вершини", () => {
    const g = addEdge(emptyGraph(), "B", "A", 7)
    expect(g.edges).toHaveLength(1)
    expect(g.edges[0]).toMatchObject({ id: "A|B", u: "A", v: "B", weight: 7 })
    expect(g.vertices).toEqual(expect.arrayContaining(["A", "B"]))
  })

  it("забороняє петлі", () => {
    expect(() => addEdge(emptyGraph(), "A", "A", 3)).toThrow()
  })

  it("забороняє дублі незалежно від порядку кінців", () => {
    const g = addEdge(emptyGraph(), "A", "B", 7)
    expect(() => addEdge(g, "B", "A", 9)).toThrow()
  })

  it("вимагає додатну цілу вагу", () => {
    expect(() => addEdge(emptyGraph(), "A", "B", 0)).toThrow()
    expect(() => addEdge(emptyGraph(), "A", "B", -5)).toThrow()
    expect(() => addEdge(emptyGraph(), "A", "B", 1.5)).toThrow()
  })

  it("не мутує вхідний граф (іммутабельність)", () => {
    const g0 = emptyGraph()
    const g1 = addEdge(g0, "A", "B", 7)
    expect(g0.edges).toHaveLength(0)
    expect(g1.edges).toHaveLength(1)
  })
})

describe("hasEdge", () => {
  it("симетрично знаходить ребро", () => {
    const g = addEdge(emptyGraph(), "A", "B", 7)
    expect(hasEdge(g, "A", "B")).toBe(true)
    expect(hasEdge(g, "B", "A")).toBe(true)
    expect(hasEdge(g, "A", "C")).toBe(false)
  })
})

describe("sortedEdges", () => {
  it("сортує за вагою, потім за id (детерміновано)", () => {
    const g = buildGraph([
      ["A", "B", 7],
      ["C", "E", 5],
      ["A", "D", 5],
      ["D", "F", 6],
    ])
    expect(sortedEdges(g).map((e) => e.id)).toEqual([
      "A|D",
      "C|E",
      "D|F",
      "A|B",
    ])
  })
})

describe("еталонний граф", () => {
  it("має 7 вершин і 11 ребер", () => {
    const g = referenceGraph()
    expect(g.vertices).toHaveLength(7)
    expect(g.edges).toHaveLength(11)
  })

  it("totalWeight рахує суму ваг за id", () => {
    const g = referenceGraph()
    expect(totalWeight(g, ["A|D", "C|E", "D|F", "A|B", "B|E", "E|G"])).toBe(39)
  })
})

describe("neighbors", () => {
  it("повертає сусідів незалежно від напряму запису ребра", () => {
    const g = buildGraph([
      ["A", "B", 1],
      ["A", "C", 2],
    ])
    expect(neighbors(g, "A").sort()).toEqual(["B", "C"])
    expect(neighbors(g, "B")).toEqual(["A"])
  })
})

describe("vertexName / nextVertexName", () => {
  it("vertexName: A..Z, далі V27", () => {
    expect(vertexName(0)).toBe("A")
    expect(vertexName(25)).toBe("Z")
    expect(vertexName(26)).toBe("V27")
  })

  it("nextVertexName повертає перше вільне ім'я", () => {
    expect(nextVertexName([])).toBe("A")
    expect(nextVertexName(["A", "B", "D"])).toBe("C")
    expect(nextVertexName(["A", "B", "C"])).toBe("D")
  })
})

describe("removeVertex / removeEdge", () => {
  it("removeVertex прибирає вершину й інцидентні ребра", () => {
    const g = buildGraph([
      ["A", "B", 1],
      ["B", "C", 2],
      ["A", "C", 3],
    ])
    const g2 = removeVertex(g, "B")
    expect([...g2.vertices].sort()).toEqual(["A", "C"])
    expect(g2.edges.map((e) => e.id)).toEqual(["A|C"])
  })

  it("removeEdge прибирає лише ребро", () => {
    const g = buildGraph([["A", "B", 1]])
    const g2 = removeEdge(g, "A|B")
    expect(g2.edges).toHaveLength(0)
    expect([...g2.vertices].sort()).toEqual(["A", "B"])
  })
})

describe("setEdgeWeight", () => {
  it("оновлює вагу наявного ребра", () => {
    const g = buildGraph([["A", "B", 1]])
    expect(setEdgeWeight(g, "A|B", 9).edges[0].weight).toBe(9)
  })

  it("кидає помилку для невідомого ребра або невалідної ваги", () => {
    const g = buildGraph([["A", "B", 1]])
    expect(() => setEdgeWeight(g, "X|Y", 2)).toThrow()
    expect(() => setEdgeWeight(g, "A|B", 0)).toThrow()
  })
})
