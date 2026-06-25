import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import { PlaybackView } from "@/algorithms/heap-sort/playback/PlaybackView"
import { HeapTree } from "@/algorithms/heap-sort/playback/HeapTreePanel"
import { HeapArrayCells } from "@/algorithms/heap-sort/playback/HeapArrayPanel"
import { useHeapSortStore } from "@/store/heap-sort-store"
import { HEAP_INTRO } from "@/lib/exampleHeapSort"

describe("HeapTree / HeapArrayCells рендеряться", () => {
  const neutral = {
    heapSize: HEAP_INTRO.length,
    siftNode: null,
    compareChild: null,
    swapA: null,
    swapB: null,
    isExtract: false,
    sortedAll: false,
  }

  it("дерево показує всі значення масиву як вузли", () => {
    const { container } = render(<HeapTree array={HEAP_INTRO} state={neutral} />)
    const text = container.textContent ?? ""
    for (const v of HEAP_INTRO) expect(text).toContain(String(v))
    // SVG-ребра з'єднують вузли (n-1 ребро для повного дерева з n вузлів).
    expect(container.querySelectorAll("line").length).toBe(HEAP_INTRO.length - 1)
  })

  it("масив-комірки показують індекси", () => {
    const { container } = render(<HeapArrayCells array={HEAP_INTRO} state={neutral} />)
    const text = container.textContent ?? ""
    expect(text).toContain(String(HEAP_INTRO[0]))
    expect(text).toContain(String(HEAP_INTRO.length - 1)) // мітка останнього індексу
  })
})

describe("PlaybackView (пірамідальне сортування) монтується", () => {
  it("рендерить плеєр на головному прикладі без помилок", () => {
    useHeapSortStore.getState().loadIntro()
    const { container } = render(<PlaybackView />)
    const text = container.textContent ?? ""
    // Рядок «Крок 1/39» (39 кадрів trace INTRO).
    expect(text).toContain("1/39")
    // Значення кореня з прикладу присутнє у дереві/масиві.
    expect(text).toContain("12")
  })
})
