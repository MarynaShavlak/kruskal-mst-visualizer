import { describe, it, expect, beforeEach, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { PwaUpdatePrompt } from "@/components/PwaUpdatePrompt"
import { usePwaStore } from "@/store/pwa-store"
import { useLangStore } from "@/store/lang-store"

describe("PwaUpdatePrompt", () => {
  beforeEach(() => {
    useLangStore.getState().setLang("ua")
    usePwaStore.setState({
      needRefresh: false,
      offlineReady: false,
      updateSW: null,
    })
  })

  it("нічого не рендерить без оновлення й без офлайн-готовності", () => {
    const { container } = render(<PwaUpdatePrompt />)
    expect(container).toBeEmptyDOMElement()
  })

  it("показує банер оновлення на needRefresh (UA)", () => {
    usePwaStore.setState({ needRefresh: true })
    render(<PwaUpdatePrompt />)

    expect(screen.getByText("Доступне оновлення")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Оновити" }),
    ).toBeInTheDocument()
  })

  it("клік «Оновити» викликає updateSW(true)", async () => {
    const user = userEvent.setup()
    const updateSW = vi.fn(async () => {})
    usePwaStore.setState({ needRefresh: true, updateSW })
    render(<PwaUpdatePrompt />)

    await user.click(screen.getByRole("button", { name: "Оновити" }))

    expect(updateSW).toHaveBeenCalledWith(true)
  })

  it("клік «Пізніше» закриває банер", async () => {
    const user = userEvent.setup()
    usePwaStore.setState({ needRefresh: true })
    render(<PwaUpdatePrompt />)

    await user.click(screen.getByRole("button", { name: "Пізніше" }))

    expect(usePwaStore.getState().needRefresh).toBe(false)
  })

  it("показує повідомлення офлайн-готовності, коли немає оновлення", () => {
    usePwaStore.setState({ offlineReady: true })
    render(<PwaUpdatePrompt />)

    expect(
      screen.getByText("Застосунок готовий до роботи офлайн."),
    ).toBeInTheDocument()
  })

  it("рендерить банер англійською при lang=en", () => {
    useLangStore.getState().setLang("en")
    usePwaStore.setState({ needRefresh: true })
    render(<PwaUpdatePrompt />)

    expect(screen.getByText("Update available")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Reload" })).toBeInTheDocument()
  })
})
