import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { MarkdownCode } from "@/algorithms/shared/learn/MarkdownCode"

describe("MarkdownCode + CopyCodeButton", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn(() => Promise.resolve()) },
      configurable: true,
    })
  })

  it("рендерить код і кнопку копіювання (запасна гілка для ```text)", () => {
    render(<MarkdownCode lang="text" code="привіт світ" />)
    expect(screen.getByText("привіт світ")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Копіювати код" }),
    ).toBeInTheDocument()
  })

  it("копіює код у буфер і показує підтвердження", async () => {
    render(<MarkdownCode lang="text" code="copy me" />)
    fireEvent.click(screen.getByRole("button", { name: "Копіювати код" }))

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("copy me")
    // Після резолву проміса іконка/підпис змінюються на «Скопійовано».
    expect(
      await screen.findByRole("button", { name: "Скопійовано" }),
    ).toBeInTheDocument()
  })
})
