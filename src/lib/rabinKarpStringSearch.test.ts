import { describe, expect, it } from "vitest"
import {
  polynomialHash,
  polynomialHashRaw,
  polynomialHashSteps,
  rabinKarpSearch,
  rabinKarpSearchAll,
  rabinKarpSearchRecompute,
  rabinKarpSearchSteps,
  rabinKarpMetrics,
  countHashCharOps,
  findCollisions,
} from "@/lib/rabinKarpStringSearch"
import {
  RK_MAIN,
  RK_COLLISION,
  RK_MULTI,
  RK_BEST,
  RK_NOT_FOUND,
  RK_WORST,
  RK_OVERLAP,
  RK_HASH_CASES,
  RK_COLLISION_CASES,
  RK_MAIN_STATS,
  RK_COLLISION_STATS,
  RK_MULTI_STATS,
  RK_OVERLAP_STATS,
  RK_H_MULTIPLIER_M9,
  RK_RAW_ABC,
} from "@/lib/exampleRabinKarpStringSearch"

// Незалежний еталон істини (брутфорс) — як str.find / ручний цикл у Python.
function bruteAll(text: string, pattern: string): number[] {
  const m = pattern.length
  const n = text.length
  if (m === 0) return Array.from({ length: n + 1 }, (_, i) => i)
  const out: number[] = []
  for (let i = 0; i <= n - m; i++) if (text.slice(i, i + m) === pattern) out.push(i)
  return out
}
function bruteFirst(text: string, pattern: string): number {
  return text.length >= 0 ? (bruteAll(text, pattern)[0] ?? -1) : -1
}

describe("polynomialHash — еталони конспекту", () => {
  it("abc→90, developer→35, general→82", () => {
    for (const c of RK_HASH_CASES) expect(polynomialHash(c.s)).toBe(c.expected)
    expect(polynomialHash("abc")).toBe(90)
    expect(polynomialHash("developer")).toBe(35)
    expect(polynomialHash("general")).toBe(82)
  })

  it("h_multiplier для M=9 = pow(256,8) % 101 = 79", () => {
    // h_multiplier рахується як степінь бази; беремо з init-події пошуку «developer».
    const { events } = rabinKarpSearchSteps(RK_MAIN.text, RK_MAIN.pattern)
    expect(events[0].hMultiplier).toBe(RK_H_MULTIPLIER_M9)
  })

  it("«abc» без модуля → 6382179, і 6382179 % 101 == 90", () => {
    expect(polynomialHashRaw("abc")).toBe(RK_RAW_ABC)
    expect(Number(RK_RAW_ABC % 101n)).toBe(90)
  })

  it("polynomialHashSteps дає той самий хеш + init/final", () => {
    for (const s of ["abc", "developer", "general", "a", ""]) {
      const r = polynomialHashSteps(s)
      expect(r.hash).toBe(polynomialHash(s))
      expect(r.events[0].kind).toBe("init")
      expect(r.events[r.events.length - 1].kind).toBe("final")
      expect(r.events.filter((e) => e.kind === "term").length).toBe(s.length)
      for (const e of r.events) expect(e.hashValue).toBeGreaterThanOrEqual(0)
    }
  })

  it("Horner-кроки «developer»: коди/степені/внески з README", () => {
    const { events } = polynomialHashSteps("developer")
    const terms = events.filter((e) => e.kind === "term")
    // i=0 'd' code 100, power 79, contribution 7900
    expect(terms[0].code).toBe(100)
    expect(terms[0].power).toBe(79)
    expect(terms[0].contribution).toBe(7900)
    // i=8 'r' code 114, power 1, contribution 114, накопичений хеш 35
    expect(terms[8].code).toBe(114)
    expect(terms[8].power).toBe(1)
    expect(terms[8].hashValue).toBe(35)
  })
})

