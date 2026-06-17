import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import {
  GreedyFigure,
  DpTableFigure,
  SubsetsFigure,
  ItemsFigure,
  CellFormulaFigure,
  CodeWalkthroughFigure,
  RecursionTreeFigure,
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

  it("CellFormulaFigure K[3][3]: «влазить, але не беремо» (12 проти 16)", () => {
    const { container } = render(
      <CellFormulaFigure instance={KNAPSACK_SMALL} i={3} w={3} />,
    )
    const text = container.textContent ?? ""
    expect(text).toContain("12") // взяти
    expect(text).toContain("16") // не брати (перемагає)
  })

  it("CellFormulaFigure K[3][4]: клітинка-відповідь 18", () => {
    const { container } = render(
      <CellFormulaFigure instance={KNAPSACK_SMALL} i={3} w={4} />,
    )
    expect(container.textContent).toContain("18")
  })

  it("CodeWalkthroughFigure (малий, focusRow=3): міні-плеєр код ↔ таблиця", () => {
    const { container } = render(
      <CodeWalkthroughFigure instance={KNAPSACK_SMALL} focusRow={3} />,
    )
    const text = container.textContent ?? ""
    // Рядок i=3 → row-open + 5 клітинок (w=0…4) = 6 кадрів.
    expect(text).toContain("/ 6")
    // Жива таблиця K[i][w] показує предмети рядка.
    expect(text).toContain("П3")
  })

  it("CodeWalkthroughFigure (малий, повний прогін): більше кадрів за фокус-рядок", () => {
    const { container } = render(<CodeWalkthroughFigure instance={KNAPSACK_SMALL} />)
    // Повний прогін малого інстансу (n=3, W=4): init + 4×(row-open+5 клітинок)
    // + fill-done + bt-open + 3×bt-row + done = 31 кадр.
    expect(container.textContent).toContain("/ 31")
  })

  it("RecursionTreeFigure (класичний): корінь 220, вузли 160/100/60", () => {
    const { container } = render(
      <RecursionTreeFigure instance={KNAPSACK_CLASSIC} />,
    )
    const text = container.textContent ?? ""
    expect(text).toContain("220") // корінь / оптимум
    expect(text).toContain("160") // не брати П3
    expect(text).toContain("100") // взяти П3 → knapSack(20,2)
    expect(text).toContain("60") // листки knapSack(W,1)
    expect(text).toContain("kS(50,3)") // корінь
  })
})
