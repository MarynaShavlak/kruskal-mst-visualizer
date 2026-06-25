import { describe, it, expect } from "vitest"
import { MAX_HEAP_QUIZ } from "@/algorithms/heap-sort/learn/learn-quiz.heap-sort"
import { isOptionCorrect } from "@/algorithms/shared/learn/quiz-types"

// Контракт декларативної спеки MCQ-чекпойнта: рівно один коректний варіант,
// усі пояснення двомовно непорожні, питання двомовне. Коректність обчислюється
// предикатом isMaxHeap із payload (а не хардкодиться у спеці).

describe("MAX_HEAP_QUIZ — контракт спеки квіза", () => {
  it("питання непорожнє обома мовами", () => {
    expect(MAX_HEAP_QUIZ.prompt.ua).not.toBe("")
    expect(MAX_HEAP_QUIZ.prompt.en).not.toBe("")
  })

  it("має варіанти з унікальними id", () => {
    const ids = MAX_HEAP_QUIZ.options.map((o) => o.id)
    expect(ids.length).toBeGreaterThan(1)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("рівно один коректний варіант (за предикатом isMaxHeap)", () => {
    const correct = MAX_HEAP_QUIZ.options.filter((o) =>
      isOptionCorrect(o, MAX_HEAP_QUIZ.correctPredicate),
    )
    expect(correct).toHaveLength(1)
    expect(correct[0].id).toBe("A")
  })

  it("кожен варіант має непорожнє пояснення обома мовами", () => {
    for (const opt of MAX_HEAP_QUIZ.options) {
      expect(opt.explain.ua, `${opt.id}/ua`).not.toBe("")
      expect(opt.explain.en, `${opt.id}/en`).not.toBe("")
    }
  })

  it("кожен варіант несе сирий payload (масив) для предиката", () => {
    for (const opt of MAX_HEAP_QUIZ.options) {
      expect(Array.isArray(opt.payload), opt.id).toBe(true)
    }
  })
})
