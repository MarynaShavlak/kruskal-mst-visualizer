import "@testing-library/jest-dom/vitest"
import { afterEach } from "vitest"
import { cleanup } from "@testing-library/react"

// jsdom не реалізує Pointer Capture / scrollIntoView, на які спираються деякі
// radix-компоненти (Toast-свайп, Select тощо). Додаємо no-op шими.
Element.prototype.hasPointerCapture ??= () => false
Element.prototype.setPointerCapture ??= () => {}
Element.prototype.releasePointerCapture ??= () => {}
Element.prototype.scrollIntoView ??= () => {}

// jsdom не має ResizeObserver, на який спирається @xyflow/react (граф-редактори).
// Без шиму смоук-монтаж граф-вкладок кидає «ResizeObserver is not defined».
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver

afterEach(() => {
  cleanup()
})
