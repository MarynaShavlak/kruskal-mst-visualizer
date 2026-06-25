import { Suspense, type ComponentType } from "react"
import { describe, it, expect, beforeEach } from "vitest"
import { render, waitFor } from "@testing-library/react"
import { ALGORITHMS } from "@/algorithms/registry"
import { useLangStore } from "@/store/lang-store"

/**
 * Контрактні smoke-тести вкладок.
 *
 * QA-запобіжник: регресія у спільному PlayerShell/learn/editor-kit мовчки ламає
 * КОЖЕН екран, а наявні тести переважно lib-рівня її не зловлять. Цей файл ітерує
 * `ALGORITHMS[*].tabs` — єдине джерело правди — і монтує КОЖЕН lazy-View напряму
 * (в обхід AlgorithmShell, бо його ErrorBoundary проковтнув би краш у fallback).
 * Нові алгоритми/вкладки покриваються автоматично, без правок цього тесту.
 *
 * Усі 24 стори ініціалізуються непорожнім пресетом → playback рендерить контент
 * без сидингу. ResizeObserver-шим (test/setup.ts) тримає граф-редактори зеленими.
 */

interface TabCase {
  readonly id: string
  readonly key: string
  readonly View: ComponentType
}

const cases: readonly TabCase[] = ALGORITHMS.flatMap((a) =>
  a.tabs.map((t) => ({ id: a.id, key: t.key, View: t.View })),
)

describe("Контрактні smoke-тести вкладок (registry-driven)", () => {
  beforeEach(() => {
    window.location.hash = ""
    useLangStore.getState().setLang("ua")
  })

  it("реєстр містить вкладки для монтажу", () => {
    // Захист від «порожнього it.each» — якщо registry-парсинг зламається,
    // it.each мовчки не запустить жодного кейсу.
    expect(cases.length).toBeGreaterThan(0)
  })

  it("кожен алгоритм має вкладку learn і коректний defaultTab", () => {
    for (const a of ALGORITHMS) {
      const keys = a.tabs.map((t) => t.key)
      expect(keys, `${a.id}: очікувалася вкладка learn`).toContain("learn")
      expect(keys, `${a.id}: defaultTab поза tabs`).toContain(a.defaultTab)
    }
  })

  it.each(cases)(
    "вкладка %s рендериться непорожнім контентом",
    async ({ View }) => {
      const { container } = render(
        <Suspense
          fallback={<div data-testid="tab-fallback">loading</div>}
        >
          <View />
        </Suspense>,
      )

      // Дочекатися завантаження lazy-чанку: fallback зникає з DOM.
      await waitFor(
        () => {
          expect(
            container.querySelector('[data-testid="tab-fallback"]'),
          ).toBeNull()
        },
        { timeout: 5000 },
      )

      // Екран справді щось намалював (не порожній DOM).
      expect((container.textContent ?? "").length).toBeGreaterThan(0)
    },
    10000,
  )
})
