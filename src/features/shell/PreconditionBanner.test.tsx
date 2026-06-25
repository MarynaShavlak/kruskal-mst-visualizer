import { describe, it, expect, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"

import { PreconditionBanner } from "@/features/shell/PreconditionBanner"
import { getAlgorithm } from "@/algorithms/registry"
import { useBinarySearchStore } from "@/store/binary-search-store"
import { useGraphStore } from "@/store/graph-store"
import { useLangStore } from "@/store/lang-store"
import type { Algorithm } from "@/algorithms/types"

function algo(id: string): Algorithm {
  const a = getAlgorithm(id)
  if (!a) throw new Error(`no algorithm ${id}`)
  return a
}

describe("PreconditionBanner", () => {
  beforeEach(() => {
    useLangStore.getState().setLang("ua")
  })

  it("sorted-array: відсортований масив → статус ОК", () => {
    useBinarySearchStore.setState({ values: [1, 3, 5, 8, 10] })
    render(<PreconditionBanner algorithm={algo("binary-search")} />)

    expect(screen.getByText(/передумова виконана/i)).toBeInTheDocument()
    // Складність із дескриптора видно у картці (типова й найгірша = O(log n)).
    expect(screen.getAllByText("O(log n)").length).toBeGreaterThan(0)
  })

  it("sorted-array: невпорядкований масив → попередження", () => {
    useBinarySearchStore.setState({ values: [5, 1, 8, 3] })
    render(<PreconditionBanner algorithm={algo("binary-search")} />)

    expect(screen.getByText(/НЕ відсортований/i)).toBeInTheDocument()
    expect(screen.queryByText(/передумова виконана/i)).not.toBeInTheDocument()
  })

  it("connected-graph: зв'язний граф → ОК", () => {
    useGraphStore.getState().loadExample()
    render(<PreconditionBanner algorithm={algo("kruskal")} />)

    expect(screen.getByText(/Граф зв'язний/i)).toBeInTheDocument()
  })

  it("connected-graph: порожній граф → інформативне попередження", () => {
    useGraphStore.getState().clear()
    render(<PreconditionBanner algorithm={algo("kruskal")} />)

    expect(screen.getByText(/Граф порожній/i)).toBeInTheDocument()
  })

  it("без передумови (лінійний пошук) → нічого не рендерить", () => {
    const { container } = render(
      <PreconditionBanner algorithm={algo("linear-search")} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it("реагує на мову (EN)", () => {
    useLangStore.getState().setLang("en")
    useBinarySearchStore.setState({ values: [1, 2, 3] })
    render(<PreconditionBanner algorithm={algo("binary-search")} />)

    expect(screen.getByText(/precondition satisfied/i)).toBeInTheDocument()
  })
})
