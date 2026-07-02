import { describe, it, expect, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { BridgeNav } from "@/algorithms/shared/learn/BridgeNav"
import { useLangStore } from "@/store/lang-store"
import { getAlgorithm } from "@/algorithms/registry"

describe("BridgeNav — місточки навчального шляху", () => {
  beforeEach(() => {
    window.location.hash = ""
    useLangStore.getState().setLang("ua")
  })

  it("середній алгоритм показує обидва містки (Звідки + Куди далі)", () => {
    // binary-search має вхідний (linear) і вихідний (interpolation) містки.
    render(<BridgeNav bridgeAlgoId="binary-search" />)

    expect(screen.getByText("Звідки")).toBeInTheDocument()
    expect(screen.getByText("Куди далі")).toBeInTheDocument()

    const prev = getAlgorithm("linear-search")!
    const next = getAlgorithm("interpolation-search")!
    expect(screen.getByText(prev.shortName.ua)).toBeInTheDocument()
    expect(screen.getByText(next.shortName.ua)).toBeInTheDocument()
  })

  it("стартовий алгоритм ланцюга має лише вихідний місток", () => {
    // kruskal — старт ланцюга: немає вхідного містка.
    render(<BridgeNav bridgeAlgoId="kruskal" />)

    expect(screen.queryByText("Звідки")).not.toBeInTheDocument()
    expect(screen.getByText("Куди далі")).toBeInTheDocument()
  })

  it("фінальний алгоритм ланцюга має лише вхідний місток", () => {
    render(<BridgeNav bridgeAlgoId="held-karp" />)

    expect(screen.getByText("Звідки")).toBeInTheDocument()
    expect(screen.queryByText("Куди далі")).not.toBeInTheDocument()
  })

  it("без алгоритму (каталог-роут, без override) рендерить null", () => {
    const { container } = render(<BridgeNav />)
    expect(container).toBeEmptyDOMElement()
  })

  it("реагує на мову (en)", () => {
    useLangStore.getState().setLang("en")
    render(<BridgeNav bridgeAlgoId="binary-search" />)

    expect(screen.getByText("From")).toBeInTheDocument()
    expect(screen.getByText("Where next")).toBeInTheDocument()
  })
})
