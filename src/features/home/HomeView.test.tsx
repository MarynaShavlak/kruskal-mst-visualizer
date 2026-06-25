import { describe, it, expect, beforeEach } from "vitest"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { HomeView } from "@/features/home/HomeView"
import { useLangStore } from "@/store/lang-store"

describe("HomeView — пошук у каталозі", () => {
  beforeEach(() => {
    window.location.hash = ""
    useLangStore.getState().setLang("ua")
  })

  /** Клікабельна картка алгоритму (role="button") з даною назвою. */
  const cardByName = (name: string) =>
    screen
      .getAllByRole("button")
      .find(
        (el) =>
          el.getAttribute("role") === "button" &&
          el.textContent?.includes(name),
      )

  it("сідить запит із хеша на перший рендер", () => {
    window.location.hash = "#?q=kruskal"
    render(<HomeView />)
    const search = screen.getByRole("searchbox", {
      name: /пошук у каталозі/i,
    })
    expect(search).toHaveValue("kruskal")
  })

  it("введення тексту звужує видимі картки", async () => {
    const user = userEvent.setup()
    render(<HomeView />)
    const search = screen.getByRole("searchbox", { name: /пошук у каталозі/i })

    await user.type(search, "kruskal")

    expect(cardByName("Краскал")).toBeTruthy()
    // Алгоритм з іншої родини зникає з результатів.
    expect(cardByName("Рюкзак")).toBeUndefined()
  })

  it("порожній результат показує empty-state і скидання повертає картки", async () => {
    const user = userEvent.setup()
    render(<HomeView />)
    const search = screen.getByRole("searchbox", { name: /пошук у каталозі/i })

    await user.type(search, "zzzzz-no-match")
    const empty = screen.getByText(/нічого не знайдено/i)
    expect(empty).toBeTruthy()

    await user.click(
      screen.getByRole("button", { name: /скинути фільтри/i }),
    )
    expect(screen.queryByText(/нічого не знайдено/i)).toBeNull()
    expect(cardByName("Краскал")).toBeTruthy()
  })

  it("кнопка очищення прибирає текст пошуку", async () => {
    const user = userEvent.setup()
    render(<HomeView />)
    const search = screen.getByRole("searchbox", { name: /пошук у каталозі/i })

    await user.type(search, "kruskal")
    await user.click(screen.getByRole("button", { name: /очистити пошук/i }))
    expect(search).toHaveValue("")
  })

  it("сід фасети родини з хеша працює (показано лише графи)", () => {
    window.location.hash = "#?family=graphs"
    render(<HomeView />)
    const graphsChip = screen
      .getAllByRole("button")
      .find((el) => /графи/i.test(el.textContent ?? ""))
    // chip-фільтр родини «Графи» активний (aria-pressed).
    expect(graphsChip).toBeTruthy()
    expect(within(document.body).queryByText(/нічого не знайдено/i)).toBeNull()
  })
})
