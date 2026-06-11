import { describe, it, expect, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { LearnView } from "@/algorithms/shared/learn/LearnView"
import { useLangStore } from "@/store/lang-store"

describe("спільний LearnView", () => {
  beforeEach(() => {
    useLangStore.getState().setLang("ua")
  })

  it("рендерить заголовок і нумеровану секцію зі спільного контенту", () => {
    const content = { ua: "## 1. Розділ\n\nтекст", en: "## 1. Section\n\ntext" }
    render(<LearnView content={content} figureForSrc={() => null} />)

    expect(screen.getByText("Навчальний розбір")).toBeInTheDocument()
    // <h2> нумерованої секції отримує id secN (узгоджено з parseToc/scroll-spy).
    const heading = screen.getByRole("heading", { level: 2, name: "1. Розділ" })
    expect(heading).toHaveAttribute("id", "sec1")
  })

  it("показує мову з глобального lang-store (en)", () => {
    useLangStore.getState().setLang("en")
    const content = { ua: "## 1. Розділ\n\nтекст", en: "## 1. Section\n\ntext" }
    render(<LearnView content={content} figureForSrc={() => null} />)

    expect(
      screen.getByRole("heading", { level: 2, name: "1. Section" }),
    ).toBeInTheDocument()
  })

  it("мапить <img> README через інжектований figureForSrc", () => {
    const content = { ua: "![підпис](graph.png)", en: "" }
    render(
      <LearnView
        content={content}
        figureForSrc={(src) => <span>фігура:{src}</span>}
      />,
    )
    expect(screen.getByText("фігура:graph.png")).toBeInTheDocument()
  })
})
