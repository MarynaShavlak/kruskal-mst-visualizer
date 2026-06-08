import { describe, it, expect, beforeEach } from "vitest"

import { toast, useToastStore } from "./toast-store"

describe("toast-store", () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] })
  })

  it("додає тост із дефолтами й повертає id", () => {
    const id = toast({ description: "Готово" })

    const { toasts } = useToastStore.getState()
    expect(toasts).toHaveLength(1)
    expect(toasts[0]).toMatchObject({
      id,
      description: "Готово",
      variant: "default",
      open: true,
    })
    expect(toasts[0].duration).toBeGreaterThan(0)
  })

  it("поважає передані title та variant", () => {
    toast({
      title: "Помилка",
      description: "Деталі",
      variant: "destructive",
    })

    expect(useToastStore.getState().toasts[0]).toMatchObject({
      title: "Помилка",
      variant: "destructive",
    })
  })

  it("видає унікальні id для кількох тостів", () => {
    const a = toast({ description: "1" })
    const b = toast({ description: "2" })

    expect(a).not.toBe(b)
    expect(useToastStore.getState().toasts).toHaveLength(2)
  })

  it("dismiss лише ставить open=false, не прибираючи елемент", () => {
    const id = toast({ description: "Зникаю" })
    useToastStore.getState().dismiss(id)

    const { toasts } = useToastStore.getState()
    expect(toasts).toHaveLength(1)
    expect(toasts[0].open).toBe(false)
  })

  it("remove прибирає тост за id", () => {
    const id = toast({ description: "Прощавай" })
    useToastStore.getState().remove(id)

    expect(useToastStore.getState().toasts).toHaveLength(0)
  })
})
