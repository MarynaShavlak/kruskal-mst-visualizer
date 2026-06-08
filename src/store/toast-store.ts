// Глобальні тости (сповіщення). Стан тримаємо в Zustand, а функцію toast()
// можна викликати будь-де поза React через getState() — без хука.

import { create } from "zustand"

export type ToastVariant = "default" | "destructive"

export interface ToastItem {
  readonly id: string
  readonly title?: string
  readonly description: string
  readonly variant: ToastVariant
  readonly duration: number
  /** false запускає анімацію зникнення; згодом елемент прибирається з масиву. */
  readonly open: boolean
}

export interface ToastInput {
  title?: string
  description: string
  variant?: ToastVariant
  duration?: number
}

interface ToastState {
  readonly toasts: readonly ToastItem[]
  add: (input: ToastInput) => string
  dismiss: (id: string) => void
  remove: (id: string) => void
}

const DEFAULT_DURATION = 4000

let counter = 0

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  add: (input) => {
    const id = `toast-${++counter}`
    const item: ToastItem = {
      id,
      title: input.title,
      description: input.description,
      variant: input.variant ?? "default",
      duration: input.duration ?? DEFAULT_DURATION,
      open: true,
    }
    set((s) => ({ toasts: [...s.toasts, item] }))
    return id
  },
  dismiss: (id) =>
    set((s) => ({
      toasts: s.toasts.map((t) => (t.id === id ? { ...t, open: false } : t)),
    })),
  remove: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

/** Показати тост. Повертає id (на випадок ручного закриття). */
export function toast(input: ToastInput): string {
  return useToastStore.getState().add(input)
}
