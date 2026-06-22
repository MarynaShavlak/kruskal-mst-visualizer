import { describe, expect, it } from "vitest"
import {
  computeLps,
  computeLpsSteps,
  kmpSearch,
  kmpSearchAll,
  kmpSearchSteps,
  countLpsComparisons,
  countSearchComparisons,
  countKmpComparisons,
  countNaiveComparisons,
  kmpReadPositions,
  naiveReadPositions,
} from "@/lib/kmpStringSearch"
import {
  LPS_CASES,
  LPS_ABABCABAB,
  KMP_CANONICAL,
  KMP_KONSPECT,
  KMP_WORST,
  KMP_NOT_FOUND,
  KMP_MULTI,
  KMP_SEARCH_CASES,
  KMP_CANONICAL_STATS,
  KMP_WORST_STATS,
  KMP_NOT_FOUND_STATS,
  KMP_KONSPECT_STATS,
  KMP_MULTI_STATS,
} from "@/lib/exampleKmpStringSearch"

// Незалежний O(m³) еталон префіксної функції: для кожного префікса — найбільший власний
// префікс, що є суфіксом. Звіряємо з compute_lps.
function bruteLps(pattern: string): number[] {
  const m = pattern.length
  const lps = new Array<number>(m).fill(0)
  for (let i = 0; i < m; i++) {
    const sub = pattern.slice(0, i + 1)
    for (let length = i; length > 0; length--) {
      if (sub.slice(0, length) === sub.slice(sub.length - length)) {
        lps[i] = length
        break
      }
    }
  }
  return lps
}

function bruteAll(text: string, pattern: string): number[] {
  const m = pattern.length
  const n = text.length
  if (m === 0) {
    const out: number[] = []
    for (let i = 0; i <= n; i++) out.push(i)
    return out
  }
  const out: number[] = []
  for (let i = 0; i <= n - m; i++) if (text.slice(i, i + m) === pattern) out.push(i)
  return out
}

describe("computeLps — еталонні таблиці конспекту", () => {
  it("ABABCABAB → [0,0,1,2,0,1,2,3,4]; AABAA → [0,1,0,1,2]; алг → [0,0,0]; AAAAB → [0,1,2,3,4]?", () => {
    expect(computeLps("ABABCABAB")).toEqual([0, 0, 1, 2, 0, 1, 2, 3, 4])
    expect(computeLps("AABAA")).toEqual([0, 1, 0, 1, 2])
    expect(computeLps("алг")).toEqual([0, 0, 0])
    // Увага: правильна lps для AAAAB — [0,1,2,3,0] (останній B не подовжує префікс).
    expect(computeLps("AAAAB")).toEqual([0, 1, 2, 3, 0])
    // Чисто-повторюваний AAAAB без B-хвоста: AAAA → [0,1,2,3].
    expect(computeLps("AAAA")).toEqual([0, 1, 2, 3])
  })

  it("кожен кейс == очікувана таблиця == незалежний брутфорс", () => {
    for (const c of LPS_CASES) {
      expect(computeLps(c.pattern)).toEqual([...c.expected])
      expect(computeLps(c.pattern)).toEqual(bruteLps(c.pattern))
    }
  })

  it("computeLpsSteps дає ту саму таблицю, що computeLps", () => {
    for (const c of LPS_CASES) {
      const r = computeLpsSteps(c.pattern)
      expect(r.lps).toEqual([...c.expected])
      expect(r.lps).toEqual(computeLps(c.pattern))
    }
  })
})

describe("kmpSearch — еталон README", () => {
  it("канонічний приклад → 10", () => {
    expect(kmpSearch(KMP_CANONICAL.text, KMP_CANONICAL.pattern)).toBe(KMP_CANONICAL_STATS.result)
  })

  it("конспект: «алг» у тексті → 4", () => {
    expect(kmpSearch(KMP_KONSPECT.text, KMP_KONSPECT.pattern)).toBe(KMP_KONSPECT_STATS.result)
  })

  it("найгірший для наївного → -1; відсутній → -1; множинні → 0", () => {
    expect(kmpSearch(KMP_WORST.text, KMP_WORST.pattern)).toBe(-1)
    expect(kmpSearch(KMP_NOT_FOUND.text, KMP_NOT_FOUND.pattern)).toBe(-1)
    expect(kmpSearch(KMP_MULTI.text, KMP_MULTI.pattern)).toBe(0)
  })

  it("шаблон == текст → 0; шаблон довший → -1; один символ", () => {
    expect(kmpSearch("abcabc", "abcabc")).toBe(0)
    expect(kmpSearch("ab", "abc")).toBe(-1)
    expect(kmpSearch("abcabc", "c")).toBe(2)
  })

  it("kmpSearch == String.indexOf на всіх пошук-кейсах", () => {
    for (const c of KMP_SEARCH_CASES) {
      expect(kmpSearch(c.text, c.pattern)).toBe(c.text.indexOf(c.pattern))
    }
  })
})

