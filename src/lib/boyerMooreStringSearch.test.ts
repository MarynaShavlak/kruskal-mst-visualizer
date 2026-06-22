import { describe, expect, it } from "vitest"
import {
  buildShiftTable,
  buildShiftTableSteps,
  boyerMooreSearch,
  boyerMooreSearchAll,
  boyerMooreSearchSteps,
  countBmComparisons,
  bmMetrics,
  countNaiveComparisons,
  countKmpComparisons,
} from "@/lib/boyerMooreStringSearch"
import {
  BM_MAIN,
  BM_BIG_JUMPS,
  BM_INTUITION,
  BM_WORST,
  BM_NOT_FOUND,
  BM_OVERLAP,
  BM_MULTI,
  BM_TABLE_CASES,
  BM_MAIN_STATS,
  BM_BIG_JUMPS_STATS,
  BM_WORST_STATS,
  BM_NOT_FOUND_STATS,
  BM_OVERLAP_STATS,
  BM_MULTI_STATS,
  BM_CONTRAST,
  type StringSearchCase,
} from "@/lib/exampleBoyerMooreStringSearch"

const ALL: StringSearchCase[] = [BM_MAIN, BM_BIG_JUMPS, BM_INTUITION, BM_WORST, BM_NOT_FOUND, BM_OVERLAP, BM_MULTI]

// Незалежний еталон таблиці: справа наліво по pattern[:-1], перше від кінця = останнє входження.
function bruteShiftTable(pattern: string): Record<string, number> {
  const m = pattern.length
  const table: Record<string, number> = {}
  for (let r = m - 2; r >= 0; r--) {
    const c = pattern[r]
    if (!(c in table)) table[c] = m - 1 - r
  }
  if (m > 0 && !(pattern[m - 1] in table)) table[pattern[m - 1]] = m
  return table
}

// Еталонний наївний пошук (зліва направо).
function naiveRef(text: string, pattern: string): number {
  const m = pattern.length
  for (let i = 0; i <= text.length - m; i++) {
    if (text.slice(i, i + m) === pattern) return i
  }
  return -1
}

describe("buildShiftTable — еталонні таблиці конспекту", () => {
  it("developer (перезапис 'e': 7→5→1; 'r' через setdefault → 9)", () => {
    expect(buildShiftTable("developer")).toEqual({ d: 8, e: 1, v: 6, l: 4, o: 3, p: 2, r: 9 })
  })

  it("ABC / CAAAA / AABA / MOORE", () => {
    expect(buildShiftTable("ABC")).toEqual({ A: 2, B: 1, C: 3 })
    expect(buildShiftTable("CAAAA")).toEqual({ C: 4, A: 1 })
    expect(buildShiftTable("AABA")).toEqual({ A: 2, B: 1 })
    expect(buildShiftTable("MOORE")).toEqual({ M: 4, O: 2, R: 1, E: 5 })
  })

  it("усі табличні кейси збігаються з очікуваним + з незалежним брутфорсом", () => {
    for (const c of BM_TABLE_CASES) {
      expect(buildShiftTable(c.pattern)).toEqual(c.expected)
      expect(buildShiftTable(c.pattern)).toEqual(bruteShiftTable(c.pattern))
    }
  })

  it("останнє входження перемагає; порожній шаблон → {}", () => {
    expect(buildShiftTable("developer").e).toBe(1)
    expect(buildShiftTable("AABA").A).toBe(2)
    expect(buildShiftTable("")).toEqual({})
  })
})

