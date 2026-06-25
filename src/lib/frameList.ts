// Дрібний збирач кадрів trace: автоматично проставляє індекс `i` (= позиція в списку),
// щоб trace-білдери не повторювали `frames.push({ i: frames.length, ... })` у кожному
// файлі. `frames` лишається живим масивом — його можна читати (.length) і повертати.
// Функційний generic-аналог kruskal-івського TraceBuilder (trace.ts), для решти алгоритмів.

export interface FrameList<F extends { readonly i: number }> {
  /** Накопичені кадри (живий масив). */
  readonly frames: F[]
  /** Додає кадр, проставляючи `i = frames.length`. */
  push: (frame: Omit<F, "i">) => void
}

export function createFrameList<F extends { readonly i: number }>(): FrameList<F> {
  const frames: F[] = []
  return {
    frames,
    push: (frame) => {
      frames.push({ i: frames.length, ...frame } as F)
    },
  }
}
