import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import {
  GreedyFigure,
  DpTableFigure,
  SubsetsFigure,
  ItemsFigure,
} from "@/algorithms/knapsack/learn/learn-widgets"
import { KNAPSACK_SMALL, KNAPSACK_CLASSIC } from "@/lib/exampleKnapsack"

describe("навчальні віджети рюкзака (обчислюються з lib)", () => {
  it("ItemsFigure показує предмети класичного інстансу", () => {
    const { container } = render(<ItemsFigure instance={KNAPSACK_CLASSIC} />)
    const text = container.textContent ?? ""
    expect(text).toContain("П1")
    expect(text).toContain("П3")
    expect(text).toContain("50") // місткість
  })

  it("DpTableFigure (малий, answer) містить оптимум 18 у куті", () => {
    const { container } = render(<DpTableFigure instance={KNAPSACK_SMALL} answer />)
    expect(container.textContent).toContain("18")
  })

  it("SubsetsFigure (класичний) містить найкращу вартість 220", () => {
    const { container } = render(<SubsetsFigure instance={KNAPSACK_CLASSIC} />)
    expect(container.textContent).toContain("220")
  })

  it("GreedyFigure (класичний) показує контрприклад 160 проти 220", () => {
    const { container } = render(<GreedyFigure instance={KNAPSACK_CLASSIC} />)
    const text = container.textContent ?? ""
    expect(text).toContain("160")
    expect(text).toContain("220")
  })
})
