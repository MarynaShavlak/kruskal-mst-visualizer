// Generic-ядро рядкових сторів (Zustand) — аналог graphCore/arrayCore для родини
// пошуку в рядку. naive/kmp/boyer-moore/rabin-karp ділять пару рядків {text, pattern}
// і однаковий набір дій (без передумов, без графа). Пресетні лоадери — у конкретних
// сторах (приклад / колізія / без збігу / випадковий).

/** Документ редактора: текст + шаблон (серіалізовний). */
export interface StringStoreDoc {
  readonly text: string
  readonly pattern: string
}

/** Спільне ядро рядкового стору: пара рядків + дії + doc round-trip. */
export interface StringCore {
  readonly text: string
  readonly pattern: string
  setText: (text: string) => void
  setPattern: (pattern: string) => void
  clear: () => void
  loadDoc: (doc: StringStoreDoc) => void
  toDoc: () => StringStoreDoc
}

/** Вузький тип set над ядром — сумісний із Zustand-овим set повного стору. */
type StringCoreSet = (
  partial: Partial<StringCore> | ((s: StringCore) => Partial<StringCore>),
) => void

/**
 * Будує ядро рядкового стору. Викликається всередині
 * `create<S>()((set, get) => ({ ...stringCore(initial, set, get), ...пресет-лоадери }))`.
 */
export function stringCore(
  initial: StringStoreDoc,
  set: StringCoreSet,
  get: () => StringCore,
): StringCore {
  return {
    text: initial.text,
    pattern: initial.pattern,
    setText: (text) => set({ text }),
    setPattern: (pattern) => set({ pattern }),
    clear: () => set({ text: "", pattern: "" }),
    loadDoc: (doc) => set({ text: String(doc.text), pattern: String(doc.pattern) }),
    toDoc: () => ({ text: get().text, pattern: get().pattern }),
  }
}
