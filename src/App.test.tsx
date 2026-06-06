import { describe, it, expect, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import App from "./App"

describe("Оболонка App", () => {
  beforeEach(() => {
    window.location.hash = ""
  })

  it("рендерить чотири вкладки", () => {
    render(<App />)
    expect(screen.getByRole("tab", { name: "Навчання" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Редактор" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Алгоритм" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Бенчмарк" })).toBeInTheDocument()
  })

  it("за замовчуванням активна вкладка «Навчання»", () => {
    render(<App />)
    expect(screen.getByRole("tab", { name: "Навчання" })).toHaveAttribute(
      "data-state",
      "active",
    )
  })

  it("клік на «Редактор» оновлює хеш і показує контент редактора", async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole("tab", { name: "Редактор" }))

    expect(window.location.hash).toBe("#editor")
    expect(screen.getByText(/Редактор графа/)).toBeInTheDocument()
  })
})
