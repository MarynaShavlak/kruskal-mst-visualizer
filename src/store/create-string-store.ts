// Generic-ядро рядкових сторів (Zustand) — аналог graphCore/arrayCore для родини
// пошуку в рядку. naive/kmp/boyer-moore/rabin-karp ділять пару рядків {text, pattern}
// і однаковий набір дій (без передумов, без графа). Пресетні лоадери — у конкретних
// сторах (приклад / колізія / без збігу / випадковий).

import { mulberry32 } from "@/lib/prng"

/** Документ редактора: текст + шаблон (серіалізовний). */
export interface StringStoreDoc {
  readonly text: string
  readonly pattern: string
}

/**
 * Випадкова пара {text, pattern} для пресетів усіх чотирьох рядкових алгоритмів:
 * текст із заданого алфавіту (навмисне з повторами → багаті часткові збіги) + шаблон-
 * підрядок із нього (щоб зазвичай знаходився), детерміновано за `seed`. Спільне тіло
 * чотирьох `*RandomPreset` — різнилися лише алфавітом, довжинами й запасним шаблоном.
 */
export function randomStringCase(
  seed: number,
  opts: {
    readonly alphabet: string
    readonly textLen: number
    readonly patLen: number
    readonly fallback: string
  },
): StringStoreDoc {
  const { alphabet, textLen, patLen, fallback } = opts
  const rnd = mulberry32(seed)
  const chars: string[] = []
  for (let i = 0; i < textLen; i++) {
    chars.push(alphabet[Math.floor(rnd() * alphabet.length)])
  }
  const text = chars.join("")
  // Шаблон — підрядок тексту (щоб був збіг), якщо текст достатньо довгий.
  const start = textLen > patLen ? Math.floor(rnd() * (textLen - patLen)) : 0
  const pattern = text.slice(start, start + patLen) || fallback
  return { text, pattern }
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
