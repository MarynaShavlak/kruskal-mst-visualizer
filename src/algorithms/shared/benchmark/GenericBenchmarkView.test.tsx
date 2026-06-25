import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import { GenericBenchmarkView } from "@/algorithms/shared/benchmark/GenericBenchmarkView"
import { sortBenchmark } from "@/lib/benchmarks/sort-benchmark"
import { useLangStore } from "@/store/lang-store"

// RTL-smoke: лише СТАТИЧНИЙ chrome — module-workers не виконуються в jsdom, тож
// run() не тестуємо тут (це покривають lib-юніти runBenchmarkPoint). Перевіряємо,
// що View читає підписи/серії з дескриптора у двох мовах.

describe("GenericBenchmarkView (узагальнений екран)", () => {
  afterEach(cleanup)

  describe("UA", () => {
    beforeEach(() => useLangStore.getState().setLang("ua"))

    it("рендерить заголовок, вступ і кнопку запуску з дескриптора", () => {
      render(<GenericBenchmarkView descriptor={sortBenchmark} />)
      expect(
        screen.getByText("Бенчмарк: наївна проти оптимізованої"),
      ).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /Запустити бенчмарк/ })).toBeInTheDocument()
      // порожній стан до запуску
      expect(screen.getByText("Натисніть «Запустити бенчмарк»")).toBeInTheDocument()
    })

    it("показує перемикач метрики час⇄операції (серії мають ops)", () => {
      render(<GenericBenchmarkView descriptor={sortBenchmark} />)
      expect(screen.getByText("Метрика:")).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "час (мс)" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "операції" })).toBeInTheDocument()
    })
  })

  describe("EN", () => {
    beforeEach(() => useLangStore.getState().setLang("en"))
    afterEach(() => useLangStore.getState().setLang("ua"))

    it("рендерить англомовний заголовок", () => {
      render(<GenericBenchmarkView descriptor={sortBenchmark} />)
      expect(screen.getByText("Benchmark: naive vs optimized")).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /Run benchmark/ })).toBeInTheDocument()
      expect(screen.getByText("Metric:")).toBeInTheDocument()
    })
  })
})
