import { describe, it, expect } from "vitest"
import { HT_OP_QUIZ, HT_SLOT_QUIZ } from "@/algorithms/hash-table/learn/learn-quiz.hash-table"
import { isOptionCorrect, type QuizSpec } from "@/algorithms/shared/learn/quiz-types"

const SPECS: Record<string, QuizSpec> = {
  HT_OP_QUIZ,
  HT_SLOT_QUIZ,
}

describe("MCQ-чекпойнти хеш-таблиці", () => {
  for (const [name, spec] of Object.entries(SPECS)) {
    it(`${name}: рівно один коректний варіант, у кожного адресне пояснення двома мовами`, () => {
      const correct = spec.options.filter((o) => isOptionCorrect(o, spec.correctPredicate))
      expect(correct).toHaveLength(1)
      for (const o of spec.options) {
        expect(o.explain.ua.trim().length).toBeGreaterThan(0)
        expect(o.explain.en.trim().length).toBeGreaterThan(0)
      }
    })
  }

  it("HT_OP_QUIZ: коректна відповідь — впорядкований обхід", () => {
    const correct = HT_OP_QUIZ.options.find((o) => o.correct)!
    expect(correct.id).toBe("sorted")
  })

  it("HT_SLOT_QUIZ: коректна комірка — 4 (539 mod 5)", () => {
    const correct = HT_SLOT_QUIZ.options.find((o) => o.correct)!
    expect(correct.id).toBe("4")
  })
})