describe("boyerMooreSearch — позиція (еталон str.indexOf / наївний)", () => {
  it("канонічний приклад: developer → 8", () => {
    expect(boyerMooreSearch(BM_MAIN.text, BM_MAIN.pattern)).toBe(BM_MAIN_STATS.result)
  })

  it("збігається з indexOf і наївним на всіх парах", () => {
    for (const c of ALL) {
      const exp = c.text.indexOf(c.pattern)
      expect(boyerMooreSearch(c.text, c.pattern)).toBe(exp)
      expect(naiveRef(c.text, c.pattern)).toBe(exp)
    }
  })

  it("WORLD → 6; CAAAA / XYZ → -1; порожній шаблон → 0; шаблон довший → -1", () => {
    expect(boyerMooreSearch(BM_INTUITION.text, BM_INTUITION.pattern)).toBe(6)
    expect(boyerMooreSearch(BM_WORST.text, BM_WORST.pattern)).toBe(-1)
    expect(boyerMooreSearch(BM_NOT_FOUND.text, BM_NOT_FOUND.pattern)).toBe(-1)
    expect(boyerMooreSearch("abc", "")).toBe(0)
    expect(boyerMooreSearch("ab", "abcd")).toBe(-1)
  })

  it("серія випадкових пар (малий алфавіт) = indexOf", () => {
    let a = 20260618 >>> 0
    const rnd = () => {
      a = (a + 0x6d2b79f5) | 0
      let t = Math.imul(a ^ (a >>> 15), 1 | a)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
    const alpha = "ABC"
    for (let k = 0; k < 600; k++) {
      const n = Math.floor(rnd() * 19)
      const m = 1 + Math.floor(rnd() * 5)
      let text = ""
      for (let p = 0; p < n; p++) text += alpha[Math.floor(rnd() * 3)]
      let pat = ""
      for (let p = 0; p < m; p++) pat += alpha[Math.floor(rnd() * 3)]
      expect(boyerMooreSearch(text, pat)).toBe(text.indexOf(pat))
    }
  })
})

describe("boyerMooreSearchAll — усі входження", () => {
  it("abcabcabc / abc → [0, 3, 6]", () => {
    expect(boyerMooreSearchAll(BM_OVERLAP.text, BM_OVERLAP.pattern)).toEqual([...BM_OVERLAP_STATS.allIndices])
  })

  it("AABAACAADAABAABA / AABA → [0, 9, 12]; перекривні AA у AAAA → [0,1,2]", () => {
    expect(boyerMooreSearchAll(BM_MULTI.text, BM_MULTI.pattern)).toEqual([...BM_MULTI_STATS.allIndices])
    expect(boyerMooreSearchAll("AAAA", "AA")).toEqual([0, 1, 2])
  })

  it("немає → []; порожній шаблон → [0..N]; база = перший елемент усіх", () => {
    expect(boyerMooreSearchAll(BM_NOT_FOUND.text, BM_NOT_FOUND.pattern)).toEqual([])
    expect(boyerMooreSearchAll("abc", "")).toEqual([0, 1, 2, 3])
    for (const c of ALL) {
      const all = boyerMooreSearchAll(c.text, c.pattern)
      expect(boyerMooreSearch(c.text, c.pattern)).toBe(all.length ? all[0] : -1)
    }
  })
})

describe("bmMetrics / лічильники (еталон README)", () => {
  it("канонічний: 10 порівнянь, 1 стрибок, 8 пропущених", () => {
    expect(bmMetrics(BM_MAIN.text, BM_MAIN.pattern)).toEqual({
      comparisons: BM_MAIN_STATS.comparisons,
      jumps: BM_MAIN_STATS.jumps,
      skipped: BM_MAIN_STATS.skipped,
    })
  })

  it("великі стрибки: 9 порівнянь < довжини тексту (43), 4 стрибки, 16 пропущених", () => {
    const m = bmMetrics(BM_BIG_JUMPS.text, BM_BIG_JUMPS.pattern)
    expect(m).toEqual({
      comparisons: BM_BIG_JUMPS_STATS.comparisons,
      jumps: BM_BIG_JUMPS_STATS.jumps,
      skipped: BM_BIG_JUMPS_STATS.skipped,
    })
    expect(m.comparisons).toBeLessThan(BM_BIG_JUMPS.text.length)
  })

  it("найгірший CAAAA/AAAA…: (N-M+1)·M = 30, 6 стрибків (усі по 1), 0 пропущених", () => {
    expect(bmMetrics(BM_WORST.text, BM_WORST.pattern)).toEqual({
      comparisons: BM_WORST_STATS.comparisons,
      jumps: BM_WORST_STATS.jumps,
      skipped: BM_WORST_STATS.skipped,
    })
    const jumps = boyerMooreSearchSteps(BM_WORST.text, BM_WORST.pattern).events
      .filter((e) => e.kind === "shift")
      .map((e) => e.jump)
    expect(jumps.length).toBeGreaterThan(0)
    expect(jumps.every((d) => d === 1)).toBe(true)
  })

  it("не знайдено XYZ: 2 порівняння, 2 стрибки, 4 пропущених", () => {
    expect(bmMetrics(BM_NOT_FOUND.text, BM_NOT_FOUND.pattern)).toEqual({
      comparisons: BM_NOT_FOUND_STATS.comparisons,
      jumps: BM_NOT_FOUND_STATS.jumps,
      skipped: BM_NOT_FOUND_STATS.skipped,
    })
  })

  it("countBmComparisons = кількість подій compare у журналі", () => {
    for (const c of ALL) {
      const compares = boyerMooreSearchSteps(c.text, c.pattern).events.filter((e) => e.kind === "compare").length
      expect(countBmComparisons(c.text, c.pattern)).toBe(compares)
    }
  })

  it("порожній шаблон / шаблон довший → 0 порівнянь", () => {
    expect(countBmComparisons("ab", "abcd")).toBe(0)
    expect(countBmComparisons("abc", "abc")).toBe(3)
  })
})

describe("контраст Боєра-Мура проти наївного й KMP", () => {
  it("великі стрибки: BM 9 ≪ наївний 43; KMP total 29", () => {
    expect(countBmComparisons(BM_BIG_JUMPS.text, BM_BIG_JUMPS.pattern)).toBe(BM_CONTRAST.bigJumps.bm)
    expect(countNaiveComparisons(BM_BIG_JUMPS.text, BM_BIG_JUMPS.pattern)).toBe(BM_CONTRAST.bigJumps.naive)
    expect(countKmpComparisons(BM_BIG_JUMPS.text, BM_BIG_JUMPS.pattern).total).toBe(BM_CONTRAST.bigJumps.kmp)
  })

  it("найгірший: BM 30 > наївний 6; KMP total 14", () => {
    expect(countBmComparisons(BM_WORST.text, BM_WORST.pattern)).toBe(BM_CONTRAST.worst.bm)
    expect(countNaiveComparisons(BM_WORST.text, BM_WORST.pattern)).toBe(BM_CONTRAST.worst.naive)
    expect(countKmpComparisons(BM_WORST.text, BM_WORST.pattern).total).toBe(BM_CONTRAST.worst.kmpTotal)
  })
})

describe("buildShiftTableSteps — журнал передобробки", () => {
  it("типи, порядок, лічильник обчислень = M-1 = кількість entry", () => {
    for (const c of BM_TABLE_CASES) {
      const { table, events } = buildShiftTableSteps(c.pattern)
      expect(events[0].kind).toBe("init")
      expect(events[events.length - 1].kind).toBe("final")
      expect(table).toEqual(c.expected)
      expect(events[events.length - 1].table).toEqual(c.expected)
      expect(events.filter((e) => e.kind === "default").length).toBe(1)
      const nEntry = events.filter((e) => e.kind === "entry").length
      expect(events[events.length - 1].computations).toBe(nEntry)
      expect(nEntry).toBe(c.pattern.length - 1)
    }
  })

  it("developer: 11 подій (init + 8 entry + default + final); 'e' перезаписується", () => {
    const { events } = buildShiftTableSteps("developer")
    expect(events.length).toBe(11)
    const eEntries = events.filter((e) => e.kind === "entry" && e.char === "e")
    expect(eEntries.length).toBe(3) // 'e' на index 1, 3, 7 (останній символ index 8 = 'r')
    expect(eEntries[1].overwrite).toBe(true)
    expect(eEntries[2].overwrite).toBe(true)
    expect(eEntries[2].shift).toBe(1) // 9 - 7 - 1 = 1 (останнє входження перемагає)
  })

  it("порожній шаблон → init + final, порожня таблиця", () => {
    const { table, events } = buildShiftTableSteps("")
    expect(table).toEqual({})
    expect(events.map((e) => e.kind)).toEqual(["init", "final"])
  })
})

describe("boyerMooreSearchSteps — журнал пошуку", () => {
  it("порядок справа наліво: j строго спадає в межах вирівнювання, старт із M-1", () => {
    for (const c of ALL) {
      const events = boyerMooreSearchSteps(c.text, c.pattern).events
      let js: number[] = []
      for (const e of events) {
        if (e.kind === "align") js = []
        else if (e.kind === "compare") {
          const j = e.j as number
          if (js.length) expect(j).toBeLessThan(js[js.length - 1])
          else expect(j).toBe(c.pattern.length - 1)
          js.push(j)
        }
      }
    }
  })

  it("стрибки лише вперед (newI > i, jump ≥ 1); пропущені НЕ порівнюються", () => {
    for (const c of ALL) {
      const events = boyerMooreSearchSteps(c.text, c.pattern).events
      const compared = new Set<number>()
      const skipped = new Set<number>()
      for (const e of events) {
        if (e.kind === "compare") compared.add((e.i as number) + (e.j as number))
        if (e.kind === "shift") {
          expect(e.jump as number).toBeGreaterThanOrEqual(1)
          expect(e.newI as number).toBeGreaterThan(e.i)
          for (const p of e.skippedNow ?? []) skipped.add(p)
        }
      }
      for (const p of skipped) expect(compared.has(p)).toBe(false)
      expect(bmMetrics(c.text, c.pattern).skipped).toBe(skipped.size)
    }
  })

  it("символ кінця вікна поза шаблоном → стрибок на повну довжину (table_value null)", () => {
    const events = boyerMooreSearchSteps("XXXXXdef", "def").events
    const firstShift = events.find((e) => e.kind === "shift")!
    expect(firstShift.tableValue).toBeNull()
    expect(firstShift.jump).toBe(3)
  })

  it("рівно одна подія-вердикт (match_found XOR not_found); лічильники монотонні", () => {
    for (const c of ALL) {
      const { result, events } = boyerMooreSearchSteps(c.text, c.pattern)
      const verdicts = events.filter((e) => e.kind === "match_found" || e.kind === "not_found").map((e) => e.kind)
      expect(verdicts).toEqual(result >= 0 ? ["match_found"] : ["not_found"])
      for (const key of ["comparisons", "jumps", "skipped"] as const) {
        const seq = events.map((e) => e[key])
        expect(seq).toEqual([...seq].sort((x, y) => x - y))
      }
    }
  })

  it("порожній шаблон: збіг на 0", () => {
    const { result, events } = boyerMooreSearchSteps("abc", "")
    expect(result).toBe(0)
    expect(events[events.length - 1].result).toBe(0)
  })
})
