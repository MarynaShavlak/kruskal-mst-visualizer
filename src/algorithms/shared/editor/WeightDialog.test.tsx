import { describe, it, expect, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { WeightDialog } from "./WeightDialog"

describe("WeightDialog", () => {
  it("підставляє початкове значення й повертає введену вагу", async () => {
    const user = userEvent.setup()
    const onSettle = vi.fn()
    render(<WeightDialog open initial={5} onSettle={onSettle} />)

    const input = screen.getByRole("spinbutton") as HTMLInputElement
    expect(input.value).toBe("5")

    fireEvent.change(input, { target: { value: "12" } })
    await user.click(screen.getByRole("button", { name: "Зберегти" }))

    expect(onSettle).toHaveBeenCalledExactlyOnceWith(12)
  })

  it("показує помилку й не закривається на недодатній вазі", async () => {
    const user = userEvent.setup()
    const onSettle = vi.fn()
    render(<WeightDialog open initial={5} onSettle={onSettle} />)

    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "0" } })
    await user.click(screen.getByRole("button", { name: "Зберегти" }))

    expect(screen.getByRole("alert")).toHaveTextContent(/додатним цілим/)
    expect(onSettle).not.toHaveBeenCalled()
  })

  it("повертає null при скасуванні", async () => {
    const user = userEvent.setup()
    const onSettle = vi.fn()
    render(<WeightDialog open initial={3} onSettle={onSettle} />)

    await user.click(screen.getByRole("button", { name: "Скасувати" }))

    expect(onSettle).toHaveBeenCalledExactlyOnceWith(null)
  })
})
