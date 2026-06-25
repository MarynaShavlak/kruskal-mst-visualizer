import { describe, it, expect, beforeEach } from "vitest"
import { render, fireEvent } from "@testing-library/react"
import { QuizFigure } from "@/algorithms/shared/learn/QuizFigure"
import type { QuizSpec } from "@/algorithms/shared/learn/quiz-types"
import { useLangStore } from "@/store/lang-store"

// Синтетична спека: один варіант через явний `correct`, другий — через
// `correctPredicate(payload)` (як у heap). Так покриваємо обидві моделі
// коректності одним тестом.
const SPEC: QuizSpec<number> = {
  prompt: { ua: "Питання?", en: "Question?" },
  correctPredicate: (n) => n > 0,
  options: [
    {
      id: "A",
      label: { ua: "варіант А", en: "option A" },
      payload: 1, // > 0 → коректний за предикатом
      explain: { ua: "А правильний бо додатний.", en: "A is right because positive." },
    },
    {
      id: "B",
      label: { ua: "варіант Б", en: "option B" },
      payload: -2, // ≤ 0 → хибний за предикатом
      explain: { ua: "Б хибний бо відʼємний.", en: "B is wrong because negative." },
    },
  ],
}

describe("QuizFigure — спільний MCQ-чекпойнт", () => {
  beforeEach(() => {
    useLangStore.getState().setLang("ua")
  })

  it("стартує без вердикту: показує підказку обрати варіант", () => {
    const { container } = render(<QuizFigure spec={SPEC} />)
    expect(container.textContent).toContain("Обери варіант")
    expect(container.textContent).not.toContain("Чому:")
  })

  it("вибір коректного варіанта → зелений вердикт + адресне пояснення", () => {
    const { getByText, container } = render(<QuizFigure spec={SPEC} />)
    fireEvent.click(getByText("варіант А"))
    expect(container.textContent).toContain("Правильно")
    expect(container.textContent).toContain("А правильний бо додатний.")
  })

  it("вибір хибного варіанта → показує пояснення САМЕ цього варіанта", () => {
    const { getByText, container } = render(<QuizFigure spec={SPEC} />)
    fireEvent.click(getByText("варіант Б"))
    expect(container.textContent).toContain("Не зовсім")
    expect(container.textContent).toContain("Б хибний бо відʼємний.")
    // Пояснення іншого варіанта НЕ показуємо до його вибору.
    expect(container.textContent).not.toContain("А правильний бо додатний.")
  })

  it("Reset очищає вибір і повертає підказку", () => {
    const { getByText, container } = render(<QuizFigure spec={SPEC} />)
    fireEvent.click(getByText("варіант Б"))
    fireEvent.click(getByText("Спробувати ще раз"))
    expect(container.textContent).toContain("Обери варіант")
    expect(container.textContent).not.toContain("Чому:")
  })

  it("рендериться англійською (prompt, мітки, вердикт)", () => {
    useLangStore.getState().setLang("en")
    const { getByText, container } = render(<QuizFigure spec={SPEC} />)
    expect(container.textContent).toContain("Question?")
    fireEvent.click(getByText("option A"))
    expect(container.textContent).toContain("Correct!")
    expect(container.textContent).toContain("A is right because positive.")
  })
})
