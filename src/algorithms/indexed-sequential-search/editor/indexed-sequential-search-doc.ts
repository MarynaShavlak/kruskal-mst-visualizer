// Серіалізація документа редактора індексно-послідовного пошуку (масив + ціль + крок
// індексу): JSON для імпорту/експорту + компактний base64url для шарингу через URL-хеш
// (?g=...). Окремий wire-формат (version 1; масив цілих + ціль + крок ≥1). Валідація —
// у спільній createSearchCodec (варіант зі step).

import type { IndexedSequentialSearchDoc } from "@/store/indexed-sequential-search-store"
import { createSearchCodec } from "@/algorithms/shared/editor/doc-codec"

export const indexedSequentialSearchCodec = createSearchCodec<IndexedSequentialSearchDoc>({
  badValuesKey: "editor.issErrBadValues",
  badTargetKey: "editor.issErrBadTarget",
  step: { badStepKey: "editor.issErrBadStep" },
})
