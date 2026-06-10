import { describe, it, expect } from "vitest"
import { tspCodec } from "@/algorithms/held-karp/editor/tsp-doc"
import { TSP_DEMO_CITIES } from "@/lib/exampleTsp"
import type { TspDoc } from "@/store/tsp-store"

const demoDoc: TspDoc = { cities: TSP_DEMO_CITIES.map((c) => ({ ...c })), start: 0 }

describe("tspCodec", () => {
  it("JSON: кругова подорож зберігає міста й старт", () => {
    const doc: TspDoc = { cities: demoDoc.cities, start: 2 }
    expect(tspCodec.fromJSON(tspCodec.toJSON(doc))).toEqual(doc)
  })

  it("hash: кругова подорож через base64url", () => {
    const back = tspCodec.decodeHash(tspCodec.encodeHash(demoDoc))
    expect(back).toEqual(demoDoc)
  })

  it("decodeHash повертає null на сміття", () => {
    expect(tspCodec.decodeHash("не-валідний-хеш!!!")).toBeNull()
  })

  it("fromJSON відхиляє невалідну схему", () => {
    expect(() => tspCodec.fromJSON('{"version":2,"cities":[],"start":0}')).toThrow()
    expect(() => tspCodec.fromJSON('{"version":1,"cities":[["A",1]],"start":0}')).toThrow()
    expect(() => tspCodec.fromJSON('{"version":1,"cities":[],"start":1.5}')).toThrow()
  })

  it("старт затискається в межі при завантаженні", () => {
    const json = '{"version":1,"cities":[["A",0,0],["B",1,1]],"start":99}'
    expect(tspCodec.fromJSON(json).start).toBe(1)
  })
})