describe("kmpSearchAll — усі (зокрема перекривні) входження", () => {
  it("AB у ABABAB → [0,2,4]; AA у AAAA → [0,1,2]", () => {
    expect(kmpSearchAll(KMP_MULTI.text, KMP_MULTI.pattern)).toEqual([...KMP_MULTI_STATS.allIndices])
    expect(kmpSearchAll("AAAA", "AA")).toEqual([0, 1, 2])
  })

  it("один збіг → список з одного; немає → []", () => {
    expect(kmpSearchAll(KMP_CANONICAL.text, KMP_CANONICAL.pattern)).toEqual([10])
    expect(kmpSearchAll(KMP_WORST.text, KMP_WORST.pattern)).toEqual([])
  })

  it("порожній шаблон → [0..N]", () => {
    expect(kmpSearchAll("abc", "")).toEqual([0, 1, 2, 3])
    expect(kmpSearchAll("", "")).toEqual([0])
  })

  it("kmpSearchAll == брутфорс на серії кейсів", () => {
    const cases: [string, string][] = [
      ["ABABAB", "AB"],
      ["AAAA", "AA"],
      [KMP_CANONICAL.text, KMP_CANONICAL.pattern],
      [KMP_WORST.text, KMP_WORST.pattern],
      ["abcabcabc", "abc"],
      [KMP_KONSPECT.text, KMP_KONSPECT.pattern],
    ]
    for (const [text, pattern] of cases) {
      expect(kmpSearchAll(text, pattern)).toEqual(bruteAll(text, pattern))
    }
  })
})

describe("лічильники порівнянь (еталон README)", () => {
  it("lps ABABCABAB = 9 порівнянь", () => {
    expect(countLpsComparisons(LPS_ABABCABAB.pattern)).toBe(KMP_CANONICAL_STATS.lpsComparisons)
  })

  it("канонічний: lps 9 + пошук 23 = 32; наївний — 29", () => {
    const c = countKmpComparisons(KMP_CANONICAL.text, KMP_CANONICAL.pattern)
    expect(c.lps).toBe(KMP_CANONICAL_STATS.lpsComparisons)
    expect(c.search).toBe(KMP_CANONICAL_STATS.searchComparisons)
    expect(c.total).toBe(KMP_CANONICAL_STATS.totalComparisons)
    expect(countNaiveComparisons(KMP_CANONICAL.text, KMP_CANONICAL.pattern)).toBe(
      KMP_CANONICAL_STATS.naiveComparisons,
    )
  })

  it("найгірший: lps 7 + пошук 16 = 23; наївний — 30 (KMP менше)", () => {
    const c = countKmpComparisons(KMP_WORST.text, KMP_WORST.pattern)
    expect(c.lps).toBe(KMP_WORST_STATS.lpsComparisons)
    expect(c.search).toBe(KMP_WORST_STATS.searchComparisons)
    expect(c.total).toBe(KMP_WORST_STATS.totalComparisons)
    expect(countNaiveComparisons(KMP_WORST.text, KMP_WORST.pattern)).toBe(
      KMP_WORST_STATS.naiveComparisons,
    )
    expect(c.total).toBeLessThan(KMP_WORST_STATS.naiveComparisons)
  })

  it("на великому патологічному вході KMP робить ІСТОТНО менше за наївний (понад удвічі)", () => {
    for (const len of [32, 64, 128]) {
      const text = "A".repeat(len)
      const pattern = "A".repeat(len / 2 - 1) + "B"
      const kmp = countKmpComparisons(text, pattern).total
      const naive = countNaiveComparisons(text, pattern)
      expect(kmp).toBeLessThan(naive)
      expect(kmp * 2).toBeLessThan(naive)
    }
  })

  it("відсутній: lps 8 + пошук 18 = 26", () => {
    const c = countKmpComparisons(KMP_NOT_FOUND.text, KMP_NOT_FOUND.pattern)
    expect(c.lps).toBe(KMP_NOT_FOUND_STATS.lpsComparisons)
    expect(c.search).toBe(KMP_NOT_FOUND_STATS.searchComparisons)
    expect(c.total).toBe(KMP_NOT_FOUND_STATS.totalComparisons)
  })

  it("конспект «алг»: lps 2 + пошук 7", () => {
    expect(countLpsComparisons(KMP_KONSPECT.pattern)).toBe(KMP_KONSPECT_STATS.lpsComparisons)
    expect(countSearchComparisons(KMP_KONSPECT.text, KMP_KONSPECT.pattern)).toBe(
      KMP_KONSPECT_STATS.searchComparisons,
    )
  })
})

