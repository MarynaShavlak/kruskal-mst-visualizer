import { describe, it, expect, beforeEach } from "vitest"
import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { Toaster } from "@/components/ui/toaster"
import { toast, useToastStore } from "@/store/toast-store"

describe("Toaster", () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] })
  })

  it("показує тост із заголовком і описом", async () => {
    render(<Toaster />)
    act(() => {
      toast({ title: "Готово", description: "Посилання скопійовано" })
    })

    expect(await screen.findByText("Готово")).toBeInTheDocument()
    expect(screen.getByText("Посилання скопійовано")).toBeInTheDocument()
  })

  it("закриває тост по кнопці й прибирає його зі стану", async () => {
    const user = userEvent.setup()
    render(<Toaster />)
    act(() => {
      toast({ description: "Можна закрити" })
    })

    await screen.findByText("Можна закрити")
    await user.click(screen.getByRole("button", { name: "Закрити" }))

    await waitFor(() =>
      expect(useToastStore.getState().toasts).toHaveLength(0),
    )
  })
})