describe("rabinKarpSearch — позиція першого входження (еталон README)", () => {
  it("канонічний «developer» у тексті конспекту → 8", () => {
    expect(rabinKarpSearch(RK_MAIN.text, RK_MAIN.pattern)).toBe(RK_MAIN_STATS.result)
  })

  it("колізія «jar» → 6; множинні «sea» → 10; best «string» → 25; не знайдено → -1", () => {
    expect(rabinKarpSearch(RK_COLLISION.text, RK_COLLISION.pattern)).toBe(RK_COLLISION_STATS.result)
    expect(rabinKarpSearch(RK_MULTI.text, RK_MULTI.pattern)).toBe(RK_MULTI_STATS.result)
    expect(rabinKarpSearch(RK_BEST.text, RK_BEST.pattern)).toBe(25)
    expect(rabinKarpSearch(RK_NOT_FOUND.text, RK_NOT_FOUND.pattern)).toBe(-1)
    expect(rabinKarpSearch(RK_WORST.text, RK_WORST.pattern)).toBe(-1)
  })

  it("крайові: порожній шаблон / шаблон == текст / один символ / довший за текст", () => {
    expect(rabinKarpSearch("developer", "developer")).toBe(0)
    expect(rabinKarpSearch("abcabc", "c")).toBe(2)
    expect(rabinKarpSearch("ab", "abc")).toBe(-1)
  })

  it("recompute (хеш з нуля) == rolling на всіх кейсах", () => {
    for (const c of [RK_MAIN, RK_COLLISION, RK_MULTI, RK_BEST, RK_NOT_FOUND, RK_WORST]) {
      expect(rabinKarpSearchRecompute(c.text, c.pattern)).toBe(rabinKarpSearch(c.text, c.pattern))
    }
  })

  it("збігається з брутфорсом на серії випадкових входів", () => {
    let seed = 424242
    const rnd = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      return seed / 0x7fffffff
    }
    const alpha = "abc "
    for (let k = 0; k < 800; k++) {
      const tn = Math.floor(rnd() * 30)
      const pn = 1 + Math.floor(rnd() * 6)
      let text = ""
      for (let i = 0; i < tn; i++) text += alpha[Math.floor(rnd() * alpha.length)]
      let pattern = ""
      for (let i = 0; i < pn; i++) pattern += alpha[Math.floor(rnd() * alpha.length)]
      expect(rabinKarpSearch(text, pattern)).toBe(bruteFirst(text, pattern))
      expect(rabinKarpSearchAll(text, pattern)).toEqual(bruteAll(text, pattern))
    }
  })
})

describe("rabinKarpSearchAll — усі входження", () => {
  it("множинні «sea» → [10, 28]; перекривні «ab» → [0,2,4]; «aa» у «aaaa» → [0,1,2]", () => {
    expect(rabinKarpSearchAll(RK_MULTI.text, RK_MULTI.pattern)).toEqual([...RK_MULTI_STATS.allIndices])
    expect(rabinKarpSearchAll(RK_OVERLAP.text, RK_OVERLAP.pattern)).toEqual([...RK_OVERLAP_STATS.allIndices])
    expect(rabinKarpSearchAll("aaaa", "aa")).toEqual([0, 1, 2])
  })

  it("порожній шаблон → [0..N]; шаблон довший → []", () => {
    expect(rabinKarpSearchAll("abc", "")).toEqual([0, 1, 2, 3])
    expect(rabinKarpSearchAll("ab", "abcde")).toEqual([])
  })
})

describe("rabinKarpSearchSteps — журнал та інваріант rolling-хешу", () => {
  it("канонічний: result 8, лічильники 9/2/1/8", () => {
    const { result, events } = rabinKarpSearchSteps(RK_MAIN.text, RK_MAIN.pattern)
    const last = events[events.length - 1]
    expect(result).toBe(RK_MAIN_STATS.result)
    expect(last.hashComparisons).toBe(RK_MAIN_STATS.hashComparisons)
    expect(last.charVerifications).toBe(RK_MAIN_STATS.charVerifications)
    expect(last.collisions).toBe(RK_MAIN_STATS.collisions)
    expect(last.rolls).toBe(RK_MAIN_STATS.rolls)
  })

  it("КРИТИЧНИЙ ІНВАРІАНТ: window_hash кожного вікна == polynomialHash(window)", () => {
    let seed = 20260618
    const rnd = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      return seed / 0x7fffffff
    }
    const inputs = [RK_MAIN, RK_COLLISION, RK_MULTI, RK_BEST, RK_NOT_FOUND, RK_WORST]
    for (const c of inputs) {
      const { events } = rabinKarpSearchSteps(c.text, c.pattern)
      for (const e of events) {
        if (e.kind === "window" && e.window != null) {
          expect(e.windowHash).toBe(polynomialHash(e.window))
        }
      }
    }
    const alpha = "abcde "
    for (let k = 0; k < 300; k++) {
      let text = ""
      const tn = 1 + Math.floor(rnd() * 30)
      for (let i = 0; i < tn; i++) text += alpha[Math.floor(rnd() * alpha.length)]
      let pattern = ""
      const pn = 1 + Math.floor(rnd() * 6)
      for (let i = 0; i < pn; i++) pattern += alpha[Math.floor(rnd() * alpha.length)]
      const { events } = rabinKarpSearchSteps(text, pattern)
      for (const e of events) {
        if (e.kind === "window" && e.window != null) {
          expect(e.windowHash).toBe(polynomialHash(e.window))
        }
      }
    }
  })

  it("кожна колізія: хеш вікна == хеш шаблону, але рядки різні", () => {
    const { events } = rabinKarpSearchSteps(RK_MAIN.text, RK_MAIN.pattern)
    for (const e of events) {
      if (e.kind === "collision") {
        expect(e.windowHash).toBe(e.patternHash)
        expect(e.window).not.toBe(e.pattern)
      }
    }
  })

  it("порожній шаблон → 0 (безпечно); шаблон довший → -1", () => {
    expect(rabinKarpSearchSteps("abc", "").result).toBe(0)
    expect(rabinKarpSearchSteps("ab", "abc").result).toBe(-1)
  })
})

