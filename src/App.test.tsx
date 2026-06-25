import { describe, it, expect, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import App from "./App"
import { useLangStore } from "@/store/lang-store"

describe("Оболонка платформи", () => {
  beforeEach(() => {
    window.location.hash = ""
    useLangStore.getState().setLang("ua")
  })

  /** Картка алгоритму в каталозі (role="button" із назвою + описом). Назва
   * алгоритму тепер з'являється і в rail «Навчальні шляхи», тож звужуємо запит
   * саме до клікабельної картки. */
  const algoCard = (shortName: string) =>
    screen
      .getAllByRole("button")
      .find(
        (el) =>
          el.getAttribute("role") === "button" &&
          el.textContent?.includes(shortName),
      )!

  it("за замовчуванням показує каталог алгоритмів", () => {
    render(<App />)
    expect(
      screen.getByRole("heading", { name: "Оберіть алгоритм" }),
    ).toBeInTheDocument()
    expect(algoCard("Краскал (МОД)")).toBeInTheDocument()
    expect(algoCard("Флойд–Воршал")).toBeInTheDocument()
  })

  it("клік по картці Краскала відкриває вкладки розділу й оновлює хеш", async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(algoCard("Краскал (МОД)"))

    expect(window.location.hash).toBe("#kruskal/learn")
    for (const name of ["Навчання", "Редактор", "Алгоритм", "Бенчмарк"]) {
      expect(screen.getByRole("tab", { name })).toBeInTheDocument()
    }
  })

  it("розділ Флойда відкриває навчання й показує вкладки (фази 2–4)", async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(algoCard("Флойд–Воршал"))

    expect(window.location.hash).toBe("#floyd-warshall/learn")
    for (const name of ["Навчання", "Редактор", "Алгоритм"]) {
      expect(screen.getByRole("tab", { name })).toBeInTheDocument()
    }
  })

  it("розділ показує footer-місточки навчального шляху (Попередній/Наступний)", async () => {
    // binary-search має й попередній (linear), і наступний (indexed-sequential).
    window.location.hash = "#binary-search/learn"
    render(<App />)

    expect(
      await screen.findByText("Попередній", undefined, { timeout: 5000 }),
    ).toBeInTheDocument()
    expect(screen.getByText("Наступний")).toBeInTheDocument()
  })

  it("глибоке посилання на вкладку відкриває її напряму", async () => {
    window.location.hash = "#kruskal/benchmark"
    render(<App />)

    expect(screen.getByRole("tab", { name: "Бенчмарк" })).toHaveAttribute(
      "data-state",
      "active",
    )
    // Бенчмарк — лінивий чанк; на холодному старті/під навантаженням набору
    // дефолтні 1000 мс findBy не вистачає (заголовок статичний, без воркера).
    expect(
      await screen.findByText(/DSU проти наївної/, undefined, { timeout: 5000 }),
    ).toBeInTheDocument()
  })
})
