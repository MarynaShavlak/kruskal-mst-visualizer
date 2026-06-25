// Серіалізація документа редактора сортування вставками (масив чисел): JSON для
// імпорту/експорту + компактний base64url для шарингу через URL-хеш (?g=...).
// Окремий wire-формат (version 1; масив цілих ≥0). Валідація — у createValuesCodec.

import type { InsertionSortDoc } from "@/store/insertion-sort-store"
import { createValuesCodec } from "@/algorithms/shared/editor/doc-codec"

export const insertionSortCodec = createValuesCodec<InsertionSortDoc>({
  badValuesKey: "editor.isErrBadValues",
})
