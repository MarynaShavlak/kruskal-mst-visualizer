import { describe, it, expect } from "vitest"
import { buildHashTableTrace } from "@/lib/hashTableTrace"
import { HT_INTRO_OPS, HT_INTRO_CAPACITY } from "@/lib/exampleHashTable"
import { cellRole, entryRole } from "@/algorithms/hash-table/playback/highlight"

const trace = buildHashTableTrace(HT_INTRO_OPS, HT_INTRO_CAPACITY)
const frameByPhaseKey = (phase: string, key: string) =>
  trace.frames.find((f) => f.phase === phase && f.op?.key === key)!

describe("cellRole", () => {
  it("домашня комірка на кадрі hash → home; на кадрі collision → collision", () => {
    const hash = frameByPhaseKey("hash", "apple")
    expect(cellRole(0, hash)).toBe("home")
    expect(cellRole(1, hash)).toBe("empty") // ще нічого

    const collision = frameByPhaseKey("collision", "lemon")
    expect(cellRole(4, collision)).toBe("collision")
  })

  it("непорожня НЕ домашня комірка → filled; порожня → empty", () => {
    const done = trace.frames[trace.frames.length - 1]
    expect(cellRole(0, done)).toBe("filled") // apple
    expect(cellRole(2, done)).toBe("empty") // ніколи не заповнена
  })
})

describe("entryRole", () => {
  it("get lemon: сканування ланцюга [banana, lemon] → scanning/probed, потім found", () => {
    const compares = trace.frames.filter(
      (f) => f.phase === "compare" && f.op?.kind === "get" && f.op?.key === "lemon",
    )
    // другий compare: позиція 1 сканується, позиція 0 вже перевірена
    const second = compares[1]
    expect(entryRole(4, 1, second)).toBe("scanning")
    expect(entryRole(4, 0, second)).toBe("probed")

    const found = frameByPhaseKey("found", "lemon")
    expect(entryRole(4, 1, found)).toBe("found")
  })

  it("не домашня комірка → завжди idle", () => {
    const hash = frameByPhaseKey("hash", "apple")
    expect(entryRole(4, 0, hash)).toBe("idle")
  })
})