describe("rabinKarpMetrics — ціна best проти worst", () => {
  it("канонічний: 1 колізія, 2 char-перевірки (= колізії + 1 справжній збіг)", () => {
    const m = rabinKarpMetrics(RK_MAIN.text, RK_MAIN.pattern)
    expect(m.collisions).toBe(1)
    expect(m.charVerifications).toBe(m.collisions + 1)
  })

  it("колізія «jar»: метрики 7/2/1/6, char-перевірки = колізії + 1", () => {
    const m = rabinKarpMetrics(RK_COLLISION.text, RK_COLLISION.pattern)
    expect(m.hashComparisons).toBe(RK_COLLISION_STATS.hashComparisons)
    expect(m.charVerifications).toBe(RK_COLLISION_STATS.charVerifications)
    expect(m.collisions).toBe(RK_COLLISION_STATS.collisions)
    expect(m.rolls).toBe(RK_COLLISION_STATS.rolls)
  })

  it("best: мало char-перевірок, без колізій", () => {
    const m = rabinKarpMetrics(RK_BEST.text, RK_BEST.pattern)
    expect(m.collisions).toBe(0)
    expect(m.charVerifications).toBeLessThanOrEqual(2)
  })

  it("worst під малим модулем 1 → багато колізій (RK = наївний)", () => {
    const good = rabinKarpMetrics(RK_WORST.text, RK_WORST.pattern, 256, 101)
    const bad = rabinKarpMetrics(RK_WORST.text, RK_WORST.pattern, 256, 1)
    expect(good.collisions).toBe(0)
    expect(bad.collisions).toBeGreaterThanOrEqual(good.collisions + 5)
  })
})

describe("countHashCharOps — rolling дешевший за перерахунок", () => {
  it("rolling лінійний, перерахунок як n·m", () => {
    for (const n of [16, 32, 64]) {
      const roll = countHashCharOps("a".repeat(n), "abcd", true)
      const recompute = countHashCharOps("a".repeat(n), "abcd", false)
      expect(roll).toBeLessThan(recompute)
    }
    const r1 = countHashCharOps("a".repeat(32), "abcd", false)
    const r2 = countHashCharOps("a".repeat(64), "abcd", false)
    expect(r2).toBeGreaterThan(2 * r1 - 8)
  })
})

describe("findCollisions — рівні хеші ≠ рівні рядки", () => {
  it("«for»/«jar» (35) і «heap»/«user» (12) — реальні колізії", () => {
    for (const cc of RK_COLLISION_CASES) {
      expect(cc.s1).not.toBe(cc.s2)
      expect(cc.s1.length).toBe(cc.s2.length)
      expect(polynomialHash(cc.s1)).toBe(polynomialHash(cc.s2))
      expect(polynomialHash(cc.s1)).toBe(cc.hash)
    }
  })

  it("«for» немає в «for» як «jar», хоч хеші рівні (char-перевірка рятує)", () => {
    expect(polynomialHash("for")).toBe(35)
    expect(polynomialHash("jar")).toBe(35)
    expect(rabinKarpSearch("for", "jar")).toBe(-1)
  })

  it("сканування знаходить пари однакової довжини з однаковим хешем", () => {
    const sample = ["for", "jar", "cat", "dog", "heap", "user", "tree", "node"]
    const pairs = findCollisions(sample)
    expect(pairs.some((p) => (p.s1 === "for" && p.s2 === "jar") || (p.s1 === "jar" && p.s2 === "for"))).toBe(true)
    expect(pairs.some((p) => (p.s1 === "heap" && p.s2 === "user") || (p.s1 === "user" && p.s2 === "heap"))).toBe(true)
    for (const p of pairs) {
      expect(polynomialHash(p.s1)).toBe(polynomialHash(p.s2))
      expect(polynomialHash(p.s1)).toBe(p.hash)
    }
  })
})