describe("монотонність i та лінійність (визначальна риса KMP)", () => {
  it("журнал пошуку НІКОЛИ не зменшує i — на всіх пошук-кейсах", () => {
    for (const c of KMP_SEARCH_CASES) {
      const r = kmpSearchSteps(c.text, c.pattern)
      const iValues = r.events.map((e) => e.i)
      for (let k = 1; k < iValues.length; k++) {
        expect(iValues[k]).toBeGreaterThanOrEqual(iValues[k - 1])
      }
      expect(r.events[r.events.length - 1].iMonotonic).toBe(true)
    }
  })

  it("сумарна кількість порівнянь ≤ 2·(n+m)", () => {
    for (const c of KMP_SEARCH_CASES) {
      const total = countKmpComparisons(c.text, c.pattern).total
      expect(total).toBeLessThanOrEqual(2 * (c.text.length + c.pattern.length))
    }
  })

  it("kmpReadPositions не спадає; naiveReadPositions «пилкоподібна»", () => {
    const kmp = kmpReadPositions(KMP_WORST.text, KMP_WORST.pattern)
    for (let k = 1; k < kmp.length; k++) expect(kmp[k]).toBeGreaterThanOrEqual(kmp[k - 1])
    const naive = naiveReadPositions(KMP_WORST.text, KMP_WORST.pattern)
    // У наївного на найгіршому є відкіт позиції назад (немонотонність).
    const hasRollback = naive.some((v, k) => k > 0 && v < naive[k - 1])
    expect(hasRollback).toBe(true)
  })
})

describe("узгодженість журналів подій", () => {
  it("lps: лічильник росте; фінал = готова таблиця; compares = set+fallback+zero", () => {
    const { lps, events } = computeLpsSteps("ABABCABAB")
    expect(events[0].kind).toBe("init")
    expect(events[events.length - 1].kind).toBe("final")
    expect(events[events.length - 1].lps).toEqual(lps)
    let prev = 0
    for (const e of events) {
      expect(e.comparisons).toBeGreaterThanOrEqual(prev)
      prev = e.comparisons
    }
    const cnt = (k: string) => events.filter((e) => e.kind === k).length
    expect(cnt("compare")).toBe(cnt("set") + cnt("fallback") + cnt("zero"))
  })

  it("search: лічильник росте; фінал = правильний результат; offset = i - j; shift jump ≥ 1", () => {
    const { result, events } = kmpSearchSteps(KMP_CANONICAL.text, KMP_CANONICAL.pattern)
    expect(events[0].kind).toBe("init")
    expect(events[events.length - 1].kind).toBe("final")
    expect(events[events.length - 1].result).toBe(result)
    expect(result).toBe(10)
    let prev = 0
    for (const e of events) {
      expect(e.comparisons).toBeGreaterThanOrEqual(prev)
      prev = e.comparisons
      expect(e.offset).toBe(e.i - e.j)
    }
    for (const e of events) {
      if (e.kind === "shift") expect(e.jump ?? 0).toBeGreaterThanOrEqual(1)
    }
  })

  it("порожній шаблон: kmpSearchSteps безпечний (0), kmpSearchAll — усі позиції", () => {
    const r = kmpSearchSteps("abc", "")
    expect(r.result).toBe(0)
    expect(kmpSearchAll("abc", "")).toEqual([0, 1, 2, 3])
  })
})
